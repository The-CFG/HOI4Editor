// ════════════════════════════════════════════════════════
//  main.js — DOM 참조, 이벤트 리스너, 초기화
//  의존: state.js → editor.js → io.js → main.js (순서대로 로드)
// ════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

    // ── DOM 참조 ────────────────────────────────────────
    const leftPanel          = document.getElementById('left-panel');
    const overlay            = document.getElementById('overlay');
    const btnNewFocus        = document.getElementById('btn-new-focus');
    const btnTreeSettings    = document.getElementById('btn-tree-settings');
    const btnClosePanel      = document.getElementById('btn-close-panel');
    const btnManageElements  = document.getElementById('btn-manage-elements');
    const btnBackToFocus     = document.getElementById('btn-back-to-focus');
    const focusEditorView    = document.getElementById('focus-editor-view');
    const linkedElementsView = document.getElementById('linked-elements-view');
    const btnMobileMenu      = document.getElementById('btn-mobile-menu');
    const fileLoaderProject  = document.getElementById('file-loader-project');
    const fileLoaderLoc      = document.getElementById('file-loader-localisation');

    // ── 편집 패널 버튼 ──────────────────────────────────
    btnNewFocus.addEventListener('click',     () => openEditorPanel('new'));
    btnTreeSettings.addEventListener('click', () => openEditorPanel('settings'));
    btnClosePanel.addEventListener('click',   closeEditorPanel);
    setupPanelFormListeners();   // editor.js

    // ── Undo / Redo ─────────────────────────────────────
    document.getElementById('btn-undo')?.addEventListener('click', undo);
    document.getElementById('btn-redo')?.addEventListener('click', redo);
    document.addEventListener('keydown', e => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
    });

    // ── 모바일 메뉴 / 오버레이 ──────────────────────────
    btnMobileMenu.addEventListener('click', () => {
        leftPanel.classList.add('open');
        overlay.classList.remove('hidden');
    });
    overlay.addEventListener('click', () => {
        leftPanel.classList.remove('open');
        closeEditorPanel();
        closeAllDropdowns();
    });

    // ── 화면 전환 ───────────────────────────────────────
    btnManageElements.addEventListener('click', () => {
        focusEditorView.classList.add('hidden');
        linkedElementsView.classList.remove('hidden');
        closeEditorPanel();
        leftPanel.classList.remove('open');
        renderLocalisationList();
    });
    btnBackToFocus.addEventListener('click', () => {
        focusEditorView.classList.remove('hidden');
        linkedElementsView.classList.add('hidden');
    });

    // ── 로컬라이제이션 UI ───────────────────────────────
    setupLocalisationListeners();  // io.js

    // ── 파일 로더 ───────────────────────────────────────
    setupFileLoaders();  // io.js

    // ── 드롭다운 메뉴 ───────────────────────────────────
    function closeAllDropdowns() {
        document.querySelectorAll('.menu-dropdown.open')
            .forEach(d => d.classList.remove('open'));
        document.querySelectorAll('.menu-dropdown-trigger.active')
            .forEach(b => b.classList.remove('active'));
    }

    function setupDropdown(triggerId, dropdownId) {
        const trigger  = document.getElementById(triggerId);
        const dropdown = document.getElementById(dropdownId);
        if (!trigger || !dropdown) return;
        trigger.addEventListener('click', e => {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('open');
            closeAllDropdowns();
            if (!isOpen) {
                dropdown.classList.add('open');
                trigger.classList.add('active');
            }
        });
    }

    setupDropdown('btn-load', 'dropdown-load');
    setupDropdown('btn-save', 'dropdown-save');

    document.addEventListener('click', closeAllDropdowns);
    document.querySelectorAll('.menu-dropdown')
        .forEach(d => d.addEventListener('click', e => e.stopPropagation()));

    // 불러오기 드롭다운 항목
    document.getElementById('dropdown-load')?.addEventListener('click', e => {
        const li = e.target.closest('li[data-action]');
        if (!li || li.classList.contains('soon')) return;
        closeAllDropdowns();
        switch (li.dataset.action) {
            case 'load-project':      fileLoaderProject.click(); break;
            case 'load-focus':        document.getElementById('file-loader-focus').click(); break;
            case 'load-localisation': fileLoaderLoc.click(); break;
        }
    });

    // 내보내기 드롭다운 항목
    document.getElementById('dropdown-save')?.addEventListener('click', async e => {
        const li = e.target.closest('li[data-action]');
        if (!li || li.classList.contains('soon')) return;
        closeAllDropdowns();
        switch (li.dataset.action) {
            case 'export-zip':          await exportZip();          break;
            case 'export-focus':        exportFocusTxt();           break;
            case 'export-localisation': exportLocalisation();       break;
        }
    });

    // ── 미저장 경고 ─────────────────────────────────────
    window.addEventListener('beforeunload', e => {
        if (appState.isDirty) { e.preventDefault(); e.returnValue = ''; }
    });

    // ── 초기화 ──────────────────────────────────────────
    saveSnapshot('초기 상태');
    renderFocusTree();
});
