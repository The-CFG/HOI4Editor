// ════════════════════════════════════════════════════════
//  script-block.js — ScriptBlock 에디터 렌더러
//  의존: hoi4-defs.js (HOI4_EFFECTS, HOI4_TRIGGERS, hoi4GetDef, hoi4SearchDefs)
//        io-parsers.js (escapeHtml, getBlock)
// ════════════════════════════════════════════════════════

// ── 파서: rawText → 노드 배열 ────────────────────────────
// 노드 종류:
//   { kind:'entry', key, params:{name:value,...}, raw }
//   { kind:'if',    limit:[], body:[], elseIfs:[{limit,body}], else_:[]|null, raw }
//   { kind:'raw',   text }

function sbParse(text) {
    if (!text?.trim()) return [];
    const tokens = _sbTokenize(text.trim());
    return _sbParseBlock(tokens, 0).nodes;
}

// 토크나이저: 문자열 → 토큰 배열
function _sbTokenize(text) {
    const tokens = [];
    let i = 0;
    while (i < text.length) {
        // 공백/줄바꿈 스킵
        if (/\s/.test(text[i])) { i++; continue; }
        // 줄 주석
        if (text[i] === '#') {
            while (i < text.length && text[i] !== '\n') i++;
            continue;
        }
        // 중괄호
        if (text[i] === '{') { tokens.push({ type: 'LBRACE', pos: i }); i++; continue; }
        if (text[i] === '}') { tokens.push({ type: 'RBRACE', pos: i }); i++; continue; }
        // = 또는 <>= 연산자
        if (text[i] === '=') { tokens.push({ type: 'EQ', pos: i }); i++; continue; }
        if ('<>!'.includes(text[i])) {
            let op = text[i++];
            if (text[i] === '=') op += text[i++];
            tokens.push({ type: 'OP', value: op, pos: i });
            continue;
        }
        // 따옴표 문자열
        if (text[i] === '"') {
            let s = '';
            i++;
            while (i < text.length && text[i] !== '"') {
                if (text[i] === '\\') i++;
                s += text[i++];
            }
            i++; // 닫는 "
            tokens.push({ type: 'STRING', value: s, pos: i });
            continue;
        }
        // 숫자 (음수 포함) — 정수만 단독으로 오면 IDENT로도 쓰일 수 있음 (스코프 키: 255 = {...})
        if (/[-\d]/.test(text[i]) && (text[i] !== '-' || /\d/.test(text[i+1] || ''))) {
            let s = '';
            const isNeg = text[i] === '-';
            if (isNeg) s += text[i++];
            let isFloat = false;
            while (i < text.length && /[\d.]/.test(text[i])) {
                if (text[i] === '.') isFloat = true;
                s += text[i++];
            }
            // 정수이고 바로 뒤에 공백 후 = 가 오면 IDENT로 처리 (스코프 키)
            let j = i;
            while (j < text.length && text[j] === ' ') j++;
            if (!isFloat && !isNeg && text[j] === '=') {
                tokens.push({ type: 'IDENT', value: s, pos: i });
            } else {
                tokens.push({ type: 'NUMBER', value: s, pos: i });
            }
            continue;
        }
        // 식별자/키워드
        let id = '';
        while (i < text.length && /[A-Za-z0-9_.:@]/.test(text[i])) id += text[i++];
        if (id) { tokens.push({ type: 'IDENT', value: id, pos: i }); continue; }
        // 나머지는 스킵
        i++;
    }
    return tokens;
}

