// ════════════════════════════════════════════════════════
//  ideas-editor.js — 아이디어(국민정신) 편집기
//  의존: state.js, io-parsers.js, ideas-form.js, cloud-ui.js
// ════════════════════════════════════════════════════════

let _ideasSelectedCat = 'country';
let _ideasSelectedId  = null;

// ── 진입점 ───────────────────────────────────────────────
function openIdeasEditor(filePath) {
    appState.currentFile = filePath;
    const fd = currentFileData();
    if (!fd || fd.type !== 'ideas') return;

    switchView('ideas-editor-view');

    const titleEl = document.getElementById('ideas-editor-title');
    if (titleEl) titleEl.textContent = filePath.split('/').pop();

    // 첫 카테고리 선택
    const cats = Object.keys(fd.categories || {});
    _ideasSelectedCat = cats.includes('country') ? 'country' : (cats[0] || 'country');
    _ideasSelectedId  = null;

    resetHistory();
    renderIdeasEditor();
}

// ── 전체 재렌더 ─────────────────────────────────────────
function renderIdeasEditor() {
    const fd = currentFileData();
    if (!fd || fd.type !== 'ideas') return;

    _renderCategoryTabs(fd);
    _renderIdeaList(fd);
    _updateIdeasCount(fd);

    // 선택된 아이디어가 있으면 폼 유지
    if (_ideasSelectedId) {
        const cat = fd.categories[_ideasSelectedCat];
        const idea = cat?.ideas?.[_ideasSelectedId];
        if (idea) {
            _showIdeasForm(fd);
        } else {
            _ideasSelectedId = null;
            _hideIdeasForm();
        }
    } else {
        _hideIdeasForm();
    }
}

// ── 카테고리 탭 ─────────────────────────────────────────
function _renderCategoryTabs(fd) {
    const container = document.getElementById('ideas-category-tabs');
    if (!container) return;
    container.innerHTML = '';

    Object.keys(fd.categories || {}).forEach(catName => {
        const cat = fd.categories[catName];
        const isRaw = cat._raw != null;
        const btn = document.createElement('button');
        btn.className = 'ideas-cat-tab' + (_ideasSelectedCat === catName ? ' active' : '');
        btn.textContent = catName + (isRaw ? ' (RAW)' : '');
        btn.title = isRaw ? '이 카테고리는 RAW 편집만 지원됩니다' : catName;
        btn.addEventListener('click', () => {
            _ideasSelectedCat = catName;
            _ideasSelectedId  = null;
            renderIdeasEditor();
        });
        container.appendChild(btn);
    });

    // 카테고리 추가 버튼
    const addBtn = document.createElement('button');
    addBtn.className = 'ideas-cat-tab ideas-cat-add';
    addBtn.textContent = '＋ 카테고리';
    addBtn.title = '새 카테고리 추가';
    addBtn.addEventListener('click', _addCategory);
    container.appendChild(addBtn);
}

// ── 아이디어 목록 ────────────────────────────────────────
function _renderIdeaList(fd) {
    const container = document.getElementById('ideas-list');
    if (!container) return;
    container.innerHTML = '';

    const cat = fd.categories[_ideasSelectedCat];
    if (!cat) return;

    // RAW 카테고리: textarea 표시
    if (cat._raw != null) {
        const rawWrap = document.createElement('div');
        rawWrap.className = 'ideas-raw-section';
        rawWrap.innerHTML = `<small style="color:var(--text-muted);display:block;margin-bottom:4px;">RAW 편집</small>`;
        const ta = document.createElement('textarea');
        ta.className = 'raw-editor';
        ta.value = cat._raw || '';
        ta.style.cssText = 'width:100%;min-height:200px;font-family:monospace;font-size:11px;';
        ta.addEventListener('input', () => {
            saveSnapshot('RAW 카테고리 편집');
            fd.categories[_ideasSelectedCat]._raw = ta.value;
            appState.isDirty = true;
        });
        rawWrap.appendChild(ta);
        container.appendChild(rawWrap);
        return;
    }

    // 일반 카테고리: 아이디어 카드 목록
    const ideas = cat.ideas || {};
    if (!Object.keys(ideas).length) {
        const empty = document.createElement('div');
        empty.style.cssText = 'color:var(--text-muted);font-size:12px;padding:8px 4px;';
        empty.textContent = '아이디어 없음';
        container.appendChild(empty);
        return;
    }

    Object.entries(ideas).forEach(([id, idea]) => {
        const card = document.createElement('div');
        card.className = 'idea-card' + (_ideasSelectedId === id ? ' selected' : '');
        card.dataset.id = id;

        const pictureKey = idea.picture || id;
        card.innerHTML = `
            <div class="idea-card-icon">💡</div>
            <div class="idea-card-info">
                <div class="idea-card-id">${escapeHtml(id)}</div>
                ${idea._comment ? `<div class="idea-card-comment">${escapeHtml(idea._comment)}</div>` : ''}
                ${idea.picture ? `<div class="idea-card-picture">${escapeHtml(pictureKey)}</div>` : ''}
            </div>
        `;
        card.addEventListener('click', () => _selectIdea(id));
        container.appendChild(card);
    });
}

