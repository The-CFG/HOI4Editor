// ════════════════════════════════════════════════════════
//  main.js — 화면 전환 라우터 + 전역 이벤트
//  의존: state.js → io.js → home.js → explorer.js
//        → editor.js → localisation.js → main.js
// ════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://uzokrwwzksgunrcdjlug.supabase.co'; // Netlify 환경변수 값
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6b2tyd3d6a3NndW5yY2RqbHVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDQ3OTMsImV4cCI6MjA5NDA4MDc5M30.WZcxh7bhpILqed15vnBof-E1LXkAEXLdxO2UY43iYJU';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
    _supabase.auth.onAuthStateChange((event, session) => {
        const user = session?.user;
        if (user) {
            console.log("연결된 계정:", user.email);
            // 여기에 로그인 성공 시 UI 변경 로직 (예: 닉네임 표시)을 넣으세요.
        } else {
            console.log("로그아웃 상태");
        }
    });

    setupHomeListeners();
    setupExplorerListeners();
    setupPanelFormListeners();
    setupLocalisationEditorListeners();
    setupGfxEditorListeners();
    setupAuthUI();

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
    setInterval(async () => {
        if (appState.isDirty && appState.project.name) {
            // 1. 기존 로컬 저장
            autoSaveToLocal(); 

            // 2. 추가: 로그인되어 있다면 클라우드 저장
            if (typeof CloudAuth !== 'undefined') {
                await CloudAuth.saveProject('hoi4_editor', appState.project.name, appState.project);
            }
        }
    }, 30_000);

    // ── 프로젝트 저장 버튼 (탐색기 툴바) ───────────────
    // setupExplorerListeners에서 연결, 여기서는 전역 저장 단축키만

    // ── 시작 화면 ──────────────────────────────────────
    switchView('home-view');
});