// 블록 파서: 토큰 배열 → 노드 배열
// stopAt: 'RBRACE'면 } 에서 멈춤 (내부 블록용)
function _sbParseBlock(tokens, start, stopAt = null) {
    const nodes = [];
    let i = start;
    while (i < tokens.length) {
        const t = tokens[i];
        if (stopAt && t.type === stopAt) { return { nodes, end: i }; }

        // key = ... 패턴
        if (t.type === 'IDENT' && tokens[i+1]?.type === 'EQ') {
            const key = t.value;
            i += 2;
            // 다음이 { → 블록
            if (tokens[i]?.type === 'LBRACE') {
                i++; // {
                const inner = _sbParseBlock(tokens, i, 'RBRACE');
                i = inner.end + 1; // }

                if (key === 'if') {
                    nodes.push(_sbParseIf(key, inner.nodes, tokens, i));
                    // if는 이미 파싱 완료
                } else {
                    // 스코프 또는 알 수 없는 블록
                    nodes.push({ kind: 'scope', key, children: inner.nodes, _rawBlock: _sbNodesToRaw(inner.nodes) });
                }
            } else {
                // 값 (단순 or 연산자 포함)
                let valToks = [];
                while (i < tokens.length && !['LBRACE','RBRACE','EQ'].includes(tokens[i].type)) {
                    // 다음이 또 IDENT = 이면 새 항목 시작
                    if (tokens[i].type === 'IDENT' && tokens[i+1]?.type === 'EQ') break;
                    valToks.push(tokens[i++]);
                }
                const rawVal = valToks.map(t => t.type === 'STRING' ? `"${t.value}"` : (t.value ?? t.type)).join(' ');
                nodes.push({ kind: 'entry', key, rawVal });
            }
        } else {
            // 인식 불가 → raw
            // 다음 유효 토큰까지 수집
            let raw = '';
            while (i < tokens.length) {
                const cur = tokens[i];
                if (cur.type === 'RBRACE' && stopAt === 'RBRACE') break;
                if (cur.type === 'IDENT' && tokens[i+1]?.type === 'EQ') break;
                raw += (cur.value ?? (cur.type === 'LBRACE' ? '{' : cur.type === 'RBRACE' ? '}' : cur.type)) + ' ';
                i++;
            }
            if (raw.trim()) nodes.push({ kind: 'raw', text: raw.trim() });
        }
    }
    return { nodes, end: i };
}

// if 블록 전용 파서
// inner.nodes: limit/else_if/else 포함된 if 본문 노드들
function _sbParseIf(_, innerNodes) {
    const node = { kind: 'if', limit: [], body: [], elseIfs: [], else_: null };
    let section = 'body';
    for (const n of innerNodes) {
        if (n.kind === 'scope' && n.key === 'limit') { node.limit = n.children; continue; }
        if (n.kind === 'scope' && n.key === 'else_if') {
            const ei = { limit: [], body: [] };
            for (const en of n.children) {
                if (en.kind === 'scope' && en.key === 'limit') ei.limit = en.children;
                else ei.body.push(en);
            }
            node.elseIfs.push(ei);
            continue;
        }
        if (n.kind === 'scope' && n.key === 'else') { node.else_ = n.children; continue; }
        node.body.push(n);
    }
    return node;
}

// ── 빌더: 노드 배열 → rawText ────────────────────────────
function sbBuild(nodes, indent = 0) {
    const t = '\t'.repeat(indent);
    const ti = '\t'.repeat(indent + 1);
    let out = '';
    for (const node of nodes) {
        if (node.kind === 'entry') {
            out += `${t}${node.key} = ${node.rawVal}\n`;
        } else if (node.kind === 'scope') {
            out += `${t}${node.key} = {\n`;
            out += sbBuild(node.children, indent + 1);
            out += `${t}}\n`;
        } else if (node.kind === 'if') {
            out += `${t}if = {\n`;
            if (node.limit?.length) {
                out += `${ti}limit = {\n`;
                out += sbBuild(node.limit, indent + 2);
                out += `${ti}}\n`;
            }
            out += sbBuild(node.body, indent + 1);
            for (const ei of (node.elseIfs || [])) {
                out += `${ti}else_if = {\n`;
                if (ei.limit?.length) {
                    out += `${ti}\tlimit = {\n`;
                    out += sbBuild(ei.limit, indent + 3);
                    out += `${ti}\t}\n`;
                }
                out += sbBuild(ei.body, indent + 2);
                out += `${ti}}\n`;
            }
            if (node.else_) {
                out += `${ti}else = {\n`;
                out += sbBuild(node.else_, indent + 2);
                out += `${ti}}\n`;
            }
            out += `${t}}\n`;
        } else if (node.kind === 'raw') {
            // raw 노드: 각 줄 앞에 들여쓰기 추가, 빈 줄은 그대로 유지
            const lines = node.text.split('\n');
            out += lines.map(l => l.trim() ? `${t}${l.trim()}` : '').join('\n');
            if (!out.endsWith('\n')) out += '\n';
        }
    }
    return out;
}

function _sbNodesToRaw(nodes) { return sbBuild(nodes, 0); }

