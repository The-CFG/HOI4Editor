// ════════════════════════════════════════════════════════
//  editor.js — 드로어 패널 / 폼 / 렌더링 / 드래그앤드롭
//  의존: state.js
// ════════════════════════════════════════════════════════

// ── 유틸 ────────────────────────────────────────────────
function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── 드로어 패널 열기 / 닫기 ────────────────────────────
function openEditorPanel(mode, focusId = null) {
    const editorDrawerPanel = document.getElementById('editor-drawer-panel');
    const panelTitle        = document.getElementById('panel-title');
    const panelContent      = document.getElementById('panel-content');
    const leftPanel         = document.getElementById('left-panel');
    const overlay           = document.getElementById('overlay');

    appState.selectedFocusId = focusId;
    const focus = focusId ? appState.focuses[focusId] : null;

    switch (mode) {
        case 'new':
            panelTitle.textContent   = '새 중점 만들기';
            panelContent.innerHTML   = generateFocusForm({});
            setupAutocomplete();
            break;
        case 'edit':
            panelTitle.textContent   = `중점 편집: ${focus.id}`;
            panelContent.innerHTML   = generateFocusForm(focus);
            setupAutocomplete();
            break;
        case 'settings':
            panelTitle.textContent   = '중점계통도 설정';
            panelContent.innerHTML   = generateSettingsForm();
            setupSettingsListeners();
            break;
    }

    editorDrawerPanel.classList.add('open');
    overlay.classList.remove('hidden');
    leftPanel.classList.remove('open');   // 모바일: 왼쪽 패널 닫기
}

function closeEditorPanel() {
    const editorDrawerPanel = document.getElementById('editor-drawer-panel');
    const overlay           = document.getElementById('overlay');

    editorDrawerPanel.classList.remove('open');
    overlay.classList.add('hidden');
    if (appState.selectedFocusId) {
        document.querySelector(`[data-id="${appState.selectedFocusId}"]`)
            ?.classList.remove('selected');
    }
    appState.selectedFocusId = null;
}

// ── 중점계통도 설정 폼 ──────────────────────────────────
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
    bind('cfg-tree-id',         'treeId',                  e => e.value);
    bind('cfg-country-tag',     'countryTag',              e => e.value.toUpperCase());
    bind('cfg-default-tree',    'defaultTree',             e => e.checked);
    bind('cfg-shared-focuses',  'sharedFocuses',           e => e.value.split(',').map(s => s.trim()).filter(Boolean));
    bind('cfg-continuous-focus','continuousFocusPosition', e => e.checked);
    bind('cfg-continuous-x',    'continuousX',             e => parseInt(e.value) || 50);
    bind('cfg-continuous-y',    'continuousY',             e => parseInt(e.value) || 2740);
    bind('cfg-reset-civilwar',  'resetOnCivilwar',         e => e.checked);
    bind('cfg-initial-x',       'initialShowX',            e => parseInt(e.value) || 0);
    bind('cfg-initial-y',       'initialShowY',            e => parseInt(e.value) || 0);
    document.getElementById('btn-settings-close')?.addEventListener('click', closeEditorPanel);
}