function _updateIdeasCount(fd) {
    const el = document.getElementById('ideas-count');
    if (!el) return;
    const cat = fd.categories[_ideasSelectedCat];
    const count = cat?._raw != null ? '—' : Object.keys(cat?.ideas || {}).length;
    el.textContent = count;
}

// ── 아이디어 선택 ────────────────────────────────────────
function _selectIdea(id) {
    // 이전 선택 저장
    if (_ideasSelectedId && _ideasSelectedId !== id) {
        _saveCurrentIdea(true); // silent save (재렌더 없이)
    }
    _ideasSelectedId = id;

    // 카드 선택 상태 갱신
    document.querySelectorAll('.idea-card').forEach(c => {
        c.classList.toggle('selected', c.dataset.id === id);
    });

    const fd = currentFileData();
    _showIdeasForm(fd);
}

function _showIdeasForm(fd) {
    const placeholder = document.getElementById('ideas-placeholder');
    const panel = document.getElementById('ideas-form-panel');
    if (placeholder) placeholder.classList.add('hidden');
    if (panel) panel.classList.remove('hidden');

    const cat = fd.categories[_ideasSelectedCat];
    const idea = cat?.ideas?.[_ideasSelectedId];
    if (!idea) return;

    renderIdeasForm(panel, _ideasSelectedId, idea, _ideasSelectedCat);
}

function _hideIdeasForm() {
    const placeholder = document.getElementById('ideas-placeholder');
    const panel = document.getElementById('ideas-form-panel');
    if (placeholder) placeholder.classList.remove('hidden');
    if (panel) { panel.classList.add('hidden'); panel.innerHTML = ''; }
}

// ── 폼 저장 ─────────────────────────────────────────────
function _saveCurrentIdea(silent = false) {
    if (!_ideasSelectedId) return;
    const fd = currentFileData();
    if (!fd) return;
    const cat = fd.categories[_ideasSelectedCat];
    if (!cat?.ideas) return;

    const formData = extractIdeasFormData();
    if (!formData) return;

    const oldId = _ideasSelectedId;
    const newId = formData._id;

    saveSnapshot(`"${oldId}" 아이디어 수정`);

    // ID 변경 처리
    if (newId && newId !== oldId) {
        const ideas = cat.ideas;
        const ordered = {};
        Object.entries(ideas).forEach(([k, v]) => {
            ordered[k === oldId ? newId : k] = k === oldId ? { ...v, ...formData } : v;
        });
        cat.ideas = ordered;
        delete formData._id;
        _ideasSelectedId = newId;
    } else {
        delete formData._id;
        cat.ideas[oldId] = { ...cat.ideas[oldId], ...formData };
    }

    appState.isDirty = true;

    if (!silent) {
        renderIdeasEditor();
    } else {
        // 카드 목록만 갱신
        _renderIdeaList(fd);
        _updateIdeasCount(fd);
    }
}

// ── 새 아이디어 추가 ─────────────────────────────────────
function _addNewIdea() {
    const fd = currentFileData();
    if (!fd) return;
    const cat = fd.categories[_ideasSelectedCat];
    if (!cat || cat._raw != null) {
        alert('RAW 카테고리에는 직접 아이디어를 추가할 수 없습니다.');
        return;
    }

    let base = 'new_spirit', n = 1;
    while (cat.ideas[base + (n === 1 ? '' : `_${n}`)]) n++;
    const newId = base + (n === 1 ? '' : `_${n}`);

    saveSnapshot('새 아이디어 추가');
    cat.ideas[newId] = {
        _comment: '', picture: '', name: '', cost: null, removal_cost: null,
        level: null, ledger: '', traits: [],
        allowed: '', allowed_civil_war: '', allowed_to_remove: '',
        visible: '', available: '', cancel: '', do_effect: '',
        modifier: '', targeted_modifier: '', research_bonus: '',
        equipment_bonus: '', rule: '',
        on_add: '', on_remove: '', ai_will_do: '',
    };
    appState.isDirty = true;
    _ideasSelectedId = newId;
    renderIdeasEditor();
}

// ── 아이디어 삭제 ────────────────────────────────────────
function _deleteIdea(id) {
    if (!confirm(`"${id}" 아이디어를 삭제하시겠습니까?`)) return;
    const fd = currentFileData();
    const cat = fd?.categories[_ideasSelectedCat];
    if (!cat?.ideas?.[id]) return;

    saveSnapshot(`"${id}" 아이디어 삭제`);
    delete cat.ideas[id];
    appState.isDirty = true;

    if (_ideasSelectedId === id) _ideasSelectedId = null;
    renderIdeasEditor();
}

