// ════════════════════════════════════════════════════════
//  focus-chips.js — Prerequisite / Mutually Exclusive
//  블록(칩) UI 컴포넌트
//
//  의존: focus-form.js의 escapeHtml, appState
//  index.html 로드 순서: focus-form.js 보다 먼저 or 같이
// ════════════════════════════════════════════════════════

// ── 공통: 중점 ID 목록 반환 ──────────────────────────────
function _chipFocusIds() {
    const fd = currentFileData();
    if (!fd?.focuses) return [];
    return Object.values(fd.focuses).map(f => f.id).filter(Boolean).sort();
}

// ── 공통: 드롭다운 + 직접입력 input 생성 ────────────────
function _makeChipInput(placeholder, onAdd) {
    const wrap = document.createElement('div');
    wrap.className = 'chip-input-row';
    wrap.innerHTML = `
        <div class="autocomplete-container" style="flex:1;">
            <input type="text" class="chip-adder" placeholder="${escapeHtml(placeholder)}" autocomplete="off">
            <div class="chip-add-dropdown autocomplete-dropdown"></div>
        </div>
        <button type="button" class="chip-add-btn secondary">추가</button>
    `;
    const input    = wrap.querySelector('.chip-adder');
    const dropdown = wrap.querySelector('.chip-add-dropdown');
    const addBtn   = wrap.querySelector('.chip-add-btn');

    let selIdx = -1;

    const refresh = () => {
        const q = input.value.trim().toLowerCase();
        selIdx   = -1;
        const ids = _chipFocusIds().filter(id => !q || id.toLowerCase().includes(q));
        if (!ids.length) { dropdown.classList.remove('active'); return; }
        dropdown.innerHTML = ids.map((id, i) =>
            `<div class="autocomplete-item" data-id="${escapeHtml(id)}" data-index="${i}">
                <span class="autocomplete-item-id">${escapeHtml(id)}</span>
             </div>`
        ).join('');
        dropdown.classList.add('active');
        dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('mousedown', e => {
                e.preventDefault();
                input.value = item.dataset.id;
                dropdown.classList.remove('active');
            });
        });
    };

    input.addEventListener('input', refresh);
    input.addEventListener('focus', refresh);
    input.addEventListener('keydown', e => {
        const items = [...dropdown.querySelectorAll('.autocomplete-item')];
        if (e.key === 'ArrowDown') { e.preventDefault(); selIdx = Math.min(selIdx+1, items.length-1); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); selIdx = Math.max(selIdx-1, 0); }
        items.forEach((it, i) => it.classList.toggle('selected', i === selIdx));
        if (e.key === 'Enter') {
            e.preventDefault();
            if (selIdx >= 0 && items[selIdx]) input.value = items[selIdx].dataset.id;
            _doAdd();
        }
        if (e.key === 'Escape') dropdown.classList.remove('active');
    });
    document.addEventListener('click', e => {
        if (!wrap.contains(e.target)) dropdown.classList.remove('active');
    });

    const _doAdd = () => {
        const val = input.value.trim();
        if (!val) return;
        onAdd(val);
        input.value = '';
        dropdown.classList.remove('active');
    };
    addBtn.addEventListener('click', _doAdd);

    return wrap;
}

// ── 칩 엘리먼트 생성 ─────────────────────────────────────
function _makeChip(label, onRemove, cls = '') {
    const chip = document.createElement('span');
    chip.className = 'focus-chip' + (cls ? ' ' + cls : '');
    chip.innerHTML = `<span class="chip-label">${escapeHtml(label)}</span><button type="button" class="chip-remove" title="제거">×</button>`;
    chip.querySelector('.chip-remove').addEventListener('click', onRemove);
    return chip;
}

// ════════════════════════════════════════════════════════
//  MUTUALLY EXCLUSIVE UI
//  데이터: string[]
//  직렬화: id1, id2, id3
// ════════════════════════════════════════════════════════
function renderMEChips(container, initialList) {
    // 내부 상태
    let _list = [...(initialList || [])];

    // 숨겨진 input (extractFormData가 읽음)
    let hiddenInput = container.querySelector('#focus-mutually-exclusive');
    if (!hiddenInput) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id   = 'focus-mutually-exclusive';
        container.appendChild(hiddenInput);
    }

    const _sync = () => { hiddenInput.value = _list.join(', '); };

    const chipsWrap = document.createElement('div');
    chipsWrap.className = 'chips-area';

    const _render = () => {
        chipsWrap.innerHTML = '';
        _list.forEach((id, idx) => {
            chipsWrap.appendChild(_makeChip(id, () => {
                _list.splice(idx, 1);
                _render();
                _sync();
            }));
        });
    };

    const inputRow = _makeChipInput('중점 ID 입력 또는 선택...', val => {
        if (_list.includes(val)) return;
        _list.push(val);
        _render();
        _sync();
    });

    container.appendChild(chipsWrap);
    container.appendChild(inputRow);
    _render();
    _sync();

    return { getList: () => [..._list] };
}

