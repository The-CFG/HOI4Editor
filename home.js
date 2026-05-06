// ════════════════════════════════════════════════════════
//  home.js — 홈 화면
//  의존: state.js, io.js
// ════════════════════════════════════════════════════════

const RECENT_KEY      = 'hoi4editor_recent';       // 최근 목록 메타 (이름·날짜)
const PROJECT_KEY_PFX = 'hoi4editor_proj_';        // 프로젝트 데이터 (이름별)
const MAX_RECENT      = 8;
const MAX_PROJ_BYTES  = 4 * 1024 * 1024;           // 4 MB (로컬스토리지 한계 고려)

// ── 홈 화면 진입 ─────────────────────────────────────────
function showHomeView() {
    appState.project    = { name: '', files: {} };
    appState.currentFile = null;
    switchView('home-view');
    renderRecentList();
}

// ── 로컬스토리지: 최근 목록 메타 ────────────────────────
function _getRecentMeta() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
    catch { return []; }
}

function _setRecentMeta(list) {
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); }
    catch (e) { console.warn('최근 목록 저장 실패:', e); }
}

// ── 로컬스토리지: 프로젝트 데이터 저장 / 불러오기 ────────
function _saveProjectToLocal(proj) {
    const key  = PROJECT_KEY_PFX + proj.name;
    const json = JSON.stringify({ version: 2, name: proj.name, files: proj.files });
    if (json.length > MAX_PROJ_BYTES) {
        console.warn(`프로젝트 "${proj.name}"이 너무 커서 로컬 자동저장을 건너뜁니다.`);
        return false;
    }
    try {
        localStorage.setItem(key, json);
        return true;
    } catch (e) {
        // 용량 초과 시 가장 오래된 프로젝트 하나를 지우고 재시도
        const meta = _getRecentMeta();
        if (meta.length > 1) {
            const oldest = meta[meta.length - 1];
            localStorage.removeItem(PROJECT_KEY_PFX + oldest.name);
            try { localStorage.setItem(key, json); return true; }
            catch { console.warn('로컬 저장 실패 (용량 초과)'); return false; }
        }
        return false;
    }
}

