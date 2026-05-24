// ════════════════════════════════════════════════════════
//  focus-editor.js — 포커스 트리 렌더링 / 드래그앤드롭
//  의존: state.js, io-parsers.js, cloud-ui.js, focus-form.js
// ════════════════════════════════════════════════════════
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

    // 음수 좌표 경계선 (CSS ::before/::after는 100px 위치, 추가 마커)
    const axisX = document.createElement('div');
    axisX.className = 'neg-axis-x';
    ve.appendChild(axisX);
    const axisY = document.createElement('div');
    axisY.className = 'neg-axis-y';
    ve.appendChild(axisY);

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

        // GFX 아이콘 이미지 결정
        const iconDataUrl = (typeof resolveGfxIcon === 'function') ? resolveGfxIcon(focus.icon) : null;
        const iconHtml = iconDataUrl
            ? `<div class="focus-node-icon"><img src="${iconDataUrl}" alt="${escapeHtml(focus.icon)}" draggable="false"></div>`
            : `<div class="focus-node-icon focus-node-icon-placeholder" title="${escapeHtml(focus.icon || 'GFX_goal_unknown')}">🎯</div>`;

        node.innerHTML  = `
            ${iconHtml}
            <div class="focus-node-label">${escapeHtml(getFocusNodeLabel(focus))}</div>
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
// renderFocusTree 호출 때마다 재등록되므로 AbortController로 이전 리스너 제거
let _dndAbort = null;

function setupDragAndDrop() {
    const ve = document.getElementById('visual-editor');
    if (!ve) return;

    // 이전 document 레벨 리스너 제거
    if (_dndAbort) _dndAbort.abort();
    _dndAbort = new AbortController();
    const _sig = _dndAbort.signal;

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
    }, { signal: _sig });
    document.addEventListener('mouseup', () => {
        if (!drag) return;
        const fd    = currentFileData();
        const focus = fd?.focuses[drag.dataset.id];
        if (focus) {
            const nx = parseInt(drag.style.left) || 0;
            const ny = parseInt(drag.style.top)  || 0;
            if (focus.relative_position_id) {
                // 상대 위치 기준: base + (x + offset.x) * scale 이 픽셀 위치
                // x/y는 유지하고 offset만 조정
                const base = getFocusPixelPosition(focus.relative_position_id);
                if (base) {
                    const totalX = Math.round((nx - base.x) / GRID_SCALE_X);
                    const totalY = Math.max(0, Math.round((ny - base.y) / GRID_SCALE_Y));
                    if (!focus.offset) focus.offset = { x: 0, y: 0 };
                    focus.offset.x = totalX - focus.x;
                    focus.offset.y = totalY - focus.y;
                }
            } else {
                // 일반 좌표: x/y만 수정
                focus.x = Math.max(0, Math.round((nx - 100) / GRID_SCALE_X));
                focus.y = Math.max(0, Math.round((ny - 100) / GRID_SCALE_Y));
            }
            appState.isDirty = true;
            saveSnapshot(`"${drag.dataset.id}" 이동`);
            renderFocusTree();
        }
        drag = null;
    }, { signal: _sig });
}

// ── 패널 폼 이벤트 위임 ──────────────────────────────────