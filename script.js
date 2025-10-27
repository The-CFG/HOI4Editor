document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 참조 ---
    const leftPanel = document.getElementById('left-panel');
    const editorDrawerPanel = document.getElementById('editor-drawer-panel');
    const panelContent = document.getElementById('panel-content');
    const panelTitle = document.getElementById('panel-title');
    const visualEditor = document.getElementById('visual-editor');
    const btnSave = document.getElementById('btn-save');
    const btnLoad = document.getElementById('btn-load');
    const fileLoader = document.getElementById('file-loader');
    const btnNewFocus = document.getElementById('btn-new-focus');
    const btnDeleteFocus = document.getElementById('btn-delete-focus');
    const btnClosePanel = document.getElementById('btn-close-panel');
    const btnManageElements = document.getElementById('btn-manage-elements');
    const btnBackToFocus = document.getElementById('btn-back-to-focus');
    const focusEditorView = document.getElementById('focus-editor-view');
    const linkedElementsView = document.getElementById('linked-elements-view');
    const btnMobileMenu = document.getElementById('btn-mobile-menu');
    const overlay = document.getElementById('overlay');
    const projectTreeIdInput = document.getElementById('project-tree-id');
    const projectCountryTagInput = document.getElementById('project-country-tag');
    const projectSharedFocusesInput = document.getElementById('project-shared-focuses');

    // --- 애플리케이션 상태 관리 ---
    const appState = {
        isDirty: false,
        focusCounter: 0,
        focuses: {},
        selectedFocusId: null,
        treeId: 'my_focus_tree',
        countryTag: 'GEN',
        sharedFocuses: [],
    };
    const dragState = {
        isDragging: false,
        activeNode: null,
        focusId: null,
        initialMouseX: 0,
        initialMouseY: 0,
        initialNodeX: 0,
        initialNodeY: 0,
    };
    const GRID_SCALE_X = 80;
    const GRID_SCALE_Y = 100;
    const getFocusPixelPosition = (focusId) => {
            const focus = appState.focuses[focusId]; if (!focus) return null;
            let pixelX = focus.x * GRID_SCALE_X; let pixelY = focus.y * GRID_SCALE_Y;
            if (focus.relative_position_id && appState.focuses[focus.relative_position_id]) {
                const parentPos = getFocusPixelPosition(focus.relative_position_id);
                if (parentPos) { pixelX += parentPos.x; pixelY += parentPos.y; }
            }
            return { x: pixelX, y: pixelY };
    };

    // --- 편집 패널 열기/닫기 로직 ---
    function openEditorPanel(mode, focusId = null) {
        appState.selectedFocusId = focusId;
        updateEditorPanel(mode, focusId);
        
        editorDrawerPanel.classList.add('open');
        overlay.classList.remove('hidden'); // 오버레이 표시
    }

    function closeEditorPanel() {
        editorDrawerPanel.classList.remove('open');
        overlay.classList.add('hidden'); // 오버레이 숨김
        if (appState.selectedFocusId) {
            document.querySelector(`[data-id="${appState.selectedFocusId}"]`)?.classList.remove('selected');
        }
        appState.selectedFocusId = null;
    }

    function updateEditorPanel(mode, focusId) {
        let title = '';
        const focus = focusId ? appState.focuses[focusId] : null;
        switch (mode) {
            case 'new':
                title = '새 중점 만들기';
                break;
            case 'edit':
                title = `중점 편집: ${focus.id}`;
                break;
        }
        panelTitle.textContent = title;
        panelContent.innerHTML = generateFocusForm(focus || {});
    }

    // --- 폼 생성 함수 ---
    function generateFocusForm(focusData) {
        const formatPrereqs = (prereqs = []) => prereqs.map(p => Array.isArray(p) ? `[${p.join(', ')}]` : p).join(', ');
        const createCheckbox = (id, label, checked) => `<div class="form-group-checkbox"><label><input type="checkbox" id="${id}" ${checked ? 'checked' : ''}> ${label}</label></div>`;
        let deleteButtonHTML = '';
        if (focusData.id) { // ID가 있는 기존 중점일 때만 삭제 버튼 추가
            deleteButtonHTML = `<button id="btn-delete-focus" class="danger">삭제</button>`;
        }
        
        return `
            <div class="form-group"><label for="focus-id">ID (필수)</label><input type="text" id="focus-id" value="${focusData.id || ''}" ${focusData.id ? 'disabled' : ''}></div>
            <div class="form-group"><label for="focus-name">이름 (Localisation)</label><input type="text" id="focus-name" value="${focusData.name || ''}"></div>
            <div class="form-group"><label for="focus-icon">아이콘 (GFX Key)</label><input type="text" id="focus-icon" value="${focusData.icon || 'GFX_goal_unknown'}"></div><hr>
            <div class="form-group"><label for="focus-days">완료일 (Cost)</label><input type="number" id="focus-days" value="${focusData.days || 70}" step="7"></div>
            <div class="form-group"><label for="focus-x">X 좌표</label><input type="number" id="focus-x" value="${focusData.x || 0}"></div>
            <div class="form-group"><label for="focus-y">Y 좌표</label><input type="number" id="focus-y" value="${focusData.y || 0}"></div><hr>
            <div class="form-group"><label for="focus-prerequisite">선행 중점 (AND: ,, OR: [id1, id2])</label><input type="text" id="focus-prerequisite" value="${formatPrereqs(focusData.prerequisite)}" placeholder="id1, [id2, id3]"></div>
            <div class="form-group"><label for="focus-mutually-exclusive">상호 배타 중점 (ID, 쉼표로 구분)</label><input type="text" id="focus-mutually-exclusive" value="${(focusData.mutually_exclusive || []).join(', ')}"></div><hr>
            <div class="form-group"><label for="focus-available">유효 조건 (Available)</label><textarea id="focus-available" placeholder="중점이 보이기 위한 조건">${focusData.available || ''}</textarea></div>
            <div class="form-group"><label for="focus-bypass">자동완료 조건 (Bypass)</label><textarea id="focus-bypass" placeholder="자동으로 완료되기 위한 조건">${focusData.bypass || ''}</textarea></div>
            ${createCheckbox('focus-cancelable', '취소 가능 (Cancelable)', focusData.cancelable)}
            ${createCheckbox('focus-continue-if-invalid', '무효화 시 계속 (Continue if Invalid)', focusData.continue_if_invalid)}
            ${createCheckbox('focus-available-if-capitulated', '항복 시 유효 (Available if Capitulated)', focusData.available_if_capitulated)}<hr>
            <div class="form-group"><label for="focus-ai-will-do">AI 실행 가중치 (Script)</label><textarea id="focus-ai-will-do" placeholder="factor = 1&#10;modifier = { ... }">${focusData.ai_will_do || ''}</textarea></div>
            <div class="form-group"><label for="focus-search-filters">검색 필터 (쉼표로 구분)</label><input type="text" id="focus-search-filters" placeholder="FOCUS_FILTER_POLITICAL, ..." value="${(focusData.search_filters || []).join(', ')}"></div>
            <div class="form-group"><label for="focus-complete-effect">완료 보상 (Script)</label><textarea id="focus-complete-effect">${focusData.complete_effect || ''}</textarea></div>
            <div class="form-actions">
                <button id="btn-apply-changes">적용</button>
                ${deleteButtonHTML}
                <button id="btn-cancel-changes" class="secondary">취소</button>
            </div>
        `;
    }

    // --- 시각적 편집기 렌더링 ---
    function renderFocusTree() {
        visualEditor.innerHTML = '';
        const svgLines = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgLines.style.position = 'absolute'; svgLines.style.width = '100%'; svgLines.style.height = '100%'; svgLines.style.pointerEvents = 'none';

        Object.values(appState.focuses).forEach(focus => {
            const pos = getFocusPixelPosition(focus.id); if (!pos) return;
            const node = document.createElement('div');
            node.className = 'focus-node'; if (focus.id === appState.selectedFocusId) node.classList.add('selected');
            node.dataset.id = focus.id; node.style.left = `${pos.x}px`; node.style.top = `${pos.y}px`;
            node.innerHTML = `
                <div class="focus-node-id">${focus.id}</div>
                <div class="focus-node-name">${focus.name || focus.id}</div>
                <div class="drag-handle"></div>
            `;
            visualEditor.appendChild(node);

            if (focus.prerequisite && focus.prerequisite.length > 0) {
                focus.prerequisite.forEach(prereqItem => {
                    const drawLine = (parentId, isOr) => {
                        const parentPos = getFocusPixelPosition(parentId);
                        if (parentPos) {
                            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                            line.setAttribute('x1', parentPos.x + 60); line.setAttribute('y1', parentPos.y + 80);
                            line.setAttribute('x2', pos.x + 60); line.setAttribute('y2', pos.y);
                            line.setAttribute('class', `prereq-line ${isOr ? 'or' : ''}`);
                            svgLines.appendChild(line);
                        }
                    };
                    if (Array.isArray(prereqItem)) { prereqItem.forEach(orFocusId => drawLine(orFocusId, true)); } 
                    else { drawLine(prereqItem, false); }
                });
            }
        });
        visualEditor.appendChild(svgLines);
    }

    // --- 이벤트 핸들러 ---
    btnNewFocus.addEventListener('click', () => openEditorPanel('new'));
    btnClosePanel.addEventListener('click', closeEditorPanel);

    editorDrawerPanel.addEventListener('click', (e) => {
        if (e.target.id === 'btn-apply-changes') {
            const idInput = document.getElementById('focus-id');
            const focusId = idInput.value.trim();
            if (!focusId) { alert('ID는 필수 항목입니다.'); return; }
            const isNew = !idInput.disabled;
            if (isNew && appState.focuses[focusId]) { alert('이미 사용 중인 ID입니다.'); return; }
    
            const prereqInput = document.getElementById('focus-prerequisite').value;
            const prereqRegex = /(\[[^\]]+\]|[^,]+)/g;
            let prerequisites = [];
            let match;
            while ((match = prereqRegex.exec(prereqInput)) !== null) {
                let part = match[0].trim();
                if (part.startsWith('[') && part.endsWith(']')) {
                    const orItems = part.substring(1, part.length - 1).split(',').map(s => s.trim()).filter(Boolean);
                    if (orItems.length > 0) prerequisites.push(orItems);
                } else if (part) {
                    prerequisites.push(part);
                }
            }
            const firstAndPrereq = prerequisites.find(p => !Array.isArray(p));
    
            const newFocusData = {
                id: focusId,
                name: document.getElementById('focus-name').value,
                icon: document.getElementById('focus-icon').value,
                days: parseInt(document.getElementById('focus-days').value) || 70,
                x: parseInt(document.getElementById('focus-x').value) || 0,
                y: parseInt(document.getElementById('focus-y').value) || 0,
                relative_position_id: firstAndPrereq || null,
                prerequisite: prerequisites,
                mutually_exclusive: document.getElementById('focus-mutually-exclusive').value.split(',').map(s => s.trim()).filter(Boolean),
                available: document.getElementById('focus-available').value.trim(),
                bypass: document.getElementById('focus-bypass').value.trim(),
                cancelable: document.getElementById('focus-cancelable').checked,
                continue_if_invalid: document.getElementById('focus-continue-if-invalid').checked,
                available_if_capitulated: document.getElementById('focus-available-if-capitulated').checked,
                search_filters: document.getElementById('focus-search-filters').value.split(',').map(s => s.trim()).filter(Boolean),
                ai_will_do: document.getElementById('focus-ai-will-do').value.trim(),
                complete_effect: document.getElementById('focus-complete-effect').value.trim(),
            };
    
            appState.focuses[focusId] = newFocusData;
            appState.isDirty = true;
            if (isNew) appState.focusCounter++;
            renderFocusTree();
            closeEditorPanel();
        } else if (e.target.id === 'btn-cancel-changes') {
            closeEditorPanel();
        } else if (e.target.id === 'btn-delete-focus') {
            const focusIdToDelete = appState.selectedFocusId;
            if (!focusIdToDelete) return;
    
            if (confirm(`정말로 중점 '${focusIdToDelete}'을(를) 삭제하시겠습니까?`)) {
                delete appState.focuses[focusIdToDelete];
                Object.values(appState.focuses).forEach(focus => {
                    if (focus.relative_position_id === focusIdToDelete) { focus.relative_position_id = null; }
                    if (focus.prerequisite && focus.prerequisite.length > 0) {
                        focus.prerequisite = focus.prerequisite.map(item => Array.isArray(item) ? item.filter(id => id !== focusIdToDelete) : item).filter(item => (Array.isArray(item) && item.length === 0) ? false : item !== focusIdToDelete);
                    }
                });
                appState.isDirty = true;
                closeEditorPanel();
                renderFocusTree();
            }
        }
    });

    visualEditor.addEventListener('click', (e) => {
        if (e.target.classList.contains('drag-handle')) return; // 핸들을 클릭하면 패널 열지 않음
    
        const node = e.target.closest('.focus-node');
        if (node) {
            const focusId = node.dataset.id;
            const currentSelected = document.querySelector('.focus-node.selected');
            if (currentSelected) currentSelected.classList.remove('selected');
            node.classList.add('selected');
            openEditorPanel('edit', focusId);
        }
    });

    btnDeleteFocus.addEventListener('click', () => {
        const focusIdToDelete = appState.selectedFocusId; if (!focusIdToDelete) return;
        if (confirm(`정말로 중점 '${focusIdToDelete}'을(를) 삭제하시겠습니까?`)) {
            delete appState.focuses[focusIdToDelete];
            Object.values(appState.focuses).forEach(focus => {
                if (focus.relative_position_id === focusIdToDelete) { focus.relative_position_id = null; }
                if (focus.prerequisite && focus.prerequisite.length > 0) {
                    focus.prerequisite = focus.prerequisite.map(item => Array.isArray(item) ? item.filter(id => id !== focusIdToDelete) : item).filter(item => (Array.isArray(item) && item.length === 0) ? false : item !== focusIdToDelete);
                }
            });
            appState.isDirty = true; closeEditorPanel(); renderFocusTree();
        }
    });

    btnLoad.addEventListener('click', () => {
        if (appState.isDirty && !confirm("저장되지 않은 변경사항이 있습니다. 계속 진행하면 현재 작업 내용이 사라집니다. 계속하시겠습니까?")) {
            return;
        }
        fileLoader.click();
    });

    fileLoader.addEventListener('change', (event) => {
        const file = event.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            try {
                const { focuses, settings } = parseFocusTree(content);
                appState.focuses = focuses;
                appState.treeId = settings.treeId;
                appState.countryTag = settings.countryTag;
                appState.sharedFocuses = settings.sharedFocuses;
                appState.isDirty = false; appState.selectedFocusId = null;

                projectTreeIdInput.value = appState.treeId;
                projectCountryTagInput.value = appState.countryTag;
                projectSharedFocusesInput.value = appState.sharedFocuses.join(', ');

                const numericIds = Object.keys(focuses).map(id => parseInt(id.replace(/[^0-9]/g, '')) || 0);
                appState.focusCounter = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 0;
                
                closeEditorPanel(); renderFocusTree();
                alert('프로젝트를 성공적으로 불러왔습니다.');
            } catch (error) {
                console.error("파일 파싱 오류:", error);
                alert(`파일을 불러오는 중 오류가 발생했습니다: ${error.message}`);
            }
        };
        reader.readAsText(file);
        fileLoader.value = '';
    });

    visualEditor.addEventListener('mousedown', (e) => {
        if (!e.target.classList.contains('drag-handle')) return;
    
        e.preventDefault();
        e.stopPropagation(); // 이벤트 버블링을 막아 click 이벤트 방지
    
        const node = e.target.closest('.focus-node');
        if (!node) return;
    
        dragState.isDragging = true;
        dragState.activeNode = node;
        dragState.focusId = node.dataset.id;
        dragState.initialMouseX = e.clientX;
        dragState.initialMouseY = e.clientY;
        dragState.initialNodeX = parseFloat(node.style.left) || 0;
        dragState.initialNodeY = parseFloat(node.style.top) || 0;
    });
    
    window.addEventListener('mousemove', (e) => {
        if (!dragState.isDragging) return;
        e.preventDefault();
    
        const dx = e.clientX - dragState.initialMouseX;
        const dy = e.clientY - dragState.initialMouseY;
    
        dragState.activeNode.style.left = `${dragState.initialNodeX + dx}px`;
        dragState.activeNode.style.top = `${dragState.initialNodeY + dy}px`;
        renderFocusTree(); // 실시간으로 선 다시 그리기
    });
    
    window.addEventListener('mouseup', (e) => {
        if (!dragState.isDragging) return;
        e.preventDefault();
        
        const focus = appState.focuses[dragState.focusId];
        if (focus) {
            const finalPixelX = parseFloat(dragState.activeNode.style.left);
            const finalPixelY = parseFloat(dragState.activeNode.style.top);
            let newCoordX = finalPixelX;
            let newCoordY = finalPixelY;
    
            if (focus.relative_position_id && appState.focuses[focus.relative_position_id]) {
                const parentPos = getFocusPixelPosition(focus.relative_position_id);
                if (parentPos) {
                    newCoordX -= parentPos.x;
                    newCoordY -= parentPos.y;
                }
            }
            
            focus.x = Math.round(newCoordX / GRID_SCALE_X);
            focus.y = Math.round(newCoordY / GRID_SCALE_Y);
            
            appState.isDirty = true;
            
            if (appState.selectedFocusId === dragState.focusId) {
                document.getElementById('focus-x').value = focus.x;
                document.getElementById('focus-y').value = focus.y;
            }
        }
        
        renderFocusTree();
        
        dragState.isDragging = false;
        dragState.activeNode = null;
        dragState.focusId = null;
    });

    function parseFocusTree(content) {
        const focuses = {}; const settings = {};
        const treeMatch = content.match(/focus_tree\s*=\s*{([\s\S]*)}/);
        if (!treeMatch) throw new Error('focus_tree 블록을 찾을 수 없습니다.');
        const treeContent = treeMatch[1];
        settings.treeId = (treeContent.match(/^\s*id\s*=\s*(\S+)/m) || [])[1] || 'parsed_tree';
        const countryBlockMatch = treeContent.match(/^\s*country\s*=\s*{([\s\S]*?)}/m);
        if (countryBlockMatch) { settings.countryTag = (countryBlockMatch[1].match(/tag\s*=\s*(\S+)/) || [])[1] || 'GEN'; }
        else { settings.countryTag = (treeContent.match(/^\s*country\s*=\s*(\S+)/m) || [])[1] || 'GEN'; }
        settings.sharedFocuses = [...treeContent.matchAll(/^\s*shared_focus\s*=\s*(\S+)/gm)].map(m => m[1]);
        const focusBlockRegex = /focus\s*=\s*{([\s\S]*?)}/g; let match;
        while((match = focusBlockRegex.exec(treeContent)) !== null) {
            const block = match[1]; const focus = {};
            const getValue = (key) => (block.match(new RegExp(`^\\s*${key}\\s*=\\s*(\\S+)`, 'm')) || [])[1];
            const getBlock = (key) => (block.match(new RegExp(`^\\s*${key}\\s*=\s*{([\\s\S]*?)}`, 'm')) || [])[1]?.trim();
            const getBoolean = (key) => /^\s*yes\s*$/im.test(getValue(key));
            focus.id = getValue('id'); if (!focus.id) continue;
            focus.icon = getValue('icon') || 'GFX_goal_unknown';
            focus.days = (parseFloat(getValue('cost')) || 10) * 7;
            focus.x = parseInt(getValue('x')) || 0;
            focus.y = parseInt(getValue('y')) || 0;
            focus.relative_position_id = getValue('relative_position_id') || null;
            const prereqBlock = getBlock('prerequisite');
            if (prereqBlock) {
                focus.prerequisite = []; const orBlocks = [...prereqBlock.matchAll(/or\s*=\s*{([\s\S]*?)}/g)];
                let andBlock = prereqBlock.replace(/or\s*=\s*{[\s\S]*?}/g, '');
                orBlocks.forEach(orMatch => { const orFocuses = [...orMatch[1].matchAll(/focus\s*=\s*(\S+)/g)].map(m => m[1]); if(orFocuses.length > 0) focus.prerequisite.push(orFocuses); });
                const andFocuses = [...andBlock.matchAll(/focus\s*=\s*(\S+)/g)].map(m => m[1]);
                focus.prerequisite.push(...andFocuses);
            } else { focus.prerequisite = []; }
            focus.mutually_exclusive = getBlock('mutually_exclusive')?.match(/\S+/g) || [];
            focus.available = getBlock('available') || '';
            focus.bypass = getBlock('bypass') || '';
            focus.cancelable = getBoolean('cancelable');
            focus.continue_if_invalid = getBoolean('continue_if_invalid');
            focus.available_if_capitulated = getBoolean('available_if_capitulated');
            focus.search_filters = getBlock('search_filters')?.match(/\S+/g) || [];
            focus.ai_will_do = getBlock('ai_will_do') || '';
            focus.complete_effect = getBlock('completion_reward') || '';
            focus.name = focus.id;
            focuses[focus.id] = focus;
        }
        return { focuses, settings };
    }
    
    function setupProjectSettingsListeners() {
        projectTreeIdInput.addEventListener('input', (e) => { appState.treeId = e.target.value; appState.isDirty = true; });
        projectCountryTagInput.addEventListener('input', (e) => { appState.countryTag = e.target.value.toUpperCase(); appState.isDirty = true; });
        projectSharedFocusesInput.addEventListener('input', (e) => { appState.sharedFocuses = e.target.value.split(',').map(s => s.trim()).filter(Boolean); appState.isDirty = true; });
        projectTreeIdInput.value = appState.treeId;
        projectCountryTagInput.value = appState.countryTag;
    }
    setupProjectSettingsListeners();
    
    btnMobileMenu.addEventListener('click', () => { leftPanel.classList.add('open'); overlay.classList.remove('hidden'); });
    overlay.addEventListener('click', () => {
        leftPanel.classList.remove('open'); // 모바일 메뉴 닫기
        closeEditorPanel(); // 편집 드로어 닫기
        overlay.classList.add('hidden');
    });
    btnManageElements.addEventListener('click', () => { focusEditorView.classList.add('hidden'); linkedElementsView.classList.remove('hidden'); closeEditorPanel(); });
    btnBackToFocus.addEventListener('click', () => { focusEditorView.classList.remove('hidden'); linkedElementsView.classList.add('hidden'); });
    window.addEventListener('beforeunload', (e) => { if (appState.isDirty) { e.preventDefault(); e.returnValue = ''; return '저장되지 않은 변경사항이 있습니다.'; } });

    btnSave.addEventListener('click', () => {
        if (Object.keys(appState.focuses).length === 0 && !appState.isDirty) { alert('저장할 내용이 없습니다.'); return; }
        let focusFileContent = `focus_tree = {\n`;
        focusFileContent += `\tid = ${appState.treeId}\n`;
        focusFileContent += `\tcountry = ${appState.countryTag}\n`;
        if (appState.sharedFocuses.length > 0) { appState.sharedFocuses.forEach(sf => { focusFileContent += `\tshared_focus = ${sf}\n`; }); }
        focusFileContent += `\n`;
        const formatBlock = (key, content) => content ? `\t\t${key} = {\n\t\t\t${content.replace(/\n/g, '\n\t\t\t')}\n\t\t}\n` : '';
        const formatBoolean = (key, value) => value ? `\t\t${key} = yes\n` : '';
        Object.values(appState.focuses).forEach(f => {
            focusFileContent += `\tfocus = {\n`;
            focusFileContent += `\t\tid = ${f.id}\n`;
            focusFileContent += `\t\ticon = ${f.icon}\n`;
            focusFileContent += `\t\tcost = ${f.days / 7}\n`;
            if (f.prerequisite && f.prerequisite.length > 0) {
                let prereqStr = '\t\tprerequisite = { ';
                f.prerequisite.forEach(item => { if (Array.isArray(item)) { prereqStr += `or = { ${item.map(p => `focus = ${p}`).join(' ')} } `; } else { prereqStr += `focus = ${item} `; } });
                prereqStr += '}\n'; focusFileContent += prereqStr;
            }
            if (f.mutually_exclusive.length > 0) { focusFileContent += `\t\tmutually_exclusive = { ${f.mutually_exclusive.map(p => `focus = ${p}`).join(' ')} }\n`; }
            focusFileContent += `\t\tx = ${f.x}\n`; focusFileContent += `\t\ty = ${f.y}\n`;
            if (f.relative_position_id) { focusFileContent += `\t\trelative_position_id = ${f.relative_position_id}\n`; }
            focusFileContent += formatBlock('available', f.available);
            focusFileContent += formatBlock('bypass', f.bypass);
            focusFileContent += formatBoolean('cancelable', f.cancelable);
            focusFileContent += formatBoolean('continue_if_invalid', f.continue_if_invalid);
            focusFileContent += formatBoolean('available_if_capitulated', f.available_if_capitulated);
            if (f.search_filters.length > 0) { focusFileContent += `\t\tsearch_filters = { ${f.search_filters.join(' ')} }\n`; }
            focusFileContent += formatBlock('ai_will_do', f.ai_will_do);
            focusFileContent += formatBlock('completion_reward', f.complete_effect);
            focusFileContent += `\t}\n\n`;
        });
        focusFileContent += '}';
        const blob = new Blob([focusFileContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${appState.countryTag}_focus.txt`; // 파일 이름에 국가 태그 반영
        link.click();
        URL.revokeObjectURL(link.href);
        alert(`${appState.countryTag}_focus.txt 파일이 다운로드되었습니다.`);
        appState.isDirty = false;
    });
});
