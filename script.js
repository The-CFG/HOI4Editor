document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 참조 (모바일용 요소 추가) ---
    const leftPanel = document.getElementById('left-panel');
    const rightPanel = document.getElementById('right-panel');
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
    
    // ★★★★★ 모바일용 요소 참조 추가 ★★★★★
    const btnMobileMenu = document.getElementById('btn-mobile-menu');
    const overlay = document.getElementById('overlay');


    // --- 애플리케이션 상태 관리 (변경 없음) ---
    const appState = {
        isDirty: false,
        focusCounter: 0,
        focuses: {},
        selectedFocusId: null,
    };
    
    const GRID_SCALE_X = 80;
    const GRID_SCALE_Y = 100;

    // --- 오른쪽 패널 관리 (CSS 변경으로 인해 로직은 그대로 동작) ---
    function openRightPanel(mode, focusId = null) {
        appState.selectedFocusId = focusId;
        updateRightPanel(mode, focusId);
        rightPanel.classList.remove('hidden');
    }

    function closeRightPanel() {
        rightPanel.classList.add('hidden');
        if (appState.selectedFocusId) {
            document.querySelector(`[data-id="${appState.selectedFocusId}"]`)?.classList.remove('selected');
        }
        appState.selectedFocusId = null;
    }
    
    // generateFocusForm, updateRightPanel, renderFocusTree 함수는 이전과 동일하게 유지됩니다.
    // ... (이전 단계의 generateFocusForm, updateRightPanel, renderFocusTree 코드가 여기에 위치) ...
    // ... 생략 ...
    
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // ★★★★★★★★★★★ 폼 생성 함수 (이전과 동일) ★★★★★★★★★★★
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    function generateFocusForm(focusData) {
        const formatPrereqs = (prereqs = []) => {
            return prereqs.map(p => {
                if (Array.isArray(p)) { return `[${p.join(', ')}]`; }
                return p;
            }).join(', ');
        };

        return `
            <div class="form-group"><label for="focus-id">ID (필수)</label><input type="text" id="focus-id" value="${focusData.id || ''}" ${focusData.id ? 'disabled' : ''}></div>
            <div class="form-group"><label for="focus-name">이름 (Localisation)</label><input type="text" id="focus-name" value="${focusData.name || ''}"></div>
            <div class="form-group"><label for="focus-icon">아이콘 (GFX Key)</label><input type="text" id="focus-icon" value="${focusData.icon || 'GFX_goal_unknown'}"></div><hr>
            <div class="form-group"><label for="focus-days">완료일 (Cost)</label><input type="number" id="focus-days" value="${focusData.days || 70}" step="7"></div>
            <div class="form-group"><label for="focus-x">X 좌표</label><input type="number" id="focus-x" value="${focusData.x || 0}"></div>
            <div class="form-group"><label for="focus-y">Y 좌표</label><input type="number" id="focus-y" value="${focusData.y || 0}"></div><hr>
            <div class="form-group"><label for="focus-prerequisite">선행 중점 (AND: ,, OR: [id1, id2])</label><input type="text" id="focus-prerequisite" value="${formatPrereqs(focusData.prerequisite)}" placeholder="id1, [id2, id3]"></div>
            <div class="form-group"><label for="focus-mutually-exclusive">상호 배타 중점 (ID, 쉼표로 구분)</label><input type="text" id="focus-mutually-exclusive" value="${(focusData.mutually_exclusive || []).join(', ')}"></div><hr>
            <div class="form-group"><label for="focus-ai-will-do">AI 실행 가중치 (Script)</label><textarea id="focus-ai-will-do" placeholder="factor = 1&#10;modifier = { ... }">${focusData.ai_will_do || ''}</textarea></div>
            <div class="form-group"><label for="focus-complete-effect">완료 보상 (Script)</label><textarea id="focus-complete-effect">${focusData.complete_effect || ''}</textarea></div>
            <button id="btn-apply-changes">적용</button><button id="btn-cancel-changes" class="secondary">취소</button>
        `;
    }

    function renderFocusTree() {
        visualEditor.innerHTML = '';
        const svgLines = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgLines.style.position = 'absolute'; svgLines.style.width = '100%'; svgLines.style.height = '100%'; svgLines.style.pointerEvents = 'none';

        const getFocusPixelPosition = (focusId) => {
            const focus = appState.focuses[focusId]; if (!focus) return null;
            let pixelX = focus.x * GRID_SCALE_X; let pixelY = focus.y * GRID_SCALE_Y;
            if (focus.relative_position_id && appState.focuses[focus.relative_position_id]) {
                const parentPos = getFocusPixelPosition(focus.relative_position_id);
                if (parentPos) { pixelX += parentPos.x; pixelY += parentPos.y; }
            }
            return { x: pixelX, y: pixelY };
        };

        Object.values(appState.focuses).forEach(focus => {
            const pos = getFocusPixelPosition(focus.id); if (!pos) return;
            const node = document.createElement('div');
            node.className = 'focus-node';
            if (focus.id === appState.selectedFocusId) node.classList.add('selected');
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
                    if (Array.isArray(prereqItem)) { prereqItem.forEach(orFocusId => drawLine(orFocusId, true)); } 
                    else { drawLine(prereqItem, false); }
                });
            }
        });
        visualEditor.appendChild(svgLines);
    }
    
    // --- 이벤트 핸들러 ---

    // ★★★★★ 모바일 메뉴 열고 닫기 이벤트 핸들러 추가 ★★★★★
    btnMobileMenu.addEventListener('click', () => {
        leftPanel.classList.add('open');
        overlay.classList.remove('hidden');
    });

    overlay.addEventListener('click', () => {
        leftPanel.classList.remove('open');
        overlay.classList.add('hidden');
    });

    rightPanel.addEventListener('click', (e) => {
        if (e.target.id === 'btn-apply-changes') {
            // ... (이전 단계의 '적용' 버튼 로직과 동일) ...
            // ... 생략 ...
            const idInput = document.getElementById('focus-id');
            const focusId = idInput.value.trim();
            if (!focusId) { alert('ID는 필수 항목입니다.'); return; }
            const isNew = !idInput.disabled;
            if (isNew && appState.focuses[focusId]) { alert('이미 사용 중인 ID입니다.'); return; }
            const prereqInput = document.getElementById('focus-prerequisite').value;
            const prereqRegex = /(\[[^\]]+\]|[^,]+)/g;
            let prerequisites = []; let match;
            while((match = prereqRegex.exec(prereqInput)) !== null) {
                let part = match[0].trim();
                if (part.startsWith('[') && part.endsWith(']')) {
                    const orItems = part.substring(1, part.length - 1).split(',').map(s => s.trim()).filter(Boolean);
                    if(orItems.length > 0) prerequisites.push(orItems);
                } else if (part) { prerequisites.push(part); }
            }
            const firstAndPrereq = prerequisites.find(p => !Array.isArray(p));
            const newFocusData = {
                id: focusId, name: document.getElementById('focus-name').value, icon: document.getElementById('focus-icon').value,
                days: parseInt(document.getElementById('focus-days').value) || 70, x: parseInt(document.getElementById('focus-x').value) || 0,
                y: parseInt(document.getElementById('focus-y').value) || 0, relative_position_id: firstAndPrereq || null,
                prerequisite: prerequisites, mutually_exclusive: document.getElementById('focus-mutually-exclusive').value.split(',').map(s => s.trim()).filter(Boolean),
                ai_will_do: document.getElementById('focus-ai-will-do').value, complete_effect: document.getElementById('focus-complete-effect').value,
            };
            appState.focuses[focusId] = newFocusData; appState.isDirty = true;
            if (isNew) appState.focusCounter++;
            renderFocusTree(); closeRightPanel();
        } else if (e.target.id === 'btn-cancel-changes') {
            closeRightPanel();
        }
    });

    // --- 나머지 이벤트 핸들러 (이전과 동일) ---
    btnNewFocus.addEventListener('click', () => openRightPanel('new'));
    btnClosePanel.addEventListener('click', closeRightPanel);
    visualEditor.addEventListener('click', (e) => {
        const node = e.target.closest('.focus-node');
        if (node) {
            const focusId = node.dataset.id;
            const currentSelected = document.querySelector('.focus-node.selected');
            if (currentSelected) currentSelected.classList.remove('selected');
            node.classList.add('selected');
            openRightPanel('edit', focusId);
        }
    });
    btnManageElements.addEventListener('click', () => { focusEditorView.classList.add('hidden'); linkedElementsView.classList.remove('hidden'); closeRightPanel(); });
    btnBackToFocus.addEventListener('click', () => { focusEditorView.classList.remove('hidden'); linkedElementsView.classList.add('hidden'); });
    window.addEventListener('beforeunload', (e) => { if (appState.isDirty) { e.preventDefault(); e.returnValue = ''; return '저장되지 않은 변경사항이 있습니다.'; } });
    btnSave.addEventListener('click', () => {
        // ... (이전 단계의 저장 버튼 로직과 동일) ...
        // ... 생략 ...
        if (Object.keys(appState.focuses).length === 0) { alert('저장할 중점이 없습니다.'); return; }
        let focusFileContent = 'focus_tree = {\n\tid = my_focus_tree\n\tcountry = GEN\n\n';
        Object.values(appState.focuses).forEach(f => {
            focusFileContent += `\tfocus = {\n`;
            focusFileContent += `\t\tid = ${f.id}\n\t\ticon = ${f.icon}\n\t\tcost = ${f.days / 7}\n`;
            if (f.prerequisite && f.prerequisite.length > 0) {
                let prereqStr = '\t\tprerequisite = { ';
                f.prerequisite.forEach(item => {
                    if(Array.isArray(item)) { prereqStr += `or = { ${item.map(p => `focus = ${p}`).join(' ')} } `; } 
                    else { prereqStr += `focus = ${item} `; }
                });
                prereqStr += '}\n'; focusFileContent += prereqStr;
            }
            if (f.mutually_exclusive.length > 0) { focusFileContent += `\t\tmutually_exclusive = { ${f.mutually_exclusive.map(p => `focus = ${p}`).join(' ')} }\n`; }
            focusFileContent += `\t\tx = ${f.x}\n\t\ty = ${f.y}\n`;
            if(f.relative_position_id) { focusFileContent += `\t\trelative_position_id = ${f.relative_position_id}\n`; }
            if(f.ai_will_do) { focusFileContent += `\t\tai_will_do = {\n\t\t\t${f.ai_will_do.replace(/\n/g, '\n\t\t\t')}\n\t\t}\n`; }
            focusFileContent += `\t\tcompletion_reward = {\n\t\t\t${f.complete_effect.replace(/\n/g, '\n\t\t\t')}\n\t\t}\n`;
            focusFileContent += `\t}\n\n`;
        });
        focusFileContent += '}';
        const blob = new Blob([focusFileContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob); link.download = 'my_focus_tree.txt';
        link.click(); URL.revokeObjectURL(link.href);
        alert("my_focus_tree.txt 파일이 다운로드되었습니다."); appState.isDirty = false;
    });
});
