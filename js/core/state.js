// ════════════════════════════════════════════════════════
//  state.js — 전역 상태 + Undo/Redo
// ════════════════════════════════════════════════════════

// ── 프로젝트 구조 ────────────────────────────────────────
// appState.project.files 키 = 경로 (예: 'common/national_focus/GEN_focus.txt')
// 값 = { type, ...파일별 데이터 }
//   type 'national_focus' : { settings:{}, focuses:{} }
//   type 'localisation'   : { lang:'', data:{} }

const appState = {
    _dirty: false,
    get isDirty() { return this._dirty; },
    set isDirty(val) {
        this._dirty = val;
        // 홈 화면일 때는 표시 안 함
        const titleEl = document.getElementById('project-title-display');
        if (titleEl) titleEl.textContent =
            (this.project.name || '새 프로젝트') + (val ? ' *' : '');
    },

    // ── 현재 프로젝트 ──────────────────────────────────
    project: {
        name: '',       // 모드명 (= ZIP 루트 폴더명)
        files: {}       // { 'path/to/file': fileObject }
    },

    // ── 현재 열린 파일 경로 ────────────────────────────
    currentFile: null,

    // ── 중점 편집기 전용 임시 상태 (파일 열릴 때 세팅) ──
    selectedFocusId: null,
};

// ── 현재 파일 데이터 헬퍼 ───────────────────────────────
function currentFileData() {
    return appState.currentFile
        ? appState.project.files[appState.currentFile]
        : null;
}

// ── 빈 파일 객체 생성 ───────────────────────────────────
function makeNationalFocusFile(countryTag = 'GEN') {
    return {
        type: 'national_focus',
        settings: {
            treeId: `${countryTag}_focus`,
            countryTag,
            defaultTree: false,
            sharedFocuses: [],
            continuousFocusPosition: false,
            continuousX: 50,
            continuousY: 2740,
            resetOnCivilwar: true,
            initialShowX: 0,
            initialShowY: 0,
        },
        focuses: {}
    };
}

function makeIdeasFile() {
    return {
        type: 'ideas',
        categories: {
            country: {
                _attrs: { law: false, designer: false, use_list_view: false },
                ideas: {}
            }
        }
    };
}

function makeLocalisationFile(lang = 'english') {
    return { type: 'localisation', lang, data: {} };
}

// ── Undo / Redo (파일 단위) ──────────────────────────────
const MAX_HISTORY = 50;
let _history      = [];
let _historyIndex = -1;

function saveSnapshot(label = '') {
    if (!appState.currentFile) return;
    _history.splice(_historyIndex + 1);
    _history.push({
        label,
        path: appState.currentFile,
        fileData: JSON.parse(JSON.stringify(currentFileData()))
    });
    if (_history.length > MAX_HISTORY) _history.shift();
    _historyIndex = _history.length - 1;
    _updateUndoRedoButtons();
}

function undo() {
    if (_historyIndex <= 0) return;
    _historyIndex--;
    _applySnapshot(_history[_historyIndex]);
}

function redo() {
    if (_historyIndex >= _history.length - 1) return;
    _historyIndex++;
    _applySnapshot(_history[_historyIndex]);
}

function _applySnapshot(snap) {
    if (!appState.project.files[snap.path]) return;
    appState.project.files[snap.path] = JSON.parse(JSON.stringify(snap.fileData));
    appState.isDirty = true;
    // 열린 파일과 같은 경우만 화면 갱신
    if (appState.currentFile === snap.path) refreshCurrentEditor();
    _updateUndoRedoButtons();
}

function resetHistory() {
    _history = [];
    _historyIndex = -1;
    _updateUndoRedoButtons();
}

function _updateUndoRedoButtons() {
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    if (btnUndo) {
        btnUndo.disabled = _historyIndex <= 0;
        btnUndo.title = _history[_historyIndex - 1]?.label
            ? `실행 취소: ${_history[_historyIndex - 1].label}` : '실행 취소 (Ctrl+Z)';
    }
    if (btnRedo) {
        btnRedo.disabled = _historyIndex >= _history.length - 1;
        btnRedo.title = _history[_historyIndex + 1]?.label
            ? `다시 실행: ${_history[_historyIndex + 1].label}` : '다시 실행 (Ctrl+Y)';
    }
}

// refreshCurrentEditor는 main.js에서 정의 (순환 참조 방지를 위해 지연 호출)
function refreshCurrentEditor() {
    const fd = currentFileData();
    if (!fd) return;
    if (fd.type === 'national_focus') renderFocusTree?.();
    if (fd.type === 'localisation')   renderLocalisationList?.();
    if (fd.type === 'ideas')          renderIdeasEditor?.();
}