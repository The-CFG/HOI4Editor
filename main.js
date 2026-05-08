// ════════════════════════════════════════════════════════
//  main.js — 화면 전환 라우터 + 전역 이벤트
//  의존: state.js → io.js → home.js → explorer.js
//        → editor.js → localisation.js → main.js
// ════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

    // ── 화면 전환 ──────────────────────────────────────
    // 사용 가능한 뷰 ID 목록
    const ALL_VIEWS = [
        'home-view',
        'explorer-view',
        'focus-editor-view',
        'localisation-editor-view',
        'gfx-editor-view',
    ];

    window.switchView = function(viewId) {
        ALL_VIEWS.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('hidden', id !== viewId);
        });
        // 편집기에서 나갈 때 드로어 닫기
        if (viewId !== 'focus-editor-view') closeEditorPanel?.();
    };

    // ── 초기화 ─────────────────────────────────────────
    setupHomeListeners();
    setupExplorerListeners();
    setupPanelFormListeners();
    setupLocalisationEditorListeners();
    setupGfxEditorListeners();

    // 드로어 닫기 버튼
    document.getElementById('btn-close-panel')
        ?.addEventListener('click', closeEditorPanel);

    // ── 전역 키보드 단축키 ─────────────────────────────
    document.addEventListener('keydown', e => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
        const ctrl = e.ctrlKey || e.metaKey;
        if (ctrl && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); }
        if (ctrl && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
        if (ctrl && e.key === 's') {
            e.preventDefault();
            // 편집기 내부면 파일 저장, 아니면 프로젝트 ZIP 저장
            const fd = currentFileData();
            const filename = appState.currentFile?.split('/').pop();
            if (fd?.type === 'national_focus' && filename)
                downloadBlob(buildFocusTxt(fd), filename);
            else if (fd?.type === 'localisation' && filename)
                downloadBlob(buildLocYml(fd), filename, 'text/yaml;charset=utf-8');
            else
                saveProjectZip();
        }
    });

    // ── 미저장 경고 ────────────────────────────────────
    window.addEventListener('beforeunload', e => {
        if (appState.isDirty) {
            autoSaveToLocal();  // 닫기 전 마지막 자동 저장
            e.preventDefault(); e.returnValue = '';
        }
    });

    // ── 30초 주기 자동 저장 ────────────────────────────
    setInterval(() => {
        if (appState.isDirty && appState.project.name) autoSaveToLocal();
    }, 30_000);

    // ── 프로젝트 저장 버튼 (탐색기 툴바) ───────────────
    // setupExplorerListeners에서 연결, 여기서는 전역 저장 단축키만

    // ── 시작 화면 ──────────────────────────────────────
    switchView('home-view');
});