// ── 카테고리 추가 ────────────────────────────────────────
function _addCategory() {
    const name = prompt('새 카테고리 이름 (예: country, hidden_ideas, my_category):');
    if (!name?.trim()) return;
    const catName = name.trim();
    const fd = currentFileData();
    if (!fd) return;
    if (fd.categories[catName]) { alert('이미 존재하는 카테고리입니다.'); return; }

    const isFullParse = IDEAS_FULL_PARSE_CATS.has(catName);
    saveSnapshot('카테고리 추가');
    if (isFullParse) {
        fd.categories[catName] = {
            _attrs: { law: false, designer: false, use_list_view: false },
            ideas: {}
        };
    } else {
        fd.categories[catName] = { _raw: '' };
    }
    appState.isDirty = true;
    _ideasSelectedCat = catName;
    _ideasSelectedId  = null;
    renderIdeasEditor();
}

// ── 파일 불러오기 ────────────────────────────────────────
function _ideasImportFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;
        const content = await file.text();
        const parsed = parseIdeasFile(content);
        if (!parsed) { alert('아이디어 파일 파싱 실패'); return; }

        const fd = currentFileData();
        if (!fd) return;
        saveSnapshot('파일 불러오기');
        fd.categories = parsed.categories;
        appState.isDirty = true;

        const cats = Object.keys(fd.categories);
        _ideasSelectedCat = cats.includes('country') ? 'country' : (cats[0] || 'country');
        _ideasSelectedId  = null;
        renderIdeasEditor();
    };
    input.click();
}

// ── 파일 내보내기 ────────────────────────────────────────
function _ideasExportFile() {
    const fd = currentFileData();
    if (!fd) return;
    const filePath = appState.currentFile || 'ideas.txt';
    const filename = filePath.split('/').pop();
    const content  = buildIdeasTxt(fd);
    downloadBlob(content, filename);
}

// ── 서버 저장 ────────────────────────────────────────────
async function _ideasSaveServer() {
    const filePath = appState.currentFile;
    const fd = currentFileData();
    if (!filePath || !fd) return;
    _saveCurrentIdea(true);
    await _saveCurrentFileToServer(filePath, fd);
}

// ── RAW 편집 ─────────────────────────────────────────────
function _ideasRawEdit() {
    const fd = currentFileData();
    if (!fd) return;
    _saveCurrentIdea(true);
    const raw = buildIdeasTxt(fd);
    // explorer의 RAW 에디터 재사용을 위해 임시 raw 객체로 전환
    const tmpFd = { type: 'raw_text', raw };
    const panel = document.getElementById('ideas-form-panel');
    const placeholder = document.getElementById('ideas-placeholder');
    if (placeholder) placeholder.classList.add('hidden');
    if (panel) {
        panel.classList.remove('hidden');
        panel.innerHTML = `
            <div style="padding:16px;display:flex;flex-direction:column;height:100%;box-sizing:border-box;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <strong>RAW 텍스트 편집</strong>
                    <button id="btn-ideas-raw-apply" class="primary" style="font-size:12px;">✅ 적용</button>
                </div>
                <textarea id="ideas-raw-textarea" style="flex:1;font-family:monospace;font-size:12px;width:100%;box-sizing:border-box;resize:none;">${escapeHtml(raw)}</textarea>
            </div>
        `;
        document.getElementById('btn-ideas-raw-apply')?.addEventListener('click', () => {
            const newRaw = document.getElementById('ideas-raw-textarea')?.value || '';
            const reparsed = parseIdeasFile(newRaw);
            if (!reparsed) { alert('파싱 오류: 형식을 확인하세요'); return; }
            saveSnapshot('RAW 편집 적용');
            fd.categories = reparsed.categories;
            appState.isDirty = true;
            _ideasSelectedId = null;
            renderIdeasEditor();
        });
    }
}

// ── 사이드바 토글 ────────────────────────────────────────
function _initIdeasSidebarToggle() {
    const panel   = document.getElementById('ideas-left-panel');
    const toggleBtn = document.getElementById('btn-ideas-sidebar-toggle');
    const expandBtn = document.getElementById('btn-ideas-sidebar-expand');
    if (!panel) return;

    const collapse = () => { panel.classList.add('collapsed'); };
    const expand   = () => { panel.classList.remove('collapsed'); };

    toggleBtn?.addEventListener('click', collapse);
    expandBtn?.addEventListener('click', expand);
}

// ── 이벤트 바인딩 (main.js에서 1회 호출) ────────────────
function setupIdeasEditorListeners() {
    document.getElementById('btn-ideas-back')?.addEventListener('click', () => {
        _saveCurrentIdea(true);
        switchView('explorer-view');
    });
    document.getElementById('btn-ideas-save-server')?.addEventListener('click', _ideasSaveServer);
    document.getElementById('btn-ideas-export')?.addEventListener('click', _ideasExportFile);
    document.getElementById('btn-ideas-import')?.addEventListener('click', _ideasImportFile);
    document.getElementById('btn-ideas-raw')?.addEventListener('click', _ideasRawEdit);
    document.getElementById('btn-new-idea')?.addEventListener('click', _addNewIdea);

    // 아이디어 폼의 저장/삭제 버튼은 ideas-form.js 렌더 시 동적으로 바인딩

    _initIdeasSidebarToggle();
}