document.addEventListener('DOMContentLoaded', () => {

    // ══════════════════════════════════════════════
    //  DOM 참조
    // ══════════════════════════════════════════════
    const leftPanel            = document.getElementById('left-panel');
    const editorDrawerPanel    = document.getElementById('editor-drawer-panel');
    const panelContent         = document.getElementById('panel-content');
    const panelTitle           = document.getElementById('panel-title');
    const visualEditor         = document.getElementById('visual-editor');
    const fileLoaderProject    = document.getElementById('file-loader-project');
    const fileLoaderFocus      = document.getElementById('file-loader-focus');
    const btnNewFocus          = document.getElementById('btn-new-focus');
    const btnTreeSettings      = document.getElementById('btn-tree-settings');
    const btnClosePanel        = document.getElementById('btn-close-panel');
    const btnManageElements    = document.getElementById('btn-manage-elements');
    const btnBackToFocus       = document.getElementById('btn-back-to-focus');
    const focusEditorView      = document.getElementById('focus-editor-view');
    const linkedElementsView   = document.getElementById('linked-elements-view');
    const btnMobileMenu        = document.getElementById('btn-mobile-menu');
    const overlay              = document.getElementById('overlay');
    const focusCountSpan       = document.getElementById('focus-count');

    // ══════════════════════════════════════════════
    //  애플리케이션 상태
    // ══════════════════════════════════════════════
    const appState = {
        _dirty: false,
        get isDirty() { return this._dirty; },
        set isDirty(val) {
            this._dirty = val;
            const h1 = document.querySelector('.menu-container h1');
            if (h1) h1.textContent = val ? 'HOI4 편집기 *' : 'HOI4 편집기';
        },
        focuses: {},
        selectedFocusId: null,
        treeId: 'my_focus_tree',
        countryTag: 'GEN',
        defaultTree: false,
        sharedFocuses: [],
        continuousFocusPosition: false,
        continuousX: 50,
        continuousY: 2740,
        resetOnCivilwar: true,
        initialShowX: 0,
        initialShowY: 0,
        localisation: {
            english: {}, korean: {}, japanese: {}, german: {},
            french: {}, spanish: {}, russian: {}, polish: {},
            braz_por: {}, simp_chinese: {}
        }
    };

    const GRID_SCALE_X = 80;
    const GRID_SCALE_Y = 100;

    // ══════════════════════════════════════════════
    //  Undo / Redo
    // ══════════════════════════════════════════════
    const MAX_HISTORY = 50;
    let history = [];
    let historyIndex = -1;

    function saveSnapshot(label = '') {
        history.splice(historyIndex + 1);
        history.push({
            label,
            focuses: JSON.parse(JSON.stringify(appState.focuses)),
            localisation: JSON.parse(JSON.stringify(appState.localisation))
        });
        if (history.length > MAX_HISTORY) history.shift();
        historyIndex = history.length - 1;
        updateUndoRedoButtons();
    }

    function undo() {
        if (historyIndex <= 0) return;
        historyIndex--;
        restoreSnapshot(history[historyIndex]);
    }

    function redo() {
        if (historyIndex >= history.length - 1) return;
        historyIndex++;
        restoreSnapshot(history[historyIndex]);
    }

    function restoreSnapshot(snap) {
        appState.focuses = JSON.parse(JSON.stringify(snap.focuses));
        appState.localisation = JSON.parse(JSON.stringify(snap.localisation));
        appState.isDirty = true;
        closeEditorPanel();
        renderFocusTree();
        updateUndoRedoButtons();
    }

    function updateUndoRedoButtons() {
        const btnUndo = document.getElementById('btn-undo');
        const btnRedo = document.getElementById('btn-redo');
        if (btnUndo) {
            btnUndo.disabled = historyIndex <= 0;
            btnUndo.title = history[historyIndex - 1]?.label
                ? `실행 취소: ${history[historyIndex - 1].label}` : '실행 취소 (Ctrl+Z)';
        }
        if (btnRedo) {
            btnRedo.disabled = historyIndex >= history.length - 1;
            btnRedo.title = history[historyIndex + 1]?.label
                ? `다시 실행: ${history[historyIndex + 1].label}` : '다시 실행 (Ctrl+Y)';
        }
    }

    // ══════════════════════════════════════════════
    //  드로어 패널 열기 / 닫기
    // ══════════════════════════════════════════════
    function openEditorPanel(mode, focusId = null) {
        appState.selectedFocusId = focusId;
        const focus = focusId ? appState.focuses[focusId] : null;

        switch (mode) {
            case 'new':
                panelTitle.textContent = '새 중점 만들기';
                panelContent.innerHTML = generateFocusForm({});
                setupAutocomplete();
                break;
            case 'edit':
                panelTitle.textContent = `중점 편집: ${focus.id}`;
                panelContent.innerHTML = generateFocusForm(focus);
                setupAutocomplete();
                break;
            case 'settings':
                panelTitle.textContent = '중점계통도 설정';
                panelContent.innerHTML = generateSettingsForm();
                setupSettingsListeners();
                break;
        }
        editorDrawerPanel.classList.add('open');
        overlay.classList.remove('hidden');
        // 모바일: 왼쪽 패널 닫기
        leftPanel.classList.remove('open');
    }

    function closeEditorPanel() {
        editorDrawerPanel.classList.remove('open');
        overlay.classList.add('hidden');
        if (appState.selectedFocusId) {
            document.querySelector(`[data-id="${appState.selectedFocusId}"]`)?.classList.remove('selected');
        }
        appState.selectedFocusId = null;
    }

    // ══════════════════════════════════════════════
    //  유틸
    // ══════════════════════════════════════════════
    function escapeHtml(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function downloadBlob(content, filename, type = 'text/plain;charset=utf-8') {
        const blob = new Blob([content], { type });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    // ══════════════════════════════════════════════
    //  중점계통도 설정 폼
    // ══════════════════════════════════════════════
    function generateSettingsForm() {
        const s = appState;
        return `
            <h4>기본 설정</h4>
            <div class="form-group">
                <label for="cfg-tree-id">Focus Tree ID</label>
                <input type="text" id="cfg-tree-id" value="${escapeHtml(s.treeId)}" placeholder="my_focus_tree">
            </div>
            <div class="form-group">
                <label for="cfg-country-tag">국가 태그 (Country Tag)</label>
                <input type="text" id="cfg-country-tag" value="${escapeHtml(s.countryTag)}" maxlength="3" placeholder="GEN">
            </div>
            <div class="form-group-checkbox">
                <label><input type="checkbox" id="cfg-default-tree" ${s.defaultTree ? 'checked' : ''}> 기본 중점 트리 (Default)</label>
                <small>전체에서 단 하나의 트리만 기본으로 설정해야 합니다</small>
            </div>
            <div class="form-group">
                <label for="cfg-shared-focuses">공유 중점 (Shared Focuses)</label>
                <input type="text" id="cfg-shared-focuses" value="${escapeHtml(s.sharedFocuses.join(', '))}" placeholder="id_1, id_2, ...">
            </div>
            <hr>
            <h4>연속 중점</h4>
            <div class="form-group-checkbox">
                <label><input type="checkbox" id="cfg-continuous-focus" ${s.continuousFocusPosition ? 'checked' : ''}> 연속 중점 표시</label>
            </div>
            <div class="form-group">
                <label for="cfg-continuous-x">연속 중점 X 좌표</label>
                <input type="number" id="cfg-continuous-x" value="${s.continuousX}">
            </div>
            <div class="form-group">
                <label for="cfg-continuous-y">연속 중점 Y 좌표</label>
                <input type="number" id="cfg-continuous-y" value="${s.continuousY}">
            </div>
            <hr>
            <h4>기타</h4>
            <div class="form-group-checkbox">
                <label><input type="checkbox" id="cfg-reset-civilwar" ${s.resetOnCivilwar ? 'checked' : ''}> 내전 시 초기화</label>
            </div>
            <div class="form-group">
                <label for="cfg-initial-x">초기 표시 X</label>
                <input type="number" id="cfg-initial-x" value="${s.initialShowX}">
            </div>
            <div class="form-group">
                <label for="cfg-initial-y">초기 표시 Y</label>
                <input type="number" id="cfg-initial-y" value="${s.initialShowY}">
            </div>
            <div class="form-actions">
                <button id="btn-settings-close" class="secondary">닫기</button>
            </div>
        `;
    }

    function setupSettingsListeners() {
        const bind = (id, prop, transform) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', e => {
                appState[prop] = transform(e.target);
                appState.isDirty = true;
            });
        };
        bind('cfg-tree-id',        'treeId',                 e => e.value);
        bind('cfg-country-tag',    'countryTag',             e => e.value.toUpperCase());
        bind('cfg-default-tree',   'defaultTree',            e => e.checked);
        bind('cfg-shared-focuses', 'sharedFocuses',          e => e.value.split(',').map(s => s.trim()).filter(Boolean));
        bind('cfg-continuous-focus','continuousFocusPosition',e => e.checked);
        bind('cfg-continuous-x',   'continuousX',            e => parseInt(e.value) || 50);
        bind('cfg-continuous-y',   'continuousY',            e => parseInt(e.value) || 2740);
        bind('cfg-reset-civilwar', 'resetOnCivilwar',        e => e.checked);
        bind('cfg-initial-x',      'initialShowX',           e => parseInt(e.value) || 0);
        bind('cfg-initial-y',      'initialShowY',           e => parseInt(e.value) || 0);
        document.getElementById('btn-settings-close')?.addEventListener('click', closeEditorPanel);
    }

    // ══════════════════════════════════════════════
    //  자동완성
    // ══════════════════════════════════════════════
    function setupAutocomplete() {
        const setup = (inputId, dropdownId) => {
            const input = document.getElementById(inputId);
            const dropdown = document.getElementById(dropdownId);
            if (!input || !dropdown) return;

            let selectedIndex = -1;

            input.addEventListener('input', () => {
                const query = input.value.trim().toLowerCase();
                selectedIndex = -1;
                if (!query) { dropdown.classList.remove('active'); return; }
                const matches = Object.values(appState.focuses)
                    .filter(f => f.id !== appState.selectedFocusId &&
                        (f.id.toLowerCase().includes(query) || (f.name || '').toLowerCase().includes(query)))
                    .slice(0, 10);
                if (!matches.length) { dropdown.classList.remove('active'); return; }
                dropdown.innerHTML = matches.map((f, i) => {
                    const kor = appState.localisation.korean[f.id];
                    const name = (typeof kor === 'object' ? kor?.name : kor) || f.name || '';
                    return `<div class="autocomplete-item" data-index="${i}" data-id="${escapeHtml(f.id)}">
                        <span class="autocomplete-item-id">${escapeHtml(f.id)}</span>
                        ${name !== f.id ? `<span class="autocomplete-item-name">${escapeHtml(name)}</span>` : ''}
                    </div>`;
                }).join('');
                dropdown.classList.add('active');
                dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                    item.addEventListener('click', () => {
                        input.value = item.dataset.id;
                        dropdown.classList.remove('active');
                    });
                });
            });

            input.addEventListener('keydown', e => {
                const items = [...dropdown.querySelectorAll('.autocomplete-item')];
                if (!items.length) return;
                if (e.key === 'ArrowDown') { e.preventDefault(); selectedIndex = Math.min(selectedIndex + 1, items.length - 1); }
                if (e.key === 'ArrowUp')   { e.preventDefault(); selectedIndex = Math.max(selectedIndex - 1, 0); }
                if (e.key === 'Enter' && selectedIndex >= 0) {
                    input.value = items[selectedIndex].dataset.id;
                    dropdown.classList.remove('active');
                }
                if (e.key === 'Escape') dropdown.classList.remove('active');
                items.forEach((item, i) => item.classList.toggle('selected', i === selectedIndex));
            });

            document.addEventListener('click', e => {
                if (!input.contains(e.target) && !dropdown.contains(e.target))
                    dropdown.classList.remove('active');
            }, { capture: true });
        };

        setup('focus-relative-position-id', 'relative-dropdown');
        setup('focus-prerequisite', 'prerequisite-dropdown');
        setup('focus-mutually-exclusive', 'mutually-dropdown');
    }

    // ══════════════════════════════════════════════
    //  중점 편집 폼 생성
    // ══════════════════════════════════════════════
    function generateFocusForm(focusData) {
        const v = (val) => escapeHtml(val ?? '');
        const chk = (val) => val ? 'checked' : '';
        const checkbox = (id, label, val) =>
            `<div class="form-group-checkbox"><label><input type="checkbox" id="${id}" ${chk(val)}> ${label}</label></div>`;
        const fmtPrereqs = (prereqs = []) =>
            prereqs.map(p => Array.isArray(p) ? `[${p.join(', ')}]` : p).join(', ');

        const actionBtns = focusData.id
            ? `<button id="btn-apply-changes">적용</button>
               <button id="btn-delete-focus" class="danger">삭제</button>
               <button id="btn-cancel-changes" class="secondary">취소</button>`
            : `<button id="btn-apply-changes">생성</button>
               <button id="btn-cancel-changes" class="secondary">취소</button>`;

        return `
            <h4>기본 정보</h4>
            <div class="form-group">
                <label for="focus-id">ID (필수, 고유값)</label>
                <input type="text" id="focus-id" value="${v(focusData.id)}" placeholder="my_focus_id">
                ${focusData.id ? `<small class="form-hint">⚠ ID 변경 시 참조 중점이 자동으로 업데이트됩니다.</small>` : ''}
            </div>
            <div class="form-group">
                <label for="focus-name">이름 (Localisation Key)</label>
                <input type="text" id="focus-name" value="${v(focusData.name)}" placeholder="자동: ID와 동일">
            </div>
            <div class="form-group">
                <label for="focus-icon">아이콘 (GFX Key)</label>
                <input type="text" id="focus-icon" value="${v(focusData.icon) || 'GFX_goal_unknown'}" placeholder="GFX_goal_generic_...">
            </div>
            ${checkbox('focus-dynamic-icon', '동적 아이콘 (Dynamic)', focusData.dynamic)}

            <hr>
            <h4>좌표 및 시간</h4>
            <div class="form-group">
                <label for="focus-cost">완료 시간 (Cost, 주 단위)</label>
                <input type="number" id="focus-cost" value="${focusData.cost ?? 10}" step="1" min="1">
                <small class="form-hint">• 1주 = 7일 &nbsp;|&nbsp; 기본값 10주 (70일)</small>
            </div>
            <div class="form-group">
                <label for="focus-x">X 좌표</label>
                <input type="number" id="focus-x" value="${focusData.x ?? 0}">
            </div>
            <div class="form-group">
                <label for="focus-y">Y 좌표</label>
                <input type="number" id="focus-y" value="${focusData.y ?? 0}">
            </div>
            <div class="form-group">
                <label for="focus-relative-position-id">상대 위치 기준 ID</label>
                <div class="autocomplete-container">
                    <input type="text" id="focus-relative-position-id" value="${v(focusData.relative_position_id)}" placeholder="다른 중점 ID" autocomplete="off">
                    <div id="relative-dropdown" class="autocomplete-dropdown"></div>
                </div>
            </div>
            <div class="form-group">
                <label for="focus-offset-x">오프셋 X</label>
                <input type="number" id="focus-offset-x" value="${focusData.offset?.x ?? 0}">
            </div>
            <div class="form-group">
                <label for="focus-offset-y">오프셋 Y</label>
                <input type="number" id="focus-offset-y" value="${focusData.offset?.y ?? 0}">
            </div>

            <hr>
            <h4>연결 관계</h4>
            <div class="form-group">
                <label for="focus-prerequisite">선행 조건 (Prerequisite)</label>
                <div class="autocomplete-container">
                    <input type="text" id="focus-prerequisite" value="${v(fmtPrereqs(focusData.prerequisite))}" placeholder="id1, [id2, id3] ← OR조건은 []로 묶기" autocomplete="off">
                    <div id="prerequisite-dropdown" class="autocomplete-dropdown"></div>
                </div>
            </div>
            <div class="form-group">
                <label for="focus-mutually-exclusive">상호 배타 (Mutually Exclusive)</label>
                <div class="autocomplete-container">
                    <input type="text" id="focus-mutually-exclusive" value="${v((focusData.mutually_exclusive || []).join(', '))}" placeholder="id1, id2, ..." autocomplete="off">
                    <div id="mutually-dropdown" class="autocomplete-dropdown"></div>
                </div>
            </div>

            <hr>
            <h4>조건 및 효과</h4>
            <div class="form-group">
                <label for="focus-available">available</label>
                <textarea id="focus-available" placeholder="available = { ... } 내부 내용">${v(focusData.available)}</textarea>
            </div>
            <div class="form-group">
                <label for="focus-bypass">bypass</label>
                <textarea id="focus-bypass" placeholder="bypass = { ... } 내부 내용">${v(focusData.bypass)}</textarea>
            </div>
            ${checkbox('focus-bypass-if-unavailable', 'bypass_if_unavailable', focusData.bypass_if_unavailable)}
            <div class="form-group">
                <label for="focus-cancel">cancel</label>
                <textarea id="focus-cancel" placeholder="cancel = { ... } 내부 내용">${v(focusData.cancel)}</textarea>
            </div>
            <div class="form-group">
                <label for="focus-allow-branch">allow_branch</label>
                <textarea id="focus-allow-branch" placeholder="allow_branch = { ... } 내부 내용">${v(focusData.allow_branch)}</textarea>
            </div>
            ${checkbox('focus-cancelable',           'cancelable',           focusData.cancelable)}
            ${checkbox('focus-continue-if-invalid',  'continue_if_invalid',  focusData.continue_if_invalid)}
            ${checkbox('focus-cancel-if-invalid',    'cancel_if_invalid',    focusData.cancel_if_invalid)}
            ${checkbox('focus-available-if-capitulated', 'available_if_capitulated', focusData.available_if_capitulated)}

            <hr>
            <h4>완료 효과</h4>
            <div class="form-group">
                <label for="focus-complete-effect">completion_reward</label>
                <textarea id="focus-complete-effect" placeholder="완료 시 실행할 효과">${v(focusData.complete_effect)}</textarea>
            </div>
            <div class="form-group">
                <label for="focus-select-effect">select_effect</label>
                <textarea id="focus-select-effect" placeholder="선택 시 실행할 효과">${v(focusData.select_effect)}</textarea>
            </div>

            <hr>
            <h4>AI 및 기타</h4>
            <div class="form-group">
                <label for="focus-ai-will-do">ai_will_do</label>
                <textarea id="focus-ai-will-do" placeholder="factor = 1">${v(focusData.ai_will_do)}</textarea>
            </div>
            <div class="form-group">
                <label for="focus-historical-ai">historical_ai</label>
                <textarea id="focus-historical-ai" placeholder="...">${v(focusData.historical_ai)}</textarea>
            </div>
            <div class="form-group">
                <label for="focus-will-lead-to-war">will_lead_to_war_with</label>
                <input type="text" id="focus-will-lead-to-war" value="${v((focusData.will_lead_to_war_with || []).join(', '))}" placeholder="TAG1, TAG2, ...">
            </div>
            <div class="form-group">
                <label for="focus-search-filters">search_filters</label>
                <input type="text" id="focus-search-filters" value="${v((focusData.search_filters || []).join(', '))}" placeholder="FOCUS_FILTER_...">
            </div>
            <div class="form-group">
                <label for="focus-text-icon">text_icon</label>
                <input type="text" id="focus-text-icon" value="${v(focusData.text_icon)}" placeholder="아이콘 텍스트">
            </div>

            <div class="form-actions">${actionBtns}</div>
        `;
    }

    // ══════════════════════════════════════════════
    //  폼 데이터 추출
    // ══════════════════════════════════════════════
    function extractFormData() {
        const gv  = id => document.getElementById(id)?.value?.trim() || '';
        const gc  = id => document.getElementById(id)?.checked || false;
        const gn  = id => parseInt(document.getElementById(id)?.value) || 0;
        const gnf = id => parseFloat(document.getElementById(id)?.value) || 0;

        const parsePrerequisites = str => {
            if (!str) return [];
            const result = [];
            const regex = /\[([^\]]+)\]|([^,\[\]]+)/g;
            let m;
            while ((m = regex.exec(str)) !== null) {
                if (m[1]) result.push(m[1].split(',').map(s => s.trim()).filter(Boolean));
                else if (m[2]?.trim()) result.push(m[2].trim());
            }
            return result;
        };
        const parseList = str => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];

        return {
            id:                       gv('focus-id'),
            name:                     gv('focus-name') || gv('focus-id'),
            icon:                     gv('focus-icon') || 'GFX_goal_unknown',
            dynamic:                  gc('focus-dynamic-icon'),
            cost:                     gnf('focus-cost') || 10,
            x:                        gn('focus-x'),
            y:                        gn('focus-y'),
            relative_position_id:     gv('focus-relative-position-id') || null,
            offset:                   { x: gn('focus-offset-x'), y: gn('focus-offset-y') },
            prerequisite:             parsePrerequisites(gv('focus-prerequisite')),
            mutually_exclusive:       parseList(gv('focus-mutually-exclusive')),
            available:                gv('focus-available'),
            bypass:                   gv('focus-bypass'),
            bypass_if_unavailable:    gc('focus-bypass-if-unavailable'),
            cancel:                   gv('focus-cancel'),
            allow_branch:             gv('focus-allow-branch'),
            cancelable:               gc('focus-cancelable'),
            continue_if_invalid:      gc('focus-continue-if-invalid'),
            cancel_if_invalid:        gc('focus-cancel-if-invalid'),
            available_if_capitulated: gc('focus-available-if-capitulated'),
            complete_effect:          gv('focus-complete-effect'),
            select_effect:            gv('focus-select-effect'),
            text_icon:                gv('focus-text-icon'),
            ai_will_do:               gv('focus-ai-will-do'),
            historical_ai:            gv('focus-historical-ai'),
            will_lead_to_war_with:    parseList(gv('focus-will-lead-to-war')),
            search_filters:           parseList(gv('focus-search-filters'))
        };
    }

    // ══════════════════════════════════════════════
    //  중점 노드 위치 계산 (재귀 + 순환 방지)
    // ══════════════════════════════════════════════
    function getFocusPixelPosition(focusId, visited = new Set()) {
        const focus = appState.focuses[focusId];
        if (!focus) return null;
        if (visited.has(focusId)) return { x: focus.x * GRID_SCALE_X + 100, y: focus.y * GRID_SCALE_Y + 100 };
        visited.add(focusId);

        if (focus.relative_position_id) {
            const base = getFocusPixelPosition(focus.relative_position_id, visited);
            if (base) return {
                x: base.x + focus.x * GRID_SCALE_X + (focus.offset?.x || 0) * GRID_SCALE_X,
                y: base.y + focus.y * GRID_SCALE_Y + (focus.offset?.y || 0) * GRID_SCALE_Y
            };
        }
        return { x: focus.x * GRID_SCALE_X + 100, y: focus.y * GRID_SCALE_Y + 100 };
    }

    // ══════════════════════════════════════════════
    //  비주얼 에디터 렌더링
    // ══════════════════════════════════════════════
    function renderFocusTree() {
        visualEditor.innerHTML = '';
        if (focusCountSpan) focusCountSpan.textContent = Object.keys(appState.focuses).length;

        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;';
        visualEditor.appendChild(svg);

        const positions = {};
        Object.values(appState.focuses).forEach(f => {
            const pos = getFocusPixelPosition(f.id);
            if (pos) positions[f.id] = pos;
        });

        const NODE_W = 120, NODE_H = 80;

        // 선행 조건 선
        Object.values(appState.focuses).forEach(focus => {
            if (!focus.prerequisite?.length) return;
            const toPos = positions[focus.id];
            if (!toPos) return;

            focus.prerequisite.forEach(item => {
                const prereqIds = Array.isArray(item) ? item : [item];
                prereqIds.forEach(pid => {
                    const fromPos = positions[pid];
                    if (!fromPos) return;
                    const line = document.createElementNS(svgNS, 'line');
                    line.setAttribute('x1', fromPos.x + NODE_W / 2);
                    line.setAttribute('y1', fromPos.y + NODE_H);
                    line.setAttribute('x2', toPos.x + NODE_W / 2);
                    line.setAttribute('y2', toPos.y);
                    line.setAttribute('class', `prereq-line${Array.isArray(item) ? ' or' : ''}`);
                    svg.appendChild(line);
                });
            });
        });

        // 상호 배타 선 + × 아이콘
        const drawnMutual = new Set();
        Object.values(appState.focuses).forEach(focus => {
            if (!focus.mutually_exclusive?.length) return;
            const posA = positions[focus.id];
            if (!posA) return;
            focus.mutually_exclusive.forEach(mid => {
                const key = [focus.id, mid].sort().join('|');
                if (drawnMutual.has(key)) return;
                drawnMutual.add(key);
                const posB = positions[mid];
                if (!posB) return;
                const line = document.createElementNS(svgNS, 'line');
                line.setAttribute('x1', posA.x + NODE_W / 2);
                line.setAttribute('y1', posA.y + NODE_H / 2);
                line.setAttribute('x2', posB.x + NODE_W / 2);
                line.setAttribute('y2', posB.y + NODE_H / 2);
                line.setAttribute('class', 'mutual-exclusive-line');
                svg.appendChild(line);
                const mx = (posA.x + posB.x) / 2 + NODE_W / 2;
                const my = (posA.y + posB.y) / 2 + NODE_H / 2;
                const txt = document.createElementNS(svgNS, 'text');
                txt.setAttribute('x', mx); txt.setAttribute('y', my);
                txt.setAttribute('class', 'mutual-exclusive-icon');
                txt.textContent = '✕';
                svg.appendChild(txt);
            });
        });

        // 중점 노드
        Object.values(appState.focuses).forEach(focus => {
            const pos = positions[focus.id];
            if (!pos) return;
            const node = document.createElement('div');
            node.className = 'focus-node';
            if (focus.id === appState.selectedFocusId) node.classList.add('selected');
            node.dataset.id = focus.id;
            node.style.left = pos.x + 'px';
            node.style.top  = pos.y + 'px';
            node.innerHTML = `
                <div class="focus-node-id">${escapeHtml(focus.id)}</div>
                <div class="focus-node-name">${escapeHtml(focus.name || focus.id)}</div>
                <div class="drag-handle" title="드래그하여 이동"></div>
            `;
            node.addEventListener('click', e => {
                if (e.target.classList.contains('drag-handle')) return;
                openEditorPanel('edit', focus.id);
            });
            visualEditor.appendChild(node);
        });

        setupDragAndDrop();
    }

    // ══════════════════════════════════════════════
    //  드래그 앤 드롭
    // ══════════════════════════════════════════════
    function setupDragAndDrop() {
        let draggedNode = null, startMouseX = 0, startMouseY = 0, startLeft = 0, startTop = 0;

        visualEditor.querySelectorAll('.drag-handle').forEach(handle => {
            handle.addEventListener('mousedown', e => {
                e.preventDefault();
                e.stopPropagation();
                draggedNode = handle.closest('.focus-node');
                startMouseX = e.clientX;
                startMouseY = e.clientY;
                startLeft   = parseInt(draggedNode.style.left) || 0;
                startTop    = parseInt(draggedNode.style.top)  || 0;
                draggedNode.style.zIndex = 100;
            });
        });

        document.addEventListener('mousemove', e => {
            if (!draggedNode) return;
            draggedNode.style.left = (startLeft + e.clientX - startMouseX) + 'px';
            draggedNode.style.top  = (startTop  + e.clientY - startMouseY) + 'px';
        });

        document.addEventListener('mouseup', e => {
            if (!draggedNode) return;
            const focusId = draggedNode.dataset.id;
            const focus = appState.focuses[focusId];
            if (focus) {
                const newPixelX = parseInt(draggedNode.style.left) || 0;
                const newPixelY = parseInt(draggedNode.style.top)  || 0;
                if (focus.relative_position_id) {
                    const basePos = getFocusPixelPosition(focus.relative_position_id);
                    if (basePos) {
                        focus.x = Math.round((newPixelX - basePos.x) / GRID_SCALE_X);
                        focus.y = Math.max(0, Math.round((newPixelY - basePos.y) / GRID_SCALE_Y));
                    }
                } else {
                    focus.x = Math.max(0, Math.round((newPixelX - 100) / GRID_SCALE_X));
                    focus.y = Math.max(0, Math.round((newPixelY - 100) / GRID_SCALE_Y));
                }
                appState.isDirty = true;
                saveSnapshot(`"${focusId}" 이동`);
                renderFocusTree();
            }
            draggedNode = null;
        });
    }

    // ══════════════════════════════════════════════
    //  패널 콘텐츠 이벤트 위임 (적용 / 삭제 / 취소)
    // ══════════════════════════════════════════════
    document.getElementById('panel-content').addEventListener('click', e => {
        if (e.target.id === 'btn-apply-changes') {
            e.preventDefault();
            const formData = extractFormData();
            if (!formData.id) { alert('ID를 입력해주세요.'); return; }

            const oldId = appState.selectedFocusId;
            const newId = formData.id;

            if (!oldId && appState.focuses[newId]) { alert('이미 존재하는 ID입니다.'); return; }

            if (oldId && newId !== oldId) {
                if (appState.focuses[newId]) { alert('이미 존재하는 ID입니다. 다른 ID를 입력해주세요.'); return; }
                // 참조 업데이트
                Object.values(appState.focuses).forEach(f => {
                    if (f.prerequisite) f.prerequisite = f.prerequisite.map(item =>
                        Array.isArray(item) ? item.map(p => p === oldId ? newId : p) : (item === oldId ? newId : item));
                    if (f.mutually_exclusive) f.mutually_exclusive = f.mutually_exclusive.map(m => m === oldId ? newId : m);
                    if (f.relative_position_id === oldId) f.relative_position_id = newId;
                });
                // 로컬라이제이션 키 이전
                Object.keys(appState.localisation).forEach(lang => {
                    if (appState.localisation[lang][oldId] !== undefined) {
                        appState.localisation[lang][newId] = appState.localisation[lang][oldId];
                        delete appState.localisation[lang][oldId];
                    }
                });
                delete appState.focuses[oldId];
            }

            saveSnapshot(oldId ? `"${oldId}" 편집` : `"${newId}" 생성`);
            appState.focuses[newId] = formData;

            // 로컬라이제이션 자동 저장
            if (formData.name && formData.name !== formData.id) {
                appState.localisation.korean[formData.id] = {
                    name: formData.name,
                    desc: appState.localisation.korean[formData.id]?.desc || ''
                };
            }
            appState.isDirty = true;
            renderFocusTree();
            closeEditorPanel();
        }

        if (e.target.id === 'btn-delete-focus') {
            e.preventDefault();
            if (confirm(`"${appState.selectedFocusId}" 중점을 삭제하시겠습니까?`)) {
                saveSnapshot(`"${appState.selectedFocusId}" 삭제`);
                delete appState.focuses[appState.selectedFocusId];
                appState.isDirty = true;
                renderFocusTree();
                closeEditorPanel();
            }
        }

        if (e.target.id === 'btn-cancel-changes') {
            e.preventDefault();
            closeEditorPanel();
        }
    });

    // ══════════════════════════════════════════════
    //  중점 파일 → .txt 생성 함수 (공용)
    // ══════════════════════════════════════════════
    function buildFocusTxt() {
        const fb = (key, content, indent = 2) => {
            if (!content) return '';
            const t = '\t'.repeat(indent), ti = '\t'.repeat(indent + 1);
            return `${t}${key} = {\n${ti}${content.replace(/\n/g, '\n' + ti)}\n${t}}\n`;
        };
        const fBool = (key, val, indent = 2) => val ? '\t'.repeat(indent) + `${key} = yes\n` : '';

        let out = `focus_tree = {\n\tid = ${appState.treeId}\n`;
        if (appState.defaultTree) out += `\tdefault = yes\n`;
        out += `\tcountry = {\n\t\tfactor = 0\n\t\tmodifier = {\n\t\t\tadd = 10\n\t\t\ttag = ${appState.countryTag}\n\t\t}\n\t}\n`;
        if (appState.continuousFocusPosition)
            out += `\tcontinuous_focus_position = { x = ${appState.continuousX} y = ${appState.continuousY} }\n`;
        if (!appState.resetOnCivilwar) out += `\treset_on_civilwar = no\n`;
        if (appState.initialShowX !== 0 || appState.initialShowY !== 0)
            out += `\tinitial_show_position = {\n\t\tx = ${appState.initialShowX}\n\t\ty = ${appState.initialShowY}\n\t}\n`;
        appState.sharedFocuses.forEach(sf => { out += `\tshared_focus = ${sf}\n`; });
        out += '\n';

        Object.values(appState.focuses).forEach(f => {
            out += `\tfocus = {\n`;
            out += `\t\tid = ${f.id}\n`;
            out += `\t\ticon = ${f.icon}\n`;
            if (f.dynamic) out += `\t\tdynamic = yes\n`;
            out += `\t\tcost = ${f.cost}\n`;
            if (f.prerequisite?.length) f.prerequisite.forEach(item => {
                out += Array.isArray(item)
                    ? `\t\tprerequisite = { ${item.map(p => `focus = ${p}`).join(' ')} }\n`
                    : `\t\tprerequisite = { focus = ${item} }\n`;
            });
            if (f.mutually_exclusive?.length)
                out += `\t\tmutually_exclusive = { ${f.mutually_exclusive.map(p => `focus = ${p}`).join(' ')} }\n`;
            if (f.relative_position_id) out += `\t\trelative_position_id = ${f.relative_position_id}\n`;
            out += `\t\tx = ${f.x}\n\t\ty = ${f.y}\n`;
            if (f.offset?.x || f.offset?.y)
                out += `\t\toffset = {\n\t\t\tx = ${f.offset.x}\n\t\t\ty = ${f.offset.y}\n\t\t}\n`;
            out += fb('available',           f.available);
            out += fb('bypass',              f.bypass);
            out += fBool('bypass_if_unavailable', f.bypass_if_unavailable);
            out += fb('cancel',              f.cancel);
            out += fb('allow_branch',        f.allow_branch);
            out += fBool('cancelable',           f.cancelable);
            out += fBool('continue_if_invalid',  f.continue_if_invalid);
            out += fBool('cancel_if_invalid',    f.cancel_if_invalid);
            out += fBool('available_if_capitulated', f.available_if_capitulated);
            if (f.search_filters?.length) out += `\t\tsearch_filters = { ${f.search_filters.join(' ')} }\n`;
            if (f.text_icon) out += `\t\ttext_icon = ${f.text_icon}\n`;
            out += fb('ai_will_do',          f.ai_will_do);
            out += fb('historical_ai',       f.historical_ai);
            if (f.will_lead_to_war_with?.length)
                out += `\t\twill_lead_to_war_with = { ${f.will_lead_to_war_with.join(' ')} }\n`;
            out += fb('select_effect',       f.select_effect);
            out += fb('completion_reward',   f.complete_effect);
            out += `\t}\n\n`;
        });
        out += '}';
        return out;
    }

    function buildLocFiles() {
        const locFiles = {};
        Object.entries(appState.localisation).forEach(([lang, data]) => {
            if (!Object.keys(data).length) return;
            let content = `l_${lang}:\n`;
            Object.entries(data).forEach(([id, locData]) => {
                const name = typeof locData === 'object' ? locData.name : locData;
                const desc = typeof locData === 'object' ? locData.desc : '';
                if (name?.trim()) {
                    content += ` ${id}:0 "${name}"\n`;
                    content += ` ${id}_desc:0 "${desc || ''}"\n`;
                }
            });
            locFiles[`${appState.countryTag}_focus_l_${lang}.yml`] = content;
        });
        return locFiles;
    }

    // ══════════════════════════════════════════════
    //  내보내기 함수들
    // ══════════════════════════════════════════════
    async function exportZip() {
        if (!Object.keys(appState.focuses).length) { alert('내보낼 중점이 없습니다.'); return; }
        const focusTxt  = buildFocusTxt();
        const locFiles  = buildLocFiles();
        const projectJson = JSON.stringify({
            version: 1,
            settings: {
                treeId: appState.treeId, countryTag: appState.countryTag,
                defaultTree: appState.defaultTree, sharedFocuses: appState.sharedFocuses,
                continuousFocusPosition: appState.continuousFocusPosition,
                continuousX: appState.continuousX, continuousY: appState.continuousY,
                resetOnCivilwar: appState.resetOnCivilwar,
                initialShowX: appState.initialShowX, initialShowY: appState.initialShowY
            },
            focuses: appState.focuses,
            localisation: appState.localisation
        }, null, 2);

        const allFiles = [
            { name: `${appState.countryTag}_focus.txt`,    content: focusTxt },
            { name: `${appState.countryTag}_project.json`, content: projectJson },
            ...Object.entries(locFiles).map(([n, c]) => ({ name: n, content: c }))
        ];

        if (typeof JSZip !== 'undefined') {
            const zip = new JSZip();
            allFiles.forEach(f => zip.file(f.name, f.content));
            const blob = await zip.generateAsync({ type: 'blob' });
            downloadBlob(blob, `${appState.countryTag}_hoi4_mod.zip`, 'application/zip');
            appState.isDirty = false;
            const locCount = Object.keys(locFiles).length;
            alert(`다운로드 완료: ${appState.countryTag}_hoi4_mod.zip\n` +
                  `포함: 중점 .txt, 프로젝트 .json${locCount ? `, 로컬라이제이션 ${locCount}개` : ''}`);
        } else {
            allFiles.forEach((f, i) => setTimeout(() => downloadBlob(f.content, f.name), i * 300));
            appState.isDirty = false;
        }
    }

    function exportFocusTxt() {
        if (!Object.keys(appState.focuses).length) { alert('내보낼 중점이 없습니다.'); return; }
        downloadBlob(buildFocusTxt(), `${appState.countryTag}_focus.txt`);
    }

    function exportLocalisation() {
        const lang = document.getElementById('localisation-language')?.value || 'english';
        const loc  = appState.localisation[lang];
        if (!Object.keys(loc || {}).length) { alert('저장된 로컬라이제이션이 없습니다.'); return; }
        let content = `l_${lang}:\n`;
        Object.entries(loc).forEach(([id, data]) => {
            const name = typeof data === 'object' ? data.name : data;
            const desc = typeof data === 'object' ? data.desc : '';
            if (name?.trim()) { content += ` ${id}:0 "${name}"\n`; content += ` ${id}_desc:0 "${desc || ''}"\n`; }
        });
        downloadBlob(content, `${appState.countryTag}_focus_l_${lang}.yml`, 'text/yaml;charset=utf-8');
    }

    // ══════════════════════════════════════════════
    //  불러오기 핸들러
    // ══════════════════════════════════════════════
    fileLoaderProject.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const proj = JSON.parse(ev.target.result);
                if (!proj.focuses) throw new Error('유효하지 않은 프로젝트 파일입니다.');
                const s = proj.settings || {};
                appState.focuses      = proj.focuses;
                appState.localisation = proj.localisation || appState.localisation;
                appState.treeId       = s.treeId       || 'my_focus_tree';
                appState.countryTag   = s.countryTag   || 'GEN';
                appState.defaultTree  = s.defaultTree  || false;
                appState.sharedFocuses = s.sharedFocuses || [];
                appState.continuousFocusPosition = s.continuousFocusPosition || false;
                appState.continuousX  = s.continuousX  || 50;
                appState.continuousY  = s.continuousY  || 2740;
                appState.resetOnCivilwar = s.resetOnCivilwar !== false;
                appState.initialShowX = s.initialShowX || 0;
                appState.initialShowY = s.initialShowY || 0;
                saveSnapshot('프로젝트 불러오기');
                renderFocusTree();
                alert(`프로젝트를 불러왔습니다. (중점 ${Object.keys(appState.focuses).length}개)`);
            } catch (err) {
                alert('프로젝트 파일을 불러오는 중 오류가 발생했습니다.\n' + err.message);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    // ══════════════════════════════════════════════
    //  중점 파일 파서
    // ══════════════════════════════════════════════
    fileLoaderFocus.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            const parsed = parseFocusFile(ev.target.result);
            if (parsed && Object.keys(parsed.focuses).length > 0) {
                const merge = Object.keys(appState.focuses).length > 0 &&
                    confirm('기존 중점이 있습니다.\n[확인] 기존에 합치기\n[취소] 기존을 지우고 새로 불러오기');
                if (merge) {
                    Object.assign(appState.focuses, parsed.focuses);
                } else {
                    appState.focuses = parsed.focuses;
                    const s = parsed.settings;
                    appState.treeId = s.treeId; appState.countryTag = s.countryTag;
                    appState.defaultTree = s.defaultTree; appState.sharedFocuses = s.sharedFocuses;
                    appState.continuousFocusPosition = s.continuousFocusPosition;
                    appState.continuousX = s.continuousX; appState.continuousY = s.continuousY;
                    appState.resetOnCivilwar = s.resetOnCivilwar;
                    appState.initialShowX = s.initialShowX; appState.initialShowY = s.initialShowY;
                }
                saveSnapshot('중점 파일 불러오기');
                renderFocusTree();
                alert(`중점 파일을 불러왔습니다. (중점 ${Object.keys(parsed.focuses).length}개)`);
            } else {
                alert('유효한 중점 블록을 찾을 수 없습니다.\nfocus_tree = { ... } 형식인지 확인해주세요.');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    function parseFocusFile(fileContent) {
        const focuses = {};
        const settings = {
            treeId: 'my_focus_tree', countryTag: 'GEN', defaultTree: false,
            sharedFocuses: [], continuousFocusPosition: false,
            continuousX: 50, continuousY: 2740, resetOnCivilwar: true,
            initialShowX: 0, initialShowY: 0
        };

        const getVal  = (key, text) => (text.match(new RegExp(`(?:^|\\s)${key}\\s*=\\s*(\\S+)`)) || [])[1];
        const getBool = (key, text) => /yes/i.test(getVal(key, text));

        // 중괄호 매칭으로 블록 추출
        function extractBlock(text, startIdx) {
            let depth = 0, i = startIdx;
            while (i < text.length) {
                if (text[i] === '{') depth++;
                else if (text[i] === '}') { if (--depth === 0) return text.slice(startIdx + 1, i); }
                i++;
            }
            return '';
        }

        function getBlock(key, text) {
            const rx = new RegExp(`(?:^|\\s)${key}\\s*=\\s*\\{`);
            const m = rx.exec(text);
            if (!m) return null;
            return extractBlock(text, m.index + m[0].length - 1);
        }

        // focus_tree 블록
        const treeStart = fileContent.search(/focus_tree\s*=\s*\{/);
        if (treeStart < 0) return null;
        const braceIdx = fileContent.indexOf('{', treeStart);
        const treeContent = extractBlock(fileContent, braceIdx);

        settings.treeId       = getVal('id', treeContent) || settings.treeId;
        settings.countryTag   = getVal('tag', treeContent) || settings.countryTag;
        settings.defaultTree  = getBool('default', treeContent);
        settings.resetOnCivilwar = !getBool('reset_on_civilwar', treeContent.replace(/reset_on_civilwar\s*=\s*no/i, '__no__'));

        const cfPos = getBlock('continuous_focus_position', treeContent);
        if (cfPos) {
            settings.continuousFocusPosition = true;
            settings.continuousX = parseInt(getVal('x', cfPos)) || 50;
            settings.continuousY = parseInt(getVal('y', cfPos)) || 2740;
        }
        const initPos = getBlock('initial_show_position', treeContent);
        if (initPos) {
            settings.initialShowX = parseInt(getVal('x', initPos)) || 0;
            settings.initialShowY = parseInt(getVal('y', initPos)) || 0;
        }
        settings.sharedFocuses = [...treeContent.matchAll(/shared_focus\s*=\s*(\S+)/g)].map(m => m[1]);

        // 개별 focus 블록 파싱
        const focusRx = /\bfocus\s*=\s*\{/g;
        let fm;
        while ((fm = focusRx.exec(treeContent)) !== null) {
            const bStart = treeContent.indexOf('{', fm.index);
            const block = extractBlock(treeContent, bStart);

            const focus = {};
            focus.id   = getVal('id', block);
            focus.icon = getVal('icon', block) || 'GFX_goal_unknown';
            focus.dynamic = getBool('dynamic', block);
            focus.cost = parseFloat(getVal('cost', block)) || 10;
            focus.x    = parseInt(getVal('x', block)) || 0;
            focus.y    = parseInt(getVal('y', block)) || 0;
            focus.relative_position_id = getVal('relative_position_id', block) || null;

            const offsetBlock = getBlock('offset', block);
            focus.offset = offsetBlock
                ? { x: parseInt(getVal('x', offsetBlock)) || 0, y: parseInt(getVal('y', offsetBlock)) || 0 }
                : { x: 0, y: 0 };

            // prerequisite (복수 가능)
            focus.prerequisite = [];
            const preRx = /prerequisite\s*=\s*\{/g;
            let pm;
            while ((pm = preRx.exec(block)) !== null) {
                const pb = extractBlock(block, block.indexOf('{', pm.index));
                const ids = [...pb.matchAll(/focus\s*=\s*(\S+)/g)].map(m => m[1]);
                if (ids.length === 1) focus.prerequisite.push(ids[0]);
                else if (ids.length > 1) focus.prerequisite.push(ids);
            }

            const mutBlock = getBlock('mutually_exclusive', block);
            focus.mutually_exclusive = mutBlock
                ? [...mutBlock.matchAll(/focus\s*=\s*(\S+)/g)].map(m => m[1]) : [];

            focus.available                = getBlock('available',           block) || '';
            focus.bypass                   = getBlock('bypass',              block) || '';
            focus.bypass_if_unavailable    = getBool('bypass_if_unavailable', block);
            focus.cancel                   = getBlock('cancel',              block) || '';
            focus.allow_branch             = getBlock('allow_branch',        block) || '';
            focus.cancelable               = getBool('cancelable',           block);
            focus.continue_if_invalid      = getBool('continue_if_invalid',  block);
            focus.cancel_if_invalid        = getBool('cancel_if_invalid',    block);
            focus.available_if_capitulated = getBool('available_if_capitulated', block);
            focus.complete_effect          = getBlock('completion_reward',   block) || '';
            focus.select_effect            = getBlock('select_effect',       block) || '';
            focus.ai_will_do               = getBlock('ai_will_do',          block) || '';
            focus.historical_ai            = getBlock('historical_ai',       block) || '';
            focus.text_icon                = getVal('text_icon', block) || '';

            const sfBlock = getBlock('search_filters', block);
            focus.search_filters = sfBlock ? sfBlock.match(/\S+/g) || [] : [];

            const wwBlock = getBlock('will_lead_to_war_with', block);
            focus.will_lead_to_war_with = wwBlock ? wwBlock.match(/\S+/g) || [] : [];

            focus.name = focus.id;
            if (focus.id) focuses[focus.id] = focus;
        }

        return { focuses, settings };
    }

    // ══════════════════════════════════════════════
    //  로컬라이제이션 관리
    // ══════════════════════════════════════════════
    const LANG_NAMES = {
        english:'영어', korean:'한국어', japanese:'일본어', german:'독일어',
        french:'프랑스어', spanish:'스페인어', russian:'러시아어', polish:'폴란드어',
        braz_por:'브라질 포르투갈어', simp_chinese:'중국어 간체'
    };

    function renderLocalisationList() {
        const list = document.getElementById('localisation-list');
        const langSel = document.getElementById('localisation-language');
        if (!list || !langSel) return;
        const lang = langSel.value;
        list.innerHTML = '';

        const focuses = Object.values(appState.focuses);
        if (!focuses.length) {
            list.innerHTML = '<p style="text-align:center;color:#b2bec3;padding:20px;">중점이 없습니다.</p>';
            return;
        }

        focuses.forEach(focus => {
            const existing = appState.localisation[lang]?.[focus.id];
            const name = typeof existing === 'object' ? existing?.name || '' : (existing || '');
            const desc = typeof existing === 'object' ? existing?.desc || '' : '';

            const item = document.createElement('div');
            item.className = 'localisation-item';
            item.innerHTML = `
                <div class="localisation-item-id">${escapeHtml(focus.id)}</div>
                <label style="font-size:.85em;color:#b2bec3;">이름</label>
                <input type="text" class="loc-name" value="${escapeHtml(name)}" placeholder="${escapeHtml(focus.id)}의 ${LANG_NAMES[lang] || lang} 이름">
                <label style="font-size:.85em;color:#b2bec3;margin-top:4px;">설명</label>
                <textarea class="loc-desc" style="min-height:56px;resize:vertical;" placeholder="설명">${escapeHtml(desc)}</textarea>
            `;
            item.querySelector('.loc-name').addEventListener('input', e => {
                const cur = appState.localisation[lang][focus.id];
                appState.localisation[lang][focus.id] = { name: e.target.value, desc: typeof cur === 'object' ? cur?.desc || '' : '' };
                appState.isDirty = true;
            });
            item.querySelector('.loc-desc').addEventListener('input', e => {
                const cur = appState.localisation[lang][focus.id];
                appState.localisation[lang][focus.id] = { name: typeof cur === 'object' ? cur?.name || '' : (cur || ''), desc: e.target.value };
                appState.isDirty = true;
            });
            list.appendChild(item);
        });
    }

    document.getElementById('localisation-language')?.addEventListener('change', renderLocalisationList);
    document.getElementById('btn-refresh-localisation')?.addEventListener('click', renderLocalisationList);
    document.getElementById('btn-download-localisation')?.addEventListener('click', exportLocalisation);

    // ══════════════════════════════════════════════
    //  이벤트 리스너
    // ══════════════════════════════════════════════
    btnNewFocus.addEventListener('click', () => openEditorPanel('new'));
    btnTreeSettings.addEventListener('click', () => openEditorPanel('settings'));
    btnClosePanel.addEventListener('click', closeEditorPanel);

    document.getElementById('btn-undo')?.addEventListener('click', undo);
    document.getElementById('btn-redo')?.addEventListener('click', redo);

    document.addEventListener('keydown', e => {
        if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
    });

    btnMobileMenu.addEventListener('click', () => {
        leftPanel.classList.add('open');
        overlay.classList.remove('hidden');
    });
    overlay.addEventListener('click', () => {
        leftPanel.classList.remove('open');
        closeEditorPanel();
        closeAllDropdowns();
    });
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

    window.addEventListener('beforeunload', e => {
        if (appState.isDirty) { e.preventDefault(); e.returnValue = ''; }
    });

    // ══════════════════════════════════════════════
    //  드롭다운 메뉴 시스템
    // ══════════════════════════════════════════════
    function closeAllDropdowns() {
        document.querySelectorAll('.menu-dropdown.open').forEach(d => d.classList.remove('open'));
        document.querySelectorAll('.menu-dropdown-trigger.active').forEach(b => b.classList.remove('active'));
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

    // 드롭다운 외부 클릭 시 닫기
    document.addEventListener('click', closeAllDropdowns);
    document.querySelectorAll('.menu-dropdown').forEach(d => d.addEventListener('click', e => e.stopPropagation()));

    // 드롭다운 항목 클릭 처리
    document.getElementById('dropdown-load')?.addEventListener('click', e => {
        const li = e.target.closest('li[data-action]');
        if (!li || li.classList.contains('soon')) return;
        closeAllDropdowns();
        switch (li.dataset.action) {
            case 'load-project':     fileLoaderProject.click(); break;
            case 'load-focus':       fileLoaderFocus.click();   break;
        }
    });

    document.getElementById('dropdown-save')?.addEventListener('click', async e => {
        const li = e.target.closest('li[data-action]');
        if (!li || li.classList.contains('soon')) return;
        closeAllDropdowns();
        switch (li.dataset.action) {
            case 'export-zip':           await exportZip();           break;
            case 'export-focus':         exportFocusTxt();            break;
            case 'export-localisation':  exportLocalisation();        break;
        }
    });

    // ══════════════════════════════════════════════
    //  초기화
    // ══════════════════════════════════════════════
    saveSnapshot('초기 상태');
    renderFocusTree();
});