function _loadProjectFromLocal(name) {
    try {
        const raw = localStorage.getItem(PROJECT_KEY_PFX + name);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch { return null; }
}

function _removeProjectFromLocal(name) {
    localStorage.removeItem(PROJECT_KEY_PFX + name);
}

// ── 최근 목록에 추가 + 데이터 저장 ─────────────────────
function addRecentProject(proj) {
    // 메타 목록 갱신
    const meta = _getRecentMeta().filter(r => r.name !== proj.name);
    meta.unshift({ name: proj.name, date: new Date().toISOString() });
    _setRecentMeta(meta.slice(0, MAX_RECENT));

    // 실제 데이터 저장
    _saveProjectToLocal(proj);
}

// ── 최근 목록 렌더링 ─────────────────────────────────────
function renderRecentList() {
    const el = document.getElementById('recent-list');
    if (!el) return;
    const meta = _getRecentMeta();

    if (!meta.length) {
        el.innerHTML = '<p class="home-empty">최근 프로젝트가 없습니다.</p>';
        return;
    }

    el.innerHTML = '';
    meta.forEach(r => {
        const hasData = !!localStorage.getItem(PROJECT_KEY_PFX + r.name);
        const item = document.createElement('div');
        item.className = 'recent-item' + (hasData ? ' clickable' : ' faded');
        item.title     = hasData ? `"${r.name}" 불러오기` : '저장된 데이터 없음 (ZIP으로 불러오세요)';
        item.innerHTML = `
            <span class="recent-name">📁 ${escapeHtml(r.name)}</span>
            <span class="recent-date">${new Date(r.date).toLocaleDateString('ko-KR')}</span>
            <span class="recent-status">${hasData ? '✓' : '—'}</span>
            <button class="recent-delete-btn" title="목록에서 제거">✕</button>
        `;

        // 클릭: 데이터 있으면 불러오기
        item.addEventListener('click', e => {
            if (e.target.classList.contains('recent-delete-btn')) return;
            if (!hasData) {
                alert(`"${r.name}"의 저장 데이터가 없습니다.\nZIP 파일로 직접 불러와주세요.`);
                return;
            }
            _openRecentProject(r.name);
        });

        // 삭제 버튼
        item.querySelector('.recent-delete-btn').addEventListener('click', e => {
            e.stopPropagation();
            if (confirm(`"${r.name}"을 최근 목록에서 제거하시겠습니까?`)) {
                const newMeta = _getRecentMeta().filter(m => m.name !== r.name);
                _setRecentMeta(newMeta);
                _removeProjectFromLocal(r.name);
                renderRecentList();
            }
        });

        el.appendChild(item);
    });
}

function _openRecentProject(name) {
    const proj = _loadProjectFromLocal(name);
    if (!proj) {
        alert(`"${name}" 데이터를 불러올 수 없습니다.`);
        renderRecentList();
        return;
    }
    appState.project    = proj;
    appState.currentFile = null;
    appState.isDirty    = false;
    resetHistory();
    switchView('explorer-view');
    renderExplorer();
}

// ── 새 프로젝트 ──────────────────────────────────────────
function createNewProject() {
    const nameEl = document.getElementById('new-project-name');
    const name   = nameEl?.value.trim();
    if (!name) { alert('프로젝트(모드) 이름을 입력해주세요.'); return; }

    const proj = { name, files: {} };
    appState.project    = proj;
    appState.currentFile = null;
    appState.isDirty    = false;
    resetHistory();
    addRecentProject(proj);
    switchView('explorer-view');
    renderExplorer();
}

// ── 프로젝트 불러오기 (ZIP / JSON) ───────────────────────
async function loadProjectFile(file) {
    try {
        let proj;
        if (file.name.endsWith('.zip')) {
            proj = await unpackProjectZip(await file.arrayBuffer());
        } else if (file.name.endsWith('.json')) {
            const json = JSON.parse(await file.text());
            proj = json.version === 2 ? json : migrateV1Project(json);
        } else {
            alert('ZIP 또는 JSON 파일만 불러올 수 있습니다.');
            return;
        }
        if (!proj) { alert('프로젝트를 파싱할 수 없습니다.'); return; }

        appState.project    = proj;
        appState.currentFile = null;
        appState.isDirty    = false;
        resetHistory();
        addRecentProject(proj);
        switchView('explorer-view');
        renderExplorer();
        alert(`"${proj.name}" 불러오기 완료 (파일 ${Object.keys(proj.files).length}개)`);
    } catch (err) {
        alert('프로젝트 불러오기 오류:\n' + err.message);
    }
}

// ── 프로젝트 저장 (ZIP + 로컬스토리지) ──────────────────
async function saveProjectZip() {
    if (!appState.project.name) { alert('먼저 프로젝트를 만들거나 불러와주세요.'); return; }
    const blob = await packProjectZip();
    if (!blob) { alert('JSZip 라이브러리를 불러오지 못했습니다.'); return; }
    downloadBlob(blob, `${appState.project.name}.zip`, 'application/zip');
    appState.isDirty = false;
    addRecentProject(appState.project);  // 로컬스토리지에도 최신 상태 저장
}

// ── 자동 로컬 저장 (프로젝트 변경 시 호출) ──────────────
// explorer.js, editor.js 등에서 isDirty = true 시 주기적으로 호출 가능
function autoSaveToLocal() {
    if (appState.project.name) _saveProjectToLocal(appState.project);
}

// ── 홈 화면 이벤트 연결 ──────────────────────────────────
function setupHomeListeners() {
    document.getElementById('btn-create-project')
        ?.addEventListener('click', createNewProject);
    document.getElementById('new-project-name')
        ?.addEventListener('keydown', e => { if (e.key === 'Enter') createNewProject(); });

    const loaderEl = document.getElementById('file-loader-project');
    document.getElementById('btn-open-project')
        ?.addEventListener('click', () => loaderEl?.click());
    loaderEl?.addEventListener('change', async e => {
        const file = e.target.files[0];
        if (file) await loadProjectFile(file);
        e.target.value = '';
    });
}
