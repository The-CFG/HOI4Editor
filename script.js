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
    const btnClosePanel = document.getElementById('btn-close-panel');
    const btnManageElements = document.getElementById('btn-manage-elements');
    const btnBackToFocus = document.getElementById('btn-back-to-focus');
    const focusEditorView = document.getElementById('focus-editor-view');
    const linkedElementsView = document.getElementById('linked-elements-view');
    const btnMobileMenu = document.getElementById('btn-mobile-menu');
    const overlay = document.getElementById('overlay');
    const projectTreeIdInput = document.getElementById('project-tree-id');
    const projectCountryTagInput = document.getElementById('project-country-tag');
    const projectDefaultTreeInput = document.getElementById('project-default-tree');
    const projectSharedFocusesInput = document.getElementById('project-shared-focuses');
    const projectContinuousFocusInput = document.getElementById('project-continuous-focus-position');
    const projectContinuousXInput = document.getElementById('project-continuous-x');
    const projectContinuousYInput = document.getElementById('project-continuous-y');
    const projectResetOnCivilwarInput = document.getElementById('project-reset-on-civilwar');
    const projectInitialShowXInput = document.getElementById('project-initial-show-x');
    const projectInitialShowYInput = document.getElementById('project-initial-show-y');
    const focusCountSpan = document.getElementById('focus-count');

    // --- 애플리케이션 상태 관리 ---
    const appState = {
        isDirty: false,
        focusCounter: 0,
        focuses: {},
        selectedFocusId: null,
        treeId: 'my_focus_tree',
        countryTag: 'GEN',
        defaultTree: false,
        sharedFocuses: [],
        continuousFocusPosition: false,
        continuousX: 50,
        continuousY: 2740,
        resetOnCivilwar: true,
        initialShowX: 0,
        initialShowY: 0,
        localisation: {
            english: {},
            korean: {},
            japanese: {},
            german: {},
            french: {},
            spanish: {},
            russian: {},
            polish: {},
            braz_por: {},
            simp_chinese: {}
        }
    };
    const GRID_SCALE_X = 80;
    const GRID_SCALE_Y = 100;

    // --- 편집 드로어 열기/닫기 로직 ---
    function openEditorPanel(mode, focusId = null) {
        appState.selectedFocusId = focusId;
        updateEditorPanel(mode, focusId);
        editorDrawerPanel.classList.add('open');
        overlay.classList.remove('hidden');
    }

    function closeEditorPanel() {
        editorDrawerPanel.classList.remove('open');
        overlay.classList.add('hidden');
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
        
        // 자동완성 기능 초기화
        setupAutocomplete();
    }

    // --- 자동완성 기능 ---
    function setupAutocomplete() {
        const prerequisiteInput = document.getElementById('focus-prerequisite');
        const mutuallyInput = document.getElementById('focus-mutually-exclusive');
        const prerequisiteDropdown = document.getElementById('prerequisite-dropdown');
        const mutuallyDropdown = document.getElementById('mutually-dropdown');
        
        if (!prerequisiteInput || !mutuallyInput) return;
        
        const setupInput = (input, dropdown) => {
            let selectedIndex = -1;
            
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                const cursorPos = input.selectionStart;
                
                // 현재 커서 위치의 단어 추출
                const beforeCursor = value.substring(0, cursorPos);
                const afterCursor = value.substring(cursorPos);
                
                // 마지막 단어 찾기 (쉼표, 대괄호 기준)
                const lastWordMatch = beforeCursor.match(/[,\[\s]([^,\[\]]*)$/);
                const currentWord = lastWordMatch ? lastWordMatch[1] : beforeCursor;
                
                if (currentWord.trim().length > 0) {
                    const matches = getFocusMatches(currentWord.trim());
                    if (matches.length > 0) {
                        showDropdown(dropdown, matches, (selected) => {
                            const before = beforeCursor.substring(0, beforeCursor.length - currentWord.length);
                            const after = afterCursor;
                            input.value = before + selected.id + after;
                            dropdown.classList.remove('active');
                            input.focus();
                        });
                        selectedIndex = -1;
                    } else {
                        dropdown.classList.remove('active');
                    }
                } else {
                    dropdown.classList.remove('active');
                }
            });
            
            input.addEventListener('keydown', (e) => {
                if (!dropdown.classList.contains('active')) return;
                
                const items = dropdown.querySelectorAll('.autocomplete-item');
                
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                    updateSelection(items, selectedIndex);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    selectedIndex = Math.max(selectedIndex - 1, -1);
                    updateSelection(items, selectedIndex);
                } else if (e.key === 'Enter' && selectedIndex >= 0) {
                    e.preventDefault();
                    items[selectedIndex].click();
                } else if (e.key === 'Escape') {
                    dropdown.classList.remove('active');
                }
            });
            
            // 클릭 외부 시 닫기
            document.addEventListener('click', (e) => {
                if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });
        };
        
        setupInput(prerequisiteInput, prerequisiteDropdown);
        setupInput(mutuallyInput, mutuallyDropdown);
    }
    
    function getFocusMatches(query) {
        const lowerQuery = query.toLowerCase();
        const currentId = appState.selectedFocusId;
        
        return Object.values(appState.focuses)
            .filter(f => f.id !== currentId) // 자기 자신 제외
            .filter(f => {
                const idMatch = f.id.toLowerCase().includes(lowerQuery);
                const nameMatch = f.name && f.name.toLowerCase().includes(lowerQuery);
                const localMatch = appState.localisation.korean[f.id] && 
                                  appState.localisation.korean[f.id].toLowerCase().includes(lowerQuery);
                return idMatch || nameMatch || localMatch;
            })
            .slice(0, 10); // 최대 10개
    }
    
    function showDropdown(dropdown, matches, onSelect) {
        dropdown.innerHTML = '';
        matches.forEach((focus, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            
            const localName = appState.localisation.korean[focus.id] || focus.name;
            item.innerHTML = `
                <span class="autocomplete-item-id">${focus.id}</span>
                ${localName !== focus.id ? `<span class="autocomplete-item-name">${localName}</span>` : ''}
            `;
            
            item.addEventListener('click', () => onSelect(focus));
            dropdown.appendChild(item);
        });
        dropdown.classList.add('active');
    }
    
    function updateSelection(items, index) {
        items.forEach((item, i) => {
            if (i === index) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // --- 폼 생성 함수 (개선됨) ---
    function generateFocusForm(focusData) {
        const formatPrereqs = (prereqs = []) => prereqs.map(p => Array.isArray(p) ? `[${p.join(', ')}]` : p).join(', ');
        const createCheckbox = (id, label, checked) => `<div class="form-group-checkbox"><label><input type="checkbox" id="${id}" ${checked ? 'checked' : ''}> ${label}</label></div>`;
        
        let actionButtonsHTML = '';
        if (focusData.id) {
            actionButtonsHTML = `
                <button id="btn-apply-changes">적용</button>
                <button id="btn-delete-focus" class="danger">삭제</button>
                <button id="btn-cancel-changes" class="secondary">취소</button>
            `;
        } else {
            actionButtonsHTML = `
                <button id="btn-apply-changes">생성</button>
                <button id="btn-cancel-changes" class="secondary">취소</button>
            `;
        }

        return `
            <h4>기본 정보</h4>
            <div class="form-group">
                <label for="focus-id">ID (필수, 고유값)</label>
                <input type="text" id="focus-id" value="${focusData.id || ''}" ${focusData.id ? 'disabled' : ''} placeholder="my_focus_id">
            </div>
            <div class="form-group">
                <label for="focus-name">이름 (Localisation Key)</label>
                <input type="text" id="focus-name" value="${focusData.name || ''}" placeholder="자동: ID와 동일">
            </div>
            <div class="form-group">
                <label for="focus-icon">아이콘 (GFX Key)</label>
                <input type="text" id="focus-icon" value="${focusData.icon || 'GFX_goal_unknown'}" placeholder="GFX_goal_generic_...">
            </div>
            ${createCheckbox('focus-dynamic-icon', '동적 아이콘 (Dynamic)', focusData.dynamic)}
            
            <hr>
            <h4>좌표 및 시간</h4>
            <div class="form-group">
                <label for="focus-cost">완료 시간 (Cost, 주 단위)</label>
                <input type="number" id="focus-cost" value="${focusData.cost || 10}" step="1" min="1">
                <small style="color: #b2bec3; display: block; margin-top: 5px;">
                    • 일반적으로 10주 (70일)<br>
                    • 1주 = 7일
                </small>
            </div>
            <div class="form-group">
                <label for="focus-x">X 좌표 (좌우 위치)</label>
                <input type="number" id="focus-x" value="${focusData.x || 0}">
            </div>
            <div class="form-group">
                <label for="focus-y">Y 좌표 (상하 위치)</label>
                <input type="number" id="focus-y" value="${focusData.y || 0}">
            </div>
            <div class="form-group">
                <label for="focus-relative-position-id">상대 위치 기준 ID</label>
                <input type="text" id="focus-relative-position-id" value="${focusData.relative_position_id || ''}" placeholder="다른 중점 ID">
            </div>
            <div class="form-group">
                <label for="focus-offset-x">오프셋 X (relative_position_id 사용 시)</label>
                <input type="number" id="focus-offset-x" value="${focusData.offset?.x || 0}">
            </div>
            <div class="form-group">
                <label for="focus-offset-y">오프셋 Y (relative_position_id 사용 시)</label>
                <input type="number" id="focus-offset-y" value="${focusData.offset?.y || 0}">
            </div>
            
            <hr>
            <h4>선행 조건</h4>
            <div class="form-group">
                <label for="focus-prerequisite">선행 중점 (AND: 쉼표, OR: [대괄호])</label>
                <div class="autocomplete-container">
                    <input type="text" id="focus-prerequisite" value="${formatPrereqs(focusData.prerequisite)}" placeholder="예: id1, [id2, id3], id4" autocomplete="off">
                    <div id="prerequisite-dropdown" class="autocomplete-dropdown"></div>
                </div>
                <small style="color: #b2bec3; display: block; margin-top: 5px;">
                    • AND 조건: id1, id4 (둘 다 완료 필요)<br>
                    • OR 조건: [id2, id3] (둘 중 하나만 완료)<br>
                    • 입력 시 중점 목록이 자동으로 표시됩니다
                </small>
            </div>
            <div class="form-group">
                <label for="focus-mutually-exclusive">상호 배타 중점 (쉼표로 구분)</label>
                <div class="autocomplete-container">
                    <input type="text" id="focus-mutually-exclusive" value="${(focusData.mutually_exclusive || []).join(', ')}" placeholder="id1, id2" autocomplete="off">
                    <div id="mutually-dropdown" class="autocomplete-dropdown"></div>
                </div>
                <small style="color: #b2bec3; display: block; margin-top: 5px;">
                    입력 시 중점 목록이 자동으로 표시됩니다
                </small>
            </div>
            
            <hr>
            <h4>조건 및 효과</h4>
            <div class="form-group">
                <label for="focus-available">선택 가능 조건 (Available)</label>
                <textarea id="focus-available" placeholder="예:&#10;date > 1936.1.1&#10;has_war = no">${focusData.available || ''}</textarea>
                <small style="color: #b2bec3;">이 조건이 만족되어야 중점을 선택할 수 있습니다</small>
            </div>
            <div class="form-group">
                <label for="focus-bypass">우회 조건 (Bypass)</label>
                <textarea id="focus-bypass" placeholder="예:&#10;has_completed_focus = alternative_focus&#10;has_war_with = GER">${focusData.bypass || ''}</textarea>
                <small style="color: #b2bec3;">이 조건이 만족되면 자동으로 완료됩니다</small>
            </div>
            ${createCheckbox('focus-bypass-if-unavailable', 'Available 조건 불충족 시 자동 우회 (Bypass if Unavailable)', focusData.bypass_if_unavailable)}
            <div class="form-group">
                <label for="focus-cancel">취소 조건 (Cancel)</label>
                <textarea id="focus-cancel" placeholder="예:&#10;has_war_with = GER">${focusData.cancel || ''}</textarea>
                <small style="color: #b2bec3;">이 조건이 만족되면 중점이 자동 취소됩니다</small>
            </div>
            <div class="form-group">
                <label for="focus-allow-branch">브랜치 허용 조건 (Allow Branch)</label>
                <textarea id="focus-allow-branch" placeholder="예:&#10;has_dlc = &#34;Together for Victory&#34;">${focusData.allow_branch || ''}</textarea>
                <small style="color: #b2bec3;">전체 브랜치에 적용되는 조건</small>
            </div>
            
            ${createCheckbox('focus-cancelable', '취소 가능 (Cancelable)', focusData.cancelable)}
            ${createCheckbox('focus-continue-if-invalid', '무효화 시 계속 (Continue if Invalid)', focusData.continue_if_invalid)}
            ${createCheckbox('focus-cancel-if-invalid', '무효화 시 취소 (Cancel if Invalid)', focusData.cancel_if_invalid)}
            ${createCheckbox('focus-available-if-capitulated', '항복 시 유효 (Available if Capitulated)', focusData.available_if_capitulated)}
            
            <hr>
            <h4>완료 효과</h4>
            <div class="form-group">
                <label for="focus-complete-effect">완료 보상 (Completion Reward)</label>
                <textarea id="focus-complete-effect" placeholder="예:&#10;add_political_power = 120&#10;add_ideas = idea_name">${focusData.complete_effect || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="focus-select-effect">선택 시 효과 (Select Effect)</label>
                <textarea id="focus-select-effect" placeholder="중점을 선택하는 순간 실행되는 효과">${focusData.select_effect || ''}</textarea>
            </div>
            
            <hr>
            <h4>AI 및 검색</h4>
            <div class="form-group">
                <label for="focus-text-icon">제목 스타일 (Text Icon)</label>
                <input type="text" id="focus-text-icon" value="${focusData.text_icon || ''}" placeholder="example_style">
                <small style="color: #b2bec3;">중점 제목 표시 스타일 참조</small>
            </div>
            <div class="form-group">
                <label for="focus-ai-will-do">AI 실행 가중치</label>
                <textarea id="focus-ai-will-do" placeholder="예:&#10;factor = 10&#10;modifier = {&#10;    factor = 0&#10;    has_war = yes&#10;}">${focusData.ai_will_do || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="focus-historical-ai">역사 AI 우선순위</label>
                <textarea id="focus-historical-ai" placeholder="예:&#10;factor = 100&#10;modifier = { ... }">${focusData.historical_ai || ''}</textarea>
                <small style="color: #b2bec3;">역사 AI 모드에서의 가중치</small>
            </div>
            <div class="form-group">
                <label for="focus-will-lead-to-war">전쟁 경고 국가</label>
                <input type="text" id="focus-will-lead-to-war" value="${(focusData.will_lead_to_war_with || []).join(', ')}" placeholder="GER, SOV">
                <small style="color: #b2bec3;">이 중점이 전쟁을 유발할 수 있는 국가들</small>
            </div>
            <div class="form-group">
                <label for="focus-search-filters">검색 필터 (쉼표로 구분)</label>
                <input type="text" id="focus-search-filters" placeholder="FOCUS_FILTER_POLITICAL, FOCUS_FILTER_INDUSTRY" value="${(focusData.search_filters || []).join(', ')}">
            </div>
            
            <div class="form-actions">${actionButtonsHTML}</div>
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
            const pos = getFocusPixelPosition(focus.id);
            if (!pos) return;
            
            const node = document.createElement('div');
            node.className = 'focus-node';
            if (focus.id === appState.selectedFocusId) node.classList.add('selected');
            node.dataset.id = focus.id;
            node.style.left = `${pos.x}px`;
            node.style.top = `${pos.y}px`;
            node.innerHTML = `
                <div class="focus-node-id">${focus.id}</div>
                <div class="focus-node-name">${focus.name || focus.id}</div>
                <div class="drag-handle"></div>
            `;
            visualEditor.appendChild(node);

            // Prerequisite 선 그리기 (각진 연결)
            if (focus.prerequisite && focus.prerequisite.length > 0) {
                focus.prerequisite.forEach(prereqItem => {
                    const drawAngledLine = (parentId, isOr) => {
                        const parentPos = getFocusPixelPosition(parentId);
                        if (parentPos) {
                            const x1 = parentPos.x + 60;
                            const y1 = parentPos.y + 80;
                            const x2 = pos.x + 60;
                            const y2 = pos.y;
                            
                            // 중간 지점 계산 (각진 연결)
                            const midY = (y1 + y2) / 2;
                            
                            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                            const pathData = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
                            path.setAttribute('d', pathData);
                            path.setAttribute('class', isOr ? 'prereq-line or' : 'prereq-line');
                            svgLines.appendChild(path);
                        }
                    };
                    if (Array.isArray(prereqItem)) {
                        prereqItem.forEach(pid => drawAngledLine(pid, true));
                    } else {
                        drawAngledLine(prereqItem, false);
                    }
                });
            }

            // Mutually Exclusive 선 그리기 (빨간색 느낌표)
            if (focus.mutually_exclusive && focus.mutually_exclusive.length > 0) {
                focus.mutually_exclusive.forEach(mutualId => {
                    const mutualPos = getFocusPixelPosition(mutualId);
                    if (mutualPos) {
                        const x1 = pos.x + 60;
                        const y1 = pos.y + 40;
                        const x2 = mutualPos.x + 60;
                        const y2 = mutualPos.y + 40;
                        
                        // 빨간 선
                        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        line.setAttribute('x1', x1);
                        line.setAttribute('y1', y1);
                        line.setAttribute('x2', x2);
                        line.setAttribute('y2', y2);
                        line.setAttribute('class', 'mutual-exclusive-line');
                        svgLines.appendChild(line);
                        
                        // 중앙에 느낌표
                        const midX = (x1 + x2) / 2;
                        const midY = (y1 + y2) / 2;
                        
                        const exclamation = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        exclamation.setAttribute('x', midX);
                        exclamation.setAttribute('y', midY + 6);
                        exclamation.setAttribute('class', 'mutual-exclusive-icon');
                        exclamation.textContent = '!';
                        svgLines.appendChild(exclamation);
                    }
                });
            }
        });

        visualEditor.insertBefore(svgLines, visualEditor.firstChild);
        updateFocusCount();
    }

    function getFocusPixelPosition(focusId) {
        const focus = appState.focuses[focusId];
        if (!focus) return null;
        
        let baseX = focus.x;
        let baseY = focus.y;
        
        // relative_position_id가 있으면 해당 중점의 좌표를 기준으로 계산
        if (focus.relative_position_id) {
            const relativeFocus = appState.focuses[focus.relative_position_id];
            if (relativeFocus) {
                baseX = relativeFocus.x + focus.x + (focus.offset?.x || 0);
                baseY = relativeFocus.y + focus.y + (focus.offset?.y || 0);
            }
        }
        
        return { 
            x: baseX * GRID_SCALE_X + 100, 
            y: baseY * GRID_SCALE_Y + 100 
        };
    }

    function updateFocusCount() {
        focusCountSpan.textContent = Object.keys(appState.focuses).length;
    }

    // --- 드래그 앤 드롭 기능 ---
    let draggedNode = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    visualEditor.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('drag-handle')) {
            draggedNode = e.target.closest('.focus-node');
            const rect = draggedNode.getBoundingClientRect();
            const panelRect = visualEditor.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            e.preventDefault();
        } else if (e.target.closest('.focus-node')) {
            const focusId = e.target.closest('.focus-node').dataset.id;
            openEditorPanel('edit', focusId);
            document.querySelectorAll('.focus-node').forEach(n => n.classList.remove('selected'));
            e.target.closest('.focus-node').classList.add('selected');
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (draggedNode) {
            const panelRect = visualEditor.getBoundingClientRect();
            const newX = e.clientX - panelRect.left - dragOffsetX;
            const newY = e.clientY - panelRect.top - dragOffsetY;
            draggedNode.style.left = `${newX}px`;
            draggedNode.style.top = `${newY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (draggedNode) {
            const focusId = draggedNode.dataset.id;
            const focus = appState.focuses[focusId];
            if (focus) {
                const newPixelX = parseInt(draggedNode.style.left);
                const newPixelY = parseInt(draggedNode.style.top);
                
                // relative_position_id가 있으면 상대 좌표로 저장
                if (focus.relative_position_id) {
                    const relativeFocus = appState.focuses[focus.relative_position_id];
                    if (relativeFocus) {
                        const relativePixelPos = getFocusPixelPosition(focus.relative_position_id);
                        if (relativePixelPos) {
                            // 상대 위치 계산 (offset 제외)
                            focus.x = Math.max(0, Math.round((newPixelX - relativePixelPos.x) / GRID_SCALE_X));
                            focus.y = Math.max(0, Math.round((newPixelY - relativePixelPos.y) / GRID_SCALE_Y));
                        }
                    }
                } else {
                    // 절대 좌표로 저장
                    focus.x = Math.max(0, Math.round((newPixelX - 100) / GRID_SCALE_X));
                    focus.y = Math.max(0, Math.round((newPixelY - 100) / GRID_SCALE_Y));
                }
                
                appState.isDirty = true;
                renderFocusTree();
            }
            draggedNode = null;
        }
    });

    // --- 폼 제출 처리 ---
    panelContent.addEventListener('click', (e) => {
        if (e.target.id === 'btn-apply-changes') {
            e.preventDefault();
            const formData = extractFormData();
            if (!formData.id) {
                alert('ID는 필수 항목입니다.');
                return;
            }
            
            if (appState.selectedFocusId && formData.id !== appState.selectedFocusId) {
                alert('ID는 수정할 수 없습니다.');
                return;
            }

            if (!appState.selectedFocusId && appState.focuses[formData.id]) {
                alert('이미 존재하는 ID입니다.');
                return;
            }

            appState.focuses[formData.id] = formData;
            appState.isDirty = true;
            
            // 로컬라이제이션 자동 저장 (한국어)
            if (formData.name && formData.name !== formData.id) {
                appState.localisation.korean[formData.id] = formData.name;
            }
            
            renderFocusTree();
            closeEditorPanel();
        }
        
        if (e.target.id === 'btn-delete-focus') {
            e.preventDefault();
            if (confirm(`정말로 "${appState.selectedFocusId}" 중점을 삭제하시겠습니까?`)) {
                delete appState.focuses[appState.selectedFocusId];
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

    function extractFormData() {
        const getValue = (id) => document.getElementById(id)?.value?.trim() || '';
        const getChecked = (id) => document.getElementById(id)?.checked || false;
        const getNumber = (id) => parseInt(document.getElementById(id)?.value) || 0;
        
        const parsePrerequisites = (str) => {
            if (!str) return [];
            const result = [];
            const regex = /\[([^\]]+)\]|([^,\[\]]+)/g;
            let match;
            while ((match = regex.exec(str)) !== null) {
                if (match[1]) {
                    result.push(match[1].split(',').map(s => s.trim()).filter(Boolean));
                } else if (match[2]) {
                    const trimmed = match[2].trim();
                    if (trimmed) result.push(trimmed);
                }
            }
            return result;
        };

        const parseList = (str) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];

        return {
            id: getValue('focus-id'),
            name: getValue('focus-name') || getValue('focus-id'),
            icon: getValue('focus-icon') || 'GFX_goal_unknown',
            dynamic: getChecked('focus-dynamic-icon'),
            cost: getNumber('focus-cost') || 10,
            x: getNumber('focus-x'),
            y: getNumber('focus-y'),
            relative_position_id: getValue('focus-relative-position-id') || null,
            offset: {
                x: getNumber('focus-offset-x'),
                y: getNumber('focus-offset-y')
            },
            prerequisite: parsePrerequisites(getValue('focus-prerequisite')),
            mutually_exclusive: parseList(getValue('focus-mutually-exclusive')),
            available: getValue('focus-available'),
            bypass: getValue('focus-bypass'),
            bypass_if_unavailable: getChecked('focus-bypass-if-unavailable'),
            cancel: getValue('focus-cancel'),
            allow_branch: getValue('focus-allow-branch'),
            cancelable: getChecked('focus-cancelable'),
            continue_if_invalid: getChecked('focus-continue-if-invalid'),
            cancel_if_invalid: getChecked('focus-cancel-if-invalid'),
            available_if_capitulated: getChecked('focus-available-if-capitulated'),
            complete_effect: getValue('focus-complete-effect'),
            select_effect: getValue('focus-select-effect'),
            text_icon: getValue('focus-text-icon'),
            ai_will_do: getValue('focus-ai-will-do'),
            historical_ai: getValue('focus-historical-ai'),
            will_lead_to_war_with: parseList(getValue('focus-will-lead-to-war')),
            search_filters: parseList(getValue('focus-search-filters'))
        };
    }

    // --- 파일 불러오기 ---
    btnLoad.addEventListener('click', () => fileLoader.click());
    
    fileLoader.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            const parsed = parseFocusFile(content);
            
            if (parsed.focuses && Object.keys(parsed.focuses).length > 0) {
                appState.focuses = parsed.focuses;
                appState.treeId = parsed.settings.treeId;
                appState.countryTag = parsed.settings.countryTag;
                appState.defaultTree = parsed.settings.defaultTree;
                appState.sharedFocuses = parsed.settings.sharedFocuses;
                appState.continuousFocusPosition = parsed.settings.continuousFocusPosition;
                appState.continuousX = parsed.settings.continuousX || 50;
                appState.continuousY = parsed.settings.continuousY || 2740;
                appState.resetOnCivilwar = parsed.settings.resetOnCivilwar;
                appState.initialShowX = parsed.settings.initialShowX;
                appState.initialShowY = parsed.settings.initialShowY;
                
                projectTreeIdInput.value = appState.treeId;
                projectCountryTagInput.value = appState.countryTag;
                projectDefaultTreeInput.checked = appState.defaultTree;
                projectSharedFocusesInput.value = appState.sharedFocuses.join(', ');
                projectContinuousFocusInput.checked = appState.continuousFocusPosition;
                projectContinuousXInput.value = appState.continuousX;
                projectContinuousYInput.value = appState.continuousY;
                projectResetOnCivilwarInput.checked = appState.resetOnCivilwar;
                projectInitialShowXInput.value = appState.initialShowX;
                projectInitialShowYInput.value = appState.initialShowY;
                
                renderFocusTree();
                alert('파일을 성공적으로 불러왔습니다.');
            } else {
                alert('올바른 중점 파일이 아닙니다.');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    function parseFocusFile(fileContent) {
        const focuses = {};
        const settings = {
            treeId: 'my_focus_tree',
            countryTag: 'GEN',
            defaultTree: false,
            sharedFocuses: [],
            continuousFocusPosition: false,
            continuousX: 50,
            continuousY: 2740,
            resetOnCivilwar: true,
            initialShowX: 0,
            initialShowY: 0
        };

        const getValue = (key, text) => (text.match(new RegExp(`${key}\\s*=\\s*(\\S+)`)) || [])[1];
        const getBlock = (key, text) => (text.match(new RegExp(`${key}\\s*=\\s*{([\\s\\S]*?)}`)) || [])[1]?.trim();
        const getBoolean = (key, text) => /yes/i.test(getValue(key, text));

        // Focus tree 블록 추출
        const treeMatch = fileContent.match(/focus_tree\s*=\s*{([\s\S]*)}/);
        if (!treeMatch) return { focuses, settings };
        
        const treeContent = treeMatch[1];
        
        // Tree 설정 파싱
        settings.treeId = getValue('id', treeContent) || settings.treeId;
        settings.defaultTree = /default\s*=\s*yes/i.test(treeContent);
        
        // country 블록에서 태그 추출 (중첩된 괄호 처리)
        const countryBlockMatch = treeContent.match(/country\s*=\s*{([\s\S]*?)(?=\n\s*(?:shared_focus|continuous_focus_position|reset_on_civilwar|initial_show_position|focus)\s*=|$)}/);
        if (countryBlockMatch) {
            const countryBlock = countryBlockMatch[1];
            const tagMatch = countryBlock.match(/tag\s*=\s*(\S+)/);
            if (tagMatch) {
                settings.countryTag = tagMatch[1];
            }
        } else {
            // 단순 country = TAG 형식 (하위 호환)
            const simpleCountryMatch = treeContent.match(/country\s*=\s*(\w+)(?:\s|$)/);
            if (simpleCountryMatch) {
                settings.countryTag = simpleCountryMatch[1];
            }
        }
        
        // continuous_focus_position 파싱
        const continuousMatch = treeContent.match(/continuous_focus_position\s*=\s*{\s*x\s*=\s*(\d+)\s+y\s*=\s*(\d+)\s*}/);
        if (continuousMatch) {
            settings.continuousFocusPosition = true;
            settings.continuousX = parseInt(continuousMatch[1]) || 50;
            settings.continuousY = parseInt(continuousMatch[2]) || 2740;
        } else {
            settings.continuousFocusPosition = false;
        }
        
        settings.resetOnCivilwar = !treeContent.includes('reset_on_civilwar = no');
        
        const initialShowMatch = treeContent.match(/initial_show_position\s*=\s*{\s*x\s*=\s*(-?\d+)\s+y\s*=\s*(-?\d+)\s*}/);
        if (initialShowMatch) {
            settings.initialShowX = parseInt(initialShowMatch[1]) || 0;
            settings.initialShowY = parseInt(initialShowMatch[2]) || 0;
        }
        
        const sharedFocusMatches = treeContent.matchAll(/shared_focus\s*=\s*(\S+)/g);
        settings.sharedFocuses = [...sharedFocusMatches].map(m => m[1]);

        // 각 focus 블록 파싱
        let searchIndex = 0;
        while (true) {
            const focusStartIndex = treeContent.indexOf('focus = {', searchIndex);
            if (focusStartIndex === -1) break;

            const blockContentStartIndex = focusStartIndex + 'focus = {'.length;
            let braceLevel = 1;
            let blockContentEndIndex = -1;

            for (let i = blockContentStartIndex; i < treeContent.length; i++) {
                if (treeContent[i] === '{') {
                    braceLevel++;
                } else if (treeContent[i] === '}') {
                    braceLevel--;
                    if (braceLevel === 0) {
                        blockContentEndIndex = i;
                        break;
                    }
                }
            }

            if (blockContentEndIndex === -1) break;

            const block = treeContent.substring(blockContentStartIndex, blockContentEndIndex);
            searchIndex = blockContentEndIndex + 1;

            const focus = {};
            focus.id = getValue('id', block);
            if (!focus.id) continue;

            // 선행 조건 파싱
            focus.prerequisite = [];
            const prereqMatches = [...block.matchAll(/prerequisite\s*=\s*{([\s\S]*?)}/g)];
            prereqMatches.forEach(prereqMatch => {
                const prereqContent = prereqMatch[1];
                const focusIdsInBlock = [...prereqContent.matchAll(/focus\s*=\s*(\S+)/g)].map(m => m[1]);
                if (focusIdsInBlock.length === 1) {
                    focus.prerequisite.push(focusIdsInBlock[0]);
                } else if (focusIdsInBlock.length > 1) {
                    focus.prerequisite.push(focusIdsInBlock);
                }
            });

            focus.icon = getValue('icon', block) || 'GFX_goal_unknown';
            focus.dynamic = getBoolean('dynamic', block);
            focus.cost = parseFloat(getValue('cost', block)) || 10;
            focus.x = parseInt(getValue('x', block)) || 0;
            focus.y = parseInt(getValue('y', block)) || 0;
            focus.relative_position_id = getValue('relative_position_id', block) || null;
            
            // offset 파싱
            const offsetBlock = getBlock('offset', block);
            if (offsetBlock) {
                focus.offset = {
                    x: parseInt(getValue('x', offsetBlock)) || 0,
                    y: parseInt(getValue('y', offsetBlock)) || 0
                };
            } else {
                focus.offset = { x: 0, y: 0 };
            }

            // 상호 배타 조건
            const mutuallyExclusiveBlock = getBlock('mutually_exclusive', block);
            focus.mutually_exclusive = mutuallyExclusiveBlock 
                ? [...mutuallyExclusiveBlock.matchAll(/focus\s*=\s*(\S+)/g)].map(m => m[1]) 
                : [];

            focus.available = getBlock('available', block) || '';
            focus.bypass = getBlock('bypass', block) || '';
            focus.bypass_if_unavailable = getBoolean('bypass_if_unavailable', block);
            focus.cancel = getBlock('cancel', block) || '';
            focus.allow_branch = getBlock('allow_branch', block) || '';
            focus.cancelable = getBoolean('cancelable', block);
            focus.continue_if_invalid = getBoolean('continue_if_invalid', block);
            focus.cancel_if_invalid = getBoolean('cancel_if_invalid', block);
            focus.available_if_capitulated = getBoolean('available_if_capitulated', block);
            
            focus.search_filters = getBlock('search_filters', block)?.match(/\S+/g) || [];
            focus.text_icon = getValue('text_icon', block) || '';
            focus.ai_will_do = getBlock('ai_will_do', block) || '';
            focus.historical_ai = getBlock('historical_ai', block) || '';
            focus.complete_effect = getBlock('completion_reward', block) || '';
            focus.select_effect = getBlock('select_effect', block) || '';
            
            // will_lead_to_war_with 파싱
            const warWithBlock = getBlock('will_lead_to_war_with', block);
            focus.will_lead_to_war_with = warWithBlock ? warWithBlock.match(/\S+/g) || [] : [];
            
            focus.name = focus.id;

            focuses[focus.id] = focus;
        }

        return { focuses, settings };
    }

    // --- 프로젝트 설정 리스너 ---
    function setupProjectSettingsListeners() {
        projectTreeIdInput.addEventListener('input', (e) => {
            appState.treeId = e.target.value;
            appState.isDirty = true;
        });
        projectCountryTagInput.addEventListener('input', (e) => {
            appState.countryTag = e.target.value.toUpperCase();
            appState.isDirty = true;
        });
        projectDefaultTreeInput.addEventListener('change', (e) => {
            appState.defaultTree = e.target.checked;
            appState.isDirty = true;
        });
        projectSharedFocusesInput.addEventListener('input', (e) => {
            appState.sharedFocuses = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            appState.isDirty = true;
        });
        projectContinuousFocusInput.addEventListener('change', (e) => {
            appState.continuousFocusPosition = e.target.checked;
            appState.isDirty = true;
        });
        projectContinuousXInput.addEventListener('input', (e) => {
            appState.continuousX = parseInt(e.target.value) || 50;
            appState.isDirty = true;
        });
        projectContinuousYInput.addEventListener('input', (e) => {
            appState.continuousY = parseInt(e.target.value) || 2740;
            appState.isDirty = true;
        });
        projectResetOnCivilwarInput.addEventListener('change', (e) => {
            appState.resetOnCivilwar = e.target.checked;
            appState.isDirty = true;
        });
        projectInitialShowXInput.addEventListener('input', (e) => {
            appState.initialShowX = parseInt(e.target.value) || 0;
            appState.isDirty = true;
        });
        projectInitialShowYInput.addEventListener('input', (e) => {
            appState.initialShowY = parseInt(e.target.value) || 0;
            appState.isDirty = true;
        });
        
        projectTreeIdInput.value = appState.treeId;
        projectCountryTagInput.value = appState.countryTag;
        projectDefaultTreeInput.checked = appState.defaultTree;
        projectContinuousFocusInput.checked = appState.continuousFocusPosition;
        projectContinuousXInput.value = appState.continuousX;
        projectContinuousYInput.value = appState.continuousY;
        projectResetOnCivilwarInput.checked = appState.resetOnCivilwar;
        projectInitialShowXInput.value = appState.initialShowX;
        projectInitialShowYInput.value = appState.initialShowY;
    }
    setupProjectSettingsListeners();

    // --- 이벤트 리스너 ---
    btnNewFocus.addEventListener('click', () => openEditorPanel('new'));
    btnClosePanel.addEventListener('click', () => closeEditorPanel());
    btnMobileMenu.addEventListener('click', () => {
        leftPanel.classList.add('open');
        overlay.classList.remove('hidden');
    });
    overlay.addEventListener('click', () => {
        leftPanel.classList.remove('open');
        closeEditorPanel();
        overlay.classList.add('hidden');
    });
    btnManageElements.addEventListener('click', () => {
        focusEditorView.classList.add('hidden');
        linkedElementsView.classList.remove('hidden');
        closeEditorPanel();
        renderLocalisationList();
    });
    btnBackToFocus.addEventListener('click', () => {
        focusEditorView.classList.remove('hidden');
        linkedElementsView.classList.add('hidden');
    });

    window.addEventListener('beforeunload', (e) => {
        if (appState.isDirty) {
            e.preventDefault();
            e.returnValue = '';
            return '저장되지 않은 변경사항이 있습니다.';
        }
    });

    // --- 저장 기능 (개선됨) ---
    btnSave.addEventListener('click', () => {
        if (Object.keys(appState.focuses).length === 0) {
            alert('저장할 중점이 없습니다.');
            return;
        }

        // 1. Focus Tree 파일 생성
        let output = `focus_tree = {\n`;
        output += `\tid = ${appState.treeId}\n`;
        
        if (appState.defaultTree) {
            output += `\tdefault = yes\n`;
        }
        
        output += `\tcountry = {\n`;
        output += `\t\tfactor = 0\n`;
        output += `\t\tmodifier = {\n`;
        output += `\t\t\tadd = 10\n`;
        output += `\t\t\ttag = ${appState.countryTag}\n`;
        output += `\t\t}\n`;
        output += `\t}\n`;
        
        if (appState.continuousFocusPosition) {
            output += `\tcontinuous_focus_position = { x = ${appState.continuousX} y = ${appState.continuousY} }\n`;
        }
        
        if (!appState.resetOnCivilwar) {
            output += `\treset_on_civilwar = no\n`;
        }
        
        if (appState.initialShowX !== 0 || appState.initialShowY !== 0) {
            output += `\tinitial_show_position = {\n`;
            output += `\t\tx = ${appState.initialShowX}\n`;
            output += `\t\ty = ${appState.initialShowY}\n`;
            output += `\t}\n`;
        }
        
        appState.sharedFocuses.forEach(sf => {
            output += `\tshared_focus = ${sf}\n`;
        });
        
        output += `\n`;

        const formatBlock = (key, content, indent = 2) => {
            if (!content) return '';
            const tabs = '\t'.repeat(indent);
            const innerTabs = '\t'.repeat(indent + 1);
            return `${tabs}${key} = {\n${innerTabs}${content.replace(/\n/g, '\n' + innerTabs)}\n${tabs}}\n`;
        };
        
        const formatBoolean = (key, value, indent = 2) => {
            if (!value) return '';
            return '\t'.repeat(indent) + `${key} = yes\n`;
        };

        Object.values(appState.focuses).forEach(f => {
            output += `\tfocus = {\n`;
            output += `\t\tid = ${f.id}\n`;
            output += `\t\ticon = ${f.icon}\n`;
            
            if (f.dynamic) {
                output += `\t\tdynamic = yes\n`;
            }
            
            output += `\t\tcost = ${f.cost}\n`;
            
            if (f.prerequisite && f.prerequisite.length > 0) {
                f.prerequisite.forEach(item => {
                    if (Array.isArray(item)) {
                        output += `\t\tprerequisite = { ${item.map(p => `focus = ${p}`).join(' ')} }\n`;
                    } else {
                        output += `\t\tprerequisite = { focus = ${item} }\n`;
                    }
                });
            }
            
            if (f.mutually_exclusive.length > 0) {
                output += `\t\tmutually_exclusive = { ${f.mutually_exclusive.map(p => `focus = ${p}`).join(' ')} }\n`;
            }
            
            if (f.relative_position_id) {
                output += `\t\trelative_position_id = ${f.relative_position_id}\n`;
            }
            
            output += `\t\tx = ${f.x}\n`;
            output += `\t\ty = ${f.y}\n`;
            
            if (f.offset && (f.offset.x !== 0 || f.offset.y !== 0)) {
                output += `\t\toffset = {\n`;
                output += `\t\t\tx = ${f.offset.x}\n`;
                output += `\t\t\ty = ${f.offset.y}\n`;
                output += `\t\t}\n`;
            }
            
            output += formatBlock('available', f.available);
            output += formatBlock('bypass', f.bypass);
            output += formatBoolean('bypass_if_unavailable', f.bypass_if_unavailable);
            output += formatBlock('cancel', f.cancel);
            output += formatBlock('allow_branch', f.allow_branch);
            output += formatBoolean('cancelable', f.cancelable);
            output += formatBoolean('continue_if_invalid', f.continue_if_invalid);
            output += formatBoolean('cancel_if_invalid', f.cancel_if_invalid);
            output += formatBoolean('available_if_capitulated', f.available_if_capitulated);
            
            if (f.search_filters.length > 0) {
                output += `\t\tsearch_filters = { ${f.search_filters.join(' ')} }\n`;
            }
            
            if (f.text_icon) {
                output += `\t\ttext_icon = ${f.text_icon}\n`;
            }
            
            output += formatBlock('ai_will_do', f.ai_will_do);
            output += formatBlock('historical_ai', f.historical_ai);
            
            if (f.will_lead_to_war_with.length > 0) {
                output += `\t\twill_lead_to_war_with = { ${f.will_lead_to_war_with.join(' ')} }\n`;
            }
            
            output += formatBlock('select_effect', f.select_effect);
            output += formatBlock('completion_reward', f.complete_effect);
            
            output += `\t}\n\n`;
        });

        output += '}';

        // 2. 로컬라이제이션 파일들 생성
        const locFiles = {};
        Object.entries(appState.localisation).forEach(([lang, data]) => {
            if (Object.keys(data).length > 0) {
                let content = `l_${lang}:\n`;
                Object.entries(data).forEach(([id, name]) => {
                    if (name && name.trim()) {
                        content += ` ${id}:0 "${name}"\n`;
                        content += ` ${id}_desc:0 ""\n`;
                    }
                });
                locFiles[`${appState.countryTag}_focus_l_${lang}.yml`] = content;
            }
        });

        // 3. 파일 다운로드
        if (Object.keys(locFiles).length === 0) {
            // 로컬라이제이션이 없으면 포커스 파일만 다운로드
            const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${appState.countryTag}_focus.txt`;
            link.click();
            URL.revokeObjectURL(link.href);
            alert(`${appState.countryTag}_focus.txt 파일이 다운로드되었습니다.`);
        } else {
            // 로컬라이제이션이 있으면 모든 파일 개별 다운로드
            // (브라우저 제한으로 ZIP 생성 불가, 개별 파일로 제공)
            const allFiles = {
                [`${appState.countryTag}_focus.txt`]: output,
                ...locFiles
            };
            
            let downloadCount = 0;
            Object.entries(allFiles).forEach(([filename, content], index) => {
                setTimeout(() => {
                    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = filename;
                    link.click();
                    URL.revokeObjectURL(link.href);
                    downloadCount++;
                    
                    if (downloadCount === Object.keys(allFiles).length) {
                        alert(`${downloadCount}개 파일이 다운로드되었습니다:\n- 중점 파일 1개\n- 로컬라이제이션 파일 ${Object.keys(locFiles).length}개`);
                    }
                }, index * 300); // 각 파일 다운로드 사이에 300ms 간격
            });
        }
        
        appState.isDirty = false;
    });

    // --- 로컬라이제이션 관리 ---
    function renderLocalisationList() {
        const localisationList = document.getElementById('localisation-list');
        const languageSelect = document.getElementById('localisation-language');
        
        if (!localisationList || !languageSelect) return;
        
        const currentLang = languageSelect.value;
        localisationList.innerHTML = '';
        
        // 모든 중점에 대해 로컬라이제이션 항목 생성
        Object.values(appState.focuses).forEach(focus => {
            const item = document.createElement('div');
            item.className = 'localisation-item';
            
            const idSpan = document.createElement('span');
            idSpan.className = 'localisation-item-id';
            idSpan.textContent = focus.id;
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'localisation-item-name';
            
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.value = appState.localisation[currentLang][focus.id] || '';
            nameInput.placeholder = `${focus.id}의 ${getLanguageName(currentLang)} 이름`;
            
            nameInput.addEventListener('input', (e) => {
                appState.localisation[currentLang][focus.id] = e.target.value;
                appState.isDirty = true;
            });
            
            nameDiv.appendChild(nameInput);
            item.appendChild(idSpan);
            item.appendChild(nameDiv);
            localisationList.appendChild(item);
        });
        
        if (Object.keys(appState.focuses).length === 0) {
            localisationList.innerHTML = '<p style="text-align: center; color: #b2bec3; padding: 20px;">중점이 없습니다. 먼저 중점을 생성해주세요.</p>';
        }
    }
    
    function getLanguageName(code) {
        const names = {
            english: '영어',
            korean: '한국어',
            japanese: '일본어',
            german: '독일어',
            french: '프랑스어',
            spanish: '스페인어',
            russian: '러시아어',
            polish: '폴란드어',
            braz_por: '브라질 포르투갈어',
            simp_chinese: '중국어 간체'
        };
        return names[code] || code;
    }
    
    // 로컬라이제이션 다운로드
    function downloadLocalisation(language) {
        const loc = appState.localisation[language];
        
        if (Object.keys(loc).length === 0) {
            alert('저장된 로컬라이제이션이 없습니다.');
            return;
        }
        
        let content = `l_${language}:\n`;
        
        Object.entries(loc).forEach(([id, name]) => {
            if (name && name.trim()) {
                // YML 형식: id:0 "이름"
                content += ` ${id}:0 "${name}"\n`;
                
                // _desc도 자동 생성 (비어있음)
                content += ` ${id}_desc:0 ""\n`;
            }
        });
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${appState.countryTag}_focus_l_${language}.yml`;
        link.click();
        URL.revokeObjectURL(link.href);
        
        alert(`${appState.countryTag}_focus_l_${language}.yml 파일이 다운로드되었습니다.`);
    }
    
    // 이벤트 리스너 설정
    const localisationLanguageSelect = document.getElementById('localisation-language');
    const btnDownloadLocalisation = document.getElementById('btn-download-localisation');
    const btnRefreshLocalisation = document.getElementById('btn-refresh-localisation');
    
    if (localisationLanguageSelect) {
        localisationLanguageSelect.addEventListener('change', renderLocalisationList);
    }
    
    if (btnDownloadLocalisation) {
        btnDownloadLocalisation.addEventListener('click', () => {
            const language = localisationLanguageSelect.value;
            downloadLocalisation(language);
        });
    }
    
    if (btnRefreshLocalisation) {
        btnRefreshLocalisation.addEventListener('click', renderLocalisationList);
    }

    // 초기 렌더링
    renderFocusTree();
});
