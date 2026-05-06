// ════════════════════════════════════════════════════════
//  editor.js — 국가중점 파일 편집기
//  의존: state.js, io.js, explorer.js
// ════════════════════════════════════════════════════════

const GRID_SCALE_X = 80;
const GRID_SCALE_Y = 100;

function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── 편집기 툴바 설정 ─────────────────────────────────────
function setupFocusEditorToolbar() {
    const fd       = currentFileData();
    const filename = appState.currentFile?.split('/').pop() || '';
    const titleEl  = document.getElementById('focus-editor-title');
    if (titleEl) titleEl.textContent = filename;

    document.getElementById('btn-focus-back')
        ?.addEventListener('click', () => {
            closeEditorPanel();
            switchView('explorer-view');
            renderExplorer();
        });
    document.getElementById('btn-focus-save-file')
        ?.addEventListener('click', () => {
            if (!fd) return;
            downloadBlob(buildFocusTxt(fd), filename);
        });
    document.getElementById('btn-focus-import-file')
        ?.addEventListener('click', () => _focusImportFile());
    document.getElementById('btn-new-focus')
        ?.addEventListener('click', () => openEditorPanel('new'));
    document.getElementById('btn-tree-settings')
        ?.addEventListener('click', () => openEditorPanel('settings'));
    document.getElementById('btn-undo')
        ?.addEventListener('click', undo);
    document.getElementById('btn-redo')
        ?.addEventListener('click', redo);
}

// ── 파일 내 불러오기 (덮어쓰기 / 병합) ──────────────────
function _focusImportFile() {
    const input = document.createElement('input');
    input.type  = 'file';
    input.accept = '.txt';
    input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;
        const content = await file.text();
        const parsed  = parseFocusFile(content);
        if (!parsed) { alert('유효한 국가중점 파일이 아닙니다.'); return; }

        const fd = currentFileData();
        if (!fd) return;

        const hasExisting = Object.keys(fd.focuses).length > 0;
        const merge = hasExisting && confirm(
            '기존 중점이 있습니다.\n[확인] 병합 (중복 ID는 새 것으로)\n[취소] 덮어쓰기'
        );
        saveSnapshot('파일 불러오기');
        if (merge) {
            Object.assign(fd.focuses, parsed.focuses);
        } else {
            fd.focuses  = parsed.focuses;
            fd.settings = parsed.settings;
        }
        appState.isDirty = true;
        renderFocusTree();
        alert(`불러오기 완료 (중점 ${Object.keys(parsed.focuses).length}개)`);
    };
    input.click();
}

// ── 드로어 패널 ─────────────────────────────────────────
function openEditorPanel(mode, focusId = null) {
    const panel   = document.getElementById('editor-drawer-panel');
    const titleEl = document.getElementById('panel-title');
    const content = document.getElementById('panel-content');
    if (!panel) return;

    const fd    = currentFileData();
    appState.selectedFocusId = focusId;

    switch (mode) {
        case 'new':
            titleEl.textContent = '새 중점 만들기';
            content.innerHTML   = generateFocusForm({});
            setupAutocomplete();
            break;
        case 'edit': {
            const focus = fd?.focuses[focusId];
            titleEl.textContent = `중점 편집: ${focusId}`;
            content.innerHTML   = generateFocusForm(focus || {});
            setupAutocomplete();
            break;
        }
        case 'settings':
            titleEl.textContent = '중점계통도 설정';
            content.innerHTML   = generateSettingsForm(fd?.settings || {});
            setupSettingsListeners();
            break;
    }
    panel.classList.add('open');
}

function closeEditorPanel() {
    document.getElementById('editor-drawer-panel')?.classList.remove('open');
    if (appState.selectedFocusId) {
        document.querySelector(`[data-id="${appState.selectedFocusId}"]`)
            ?.classList.remove('selected');
    }
    appState.selectedFocusId = null;
}