// ════════════════════════════════════════════════════════
//  renderScriptBlock — 메인 렌더러
//  container : DOM 요소 (교체됨)
//  fieldId   : hidden textarea의 id
//  initialRaw: 초기 텍스트
//  blockType : 'effect' | 'trigger' | 'mixed'
// ════════════════════════════════════════════════════════
function renderScriptBlock(container, fieldId, initialRaw, blockType) {
    container.innerHTML = '';

    // hidden textarea (extractFormData가 읽음)
    let hidden = document.getElementById(fieldId);
    if (!hidden) {
        hidden = document.createElement('textarea');
        hidden.id = fieldId;
        hidden.style.display = 'none';
        container.appendChild(hidden);
    }

    let nodes = sbParse(initialRaw || '');
    const _sync = () => { hidden.value = sbBuild(nodes); };
    _sync();

    const listEl = document.createElement('div');
    listEl.className = 'sb-list';
    container.appendChild(listEl);

    // 툴바
    const toolbar = document.createElement('div');
    toolbar.className = 'sb-toolbar';
    container.appendChild(toolbar);

    const _render = () => {
        listEl.innerHTML = '';
        nodes.forEach((node, idx) => {
            listEl.appendChild(_renderNode(node, idx, nodes, _render, _sync, blockType));
        });
        _sync();
    };

    // 추가 버튼들
    const kinds = blockType === 'trigger' ? ['trigger'] :
                  blockType === 'effect'  ? ['effect'] :
                  ['effect', 'trigger'];

    kinds.forEach(kind => {
        const btn = _makeAddBtn(kind, (node) => {
            nodes.push(node);
            _render();
        }, blockType);
        toolbar.appendChild(btn);
    });

    // IF 추가 버튼
    const ifBtn = document.createElement('button');
    ifBtn.type = 'button';
    ifBtn.className = 'sb-add-btn secondary';
    ifBtn.textContent = '+ IF 블록';
    ifBtn.addEventListener('click', () => {
        nodes.push({ kind: 'if', limit: [], body: [], elseIfs: [], else_: null });
        _render();
    });
    toolbar.appendChild(ifBtn);

    // RAW 추가 버튼
    const rawBtn = document.createElement('button');
    rawBtn.type = 'button';
    rawBtn.className = 'sb-add-btn secondary';
    rawBtn.textContent = '+ RAW';
    rawBtn.addEventListener('click', () => {
        nodes.push({ kind: 'raw', text: '' });
        _render();
    });
    toolbar.appendChild(rawBtn);

    _render();
}

// ── 노드 렌더링 ──────────────────────────────────────────
function _renderNode(node, idx, parentList, onRerender, onSync, blockType) {
    const wrap = document.createElement('div');
    wrap.className = 'sb-node';

    const _removeBtn = (label = '✕') => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sb-remove';
        btn.textContent = label;
        btn.title = '삭제';
        btn.addEventListener('click', () => {
            parentList.splice(idx, 1);
            onRerender();
        });
        return btn;
    };

    if (node.kind === 'entry') {
        wrap.className += ' sb-entry';
        const def = hoi4GetDef(node.key);
        const header = document.createElement('div');
        header.className = 'sb-entry-header';

        const keySpan = document.createElement('span');
        keySpan.className = 'sb-entry-key';
        keySpan.textContent = node.key;
        if (def?.label) {
            const lbl = document.createElement('span');
            lbl.className = 'sb-entry-label';
            lbl.textContent = def.label;
            keySpan.appendChild(lbl);
        }
        header.appendChild(keySpan);

        // 값 인풋
        const valInput = document.createElement('input');
        valInput.className = 'sb-entry-val';
        valInput.value = node.rawVal ?? '';
        valInput.addEventListener('input', () => {
            node.rawVal = valInput.value;
            onSync();
        });
        header.appendChild(valInput);
        header.appendChild(_removeBtn());
        wrap.appendChild(header);

    } else if (node.kind === 'raw') {
        wrap.className += ' sb-raw';
        const header = document.createElement('div');
        header.className = 'sb-entry-header';
        const lbl = document.createElement('span');
        lbl.className = 'sb-entry-key';
        lbl.textContent = 'RAW';
        header.appendChild(lbl);
        header.appendChild(_removeBtn());
        wrap.appendChild(header);

        const ta = document.createElement('textarea');
        ta.className = 'sb-raw-ta';
        ta.value = node.text;
        ta.rows = 3;
        ta.addEventListener('input', () => {
            // textarea 값 그대로 보존 (줄바꿈 포함)
            node.text = ta.value;
            onSync();
        });
        wrap.appendChild(ta);

    } else if (node.kind === 'scope') {
        wrap.className += ' sb-scope';
        const header = document.createElement('div');
        header.className = 'sb-entry-header';
        const lbl = document.createElement('span');
        lbl.className = 'sb-entry-key';
        lbl.textContent = node.key + ' { }';
        header.appendChild(lbl);
        header.appendChild(_removeBtn());
        wrap.appendChild(header);

        // 스코프 내부를 재귀적으로
        const inner = document.createElement('div');
        inner.className = 'sb-scope-inner';
        renderScriptBlockNodes(inner, node.children, onSync, blockType);
        wrap.appendChild(inner);

    } else if (node.kind === 'if') {
        wrap.className += ' sb-if-block';
        _renderIfBlock(wrap, node, onRerender, onSync, blockType);
        wrap.appendChild(_removeBtn('× IF 삭제'));    }

    return wrap;
}

