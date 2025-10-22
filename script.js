document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 참조 (rightPanel -> leftPanel, editorFormContainer) ---
    const leftPanel = document.getElementById('left-panel');
    const editorFormContainer = document.getElementById('editor-form-container');
    const panelContent = document.getElementById('panel-content');
    const panelTitle = document.getElementById('panel-title');
    const visualEditor = document.getElementById('visual-editor');
    const btnNewFocus = document.getElementById('btn-new-focus');
    const btnClosePanel = document.getElementById('btn-close-panel');
    const btnMobileMenu = document.getElementById('btn-mobile-menu');
    const overlay = document.getElementById('overlay');
    // ... 기타 참조는 동일 ...

    // --- 애플리케이션 상태 관리 (변경 없음) ---
    const appState = { isDirty: false, focusCounter: 0, focuses: {}, selectedFocusId: null };
    const GRID_SCALE_X = 80; const GRID_SCALE_Y = 100;

    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // ★★★★★★★★★★★ 편집 패널 열기/닫기 로직 전면 수정 ★★★★★★★★★★★
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    function openEditorPanel(mode, focusId = null) {
        appState.selectedFocusId = focusId;
        updateEditorPanel(mode, focusId);

        leftPanel.classList.add('editing');
        editorFormContainer.classList.remove('hidden');

        // 모바일 뷰인지 확인
        if (window.innerWidth <= 1024) {
             editorFormContainer.classList.add('show-on-mobile');
        }
    }

    function closeEditorPanel() {
        leftPanel.classList.remove('editing');
        editorFormContainer.classList.add('hidden');
        editorFormContainer.classList.remove('show-on-mobile'); // 모바일 클래스도 제거

        if (appState.selectedFocusId) {
            document.querySelector(`[data-id="${appState.selectedFocusId}"]`)?.classList.remove('selected');
        }
        appState.selectedFocusId = null;
    }

    function updateEditorPanel(mode, focusId) {
        let title = '';
        const focus = focusId ? appState.focuses[focusId] : null;

        switch (mode) {
            case 'new': title = '새 중점 만들기'; break;
            case 'edit': title = `중점 편집: ${focus.id}`; break;
        }
        panelTitle.textContent = title;
        panelContent.innerHTML = generateFocusForm(focus || {});
    }

    // --- generateFocusForm, renderFocusTree 함수는 이전과 동일 ---
    // ... 이전 단계의 generateFocusForm, renderFocusTree 코드를 여기에 삽입 ...
    // ... 생략 ...
    function generateFocusForm(focusData) { /* 이전과 동일 */ 
        const formatPrereqs = (prereqs = []) => { return prereqs.map(p => Array.isArray(p) ? `[${p.join(', ')}]` : p).join(', '); };
        return `<div class="form-group"><label for="focus-id">ID (필수)</label><input type="text" id="focus-id" value="${focusData.id || ''}" ${focusData.id ? 'disabled' : ''}></div><div class="form-group"><label for="focus-name">이름 (Localisation)</label><input type="text" id="focus-name" value="${focusData.name || ''}"></div><div class="form-group"><label for="focus-icon">아이콘 (GFX Key)</label><input type="text" id="focus-icon" value="${focusData.icon || 'GFX_goal_unknown'}"></div><hr><div class="form-group"><label for="focus-days">완료일 (Cost)</label><input type="number" id="focus-days" value="${focusData.days || 70}" step="7"></div><div class="form-group"><label for="focus-x">X 좌표</label><input type="number" id="focus-x" value="${focusData.x || 0}"></div><div class="form-group"><label for="focus-y">Y 좌표</label><input type="number" id="focus-y" value="${focusData.y || 0}"></div><hr><div class="form-group"><label for="focus-prerequisite">선행 중점 (AND: ,, OR: [id1, id2])</label><input type="text" id="focus-prerequisite" value="${formatPrereqs(focusData.prerequisite)}" placeholder="id1, [id2, id3]"></div><div class="form-group"><label for="focus-mutually-exclusive">상호 배타 중점 (ID, 쉼표로 구분)</label><input type="text" id="focus-mutually-exclusive" value="${(focusData.mutually_exclusive || []).join(', ')}"></div><hr><div class="form-group"><label for="focus-ai-will-do">AI 실행 가중치 (Script)</label><textarea id="focus-ai-will-do" placeholder="factor = 1&#10;modifier = { ... }">${focusData.ai_will_do || ''}</textarea></div><div class="form-group"><label for="focus-complete-effect">완료 보상 (Script)</label><textarea id="focus-complete-effect">${focusData.complete_effect || ''}</textarea></div><button id="btn-apply-changes">적용</button><button id="btn-cancel-changes" class="secondary">취소</button>`;
    }
    function renderFocusTree() { /* 이전과 동일 */
        visualEditor.innerHTML = '';
        const svgLines = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgLines.style.position = 'absolute'; svgLines.style.width = '100%'; svgLines.style.height = '100%'; svgLines.style.pointerEvents = 'none';
        const getFocusPixelPosition = (focusId) => { const focus = appState.focuses[focusId]; if (!focus) return null; let pixelX = focus.x * GRID_SCALE_X; let pixelY = focus.y * GRID_SCALE_Y; if (focus.relative_position_id && appState.focuses[focus.relative_position_id]) { const parentPos = getFocusPixelPosition(focus.relative_position_id); if (parentPos) { pixelX += parentPos.x; pixelY += parentPos.y; } } return { x: pixelX, y: pixelY }; };
        Object.values(appState.focuses).forEach(focus => {
            const pos = getFocusPixelPosition(focus.id); if (!pos) return;
            const node = document.createElement('div'); node.className = 'focus-node'; if (focus.id === appState.selectedFocusId) node.classList.add('selected');
            node.dataset.id = focus.id; node.style.left = `${pos.x}px`; node.style.top = `${pos.y}px`;
            node.innerHTML = `<div class="focus-node-id">${focus.id}</div><div class="focus-node-name">${focus.name}</div>`;
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
                    if (Array.isArray(prereqItem)) { prereqItem.forEach(orFocusId => drawLine(orFocusId, true)); } else { drawLine(prereqItem, false); }
                });
            }
        });
        visualEditor.appendChild(svgLines);
    }
    
    // --- 이벤트 핸들러 ---
    btnNewFocus.addEventListener('click', () => openEditorPanel('new'));
    btnClosePanel.addEventListener('click', closeEditorPanel);

    // 이벤트 위임을 leftPanel로 변경
    leftPanel.addEventListener('click', (e) => {
        if (e.target.id === 'btn-apply-changes') {
            // '적용' 버튼 로직은 이전과 완전히 동일
            // ... 생략 ...
            const idInput = document.getElementById('focus-id'); const focusId = idInput.value.trim(); if (!focusId) { alert('ID는 필수 항목입니다.'); return; } const isNew = !idInput.disabled; if (isNew && appState.focuses[focusId]) { alert('이미 사용 중인 ID입니다.'); return; } const prereqInput = document.getElementById('focus-prerequisite').value; const prereqRegex = /(\[[^\]]+\]|[^,]+)/g; let prerequisites = []; let match; while((match = prereqRegex.exec(prereqInput)) !== null) { let part = match[0].trim(); if (part.startsWith('[') && part.endsWith(']')) { const orItems = part.substring(1, part.length - 1).split(',').map(s => s.trim()).filter(Boolean); if(orItems.length > 0) prerequisites.push(orItems); } else if (part) { prerequisites.push(part); } } const firstAndPrereq = prerequisites.find(p => !Array.isArray(p)); const newFocusData = { id: focusId, name: document.getElementById('focus-name').value, icon: document.getElementById('focus-icon').value, days: parseInt(document.getElementById('focus-days').value) || 70, x: parseInt(document.getElementById('focus-x').value) || 0, y: parseInt(document.getElementById('focus-y').value) || 0, relative_position_id: firstAndPrereq || null, prerequisite: prerequisites, mutually_exclusive: document.getElementById('focus-mutually-exclusive').value.split(',').map(s => s.trim()).filter(Boolean), ai_will_do: document.getElementById('focus-ai-will-do').value, complete_effect: document.getElementById('focus-complete-effect').value }; appState.focuses[focusId] = newFocusData; appState.isDirty = true; if (isNew) appState.focusCounter++; renderFocusTree(); closeEditorPanel();
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

    // 모바일 메뉴 핸들러
    btnMobileMenu.addEventListener('click', () => { leftPanel.classList.add('open'); overlay.classList.remove('hidden'); });
    overlay.addEventListener('click', () => { leftPanel.classList.remove('open'); overlay.classList.add('hidden'); });
    
    // 나머지 이벤트 핸들러는 이전과 동일
    // ... btnManageElements, btnBackToFocus, beforeunload, btnSave 이벤트 핸들러 ...
});
