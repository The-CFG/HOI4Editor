document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 참조 (변경 없음) ---
    const centerPanel = document.getElementById('center-panel');
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

    // --- 애플리케이션 상태 관리 (변경 없음) ---
    const appState = {
        isDirty: false,
        focusCounter: 0,
        focuses: {},
        selectedFocusId: null,
    };
    
    // --- 좌표 스케일링 상수 ---
    const GRID_SCALE_X = 80; // 게임 내 x좌표 1의 픽셀 너비
    const GRID_SCALE_Y = 100; // 게임 내 y좌표 1의 픽셀 높이

    // --- 오른쪽 패널 관리 (함수 호출부는 변경 없음) ---
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

    function updateRightPanel(mode, focusId) {
        let title = '';
        let contentHTML = '';
        const focus = focusId ? appState.focuses[focusId] : null;

        switch (mode) {
            case 'new':
                title = '새 중점 만들기';
                contentHTML = generateFocusForm({});
                break;
            case 'edit':
                title = `중점 편집: ${focus.id}`;
                contentHTML = generateFocusForm(focus);
                break;
        }

        panelTitle.textContent = title;
        panelContent.innerHTML = contentHTML;
    }

    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // ★★★★★★★★★★★ 폼 생성 함수 확장 ★★★★★★★★★★★
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    function generateFocusForm(focusData) {
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
                <label for="focus-desc">설명 (Localisation)</label>
                <textarea id="focus-desc">${focusData.desc || ''}</textarea>
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
            <div class="form-group">
                <label for="focus-relative-id">기준 중점 ID (비워두면 절대좌표)</label>
                <input type="text" id="focus-relative-id" value="${focusData.relative_position_id || ''}">
            </div>
            
            <hr>

            <div class="form-group">
                <label for="focus-prerequisite">선행 중점 (ID, 쉼표로 구분)</label>
                <input type="text" id="focus-prerequisite" value="${(focusData.prerequisite || []).join(', ')}">
            </div>
            <div class="form-group">
                <label for="focus-mutually-exclusive">상호 배타 중점 (ID, 쉼표로 구분)</label>
                <input type="text" id="focus-mutually-exclusive" value="${(focusData.mutually_exclusive || []).join(', ')}">
            </div>

            <hr>
            
            <div class="form-group">
                <label for="focus-ai-will-do">AI 실행 가중치 (Script)</label>
                <textarea id="focus-ai-will-do" placeholder="factor = 1&#10;modifier = { ... }">${focusData.ai_will_do || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="focus-available">유효 조건 (Script)</label>
                <textarea id="focus-available">${focusData.available || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="focus-bypass">자동완료 조건 (Script)</label>
                <textarea id="focus-bypass">${focusData.bypass || ''}</textarea>
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

        Object.values(appState.focuses).forEach(focus => {
            const node = document.createElement('div');
            node.className = 'focus-node';
            if (focus.id === appState.selectedFocusId) node.classList.add('selected');
            node.dataset.id = focus.id;
            
            // ★★★★★ 좌표를 스케일링하여 픽셀 위치로 변환 ★★★★★
            let pixelX = focus.x * GRID_SCALE_X;
            let pixelY = focus.y * GRID_SCALE_Y;

            // 상대 위치 계산
            if (focus.relative_position_id && appState.focuses[focus.relative_position_id]) {
                const parent = appState.focuses[focus.relative_position_id];
                pixelX += parent.x * GRID_SCALE_X;
                pixelY += parent.y * GRID_SCALE_Y;
            }

            node.style.left = `${pixelX}px`;
            node.style.top = `${pixelY}px`;
            node.innerHTML = `<div class="focus-node-id">${focus.id}</div><div class="focus-node-name">${focus.name}</div>`;
            visualEditor.appendChild(node);
            
            if (focus.prerequisite && focus.prerequisite.length > 0) {
                focus.prerequisite.forEach(prereqId => {
                    const parent = appState.focuses[prereqId];
                    if (parent) {
                        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        
                        let parentPixelX = parent.x * GRID_SCALE_X;
                        let parentPixelY = parent.y * GRID_SCALE_Y;
                         if (parent.relative_position_id && appState.focuses[parent.relative_position_id]) {
                            const grandparent = appState.focuses[parent.relative_position_id];
                            parentPixelX += grandparent.x * GRID_SCALE_X;
                            parentPixelY += grandparent.y * GRID_SCALE_Y;
                        }

                        line.setAttribute('x1', parentPixelX + 60);
                        line.setAttribute('y1', parentPixelY + 80);
                        line.setAttribute('x2', pixelX + 60);
                        line.setAttribute('y2', pixelY);
                        line.setAttribute('class', 'prereq-line');
                        svgLines.appendChild(line);
                    }
                });
            }
        });
        visualEditor.appendChild(svgLines);
    }

    // --- 이벤트 핸들러 ---
    btnNewFocus.addEventListener('click', () => openRightPanel('new'));
    btnClosePanel.addEventListener('click', closeRightPanel);
    rightPanel.addEventListener('click', (e) => {
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
            
            // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
            // ★★★★★★★★★★★ 폼 데이터 읽기 확장 ★★★★★★★★★★
            // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
            const newFocusData = {
                id: focusId,
                name: document.getElementById('focus-name').value,
                desc: document.getElementById('focus-desc').value,
                icon: document.getElementById('focus-icon').value,
                days: parseInt(document.getElementById('focus-days').value) || 70,
                x: parseInt(document.getElementById('focus-x').value) || 0,
                y: parseInt(document.getElementById('focus-y').value) || 0,
                relative_position_id: document.getElementById('focus-relative-id').value.trim() || null,
                prerequisite: document.getElementById('focus-prerequisite').value.split(',').map(s => s.trim()).filter(Boolean),
                mutually_exclusive: document.getElementById('focus-mutually-exclusive').value.split(',').map(s => s.trim()).filter(Boolean),
                ai_will_do: document.getElementById('focus-ai-will-do').value,
                available: document.getElementById('focus-available').value,
                bypass: document.getElementById('focus-bypass').value,
                complete_effect: document.getElementById('focus-complete-effect').value,
            };

            appState.focuses[focusId] = newFocusData;
            appState.isDirty = true;
            if (isNew) {
                appState.focusCounter++;
            }
            
            renderFocusTree();
            closeRightPanel();
        } else if (e.target.id === 'btn-cancel-changes') {
            closeRightPanel();
        }
    });

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
    
    btnManageElements.addEventListener('click', () => {
        focusEditorView.classList.add('hidden');
        linkedElementsView.classList.remove('hidden');
        closeRightPanel();
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

    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // ★★★★★★★★★★★ 다운로드 로직 개선 ★★★★★★★★★★★
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    btnSave.addEventListener('click', () => {
        if (Object.keys(appState.focuses).length === 0) {
            alert('저장할 중점이 없습니다.');
            return;
        }

        let focusFileContent = 'focus_tree = {\n';
        focusFileContent += '\tid = my_focus_tree\n';
        focusFileContent += '\tcountry = GEN\n\n';

        Object.values(appState.focuses).forEach(f => {
            focusFileContent += `\tfocus = {\n`;
            focusFileContent += `\t\tid = ${f.id}\n`;
            focusFileContent += `\t\ticon = ${f.icon}\n`;
            focusFileContent += `\t\tcost = ${f.days / 7}\n`;
            if (f.prerequisite.length > 0) {
                 focusFileContent += `\t\tprerequisite = { ${f.prerequisite.map(p => `focus = ${p}`).join(' ')} }\n`;
            }
            if (f.mutually_exclusive.length > 0) {
                 focusFileContent += `\t\tmutually_exclusive = { ${f.mutually_exclusive.map(p => `focus = ${p}`).join(' ')} }\n`;
            }
            focusFileContent += `\t\tx = ${f.x}\n`;
            focusFileContent += `\t\ty = ${f.y}\n`;
            if(f.relative_position_id) {
                focusFileContent += `\t\trelative_position_id = ${f.relative_position_id}\n`;
            }
             if(f.available) {
                focusFileContent += `\t\tavailable = {\n\t\t\t${f.available.replace(/\n/g, '\n\t\t\t')}\n\t\t}\n`;
            }
            if(f.bypass) {
                focusFileContent += `\t\tbypass = {\n\t\t\t${f.bypass.replace(/\n/g, '\n\t\t\t')}\n\t\t}\n`;
            }
            if(f.ai_will_do) {
                focusFileContent += `\t\tai_will_do = {\n\t\t\t${f.ai_will_do.replace(/\n/g, '\n\t\t\t')}\n\t\t}\n`;
            }
            focusFileContent += `\t\tcompletion_reward = {\n\t\t\t${f.complete_effect.replace(/\n/g, '\n\t\t\t')}\n\t\t}\n`;
            focusFileContent += `\t}\n\n`;
        });
        
        focusFileContent += '}';

        console.log('--- 생성된 중점 파일 내용 ---');
        console.log(focusFileContent);
        
        // 실제 파일 다운로드 로직
        const blob = new Blob([focusFileContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'my_focus_tree.txt';
        link.click();
        URL.revokeObjectURL(link.href);
        
        alert("my_focus_tree.txt 파일이 다운로드되었습니다.");
        appState.isDirty = false;
    });
});
