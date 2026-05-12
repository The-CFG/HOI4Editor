// ════════════════════════════════════════════════════════
//  home.js — 홈 화면
//  의존: state.js, io.js, auth.js
// ════════════════════════════════════════════════════════

const RECENT_KEY      = 'hoi4editor_recent';
const PROJECT_KEY_PFX = 'hoi4editor_proj_';
const MAX_RECENT      = 8;
const MAX_PROJ_BYTES  = 4 * 1024 * 1024;  // 4 MB

// ── 홈 화면 진입 ─────────────────────────────────────────
function showHomeView() {
    appState.project     = { name: '', files: {} };
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
    const meta = _getRecentMeta().filter(r => r.name !== proj.name);
    meta.unshift({ name: proj.name, date: new Date().toISOString() });
    _setRecentMeta(meta.slice(0, MAX_RECENT));
    _saveProjectToLocal(proj);
}

// ── 최근 목록 렌더링 (로컬 + 클라우드 병합) ─────────────
async function renderRecentList() {
    const el = document.getElementById('recent-list');
    if (!el) return;

    // 클라우드 목록 병렬 조회 (로그인 상태일 때만)
    let cloudProjects = [];
    try {
        if (typeof CloudAuth !== 'undefined') {
            cloudProjects = await CloudAuth.listProjects();
        }
    } catch (e) {
        console.warn('클라우드 목록 조회 실패:', e);
    }

    const localMeta  = _getRecentMeta();  // [{ name, date }]
    const cloudNames = new Set(cloudProjects.map(c => c.name));
    const localNames = new Set(localMeta.map(l => l.name));

    // 병합: 로컬 + 클라우드 전용 항목
    const merged = [...localMeta];
    for (const cp of cloudProjects) {
        if (!localNames.has(cp.name)) {
            merged.push({ name: cp.name, date: cp.updated_at, cloudOnly: true });
        }
    }
    // updated_at 내림차순 정렬
    merged.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (!merged.length) {
        el.innerHTML = '<p class="home-empty">최근 프로젝트가 없습니다.</p>';
        return;
    }

    el.innerHTML = '';
    for (const r of merged) {
        const hasLocal = !!localStorage.getItem(PROJECT_KEY_PFX + r.name);
        const hasCloud = cloudNames.has(r.name);
        const canOpen  = hasLocal || hasCloud;

        const item = document.createElement('div');
        item.className = 'recent-item' + (canOpen ? ' clickable' : ' faded');
        item.title     = canOpen
            ? `"${r.name}" 불러오기`
            : '저장된 데이터 없음 (ZIP으로 불러오세요)';

        // 상태 표시: 로컬만 / 클라우드만 / 둘 다
        const statusLabel = hasLocal && hasCloud ? '✓ ☁️'
                          : hasCloud              ? '☁️'
                          : hasLocal              ? '✓'
                          : '—';

        item.innerHTML = `
            <span class="recent-name">📁 ${escapeHtml(r.name)}</span>
            <span class="recent-date">${new Date(r.date).toLocaleDateString('ko-KR')}</span>
            <span class="recent-status">${statusLabel}</span>
            <button class="recent-delete-btn" title="목록에서 제거">✕</button>
        `;

        // 클릭: 불러오기
        item.addEventListener('click', e => {
            if (e.target.classList.contains('recent-delete-btn')) return;
            if (!canOpen) {
                alert(`"${r.name}"의 저장 데이터가 없습니다.\nZIP 파일로 직접 불러와주세요.`);
                return;
            }
            _openRecentProject(r.name, hasLocal, hasCloud);
        });

        // 삭제 버튼
        item.querySelector('.recent-delete-btn').addEventListener('click', async e => {
            e.stopPropagation();
            const isCloud = cloudNames.has(r.name);
            const msg = isCloud
                ? `"${r.name}"을 로컬 목록과 클라우드에서 모두 삭제하시겠습니까?`
                : `"${r.name}"을 최근 목록에서 제거하시겠습니까?`;
            if (!confirm(msg)) return;

            // 로컬 제거
            const newMeta = _getRecentMeta().filter(m => m.name !== r.name);
            _setRecentMeta(newMeta);
            _removeProjectFromLocal(r.name);

            // 클라우드 삭제
            if (isCloud) {
                try { await CloudAuth.deleteProject(r.name); }
                catch (err) { console.error('클라우드 삭제 실패:', err); }
            }

            renderRecentList();
        });

        el.appendChild(item);
    }
}