// ── 자동완성 ─────────────────────────────────────────────
function setupAutocomplete() {
    const setup = (inputId, dropdownId) => {
        const input    = document.getElementById(inputId);
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
                const kor  = appState.localisation.korean[f.id];
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
    setup('focus-prerequisite',         'prerequisite-dropdown');
    setup('focus-mutually-exclusive',   'mutually-dropdown');
}

// ── 중점 편집 폼 생성 ──────────────────────────────────
function generateFocusForm(focusData) {
    const v   = val  => escapeHtml(val ?? '');
    const chk = val  => val ? 'checked' : '';
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
        ${checkbox('focus-bypass-if-unavailable', 'bypass_if_unavailable',    focusData.bypass_if_unavailable)}
        <div class="form-group">
            <label for="focus-cancel">cancel</label>
            <textarea id="focus-cancel" placeholder="cancel = { ... } 내부 내용">${v(focusData.cancel)}</textarea>
        </div>
        <div class="form-group">
            <label for="focus-allow-branch">allow_branch</label>
            <textarea id="focus-allow-branch" placeholder="allow_branch = { ... } 내부 내용">${v(focusData.allow_branch)}</textarea>
        </div>
        ${checkbox('focus-cancelable',            'cancelable',               focusData.cancelable)}
        ${checkbox('focus-continue-if-invalid',   'continue_if_invalid',      focusData.continue_if_invalid)}
        ${checkbox('focus-cancel-if-invalid',     'cancel_if_invalid',        focusData.cancel_if_invalid)}
        ${checkbox('focus-available-if-capitulated','available_if_capitulated',focusData.available_if_capitulated)}

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

// ── 폼 데이터 추출 ──────────────────────────────────────
function extractFormData() {
    const gv  = id => document.getElementById(id)?.value?.trim() || '';
    const gc  = id => document.getElementById(id)?.checked || false;
    const gn  = id => parseInt(document.getElementById(id)?.value)   || 0;
    const gnf = id => parseFloat(document.getElementById(id)?.value) || 0;

    const parsePrerequisites = str => {
        if (!str) return [];
        const result = [];
        const regex  = /\[([^\]]+)\]|([^,\[\]]+)/g;
        let m;
        while ((m = regex.exec(str)) !== null) {
            if (m[1])        result.push(m[1].split(',').map(s => s.trim()).filter(Boolean));
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

// ── 중점 노드 픽셀 위치 계산 (재귀 + 순환 방지) ─────────
function getFocusPixelPosition(focusId, visited = new Set()) {
    const focus = appState.focuses[focusId];
    if (!focus) return null;
    if (visited.has(focusId))
        return { x: focus.x * GRID_SCALE_X + 100, y: focus.y * GRID_SCALE_Y + 100 };
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

// ── 비주얼 에디터 렌더링 ────────────────────────────────
function renderFocusTree() {
    const visualEditor  = document.getElementById('visual-editor');
    const focusCountSpan = document.getElementById('focus-count');

    visualEditor.innerHTML = '';
    if (focusCountSpan) focusCountSpan.textContent = Object.keys(appState.focuses).length;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg   = document.createElementNS(svgNS, 'svg');
    svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;';
    visualEditor.appendChild(svg);

    // 모든 중점의 픽셀 위치 사전 계산
    const positions = {};
    Object.values(appState.focuses).forEach(f => {
        const pos = getFocusPixelPosition(f.id);
        if (pos) positions[f.id] = pos;
    });

    const NODE_W = 120, NODE_H = 80;

    // 선행 조건 선 (수직 → 수평 → 수직, 직각 꺾임)
    Object.values(appState.focuses).forEach(focus => {
        if (!focus.prerequisite?.length) return;
        const toPos = positions[focus.id];
        if (!toPos) return;

        focus.prerequisite.forEach(item => {
            const prereqIds = Array.isArray(item) ? item : [item];
            prereqIds.forEach(pid => {
                const fromPos = positions[pid];
                if (!fromPos) return;

                const x1   = fromPos.x + NODE_W / 2;
                const y1   = fromPos.y + NODE_H;
                const x2   = toPos.x   + NODE_W / 2;
                const y2   = toPos.y;
                const midY = (y1 + y2) / 2;

                const d = x1 === x2
                    ? `M ${x1} ${y1} L ${x2} ${y2}`
                    : `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;

                const path = document.createElementNS(svgNS, 'path');
                path.setAttribute('d', d);
                path.setAttribute('class', `prereq-line${Array.isArray(item) ? ' or' : ''}`);
                svg.appendChild(path);
            });
        });
    });

    // 상호 배타 선 + ✕ 아이콘
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

            const mx  = (posA.x + posB.x) / 2 + NODE_W / 2;
            const my  = (posA.y + posB.y) / 2 + NODE_H / 2;
            const txt = document.createElementNS(svgNS, 'text');
            txt.setAttribute('x', mx);
            txt.setAttribute('y', my);
            txt.setAttribute('class', 'mutual-exclusive-icon');
            txt.textContent = '!';
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
        node.dataset.id  = focus.id;
        node.style.left  = pos.x + 'px';
        node.style.top   = pos.y + 'px';
        node.innerHTML   = `
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

// ── 드래그 앤 드롭 ──────────────────────────────────────
function setupDragAndDrop() {
    const visualEditor = document.getElementById('visual-editor');
    let draggedNode = null, startMouseX = 0, startMouseY = 0, startLeft = 0, startTop = 0;

    visualEditor.querySelectorAll('.drag-handle').forEach(handle => {
        handle.addEventListener('mousedown', e => {
            e.preventDefault();
            e.stopPropagation();
            draggedNode  = handle.closest('.focus-node');
            startMouseX  = e.clientX;
            startMouseY  = e.clientY;
            startLeft    = parseInt(draggedNode.style.left) || 0;
            startTop     = parseInt(draggedNode.style.top)  || 0;
            draggedNode.style.zIndex = 100;
        });
    });

    document.addEventListener('mousemove', e => {
        if (!draggedNode) return;
        draggedNode.style.left = (startLeft + e.clientX - startMouseX) + 'px';
        draggedNode.style.top  = (startTop  + e.clientY - startMouseY) + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (!draggedNode) return;
        const focusId = draggedNode.dataset.id;
        const focus   = appState.focuses[focusId];
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

// ── 패널 폼 이벤트 위임 (적용 / 삭제 / 취소) ───────────
function setupPanelFormListeners() {
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
                // 모든 참조 업데이트
                Object.values(appState.focuses).forEach(f => {
                    if (f.prerequisite)
                        f.prerequisite = f.prerequisite.map(item =>
                            Array.isArray(item) ? item.map(p => p === oldId ? newId : p)
                                                : (item === oldId ? newId : item));
                    if (f.mutually_exclusive)
                        f.mutually_exclusive = f.mutually_exclusive.map(m => m === oldId ? newId : m);
                    if (f.relative_position_id === oldId)
                        f.relative_position_id = newId;
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
}