// ════════════════════════════════════════════════════════
//  PREREQUISITE UI
//  데이터: (string | string[])[]
//    - string  → AND 조건 하나 (단독 중점)
//    - string[] → OR 그룹 (여러 중점 중 하나)
//
//  직렬화: id1, [id2, id3], id4
//    → parsePre 호환
// ════════════════════════════════════════════════════════
function renderPrerequisiteChips(container, initialList) {
    // _items: Array< string | string[] >
    let _items = JSON.parse(JSON.stringify(initialList || []));

    let hiddenInput = container.querySelector('#focus-prerequisite');
    if (!hiddenInput) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id   = 'focus-prerequisite';
        container.appendChild(hiddenInput);
    }

    const _serialize = () => {
        return _items.map(item =>
            Array.isArray(item)
                ? (item.length === 1 ? item[0] : `[${item.join(', ')}]`)
                : item
        ).join(', ');
    };
    const _sync = () => { hiddenInput.value = _serialize(); };

    const listWrap = document.createElement('div');
    listWrap.className = 'pre-list';

    const _render = () => {
        listWrap.innerHTML = '';

        _items.forEach((item, itemIdx) => {
            if (Array.isArray(item)) {
                // OR 그룹 박스
                const orBox = document.createElement('div');
                orBox.className = 'pre-or-box';
                const orLabel = document.createElement('div');
                orLabel.className = 'pre-or-label';
                orLabel.textContent = 'OR';
                orBox.appendChild(orLabel);

                const orChips = document.createElement('div');
                orChips.className = 'chips-area';
                item.forEach((id, subIdx) => {
                    orChips.appendChild(_makeChip(id, () => {
                        item.splice(subIdx, 1);
                        // OR 그룹에 1개만 남으면 자동으로 단독 항목으로 풀기
                        if (item.length === 1) _items[itemIdx] = item[0];
                        else if (item.length === 0) _items.splice(itemIdx, 1);
                        _render(); _sync();
                    }, 'chip-or'));
                });
                orBox.appendChild(orChips);

                // OR 그룹 내 추가
                const orAddRow = _makeChipInput('OR 내 중점 추가...', val => {
                    if (!item.includes(val)) { item.push(val); _render(); _sync(); }
                });
                orAddRow.style.marginTop = '6px';
                orBox.appendChild(orAddRow);

                // OR 그룹 삭제 버튼
                const delOrBtn = document.createElement('button');
                delOrBtn.type = 'button';
                delOrBtn.className = 'pre-or-delete secondary';
                delOrBtn.title = 'OR 그룹 전체 삭제';
                delOrBtn.textContent = '× OR 그룹 삭제';
                delOrBtn.addEventListener('click', () => {
                    _items.splice(itemIdx, 1); _render(); _sync();
                });
                orBox.appendChild(delOrBtn);

                listWrap.appendChild(orBox);
            } else {
                // 단독 AND 항목
                const row = document.createElement('div');
                row.className = 'pre-and-row';
                row.appendChild(_makeChip(item, () => {
                    _items.splice(itemIdx, 1); _render(); _sync();
                }, 'chip-and'));
                listWrap.appendChild(row);
            }
        });

        // 하단 추가 버튼들
        const addArea = document.createElement('div');
        addArea.className = 'pre-add-area';

        // AND 추가 (단독 중점)
        const andRow = _makeChipInput('AND 조건 중점 추가...', val => {
            _items.push(val); _render(); _sync();
        });

        // OR 그룹 추가 버튼
        const addOrBtn = document.createElement('button');
        addOrBtn.type = 'button';
        addOrBtn.className = 'secondary pre-add-or-btn';
        addOrBtn.textContent = '+ OR 그룹 추가';
        addOrBtn.style.marginTop = '6px';
        addOrBtn.addEventListener('click', () => {
            _items.push([]); _render(); _sync();
        });

        addArea.appendChild(andRow);
        addArea.appendChild(addOrBtn);
        listWrap.appendChild(addArea);
    };

    container.appendChild(listWrap);
    _render();
    _sync();

    return { getList: () => JSON.parse(JSON.stringify(_items)) };
}