// focus-editor.js — 포커스 트리 렌더링 / 드래그앤드롭 / 툴바
//  의존: state.js, io-parsers.js, cloud-ui.js, auth.js
// ════════════════════════════════════════════════════════
//  editor.js — 국가중점 파일 편집기
//  의존: state.js, io.js, explorer.js
// ════════════════════════════════════════════════════════

const GRID_SCALE_X = 80;
const GRID_SCALE_Y = 100;

// ── Search Filter 목록 ───────────────────────────────────
const SEARCH_FILTERS = [
    'FOCUS_FILTER_POLITICAL',
    'FOCUS_FILTER_RESEARCH',
    'FOCUS_FILTER_INDUSTRY',
    'FOCUS_FILTER_STABILITY',
    'FOCUS_FILTER_WAR_SUPPORT',
    'FOCUS_FILTER_MANPOWER',
    'FOCUS_FILTER_ANNEXATION',
    'FOCUS_FILTER_HISTORICAL',
    'FOCUS_FILTER_INTERNATIONAL_TRADE',
    'FOCUS_FILTER_ARMY_XP',
    'FOCUS_FILTER_NAVY_XP',
    'FOCUS_FILTER_AIR_XP',
    'FOCUS_FILTER_TFV_AUTONOMY',
    'FOCUS_FILTER_POLITICAL_CHARACTER',
    'FOCUS_FILTER_MILITARY_CHARACTER',
    'FOCUS_FILTER_INTERNAL_AFFAIRS',
    'FOCUS_FILTER_FRA_POLITICAL_VIOLENCE',
    'FOCUS_FILTER_PROPAGANDA',
    'FOCUS_FILTER_FRA_OCCUPATION_COST',
    'FOCUS_FILTER_CHI_INFLATION',
    'FOCUS_FILTER_BALANCE_OF_POWER',
    'FOCUS_FILTER_SWI_MILITARY_READINESS',
    'FOCUS_FILTER_USA_CONGRESS',
    'FOCUS_FILTER_MEX_CHURCH_AUTHORITY',
    'FOCUS_FILTER_MEX_CAUDILLO_REBELLION',
    'FOCUS_FILTER_SPA_CIVIL_WAR',
    'FOCUS_FILTER_SPA_CARLIST_UPRISING',
    'FOCUS_FILTER_TUR_KURDISTAN',
    'FOCUS_FILTER_TUR_KEMALISM',
    'FOCUS_FILTER_TUR_TRADITIONALISM',
    'FOCUS_FILTER_GRE_DEBT_TO_IFC',
    'FOCUS_FILTER_SOV_POLITICAL_PARANOIA',
    'FOCUS_FILTER_ITA_MISSIOLINI',
    'FOCUS_FILTER_FOLKHEMMET',
];

function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── 중점 노드 표시 모드 ('id' | 'localisation') ─────────
let _focusNodeDisplayMode = 'id';

function getFocusNodeLabel(focus) {
    if (_focusNodeDisplayMode === 'localisation') {
        // 프로젝트 내 모든 loc 파일에서 이름 탐색
        for (const fd of Object.values(appState.project.files)) {
            if (fd.type !== 'localisation') continue;
            const entry = fd.data[focus.id];
            const name  = typeof entry === 'object' ? entry?.name : entry;
            if (name?.trim()) return name;
        }
        // 없으면 focus.name, 그것도 없으면 id
        return focus.name || focus.id;
    }
    return focus.id;
}
// 프로젝트 내 모든 로컬라이제이션 파일에서 focusId에 해당하는 name을 찾아 반영
function applyLocToFocus(focusId, fd) {
    const focus = fd?.focuses[focusId];
    if (!focus) return;
    for (const filePath of Object.keys(appState.project.files)) {
        const locFile = appState.project.files[filePath];
        if (locFile.type !== 'localisation') continue;
        const entry = locFile.data[focusId];
        const name  = typeof entry === 'object' ? entry?.name : entry;
        if (name?.trim()) { focus.name = name; return; }
    }
}

function applyLocToAllFocuses(fd) {
    if (!fd) return;
    Object.keys(fd.focuses).forEach(id => applyLocToFocus(id, fd));
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
    document.getElementById('btn-focus-save-server')
        ?.addEventListener('click', () => {
            if (!fd || !appState.currentFile) return;
            _saveCurrentFileToServer(appState.currentFile, fd);
        });
    document.getElementById('btn-focus-save-file')
        ?.addEventListener('click', () => {
            if (!fd) return;
            downloadBlob(buildFocusTxt(fd), filename);
        });
    document.getElementById('btn-focus-import-file')
        ?.addEventListener('click', () => _focusImportFile());
    document.getElementById('btn-focus-raw-edit')
        ?.addEventListener('click', () => {
            if (!fd || !appState.currentFile) return;
            const ve = document.getElementById('visual-editor');
            if (!ve) return;
            _renderRawWithReturn(
                ve, appState.currentFile, fd,
                buildFocusTxt(fd),
                (newRaw) => {
                    let parsed;
                    try { parsed = parseFocusFile(newRaw); }
                    catch (e) { return { ok: false, msg: e.message }; }
                    if (!parsed) return { ok: false, msg: 'focus_tree 블록을 찾을 수 없습니다.' };
                    Object.assign(fd, parsed);
                    appState.project.files[appState.currentFile] = fd;
                    appState.isDirty = true;
                    return { ok: true };
                },
                () => renderFocusTree()
            );
        });
    document.getElementById('btn-new-focus')
        ?.addEventListener('click', () => openEditorPanel('new'));
    document.getElementById('btn-tree-settings')
        ?.addEventListener('click', () => openEditorPanel('settings'));
    document.getElementById('btn-undo')
        ?.addEventListener('click', undo);
    document.getElementById('btn-redo')
        ?.addEventListener('click', redo);

    // 노드 표시 모드 라디오
    document.querySelectorAll('input[name="node-display"]').forEach(radio => {
        // 현재 상태 동기화
        radio.checked = (radio.value === _focusNodeDisplayMode);
        radio.addEventListener('change', () => {
            _focusNodeDisplayMode = radio.value;
            renderFocusTree();
        });
    });
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
        CloudAuth.saveProject(appState.project.name).catch(console.error);
        alert(`불러오기 완료 (중점 ${Object.keys(parsed.focuses).length}개)`);
    };
    input.click();
}

// ── 드로어 패널 ─────────────────────────────────────────
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
            applyLocToFocus(newId, fd);   // 로컬라이제이션에 이름이 있으면 반영
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