// ── 설정 폼 ──────────────────────────────────────────────
function generateSettingsForm(s = {}) {
    return `
        <h4>기본 설정</h4>
        <div class="form-group">
            <label for="cfg-tree-id">Focus Tree ID</label>
            <input type="text" id="cfg-tree-id" value="${escapeHtml(s.treeId || '')}" placeholder="my_focus_tree">
        </div>
        <div class="form-group">
            <label for="cfg-country-tag">국가 태그</label>
            <input type="text" id="cfg-country-tag" value="${escapeHtml(s.countryTag || '')}" maxlength="3" placeholder="GEN">
        </div>
        <div class="form-group-checkbox">
            <label><input type="checkbox" id="cfg-default-tree" ${s.defaultTree ? 'checked' : ''}> 기본 중점 트리 (Default)</label>
            <small>전체에서 단 하나의 트리만 기본으로 설정</small>
        </div>
        <div class="form-group">
            <label for="cfg-shared-focuses">공유 중점</label>
            <input type="text" id="cfg-shared-focuses" value="${escapeHtml((s.sharedFocuses || []).join(', '))}">
        </div>
        <hr>
        <h4>연속 중점</h4>
        <div class="form-group-checkbox">
            <label><input type="checkbox" id="cfg-continuous-focus" ${s.continuousFocusPosition ? 'checked' : ''}> 연속 중점 표시</label>
        </div>
        <div class="form-group">
            <label>X</label><input type="number" id="cfg-continuous-x" value="${s.continuousX ?? 50}">
        </div>
        <div class="form-group">
            <label>Y</label><input type="number" id="cfg-continuous-y" value="${s.continuousY ?? 2740}">
        </div>
        <hr>
        <h4>기타</h4>
        <div class="form-group-checkbox">
            <label><input type="checkbox" id="cfg-reset-civilwar" ${s.resetOnCivilwar !== false ? 'checked' : ''}> 내전 시 초기화</label>
        </div>
        <div class="form-group">
            <label>초기 표시 X</label><input type="number" id="cfg-initial-x" value="${s.initialShowX ?? 0}">
        </div>
        <div class="form-group">
            <label>초기 표시 Y</label><input type="number" id="cfg-initial-y" value="${s.initialShowY ?? 0}">
        </div>
        <div class="form-actions">
            <button id="btn-settings-close" class="secondary">닫기</button>
        </div>
    `;
}

function setupSettingsListeners() {
    const fd = currentFileData();
    if (!fd) return;
    const s  = fd.settings;
    const bind = (id, prop, transform) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', e => {
            s[prop] = transform(e.target);
            appState.isDirty = true;
        });
    };
    bind('cfg-tree-id',          'treeId',                  e => e.value);
    bind('cfg-country-tag',      'countryTag',              e => e.value.toUpperCase());
    bind('cfg-default-tree',     'defaultTree',             e => e.checked);
    bind('cfg-shared-focuses',   'sharedFocuses',           e => e.value.split(',').map(v => v.trim()).filter(Boolean));
    bind('cfg-continuous-focus', 'continuousFocusPosition', e => e.checked);
    bind('cfg-continuous-x',     'continuousX',             e => parseInt(e.value) || 50);
    bind('cfg-continuous-y',     'continuousY',             e => parseInt(e.value) || 2740);
    bind('cfg-reset-civilwar',   'resetOnCivilwar',         e => e.checked);
    bind('cfg-initial-x',        'initialShowX',            e => parseInt(e.value) || 0);
    bind('cfg-initial-y',        'initialShowY',            e => parseInt(e.value) || 0);
    document.getElementById('btn-settings-close')?.addEventListener('click', closeEditorPanel);
}