// ── IF 블록 렌더링 ────────────────────────────────────────
function _renderIfBlock(wrap, node, onRerender, onSync, blockType) {
    // LIMIT
    const limitSection = _makeSection('LIMIT (조건)', 'sb-section-limit');
    renderScriptBlockNodes(limitSection, node.limit, onSync, 'trigger');
    const addLimitRow = _makeAddBtn('trigger', (n) => { node.limit.push(n); onRerender(); }, 'trigger');
    limitSection.appendChild(addLimitRow);
    wrap.appendChild(limitSection);

    // BODY
    const bodySection = _makeSection('BODY (효과)', 'sb-section-body');
    renderScriptBlockNodes(bodySection, node.body, onSync, blockType);
    const addBodyRow = _makeAddBtn(blockType === 'trigger' ? 'trigger' : 'effect', (n) => { node.body.push(n); onRerender(); }, blockType);
    bodySection.appendChild(addBodyRow);
    wrap.appendChild(bodySection);

    // ELSE_IF들
    node.elseIfs.forEach((ei, eiIdx) => {
        const eiWrap = document.createElement('div');
        eiWrap.className = 'sb-elseif';

        const eiHeader = document.createElement('div');
        eiHeader.className = 'sb-section-header';
        eiHeader.textContent = `ELSE_IF ${eiIdx + 1}`;
        const delEi = document.createElement('button');
        delEi.type = 'button'; delEi.className = 'sb-remove'; delEi.textContent = '✕';
        delEi.addEventListener('click', () => { node.elseIfs.splice(eiIdx, 1); onRerender(); });
        eiHeader.appendChild(delEi);
        eiWrap.appendChild(eiHeader);

        const eiLimit = _makeSection('LIMIT', 'sb-section-limit');
        renderScriptBlockNodes(eiLimit, ei.limit, onSync, 'trigger');
        eiWrap.appendChild(eiLimit);
        const eiBody = _makeSection('BODY', 'sb-section-body');
        renderScriptBlockNodes(eiBody, ei.body, onSync, blockType);
        eiWrap.appendChild(eiBody);
        wrap.appendChild(eiWrap);
    });

    // ELSE
    if (node.else_) {
        const elseWrap = document.createElement('div');
        elseWrap.className = 'sb-else';
        const elseHeader = document.createElement('div');
        elseHeader.className = 'sb-section-header';
        elseHeader.textContent = 'ELSE';
        const delElse = document.createElement('button');
        delElse.type = 'button'; delElse.className = 'sb-remove'; delElse.textContent = '✕';
        delElse.addEventListener('click', () => { node.else_ = null; onRerender(); });
        elseHeader.appendChild(delElse);
        elseWrap.appendChild(elseHeader);
        renderScriptBlockNodes(elseWrap, node.else_, onSync, blockType);
        wrap.appendChild(elseWrap);
    }

    // 하단 액션 버튼들
    const actions = document.createElement('div');
    actions.className = 'sb-if-actions';
    const addEiBtn = document.createElement('button');
    addEiBtn.type = 'button'; addEiBtn.className = 'secondary sb-add-btn';
    addEiBtn.textContent = '+ ELSE_IF';
    addEiBtn.addEventListener('click', () => { node.elseIfs.push({ limit: [], body: [] }); onRerender(); });
    actions.appendChild(addEiBtn);
    if (!node.else_) {
        const addElseBtn = document.createElement('button');
        addElseBtn.type = 'button'; addElseBtn.className = 'secondary sb-add-btn';
        addElseBtn.textContent = '+ ELSE';
        addElseBtn.addEventListener('click', () => { node.else_ = []; onRerender(); });
        actions.appendChild(addElseBtn);
    }
    wrap.appendChild(actions);
}

