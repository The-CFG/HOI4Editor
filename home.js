// ════════════════════════════════════════════════════════
//  home.js — 홈 화면
//  의존: state.js, io.js
// ════════════════════════════════════════════════════════

const RECENT_KEY = 'hoi4editor_recent';

function showHomeView() {
    appState.project   = { name: '', files: {} };
    appState.currentFile = null;
    switchView('home-view');
    renderRecentList();
}

// ── 최근 프로젝트 ────────────────────────────────────────
function getRecentProjects() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
    catch { return []; }
}

function addRecentProject(name) {
    const list = getRecentProjects().filter(r => r.name !== name);
    list.unshift({ name, date: new Date().toISOString() });
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 8)));
}

function renderRecentList() {
    const el = document.getElementById('recent-list');
    if (!el) return;
    const list = getRecentProjects();
    if (!list.length) {
        el.innerHTML = '<p class="home-empty">최근 프로젝트가 없습니다.</p>';
        return;
    }
    el.innerHTML = list.map(r => `
        <div class="recent-item">
            <span class="recent-name">📁 ${escapeHtml(r.name)}</span>
            <span class="recent-date">${new Date(r.date).toLocaleDateString('ko-KR')}</span>
        </div>
    `).join('');
    // 클릭해도 ZIP 없이 이름만 있으므로 정보 제공용
}

// ── 새 프로젝트 ─────────────────────────────────────────
function createNewProject() {
    const nameEl = document.getElementById('new-project-name');
    const name   = nameEl?.value.trim();
    if (!name) { alert('프로젝트(모드) 이름을 입력해주세요.'); return; }

    appState.project   = { name, files: {} };
    appState.currentFile = null;
    appState.isDirty   = false;
    resetHistory();
    addRecentProject(name);
    switchView('explorer-view');
    renderExplorer();
}

// ── 프로젝트 불러오기 (ZIP / JSON) ──────────────────────
async function loadProjectFile(file) {
    try {
        let proj;
        if (file.name.endsWith('.zip')) {
            proj = await unpackProjectZip(await file.arrayBuffer());
        } else if (file.name.endsWith('.json')) {
            const text = await file.text();
            const json = JSON.parse(text);
            proj = json.version === 2 ? json : migrateV1Project(json);
        } else {
            alert('ZIP 또는 JSON 파일만 불러올 수 있습니다.');
            return;
        }
        if (!proj) { alert('프로젝트를 파싱할 수 없습니다.'); return; }

        appState.project   = proj;
        appState.currentFile = null;
        appState.isDirty   = false;
        resetHistory();
        addRecentProject(proj.name);
        switchView('explorer-view');
        renderExplorer();
        alert(`"${proj.name}" 프로젝트를 불러왔습니다.\n파일 ${Object.keys(proj.files).length}개`);
    } catch (err) {
        alert('프로젝트 불러오기 오류:\n' + err.message);
    }
}

// ── 프로젝트 저장 (ZIP) ──────────────────────────────────
async function saveProjectZip() {
    if (!appState.project.name) { alert('먼저 프로젝트를 만들거나 불러와주세요.'); return; }
    const blob = await packProjectZip();
    if (!blob) { alert('JSZip 라이브러리를 불러오지 못했습니다.'); return; }
    downloadBlob(blob, `${appState.project.name}.zip`, 'application/zip');
    appState.isDirty = false;
    addRecentProject(appState.project.name);
}

// ── 홈 화면 이벤트 연결 ──────────────────────────────────
function setupHomeListeners() {
    document.getElementById('btn-create-project')
        ?.addEventListener('click', createNewProject);

    document.getElementById('new-project-name')
        ?.addEventListener('keydown', e => {
            if (e.key === 'Enter') createNewProject();
        });

    const loaderEl = document.getElementById('file-loader-project');
    document.getElementById('btn-open-project')
        ?.addEventListener('click', () => loaderEl?.click());

    loaderEl?.addEventListener('change', async e => {
        const file = e.target.files[0];
        if (file) await loadProjectFile(file);
        e.target.value = '';
    });
}
