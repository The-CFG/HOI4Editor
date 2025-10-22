document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 참조 (변경 없음) ---
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

    // --- 편집 패널 열기/닫기 로직 (변경 없음) ---
    function openEditorPanel(mode, focusId = null) {
        appState.selectedFocusId = focusId;
        updateEditorPanel(mode, focusId);
        leftPanel.classList.add('editing');
        editorFormContainer.classList.remove('hidden');
        if (window.innerWidth <= 1024) { editorFormContainer.classList.add('show-on-mobile'); }
    }
    function closeEditorPanel() {
        leftPanel.classList.remove('editing');
        editorFormContainer.classList.add('hidden');
        editorFormContainer.classList.remove('show-on-mobile');
        if (appState.selectedFocusId) { document.querySelector(`[data-id="${appState.selectedFocusId}"]`)?.classList.remove('selected'); }
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

    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // ★★★★★★★★★★★ 폼 생성 함수 대폭 확장 ★★★★★★★★★★★★
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    function generateFocusForm(focusData) {
        const formatPrereqs = (prereqs = []) => prereqs.map(p => Array.isArray(p) ? `[${p.join(', ')}]` : p).join(', ');
        
        // 체크박스 HTML을 생성하는 헬퍼 함수
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

    // --- renderFocusTree 함수는 변경 없음 ---
    function renderFocusTree() { /* ... 이전과 동일 ... */ }

    // --- 이벤트 핸들러 ---
    btnNewFocus.addEventListener('click', () => openEditorPanel('new'));
    btnClosePanel.addEventListener('click', closeEditorPanel);

    leftPanel.addEventListener('click', (e) => {
        if (e.target.id === 'btn-apply-changes') {
            const idInput = document.getElementById('focus-id');
            const focusId = idInput.value.trim();
            if (!focusId) { alert('ID는 필수 항목입니다.'); return; }
            const isNew = !idInput.disabled;
            if (isNew && appState.focuses[focusId]) { alert('이미 사용 중인 ID입니다.'); return; }

            // 선행 중점 파싱 (이전과 동일)
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

            // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
            // ★★★★★★★★★★★ '적용' 시 데이터 읽기 확장 ★★★★★★★★★★★★
            // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
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
                
                // 새로 추가된 속성 읽기
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

    // --- 나머지 이벤트 핸들러 (대부분 변경 없음) ---
    // ... visualEditor, btnMobileMenu, overlay 등 이벤트 핸들러 ...

    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // ★★★★★★★★★★★ 다운로드 로직 확장 ★★★★★★★★★★★
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    document.getElementById('btn-save').addEventListener('click', () => {
        if (Object.keys(appState.focuses).length === 0) { alert('저장할 중점이 없습니다.'); return; }

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
                    if(Array.isArray(item)) { prereqStr += `or = { ${item.map(p => `focus = ${p}`).join(' ')} } `; } 
                    else { prereqStr += `focus = ${item} `; }
                });
                prereqStr += '}\n';
                focusFileContent += prereqStr;
            }
            if (f.mutually_exclusive.length > 0) { focusFileContent += `\t\tmutually_exclusive = { ${f.mutually_exclusive.map(p => `focus = ${p}`).join(' ')} }\n`; }
            
            focusFileContent += `\t\tx = ${f.x}\n`;
            focusFileContent += `\t\ty = ${f.y}\n`;
            if(f.relative_position_id) { focusFileContent += `\t\trelative_position_id = ${f.relative_position_id}\n`; }
            
            // 새로 추가된 속성들을 파일에 쓰기
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

        const blob = new Blob([focusFileContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'my_focus_tree.txt';
        link.click();
        URL.revokeObjectURL(link.href);
        
        alert("my_focus_tree.txt 파일이 다운로드되었습니다.");
        appState.isDirty = false;
    });

    // Dummy placeholders for functions not shown but needed for completeness
    btnMobileMenu.addEventListener('click', () => { leftPanel.classList.add('open'); overlay.classList.remove('hidden'); });
    overlay.addEventListener('click', () => { leftPanel.classList.remove('open'); overlay.classList.add('hidden'); });
    visualEditor.addEventListener('click', (e) => {
        const node = e.target.closest('.focus-node');
        if (node) {
            const focusId = node.dataset.id;
            const currentSelected = document.querySelector('.focus-node.selected');
            if (currentSelected) currentSelected.classList.remove('selected');
            node.classList.add('selected');
            openEditorP
