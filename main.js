// ════════════════════════════════════════════════════════
//  main.js — 화면 전환 라우터 + 전역 이벤트
//  의존: state.js → io.js → home.js → explorer.js
//        → editor.js → localisation.js → auth.js → main.js
// ════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://uzokrwwzksgunrcdjlug.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6b2tyd3d6a3NndW5yY2RqbHVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDQ3OTMsImV4cCI6MjA5NDA4MDc5M30.WZcxh7bhpILqed15vnBof-E1LXkAEXLdxO2UY43iYJU';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {

    // ── 화면 전환 ──────────────────────────────────────
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
        if (viewId !== 'focus-editor-view') closeEditorPanel?.();
    };

    // ── 인증 상태 변경 감지 ────────────────────────────
    _supabase.auth.onAuthStateChange((event, session) => {
        const user = session?.user;
        if (user) {
            console.log('연결된 계정:', user.email);
            // 로그인 시 홈 화면 클라우드 목록 갱신
            renderRecentList();
        } else {
            console.log('로그아웃 상태');
            renderRecentList();
        }
    });

    // ── 초기화 ─────────────────────────────────────────
    setupHomeListeners();
    setupExplorerListeners();
    setupPanelFormListeners();
    setupLocalisationEditorListeners();
    setupGfxEditorListeners();
    setupAuthUI();

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
            const fd       = currentFileData();
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
        if (appState.isDirty && appState.project.name) {
            autoSaveToLocal();  // 로컬 + 클라우드 동시 처리 (home.js)
        }
    }, 30_000);

    // ── 시작 화면 ──────────────────────────────────────
    switchView('home-view');
});