// ── 최근 프로젝트 열기 ───────────────────────────────────
async function _openRecentProject(name, hasLocal, hasCloud) {
    // 로컬 우선, 없으면 클라우드에서 로드
    let proj = hasLocal ? _loadProjectFromLocal(name) : null;

    if (!proj && hasCloud) {
        const loadingMsg = document.createElement('p');
        loadingMsg.textContent = `☁️ "${name}" 클라우드에서 불러오는 중...`;
        loadingMsg.style.color = '#aaa';
        const el = document.getElementById('recent-list');
        if (el) el.prepend(loadingMsg);

        try {
            proj = await CloudAuth.loadProject(name);
        } catch (e) {
            alert(`클라우드 로드 실패: ${e.message}`);
            renderRecentList();
            return;
        }

        if (proj) {
            // 로컬에도 캐시
            _saveProjectToLocal(proj);
            const meta = _getRecentMeta().filter(r => r.name !== name);
            meta.unshift({ name, date: new Date().toISOString() });
            _setRecentMeta(meta.slice(0, MAX_RECENT));
        }
    }

    if (!proj) {
        alert(`"${name}" 데이터를 불러올 수 없습니다.`);
        renderRecentList();
        return;
    }

    appState.project     = proj;
    appState.currentFile = null;
    appState.isDirty     = false;
    resetHistory();
    switchView('explorer-view');
    renderExplorer();
}

// ── 새 프로젝트 ──────────────────────────────────────────
async function createNewProject() {
    const nameEl = document.getElementById('new-project-name');
    const name   = nameEl?.value.trim();
    if (!name) { alert('프로젝트(모드) 이름을 입력해주세요.'); return; }

    const proj = { name, files: {} };
    appState.project     = proj;
    appState.currentFile = null;
    appState.isDirty     = false;
    resetHistory();
    addRecentProject(proj);

    // 로그인 상태면 클라우드 메타도 즉시 생성
    try {
        const user = await CloudAuth.getUser();
        if (user) await CloudAuth._saveProjectMeta(user.id, name);
    } catch (e) { console.warn('클라우드 메타 생성 실패:', e); }

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

        appState.project     = proj;
        appState.currentFile = null;
        appState.isDirty     = false;
        resetHistory();
        addRecentProject(proj);
        switchView('explorer-view');
        renderExplorer();
        alert(`"${proj.name}" 불러오기 완료 (파일 ${Object.keys(proj.files).length}개)`);
    } catch (err) {
        alert('프로젝트 불러오기 오류:\n' + err.message);
    }
}

// ── 프로젝트 저장 (ZIP + 로컬 + 클라우드) ───────────────
async function saveProjectZip() {
    if (!appState.project.name) { alert('먼저 프로젝트를 만들거나 불러와주세요.'); return; }
    const blob = await packProjectZip();
    if (!blob) { alert('JSZip 라이브러리를 불러오지 못했습니다.'); return; }
    downloadBlob(blob, `${appState.project.name}.zip`, 'application/zip');
    appState.isDirty = false;
    addRecentProject(appState.project);

    // 클라우드 동기화 (비동기, 실패해도 사용자 흐름 막지 않음)
    try {
        const user = await CloudAuth.getUser();
        if (user) await CloudAuth.saveProject(appState.project.name);
    } catch (e) { console.warn('ZIP 저장 후 클라우드 동기화 실패:', e); }
}

// ── 자동 로컬 저장 ───────────────────────────────────────
function autoSaveToLocal() {
    if (!appState.project.name) return;

    // 1. 로컬스토리지 저장
    _saveProjectToLocal(appState.project);

    // 2. 클라우드 비동기 저장 (로그인 상태일 때만)
    CloudAuth.getUser().then(user => {
        if (user) CloudAuth.saveProject(appState.project.name)
            .catch(e => console.warn('클라우드 자동 저장 실패:', e));
    }).catch(() => {});
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