// ── 자동완성 ─────────────────────────────────────────────
function setupAutocomplete() {
    const fd = currentFileData();
    const setup = (inputId, dropdownId) => {
        const input    = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);
        if (!input || !dropdown) return;
        let selIdx = -1;

        input.addEventListener('input', () => {
            const q = input.value.trim().toLowerCase();
            selIdx  = -1;
            if (!q) { dropdown.classList.remove('active'); return; }
            const matches = Object.values(fd?.focuses || {})
                .filter(f => f.id !== appState.selectedFocusId &&
                    (f.id.toLowerCase().includes(q) || (f.name || '').toLowerCase().includes(q)))
                .slice(0, 10);
            if (!matches.length) { dropdown.classList.remove('active'); return; }
            dropdown.innerHTML = matches.map((f, i) =>
                `<div class="autocomplete-item" data-index="${i}" data-id="${escapeHtml(f.id)}">
                    <span class="autocomplete-item-id">${escapeHtml(f.id)}</span>
                    ${f.name !== f.id ? `<span class="autocomplete-item-name">${escapeHtml(f.name || '')}</span>` : ''}
                </div>`
            ).join('');
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
            if (e.key === 'ArrowDown') { e.preventDefault(); selIdx = Math.min(selIdx + 1, items.length - 1); }
            if (e.key === 'ArrowUp')   { e.preventDefault(); selIdx = Math.max(selIdx - 1, 0); }
            if (e.key === 'Enter' && selIdx >= 0) { input.value = items[selIdx].dataset.id; dropdown.classList.remove('active'); }
            if (e.key === 'Escape') dropdown.classList.remove('active');
            items.forEach((it, i) => it.classList.toggle('selected', i === selIdx));
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

// ── 중점 폼 생성 ─────────────────────────────────────────
function generateFocusForm(focusData) {
    const v   = val => escapeHtml(val ?? '');
    const chk = val => val ? 'checked' : '';
    const cb  = (id, label, val) =>
        `<div class="form-group-checkbox"><label><input type="checkbox" id="${id}" ${chk(val)}> ${label}</label></div>`;
    const fmtPre = (pre = []) => pre.map(p => Array.isArray(p) ? `[${p.join(', ')}]` : p).join(', ');

    const btns = focusData.id
        ? `<button id="btn-apply-changes">적용</button>
           <button id="btn-delete-focus" class="danger">삭제</button>
           <button id="btn-cancel-changes" class="secondary">취소</button>`
        : `<button id="btn-apply-changes">생성</button>
           <button id="btn-cancel-changes" class="secondary">취소</button>`;

    return `
        <h4>기본 정보</h4>
        <div class="form-group">
            <label>ID (필수)</label>
            <input type="text" id="focus-id" value="${v(focusData.id)}" placeholder="my_focus_id">
            ${focusData.id ? '<small class="form-hint">⚠ ID 변경 시 참조가 자동 업데이트됩니다.</small>' : ''}
        </div>
        <div class="form-group">
            <label>이름 (Localisation Key)</label>
            <input type="text" id="focus-name" value="${v(focusData.name)}" placeholder="자동: ID와 동일">
        </div>
        <div class="form-group">
            <label>아이콘 (GFX Key)</label>
            <input type="text" id="focus-icon" value="${v(focusData.icon) || 'GFX_goal_unknown'}" placeholder="GFX_goal_generic_...">
        </div>
        ${cb('focus-dynamic-icon', '동적 아이콘 (Dynamic)', focusData.dynamic)}
        <hr>
        <h4>좌표 및 시간</h4>
        <div class="form-group">
            <label>완료 시간 (Cost, 주)</label>
            <input type="number" id="focus-cost" value="${focusData.cost ?? 10}" min="1">
            <small class="form-hint">1주 = 7일, 기본 10주</small>
        </div>
        <div class="form-group"><label>X 좌표</label><input type="number" id="focus-x" value="${focusData.x ?? 0}"></div>
        <div class="form-group"><label>Y 좌표</label><input type="number" id="focus-y" value="${focusData.y ?? 0}"></div>
        <div class="form-group">
            <label>상대 위치 기준 ID</label>
            <div class="autocomplete-container">
                <input type="text" id="focus-relative-position-id" value="${v(focusData.relative_position_id)}" placeholder="다른 중점 ID" autocomplete="off">
                <div id="relative-dropdown" class="autocomplete-dropdown"></div>
            </div>
        </div>
        <div class="form-group"><label>오프셋 X</label><input type="number" id="focus-offset-x" value="${focusData.offset?.x ?? 0}"></div>
        <div class="form-group"><label>오프셋 Y</label><input type="number" id="focus-offset-y" value="${focusData.offset?.y ?? 0}"></div>
        <hr>
        <h4>연결 관계</h4>
        <div class="form-group">
            <label>선행 조건 (Prerequisite)</label>
            <div class="autocomplete-container">
                <input type="text" id="focus-prerequisite" value="${v(fmtPre(focusData.prerequisite))}" placeholder="id1, [id2, id3]" autocomplete="off">
                <div id="prerequisite-dropdown" class="autocomplete-dropdown"></div>
            </div>
        </div>
        <div class="form-group">
            <label>상호 배타 (Mutually Exclusive)</label>
            <div class="autocomplete-container">
                <input type="text" id="focus-mutually-exclusive" value="${v((focusData.mutually_exclusive || []).join(', '))}" autocomplete="off">
                <div id="mutually-dropdown" class="autocomplete-dropdown"></div>
            </div>
        </div>
        <hr>
        <h4>조건 및 효과</h4>
        <div class="form-group"><label>available</label><textarea id="focus-available">${v(focusData.available)}</textarea></div>
        <div class="form-group"><label>bypass</label><textarea id="focus-bypass">${v(focusData.bypass)}</textarea></div>
        ${cb('focus-bypass-if-unavailable', 'bypass_if_unavailable', focusData.bypass_if_unavailable)}
        <div class="form-group"><label>cancel</label><textarea id="focus-cancel">${v(focusData.cancel)}</textarea></div>
        <div class="form-group"><label>allow_branch</label><textarea id="focus-allow-branch">${v(focusData.allow_branch)}</textarea></div>
        ${cb('focus-cancelable',             'cancelable',               focusData.cancelable)}
        ${cb('focus-continue-if-invalid',    'continue_if_invalid',      focusData.continue_if_invalid)}
        ${cb('focus-cancel-if-invalid',      'cancel_if_invalid',        focusData.cancel_if_invalid)}
        ${cb('focus-available-if-capitulated','available_if_capitulated', focusData.available_if_capitulated)}
        <hr>
        <h4>완료 효과</h4>
        <div class="form-group"><label>completion_reward</label><textarea id="focus-complete-effect">${v(focusData.complete_effect)}</textarea></div>
        <div class="form-group"><label>select_effect</label><textarea id="focus-select-effect">${v(focusData.select_effect)}</textarea></div>
        <hr>
        <h4>AI 및 기타</h4>
        <div class="form-group"><label>ai_will_do</label><textarea id="focus-ai-will-do">${v(focusData.ai_will_do)}</textarea></div>
        <div class="form-group"><label>historical_ai</label><textarea id="focus-historical-ai">${v(focusData.historical_ai)}</textarea></div>
        <div class="form-group"><label>will_lead_to_war_with</label><input type="text" id="focus-will-lead-to-war" value="${v((focusData.will_lead_to_war_with || []).join(', '))}"></div>
        <div class="form-group"><label>search_filters</label><input type="text" id="focus-search-filters" value="${v((focusData.search_filters || []).join(', '))}"></div>
        <div class="form-group"><label>text_icon</label><input type="text" id="focus-text-icon" value="${v(focusData.text_icon)}"></div>
        <div class="form-actions">${btns}</div>
    `;
}

// ── 폼 데이터 추출 ───────────────────────────────────────
function extractFormData() {
    const gv  = id => document.getElementById(id)?.value?.trim() || '';
    const gc  = id => document.getElementById(id)?.checked || false;
    const gn  = id => parseInt(document.getElementById(id)?.value)   || 0;
    const gnf = id => parseFloat(document.getElementById(id)?.value) || 0;
    const lst = str => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];
    const parsePre = str => {
        if (!str) return [];
        const result = [], rx = /\[([^\]]+)\]|([^,\[\]]+)/g;
        let m;
        while ((m = rx.exec(str)) !== null) {
            if (m[1]) result.push(m[1].split(',').map(s => s.trim()).filter(Boolean));
            else if (m[2]?.trim()) result.push(m[2].trim());
        }
        return result;
    };
    return {
        id: gv('focus-id'), name: gv('focus-name') || gv('focus-id'),
        icon: gv('focus-icon') || 'GFX_goal_unknown',
        dynamic: gc('focus-dynamic-icon'), cost: gnf('focus-cost') || 10,
        x: gn('focus-x'), y: gn('focus-y'),
        relative_position_id: gv('focus-relative-position-id') || null,
        offset: { x: gn('focus-offset-x'), y: gn('focus-offset-y') },
        prerequisite: parsePre(gv('focus-prerequisite')),
        mutually_exclusive: lst(gv('focus-mutually-exclusive')),
        available: gv('focus-available'), bypass: gv('focus-bypass'),
        bypass_if_unavailable: gc('focus-bypass-if-unavailable'),
        cancel: gv('focus-cancel'), allow_branch: gv('focus-allow-branch'),
        cancelable: gc('focus-cancelable'),
        continue_if_invalid: gc('focus-continue-if-invalid'),
        cancel_if_invalid: gc('focus-cancel-if-invalid'),
        available_if_capitulated: gc('focus-available-if-capitulated'),
        complete_effect: gv('focus-complete-effect'),
        select_effect: gv('focus-select-effect'),
        text_icon: gv('focus-text-icon'),
        ai_will_do: gv('focus-ai-will-do'), historical_ai: gv('focus-historical-ai'),
        will_lead_to_war_with: lst(gv('focus-will-lead-to-war')),
        search_filters: lst(gv('focus-search-filters'))
    };
}

// ── 픽셀 위치 계산 ───────────────────────────────────────
function getFocusPixelPosition(focusId, visited = new Set()) {
    const fd    = currentFileData();
    const focus = fd?.focuses[focusId];
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

// ── 렌더링 ───────────────────────────────────────────────
function renderFocusTree() {
    const ve  = document.getElementById('visual-editor');
    const cnt = document.getElementById('focus-count');
    if (!ve) return;
    const fd  = currentFileData();
    ve.innerHTML = '';
    if (cnt) cnt.textContent = Object.keys(fd?.focuses || {}).length;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg   = document.createElementNS(svgNS, 'svg');
    svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;';
    ve.appendChild(svg);

    const focuses   = fd?.focuses || {};
    const positions = {};
    Object.keys(focuses).forEach(id => {
        const p = getFocusPixelPosition(id);
        if (p) positions[id] = p;
    });

    const NW = 120, NH = 80;

    // 선행 조건 선 (직각 꺾임)
    Object.values(focuses).forEach(focus => {
        if (!focus.prerequisite?.length) return;
        const toPos = positions[focus.id];
        if (!toPos) return;
        focus.prerequisite.forEach(item => {
            (Array.isArray(item) ? item : [item]).forEach(pid => {
                const fromPos = positions[pid];
                if (!fromPos) return;
                const x1 = fromPos.x + NW / 2, y1 = fromPos.y + NH;
                const x2 = toPos.x   + NW / 2, y2 = toPos.y;
                const my = (y1 + y2) / 2;
                const d  = x1 === x2 ? `M ${x1} ${y1} L ${x2} ${y2}`
                    : `M ${x1} ${y1} L ${x1} ${my} L ${x2} ${my} L ${x2} ${y2}`;
                const path = document.createElementNS(svgNS, 'path');
                path.setAttribute('d', d);
                path.setAttribute('class', `prereq-line${Array.isArray(item) ? ' or' : ''}`);
                svg.appendChild(path);
            });
        });
    });

    // 상호 배타 선 + ! 아이콘
    const drawn = new Set();
    Object.values(focuses).forEach(focus => {
        if (!focus.mutually_exclusive?.length) return;
        const posA = positions[focus.id];
        if (!posA) return;
        focus.mutually_exclusive.forEach(mid => {
            const key = [focus.id, mid].sort().join('|');
            if (drawn.has(key)) return;
            drawn.add(key);
            const posB = positions[mid];
            if (!posB) return;
            const line = document.createElementNS(svgNS, 'line');
            line.setAttribute('x1', posA.x + NW / 2); line.setAttribute('y1', posA.y + NH / 2);
            line.setAttribute('x2', posB.x + NW / 2); line.setAttribute('y2', posB.y + NH / 2);
            line.setAttribute('class', 'mutual-exclusive-line');
            svg.appendChild(line);
            const txt = document.createElementNS(svgNS, 'text');
            txt.setAttribute('x', (posA.x + posB.x) / 2 + NW / 2);
            txt.setAttribute('y', (posA.y + posB.y) / 2 + NH / 2);
            txt.setAttribute('class', 'mutual-exclusive-icon');
            txt.textContent = '!';
            svg.appendChild(txt);
        });
    });

    // 중점 노드
    Object.values(focuses).forEach(focus => {
        const pos = positions[focus.id];
        if (!pos) return;
        const node = document.createElement('div');
        node.className = 'focus-node' + (focus.id === appState.selectedFocusId ? ' selected' : '');
        node.dataset.id = focus.id;
        node.style.left = pos.x + 'px';
        node.style.top  = pos.y + 'px';
        node.innerHTML  = `
            <div class="focus-node-id">${escapeHtml(focus.id)}</div>
            <div class="focus-node-name">${escapeHtml(focus.name || focus.id)}</div>
            <div class="drag-handle" title="드래그하여 이동"></div>
        `;
        node.addEventListener('click', e => {
            if (e.target.classList.contains('drag-handle')) return;
            openEditorPanel('edit', focus.id);
        });
        ve.appendChild(node);
    });

    setupDragAndDrop();
}

// ── 드래그 앤 드롭 ───────────────────────────────────────
function setupDragAndDrop() {
    const ve = document.getElementById('visual-editor');
    if (!ve) return;
    let drag = null, sMouseX = 0, sMouseY = 0, sLeft = 0, sTop = 0;

    ve.querySelectorAll('.drag-handle').forEach(h => {
        h.addEventListener('mousedown', e => {
            e.preventDefault(); e.stopPropagation();
            drag   = h.closest('.focus-node');
            sMouseX = e.clientX; sMouseY = e.clientY;
            sLeft   = parseInt(drag.style.left) || 0;
            sTop    = parseInt(drag.style.top)  || 0;
            drag.style.zIndex = 100;
        });
    });
    document.addEventListener('mousemove', e => {
        if (!drag) return;
        drag.style.left = (sLeft + e.clientX - sMouseX) + 'px';
        drag.style.top  = (sTop  + e.clientY - sMouseY) + 'px';
    });
    document.addEventListener('mouseup', () => {
        if (!drag) return;
        const fd    = currentFileData();
        const focus = fd?.focuses[drag.dataset.id];
        if (focus) {
            const nx = parseInt(drag.style.left) || 0;
            const ny = parseInt(drag.style.top)  || 0;
            if (focus.relative_position_id) {
                const base = getFocusPixelPosition(focus.relative_position_id);
                if (base) {
                    focus.x = Math.round((nx - base.x) / GRID_SCALE_X);
                    focus.y = Math.max(0, Math.round((ny - base.y) / GRID_SCALE_Y));
                }
            } else {
                focus.x = Math.max(0, Math.round((nx - 100) / GRID_SCALE_X));
                focus.y = Math.max(0, Math.round((ny - 100) / GRID_SCALE_Y));
            }
            appState.isDirty = true;
            saveSnapshot(`"${drag.dataset.id}" 이동`);
            renderFocusTree();
        }
        drag = null;
    });
}

// ── 패널 폼 이벤트 위임 ──────────────────────────────────
function setupPanelFormListeners() {
    document.getElementById('panel-content')?.addEventListener('click', e => {
        if (e.target.id === 'btn-apply-changes') {
            e.preventDefault();
            const fd  = currentFileData();
            if (!fd)  return;
            const formData = extractFormData();
            if (!formData.id) { alert('ID를 입력해주세요.'); return; }
            const oldId = appState.selectedFocusId;
            const newId = formData.id;
            if (!oldId && fd.focuses[newId]) { alert('이미 존재하는 ID입니다.'); return; }
            if (oldId && newId !== oldId) {
                if (fd.focuses[newId]) { alert('이미 존재하는 ID입니다.'); return; }
                Object.values(fd.focuses).forEach(f => {
                    if (f.prerequisite)
                        f.prerequisite = f.prerequisite.map(item =>
                            Array.isArray(item) ? item.map(p => p === oldId ? newId : p)
                                                : (item === oldId ? newId : item));
                    if (f.mutually_exclusive)
                        f.mutually_exclusive = f.mutually_exclusive.map(m => m === oldId ? newId : m);
                    if (f.relative_position_id === oldId) f.relative_position_id = newId;
                });
                delete fd.focuses[oldId];
            }
            saveSnapshot(oldId ? `"${oldId}" 편집` : `"${newId}" 생성`);
            fd.focuses[newId] = formData;
            appState.isDirty = true;
            renderFocusTree();
            closeEditorPanel();
        }
        if (e.target.id === 'btn-delete-focus') {
            e.preventDefault();
            const fd = currentFileData();
            if (!fd || !appState.selectedFocusId) return;
            if (confirm(`"${appState.selectedFocusId}" 중점을 삭제하시겠습니까?`)) {
                saveSnapshot(`"${appState.selectedFocusId}" 삭제`);
                delete fd.focuses[appState.selectedFocusId];
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
