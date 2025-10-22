document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 참조 ---
    const leftPanel = document.getElementById('left-panel');
    const editorFormContainer = document.getElementById('editor-form-container');
    const panelContent = document.getElementById('panel-content');
    const panelTitle = document.getElementById('panel-title');
    const visualEditor = document.getElementById('visual-editor');
    const btnSave = document.getElementById('btn-save');
    const btnNewFocus = document.getElementById('btn-new-focus');
    const btnClosePanel = document.getElementById('btn-close-panel');
    const btnManageElements = document.getElementById('btn-manage-elements');
    const btnBackToFocus = document.getElementById('btn-back-to-focus');
    const focusEditorView = document.getElementById('focus-editor-view');
    const linkedElementsView = document.getElementById('linked-elements-view');
    const btnMobileMenu = document.getElementById('btn-mobile-menu');
    const overlay = document.getElementById('overlay');

    // --- 애플리케이션 상태 관리 ---
    const appState = {
        isDirty: false,
        focusCounter: 0,
        focuses: {},
        selectedFocusId: null,
    };
    const GRID_SCALE_X = 80;
    const GRID_SCALE_Y = 100;

    // --- 편집 패널 열기/닫기 로직 ---
    function openEditorPanel(mode, focusId = null) {
        appState.selectedFocusId = focusId;
        updateEditorPanel(mode, focusId);
        leftPanel.classList.add('editing');
        editorFormContainer.classList.remove('hidden');
        if (window.innerWidth <= 1024) {
            editorFormContainer.classList.add('show-on-mobile');
        }
    }

    function closeEditorPanel() {
        leftPanel.classList.remove('editing');
        editorFormContainer.classList.add('hidden');
        editorFormContainer.classList.remove('show-on-mobile');
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
        
        const createCheckbox = (id, label, checked) => `
            <div class="form-group-checkbox">
                <label>
                    <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
                    ${label}
                </label>
            </div>
        `;

        return `
            <div class="form-group">
                <label for="focus-id">ID (필수)</label>
                <input type="text" id="focus-id" value="${focusData.id || ''}" ${focusData.id ? 'disabled' : ''}>
            </div>
            <div class="form-group">
                <label for="focus-name">이름 (Localisation)</label>
                <input type="text" id="focus-name" value="${focusData.name || ''}">
            </div>
            <div class="form-group">
                <label for="focus-icon">아이콘 (GFX Key)</label>
                <input type="text" id="focus-icon" value="${focusData.icon || 'GFX_goal_unknown'}">
            </div>
            <hr>
            <div class="form-group">
                <label for="focus-days">완료일 (Cost)</label>
                <input type="number" id="focus-days" value="${focusData.days || 70}" step="7">
            </div>
            <div class="form-group">
                <label for="focus-x">X 좌표</label>
                <input type="number" id="focus-x" value="${focusData.x || 0}">
            </div>
            <div class="form-group">
                <label for="focus-y">Y 좌표</label>
                <input type="number" id="focus-y" value="${focusData.y || 0}">
            </div>
            <hr>
            <div class="form-group">
                <label for="focus-prerequisite">선행 중점 (AND: ,, OR: [id1, id2])</label>
                <input type="text" id="focus-prerequisite" value="${formatPrereqs(focusData.prerequisite)}" placeholder="id1, [id2, id3]">
            </div>
            <div class="form-group">
                <label for="focus-mutually-exclusive">상호 배타 중점 (ID, 쉼표로 구분)</label>
                <input type="text" id="focus-mutually-exclusive" value="${(focusData.mutually_exclusive || []).join(', ')}">
            </div>
            <hr>
            <div class="form-group">
                <label for="focus-available">유효 조건 (Available)</label>
                <textarea id="focus-available" placeholder="중점이 보이기 위한 조건">${focusData.available || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="focus-bypass">자동완료 조건 (Bypass)</label>
                <textarea id="focus-bypass" placeholder="자동으로 완료되기 위한 조건">${focusData.bypass || ''}</textarea>
            </div>
            ${createCheckbox('focus-cancelable', '취소 가능 (Cancelable)', focusData.cancelable)}
            ${createCheckbox('focus-continue-if-invalid', '무효화 시 계속 (Continue if Invalid)', focusData.continue_if_invalid)}
            ${createCheckbox('focus-available-if-capitulated', '항복 시 유효 (Available if Capitulated)', focusData.available_if_capitulated)}
            <hr>
            <div class="form-group">
                <label for="focus-ai-will-do">AI 실행 가중치 (Script)</label>
                <textarea id="focus-ai-will-do" placeholder="factor = 1&#10;modifier = { ... }">${focusData.ai_will_do || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="focus-search-filters">검색 필터 (쉼표로 구분)</label>
                <input type="text" id="focus-search-filters" placeholder="FOCUS_FILTER_POLITICAL, ..." value="${(focusData.search_filters || []).join(', ')}">
            </div>
            <div class="form-group">
                <label for="focus-complete-effect">완료 보상 (Script)</label>
                <textarea id="focus-complete-effect">${focusData.complete_effect || ''}</textarea>
            </div>
            <button id="btn-apply-changes">적용</button>
            <button id="btn-cancel-changes" class="secondary">취소</button>
        `;
    }

    // --- 시각적 편집기 렌더링 ---
    function renderFocusTree() {
        visualEditor.innerHTML = '';
        const svgLines = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgLines.style.position = 'absolute';
        svgLines.style.width = '100%';
        svgLines.style.height = '100%';
        svgLines.style.pointerEvents = 'none';

        const getFocusPixelPosition = (focusId) => {
            const focus = appState.focuses[focusId];
            if (!focus) return null;
            let pixelX = focus.x * GRID_SCALE_X;
            let pixelY = focus.y * GRID_SCALE_Y;
            if (focus.relative_position_id && appState.focuses[focus.relative_position_id]) {
                const parentPos = getFocusPixelPosition(focus.relative_position_id);
                if (parentPos) {
                    pixelX += parentPos.x;
                    pixelY += parentPos.y;
                }
            }
            return { x: pixelX, y: pixelY };
        };

        Object.values(appState.focuses).forEach(focus => {
            const pos = getFocusPixelPosition(focus.id);
            if (!pos) return;
            const node = document.createElement('div');
            node.className = 'focus-node';
            if (focus.id === appState.selectedFocusId) node.classList.add('selected');
            node.dataset.id = focus.id;
            node.style.left = `${pos.x}px`;
            node.style.top = `${pos.y}px`;
            node.innerHTML = `<div class="focus-node-id">${focus.id}</div><div class="focus-node-name">${focus.name}</div>`;
            visualEditor.appendChild(node);

            if (focus.prerequisite && focus.prerequisite.length > 0) {
                focus.prerequisite.forEach(prereqItem => {
                    const drawLine = (parentId, isOr) => {
                        const parentPos = getFocusPixelPosition(parentId);
                        if (parentPos) {
                            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                            line.setAttribute('x1', parentPos.x + 60);
                            line.setAttribute('y1', parentPos.y + 80);
                            line.setAttribute('x2', pos.x + 60);
                            line.setAttribute('y2', pos.y);
                            line.setAttribute('class', `prereq-line ${isOr ? 'or' : ''}`);
                            svgLines.appendChild(line);
                        }
                    };
                    if (Array.isArray(prereqItem)) {
                        prereqItem.forEach(orFocusId => drawLine(orFocusId, true));
                    } else {
                        drawLine(prereqItem, false);
                    }
                });
            }
        });
        visualEditor.appendChild(svgLines);
    }

    // --- 이벤트 핸들러 ---
    btnNewFocus.addEventListener('click', () => openEditorPanel('new'));
    btnClosePanel.addEventListener('click', closeEditorPanel);

    leftPanel.addEventListener('click', (e) => {
        if (e.target.id === 'btn-apply-changes') {
            const idInput = document.getElementById('focus-id');
            const focusId = idInput.value.trim();
            if (!focusId) {
                alert('ID는 필수 항목입니다.');
                return;
            }
            const isNew = !idInput.disabled;
            if (isNew && appState.focuses[focusId]) {
                alert('이미 사용 중인 ID입니다.');
                return;
            }

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
        }
    });

    visualEditor.addEventListener('click', (e) => {
        const node = e.target.closest('.focus-node');
        if (node) {
            const focusId = node.dataset.id;
            const currentSelected = document.querySelector('.focus-node.selected');
            if (currentSelected) currentSelected.classList.remove('selected');
            node.classList.add('selected');
            openEditorPanel('edit', focusId);
        }
    });

    btnMobileMenu.addEventListener('click', () => {
        leftPanel.classList.add('open');
        overlay.classList.remove('hidden');
    });

    overlay.addEventListener('click', () => {
        leftPanel.classList.remove('open');
        overlay.classList.add('hidden');
    });

    btnManageElements.addEventListener('click', () => {
        focusEditorView.classList.add('hidden');
        linkedElementsView.classList.remove('hidden');
        closeEditorPanel();
    });

    btnBackToFocus.addEventListener('click', () => {
        focusEditorView.classList.remove('hidden');
        linkedElementsView.classList.add('hidden');
    });

    window.addEventListener('beforeunload', (e) => {
        if (appState.isDirty) {
            e.preventDefault();
            e.returnValue = '';
            return '저장되지 않은 변경사항이 있습니다. 정말로 나가시겠습니까?';
        }
    });

    btnSave.addEventListener('click', () => {
        if (Object.keys(appState.focuses).length === 0) {
            alert('저장할 중점이 없습니다.');
            return;
        }

        let focusFileContent = 'focus_tree = {\n\tid = my_focus_tree\n\tcountry = GEN\n\n';
        const formatBlock = (key, content) => content ? `\t\t${key} = {\n\t\t\t${content.replace(/\n/g, '\n\t\t\t')}\n\t\t}\n` : '';
        const formatBoolean = (key, value) => value ? `\t\t${key} = yes\n` : '';

        Object.values(appState.focuses).forEach(f => {
            focusFileContent += `\tfocus = {\n`;
            focusFileContent += `\t\tid = ${f.id}\n`;
            focusFileContent += `\t\ticon = ${f.icon}\n`;
            focusFileContent += `\t\tcost = ${f.days / 7}\n`;

            if (f.prerequisite && f.prerequisite.length > 0) {
                let prereqStr = '\t\tprerequisite = { ';
                f.prerequisite.forEach(item => {
                    if (Array.isArray(item)) {
                        prereqStr += `or = { ${item.map(p => `focus = ${p}`).join(' ')} } `;
                    } else {
                        prereqStr += `focus = ${item} `;
                    }
                });
                prereqStr += '}\n';
                focusFileContent += prereqStr;
            }
            if (f.mutually_exclusive.length > 0) {
                focusFileContent += `\t\tmutually_exclusive = { ${f.mutually_exclusive.map(p => `focus = ${p}`).join(' ')} }\n`;
            }

            focusFileContent += `\t\tx = ${f.x}\n`;
            focusFileContent += `\t\ty = ${f.y}\n`;
            if (f.relative_position_id) {
                focusFileContent += `\t\trelative_position_id = ${f.relative_position_id}\n`;
            }

            focusFileContent += formatBlock('available', f.available);
            focusFileContent += formatBlock('bypass', f.bypass);
            focusFileContent += formatBoolean('cancelable', f.cancelable);
            focusFileContent += formatBoolean('continue_if_invalid', f.continue_if_invalid);
            focusFileContent += formatBoolean('available_if_capitulated', f.available_if_capitulated);

            if (f.search_filters.length > 0) {
                focusFileContent += `\t\tsearch_filters = { ${f.search_filters.join(' ')} }\n`;
            }

            focusFileContent += formatBlock('ai_will_do', f.ai_will_do);
            focusFileContent += formatBlock('completion_reward', f.complete_effect);

            focusFileContent += `\t}\n\n`;
        });

        focusFileContent += '}';

        const blob = new Blob([focusFileContent], {
            type: 'text/plain;charset=utf-8'
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'my_focus_tree.txt';
        link.click();
        URL.revokeObjectURL(link.href);

        alert("my_focus_tree.txt 파일이 다운로드되었습니다.");
        appState.isDirty = false;
    });
});
