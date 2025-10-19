document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 참조 ---
    const leftPanel = document.querySelector('.left-panel');
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

    // --- 애플리케이션 상태 관리 ---
    const appState = {
        isDirty: false, // 저장되지 않은 변경사항이 있는지 추적
        focusCounter: 0,
        focuses: {}, // { focus_1: { id: 'focus_1', name: '...', x: 10, y: 10, ... }, ... }
        selectedFocusId: null,
    };

    // --- 오른쪽 패널 관리 ---
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
        const focus = focusId ? appState.focuses[focusId] : {};

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

    function generateFocusForm(focusData) {
        // 필수/주요 속성만 간단히 구현. 이 부분을 확장하면 됨.
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
                <label for="focus-prerequisite">선행 중점 (ID, 쉼표로 구분)</label>
                <input type="text" id="focus-prerequisite" value="${(focusData.prerequisite || []).join(', ')}">
            </div>
            <div class="form-group">
                <label for="focus-mutually-exclusive">상호 배타 중점 (ID, 쉼표로 구분)</label>
                <input type="text" id="focus-mutually-exclusive" value="${(focusData.mutually_exclusive || []).join(', ')}">
            </div>
            <div class="form-group">
                <label for="focus-days">완료일 (Cost)</label>
                <input type="number" id="focus-days" value="${focusData.days || 70}">
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
        visualEditor.innerHTML = ''; // 기존 노드 모두 삭제
        const svgLines = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgLines.style.position = 'absolute';
        svgLines.style.width = '100%';
        svgLines.style.height = '100%';
        svgLines.style.pointerEvents = 'none'; // SVG가 마우스 이벤트를 가로채지 않도록

        Object.values(appState.focuses).forEach(focus => {
            // 노드 생성
            const node = document.createElement('div');
            node.className = 'focus-node';
            if (focus.id === appState.selectedFocusId) {
                node.classList.add('selected');
            }
            node.dataset.id = focus.id;
            node.style.left = `${focus.x}px`;
            node.style.top = `${focus.y}px`;
            node.innerHTML = `<div class="focus-node-id">${focus.id}</div><div class="focus-node-name">${focus.name}</div>`;
            visualEditor.appendChild(node);
            
            // 연결선 생성
            if (focus.prerequisite && focus.prerequisite.length > 0) {
                focus.prerequisite.forEach(prereqId => {
                    const parent = appState.focuses[prereqId];
                    if (parent) {
                        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        line.setAttribute('x1', parent.x + 60); // 부모 노드 중앙
                        line.setAttribute('y1', parent.y + 80); // 부모 노드 하단
                        line.setAttribute('x2', focus.x + 60); // 자식 노드 중앙
                        line.setAttribute('y2', focus.y);     // 자식 노드 상단
                        line.setAttribute('class', 'prereq-line');
                        // TODO: OR 조건에 따라 'or' 클래스 추가 로직 구현
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

    // 이벤트 위임: 동적으로 생성된 '적용' 버튼 처리
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
            
            // 폼에서 데이터 읽기
            const newFocusData = {
                id: focusId,
                name: document.getElementById('focus-name').value,
                desc: document.getElementById('focus-desc').value,
                prerequisite: document.getElementById('focus-prerequisite').value.split(',').map(s => s.trim()).filter(Boolean),
                mutually_exclusive: document.getElementById('focus-mutually-exclusive').value.split(',').map(s => s.trim()).filter(Boolean),
                days: parseInt(document.getElementById('focus-days').value) || 70,
                complete_effect: document.getElementById('focus-complete-effect').value,
                x: isNew ? 100 + (appState.focusCounter * 150) % 600 : appState.focuses[focusId].x,
                y: isNew ? 100 + Math.floor(appState.focusCounter / 4) * 120 : appState.focuses[focusId].y,
            };

            // 상태 업데이트
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

    // 이벤트 위임: 시각적 편집기에서 중점 선택
    visualEditor.addEventListener('click', (e) => {
        const node = e.target.closest('.focus-node');
        if (node) {
            const focusId = node.dataset.id;
            
            // 기존 선택 해제
            const currentSelected = document.querySelector('.focus-node.selected');
            if (currentSelected) currentSelected.classList.remove('selected');

            // 새 노드 선택
            node.classList.add('selected');
            openRightPanel('edit', focusId);
        }
    });
    
    // 화면 전환
    btnManageElements.addEventListener('click', () => {
        focusEditorView.classList.add('hidden');
        linkedElementsView.classList.remove('hidden');
        closeRightPanel();
    });

    btnBackToFocus.addEventListener('click', () => {
        focusEditorView.classList.remove('hidden');
        linkedElementsView.classList.add('hidden');
    });

    // 미저장 변경사항 경고
    window.addEventListener('beforeunload', (e) => {
        if (appState.isDirty) {
            e.preventDefault();
            e.returnValue = ''; // 대부분의 최신 브라우저에서 이 설정이 필요
            return '저장되지 않은 변경사항이 있습니다. 정말로 나가시겠습니까?';
        }
    });

    // 다운로드 기능 (실제 파일 생성 대신 콘솔에 출력)
    btnSave.addEventListener('click', () => {
        if (Object.keys(appState.focuses).length === 0) {
            alert('저장할 중점이 없습니다.');
            return;
        }

        // HOI4 .txt 파일 형식으로 변환 (간단한 예시)
        let focusFileContent = 'focus_tree = {\n';
        focusFileContent += '\tid = my_focus_tree\n';
        focusFileContent += '\tcountry = GEN\n\n';

        Object.values(appState.focuses).forEach(f => {
            focusFileContent += `\tfocus = {\n`;
            focusFileContent += `\t\tid = ${f.id}\n`;
            focusFileContent += `\t\tcost = ${f.days / 7}\n`; // HOI4는 7일당 1 cost
            if (f.prerequisite.length > 0) {
                 focusFileContent += `\t\tprerequisite = { ${f.prerequisite.map(p => `focus = ${p}`).join(' ')} }\n`;
            }
            if (f.mutually_exclusive.length > 0) {
                 focusFileContent += `\t\tmutually_exclusive = { ${f.mutually_exclusive.map(p => `focus = ${p}`).join(' ')} }\n`;
            }
            focusFileContent += `\t\tx = ${Math.round(f.x / 140)}\n`; // 대략적인 좌표 변환
            focusFileContent += `\t\ty = ${Math.round(f.y / 100)}\n`;
            focusFileContent += `\t\tcompletion_reward = {\n\t\t\t${f.complete_effect.replace(/\n/g, '\n\t\t\t')}\n\t\t}\n`;
            focusFileContent += `\t}\n\n`;
        });
        
        focusFileContent += '}';

        console.log('--- 생성된 중점 파일 내용 ---');
        console.log(focusFileContent);
        
        alert("브라우저의 개발자 도구(F12) 콘솔에서 생성된 .txt 파일 내용을 확인하고 복사할 수 있습니다.");
        appState.isDirty = false; // 저장했으므로 상태 초기화
    });
});