// ── 중첩 노드 렌더링 (onRerender 없이) ───────────────────
function renderScriptBlockNodes(container, nodeList, onSync, blockType) {
    const listEl = document.createElement('div');
    listEl.className = 'sb-list sb-list-inner';
    container.appendChild(listEl);

    const _render = () => {
        listEl.innerHTML = '';
        nodeList.forEach((node, idx) => {
            listEl.appendChild(_renderNode(node, idx, nodeList, _render, onSync, blockType));
        });
        onSync();
    };
    _render();
}

// ── 섹션 헤더 ────────────────────────────────────────────
function _makeSection(title, cls) {
    const sec = document.createElement('div');
    sec.className = 'sb-section ' + cls;
    const hdr = document.createElement('div');
    hdr.className = 'sb-section-header';
    hdr.textContent = title;
    sec.appendChild(hdr);
    return sec;
}

// ── 추가 버튼 (드롭다운 검색) ────────────────────────────
function _makeAddBtn(kind, onAdd, blockType) {
    const wrap = document.createElement('div');
    wrap.className = 'sb-add-wrap';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'sb-search';
    searchInput.placeholder = kind === 'trigger' ? '조건 검색...' : kind === 'effect' ? '효과 검색...' : '검색...';

    const dropdown = document.createElement('div');
    dropdown.className = 'sb-dropdown autocomplete-dropdown';

    let selIdx = -1;

    const _refresh = () => {
        const q = searchInput.value.trim();
        selIdx = -1;
        const kinds = kind === 'mixed' ? ['effect','trigger'] : [kind];
        const results = hoi4SearchDefs(q, kinds, 30);
        if (!results.length) { dropdown.classList.remove('active'); return; }
        dropdown.innerHTML = results.map((d, i) =>
            `<div class="autocomplete-item" data-key="${escapeHtml(d.key)}" data-index="${i}">
                <span class="autocomplete-item-id">${escapeHtml(d.key)}</span>
                ${d.label ? `<span class="autocomplete-item-name">${escapeHtml(d.label)}</span>` : ''}
                <span class="sb-kind-badge sb-kind-${d._kind}">${d._kind}</span>
             </div>`
        ).join('');
        dropdown.classList.add('active');
        dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('mousedown', e => {
                e.preventDefault();
                _pick(item.dataset.key);
            });
        });
    };

    const _pick = (key) => {
        const def = hoi4GetDef(key);
        // 기본값으로 rawVal 구성
        let rawVal = '';
        if (def?.params?.length === 1 && def.params[0].default !== undefined) {
            rawVal = String(def.params[0].default);
        } else if (def?.params?.length === 1 && def.params[0].type === 'bool') {
            rawVal = 'yes';
        } else if (def?.params) {
            rawVal = def.params.map(p => p.default !== undefined ? String(p.default) : (p.type === 'bool' ? 'yes' : '')).join(' ').trim();
        }
        onAdd({ kind: 'entry', key, rawVal });
        searchInput.value = '';
        dropdown.classList.remove('active');
    };

    searchInput.addEventListener('input', _refresh);
    searchInput.addEventListener('focus', _refresh);
    searchInput.addEventListener('keydown', e => {
        const items = [...dropdown.querySelectorAll('.autocomplete-item')];
        if (e.key === 'ArrowDown') { e.preventDefault(); selIdx = Math.min(selIdx+1, items.length-1); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); selIdx = Math.max(selIdx-1, 0); }
        items.forEach((it, i) => it.classList.toggle('selected', i === selIdx));
        if (e.key === 'Enter') {
            e.preventDefault();
            if (selIdx >= 0) _pick(items[selIdx].dataset.key);
            else if (searchInput.value.trim()) onAdd({ kind: 'entry', key: searchInput.value.trim(), rawVal: '' });
            searchInput.value = '';
            dropdown.classList.remove('active');
        }
        if (e.key === 'Escape') dropdown.classList.remove('active');
    });
    document.addEventListener('click', e => {
        if (!wrap.contains(e.target)) dropdown.classList.remove('active');
    });

    wrap.appendChild(searchInput);
    wrap.appendChild(dropdown);
    return wrap;
}
