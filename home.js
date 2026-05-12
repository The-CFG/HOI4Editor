// ════════════════════════════════════════════════════════
//  home.js — 홈 화면
//  의존: state.js, io.js, auth.js
//  저장소: Supabase 전용 (로컬스토리지 미사용)
// ════════════════════════════════════════════════════════

// ── 홈 화면 진입 ─────────────────────────────────────────
function showHomeView() {
    appState.project     = { name: '', files: {} };
    appState.currentFile = null;
    switchView('home-view');
    renderRecentList();
}

// ── 최근 목록 렌더링 (클라우드 전용) ────────────────────
async function renderRecentList() {
    const el = document.getElementById('recent-list');
    if (!el) return;

    const user = await CloudAuth.getUser();

    if (!user) {
        el.innerHTML = '<p class="home-empty">🔒 로그인하면 프로젝트 목록이 표시됩니다.</p>';
        return;
    }

    el.innerHTML = '<p class="home-empty" style="color:var(--text-muted)">☁️ 불러오는 중...</p>';

    let projects = [];
    try {
        projects = await CloudAuth.listProjects();
    } catch (e) {
        el.innerHTML = '<p class="home-empty" style="color:#e07070;">⚠ 서버 연결 실패. 잠시 후 다시 시도해주세요.</p>';
        console.error('프로젝트 목록 조회 실패:', e);
        return;
    }

    if (!projects.length) {
        el.innerHTML = '<p class="home-empty">저장된 프로젝트가 없습니다. 새 프로젝트를 만들어보세요.</p>';
        return;
    }

    el.innerHTML = '';
    for (const p of projects) {
        const item = document.createElement('div');
        item.className = 'recent-item clickable';
        item.title = `"${p.name}" 불러오기`;
        item.innerHTML = `
            <span class="recent-name">📁 ${escapeHtml(p.name)}</span>
            <span class="recent-date">${new Date(p.updated_at).toLocaleDateString('ko-KR')}</span>
            <span class="recent-status">☁️</span>
            <button class="recent-delete-btn" title="프로젝트 삭제">🗑</button>
        `;

        item.addEventListener('click', e => {
            if (e.target.classList.contains('recent-delete-btn')) return;
            _openCloudProject(p.name);
        });

        item.querySelector('.recent-delete-btn').addEventListener('click', async e => {
            e.stopPropagation();
            if (!confirm(`"${p.name}" 프로젝트를 서버에서 완전히 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
            item.style.opacity = '0.4';
            try {
                await CloudAuth.deleteProject(p.name);
                renderRecentList();
            } catch (err) {
                alert('삭제 실패: ' + err.message);
                item.style.opacity = '1';
            }
        });

        el.appendChild(item);
    }
}

// ── 클라우드에서 프로젝트 열기 ───────────────────────────
async function _openCloudProject(name) {
    const el = document.getElementById('recent-list');
    if (el) el.innerHTML = `<p class="home-empty" style="color:var(--text-muted)">☁️ "${escapeHtml(name)}" 불러오는 중...</p>`;

    let proj;
    try {
        proj = await CloudAuth.loadProject(name);
    } catch (e) {
        alert(`불러오기 실패: ${e.message}`);
        renderRecentList();
        return;
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

    const user = await CloudAuth.getUser();
    if (!user) { alert('프로젝트를 만들려면 먼저 로그인해주세요.'); return; }

    const proj = { name, files: {} };
    appState.project     = proj;
    appState.currentFile = null;
    appState.isDirty     = false;
    resetHistory();

    // 서버에 메타 즉시 생성
    try {
        await CloudAuth._saveProjectMeta(user.id, name);
    } catch (e) {
        console.warn('서버 메타 생성 실패:', e);
    }

    if (nameEl) nameEl.value = '';
    switchView('explorer-view');
    renderExplorer();
}

// ── 프로젝트 불러오기 (ZIP) ──────────────────────────────
async function loadProjectFile(file) {
    const user = await CloudAuth.getUser();
    if (!user) { alert('ZIP을 불러오려면 먼저 로그인해주세요.'); return; }

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
        appState.isDirty     = true;   // 서버에 아직 없으므로 dirty
        resetHistory();

        // 서버에 즉시 저장
        try {
            await CloudAuth.saveProject(proj.name);
            appState.isDirty = false;
        } catch (e) {
            console.warn('ZIP 업로드 후 서버 저장 실패:', e);
        }

        switchView('explorer-view');
        renderExplorer();
        alert(`"${proj.name}" 불러오기 완료 (파일 ${Object.keys(proj.files).length}개)`);
    } catch (err) {
        alert('프로젝트 불러오기 오류:\n' + err.message);
    }
}

// ── 프로젝트 ZIP 내보내기 + 서버 동기화 ─────────────────
async function saveProjectZip() {
    if (!appState.project.name) { alert('먼저 프로젝트를 만들거나 불러와주세요.'); return; }
    const blob = await packProjectZip();
    if (!blob) { alert('JSZip 라이브러리를 불러오지 못했습니다.'); return; }
    downloadBlob(blob, `${appState.project.name}.zip`, 'application/zip');

    // 서버 동기화
    try {
        const user = await CloudAuth.getUser();
        if (user) {
            await CloudAuth.saveProject(appState.project.name);
            appState.isDirty = false;
        }
    } catch (e) {
        console.warn('서버 동기화 실패:', e);
    }
}

// ── 자동 저장 (30초 인터벌 / beforeunload 에서 호출) ─────
function autoSaveToLocal() {
    if (!appState.project.name) return;
    // 로컬스토리지 없음 — 서버에만 저장
    CloudAuth.getUser().then(user => {
        if (user) CloudAuth.saveProject(appState.project.name)
            .then(() => { appState.isDirty = false; })
            .catch(e => console.warn('자동 저장 실패:', e));
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
