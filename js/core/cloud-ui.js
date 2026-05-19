// ════════════════════════════════════════════════════════
//  cloud-ui.js — 저장/진행 공용 UI 유틸
//  editor·gfx-editor·localisation·explorer·main에서 공용 호출
//  의존: state.js, auth.js
// ════════════════════════════════════════════════════════

// ── 프로그레스 모달 ──────────────────────────────────────
function _progressShow(title, icon = '☁️') {
    const modal = document.getElementById('progress-modal');
    if (!modal) return;
    document.getElementById('progress-title').textContent     = title;
    document.getElementById('progress-icon').textContent      = icon;
    document.getElementById('progress-detail').textContent    = '';
    document.getElementById('progress-bar-fill').style.width  = '0%';
    document.getElementById('progress-pct').textContent       = '0%';
    document.getElementById('progress-step-label').textContent = '';
    modal.style.display = 'flex';
}
function _progressUpdate(pct, detail) {
    const fill = document.getElementById('progress-bar-fill');
    if (fill) fill.style.width = pct + '%';
    const pctEl = document.getElementById('progress-pct');
    if (pctEl) pctEl.textContent = pct + '%';
    const detailEl = document.getElementById('progress-detail');
    if (detailEl) detailEl.textContent = detail || '';
}
function _progressHide() {
    const modal = document.getElementById('progress-modal');
    if (modal) modal.style.display = 'none';
}

// ── 단일 파일 서버 저장 (Ctrl+S / 편집기 버튼 공용) ─────
async function _saveCurrentFileToServer(filePath, fd) {
    if (!appState.project.name) { alert('프로젝트가 없습니다.'); return; }
    const user = await CloudAuth.getUser();
    if (!user) { alert('로그인이 필요합니다.'); return; }
    try {
        await CloudAuth.saveOneFile(appState.project.name, filePath, fd);
        appState.isDirty = false;
        _showSaveToast(`저장됨: ${filePath.split('/').pop()}`);
    } catch (e) {
        alert('저장 실패:\n' + e.message);
    }
}

// ── 저장 완료 토스트 ─────────────────────────────────────
function _showSaveToast(msg) {
    let toast = document.getElementById('save-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'save-toast';
        toast.style.cssText = `
            position:fixed;bottom:24px;right:24px;z-index:9999;
            background:var(--accent,#4caf50);color:#fff;
            padding:8px 18px;border-radius:8px;
            font-size:.9rem;box-shadow:0 2px 12px rgba(0,0,0,.3);
            transition:opacity .3s;pointer-events:none;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = '☁️ ' + msg;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2000);
}

// ── 자동 저장 (30초 인터벌 / beforeunload) ───────────────
function autoSaveToLocal() {
    if (!appState.project.name) return;
    CloudAuth.getUser().then(user => {
        if (user) CloudAuth.saveProject(appState.project.name)
            .then(() => { appState.isDirty = false; })
            .catch(e => console.warn('자동 저장 실패:', e));
    }).catch(() => {});
}
