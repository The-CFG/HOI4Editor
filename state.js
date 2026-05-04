// ════════════════════════════════════════════════════════
//  state.js — 전역 상태 + Undo/Redo
//  다른 모든 스크립트가 이 파일에 의존합니다.
// ════════════════════════════════════════════════════════

const GRID_SCALE_X = 80;
const GRID_SCALE_Y = 100;

// ── 애플리케이션 전역 상태 ──────────────────────────────
const appState = {
    _dirty: false,
    get isDirty() { return this._dirty; },
    set isDirty(val) {
        this._dirty = val;
        const h1 = document.querySelector('.menu-container h1');
        if (h1) h1.textContent = val ? 'HOI4 편집기 *' : 'HOI4 편집기';
    },

    focuses:        {},
    selectedFocusId: null,

    // Focus Tree 설정
    treeId:                  'my_focus_tree',
    countryTag:              'GEN',
    defaultTree:             false,
    sharedFocuses:           [],
    continuousFocusPosition: false,
    continuousX:             50,
    continuousY:             2740,
    resetOnCivilwar:         true,
    initialShowX:            0,
    initialShowY:            0,

    // 로컬라이제이션 (언어별 {id: {name, desc}})
    localisation: {
        english: {}, korean: {}, japanese: {}, german: {},
        french: {}, spanish: {}, russian: {}, polish: {},
        braz_por: {}, simp_chinese: {}
    }
};

// ── Undo / Redo ─────────────────────────────────────────
const MAX_HISTORY = 50;
let _history      = [];
let _historyIndex = -1;

function saveSnapshot(label = '') {
    _history.splice(_historyIndex + 1);
    _history.push({
        label,
        focuses:      JSON.parse(JSON.stringify(appState.focuses)),
        localisation: JSON.parse(JSON.stringify(appState.localisation))
    });
    if (_history.length > MAX_HISTORY) _history.shift();
    _historyIndex = _history.length - 1;
    _updateUndoRedoButtons();
}

function undo() {
    if (_historyIndex <= 0) return;
    _historyIndex--;
    _restoreSnapshot(_history[_historyIndex]);
}

function redo() {
    if (_historyIndex >= _history.length - 1) return;
    _historyIndex++;
    _restoreSnapshot(_history[_historyIndex]);
}

function _restoreSnapshot(snap) {
    appState.focuses      = JSON.parse(JSON.stringify(snap.focuses));
    appState.localisation = JSON.parse(JSON.stringify(snap.localisation));
    appState.isDirty = true;
    // editor.js에서 정의된 함수 호출
    closeEditorPanel();
    renderFocusTree();
    _updateUndoRedoButtons();
}

function _updateUndoRedoButtons() {
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    if (btnUndo) {
        btnUndo.disabled = _historyIndex <= 0;
        btnUndo.title    = _history[_historyIndex - 1]?.label
            ? `실행 취소: ${_history[_historyIndex - 1].label}` : '실행 취소 (Ctrl+Z)';
    }
    if (btnRedo) {
        btnRedo.disabled = _historyIndex >= _history.length - 1;
        btnRedo.title    = _history[_historyIndex + 1]?.label
            ? `다시 실행: ${_history[_historyIndex + 1].label}` : '다시 실행 (Ctrl+Y)';
    }
}
