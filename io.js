// ════════════════════════════════════════════════════════
//  io.js — 파일 파서 / 빌더 / 불러오기 / 내보내기
//  의존: state.js, editor.js (renderFocusTree, saveSnapshot)
// ════════════════════════════════════════════════════════

// ── 공용 유틸 ───────────────────────────────────────────
function downloadBlob(content, filename, type = 'text/plain;charset=utf-8') {
    const blob = typeof content === 'string' ? new Blob([content], { type }) : content;
    const link = document.createElement('a');
    link.href     = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

// ── .txt 빌더 ───────────────────────────────────────────
function buildFocusTxt() {
    const fb   = (key, content, indent = 2) => {
        if (!content?.trim()) return '';
        const t = '\t'.repeat(indent), ti = '\t'.repeat(indent + 1);
        return `${t}${key} = {\n${ti}${content.trim().replace(/\n/g, '\n' + ti)}\n${t}}\n`;
    };
    const fBool = (key, val, indent = 2) => val ? '\t'.repeat(indent) + `${key} = yes\n` : '';

    let out = `focus_tree = {\n\tid = ${appState.treeId}\n`;
    if (appState.defaultTree) out += `\tdefault = yes\n`;
    out += `\tcountry = {\n\t\tfactor = 0\n\t\tmodifier = {\n\t\t\tadd = 10\n\t\t\ttag = ${appState.countryTag}\n\t\t}\n\t}\n`;
    if (appState.continuousFocusPosition)
        out += `\tcontinuous_focus_position = { x = ${appState.continuousX} y = ${appState.continuousY} }\n`;
    if (!appState.resetOnCivilwar) out += `\treset_on_civilwar = no\n`;
    if (appState.initialShowX !== 0 || appState.initialShowY !== 0)
        out += `\tinitial_show_position = {\n\t\tx = ${appState.initialShowX}\n\t\ty = ${appState.initialShowY}\n\t}\n`;
    appState.sharedFocuses.forEach(sf => { out += `\tshared_focus = ${sf}\n`; });
    out += '\n';

    Object.values(appState.focuses).forEach(f => {
        out += `\tfocus = {\n`;
        out += `\t\tid = ${f.id}\n`;
        out += `\t\ticon = ${f.icon}\n`;
        if (f.dynamic) out += `\t\tdynamic = yes\n`;
        out += `\t\tcost = ${f.cost}\n`;
        if (f.prerequisite?.length) f.prerequisite.forEach(item => {
            out += Array.isArray(item)
                ? `\t\tprerequisite = { ${item.map(p => `focus = ${p}`).join(' ')} }\n`
                : `\t\tprerequisite = { focus = ${item} }\n`;
        });
        if (f.mutually_exclusive?.length)
            out += `\t\tmutually_exclusive = { ${f.mutually_exclusive.map(p => `focus = ${p}`).join(' ')} }\n`;
        if (f.relative_position_id) out += `\t\trelative_position_id = ${f.relative_position_id}\n`;
        out += `\t\tx = ${f.x}\n\t\ty = ${f.y}\n`;
        if (f.offset?.x || f.offset?.y)
            out += `\t\toffset = {\n\t\t\tx = ${f.offset.x}\n\t\t\ty = ${f.offset.y}\n\t\t}\n`;
        out += fb('available',         f.available);
        out += fb('bypass',            f.bypass);
        out += fBool('bypass_if_unavailable', f.bypass_if_unavailable);
        out += fb('cancel',            f.cancel);
        out += fb('allow_branch',      f.allow_branch);
        out += fBool('cancelable',           f.cancelable);
        out += fBool('continue_if_invalid',  f.continue_if_invalid);
        out += fBool('cancel_if_invalid',    f.cancel_if_invalid);
        out += fBool('available_if_capitulated', f.available_if_capitulated);
        if (f.search_filters?.length)
            out += `\t\tsearch_filters = { ${f.search_filters.join(' ')} }\n`;
        if (f.text_icon) out += `\t\ttext_icon = ${f.text_icon}\n`;
        out += fb('ai_will_do',        f.ai_will_do);
        out += fb('historical_ai',     f.historical_ai);
        if (f.will_lead_to_war_with?.length)
            out += `\t\twill_lead_to_war_with = { ${f.will_lead_to_war_with.join(' ')} }\n`;
        out += fb('select_effect',     f.select_effect);
        out += fb('completion_reward', f.complete_effect);
        out += `\t}\n\n`;
    });
    out += '}';
    return out;
}

// ── .yml 빌더 ───────────────────────────────────────────
function buildLocFiles() {
    const locFiles = {};
    Object.entries(appState.localisation).forEach(([lang, data]) => {
        if (!Object.keys(data).length) return;
        let content = `l_${lang}:\n`;
        Object.entries(data).forEach(([id, locData]) => {
            const name = typeof locData === 'object' ? locData.name : locData;
            const desc = typeof locData === 'object' ? locData.desc : '';
            if (name?.trim()) {
                content += ` ${id}:0 "${name}"\n`;
                content += ` ${id}_desc:0 "${desc || ''}"\n`;
            }
        });
        locFiles[`${appState.countryTag}_focus_l_${lang}.yml`] = content;
    });
    return locFiles;
}

// ── 내보내기 함수들 ─────────────────────────────────────
async function exportZip() {
    if (!Object.keys(appState.focuses).length) { alert('내보낼 중점이 없습니다.'); return; }
    const focusTxt    = buildFocusTxt();
    const locFiles    = buildLocFiles();
    const projectJson = JSON.stringify({
        version: 1,
        settings: {
            treeId: appState.treeId, countryTag: appState.countryTag,
            defaultTree: appState.defaultTree, sharedFocuses: appState.sharedFocuses,
            continuousFocusPosition: appState.continuousFocusPosition,
            continuousX: appState.continuousX, continuousY: appState.continuousY,
            resetOnCivilwar: appState.resetOnCivilwar,
            initialShowX: appState.initialShowX, initialShowY: appState.initialShowY
        },
        focuses: appState.focuses,
        localisation: appState.localisation
    }, null, 2);

    const allFiles = [
        { name: `${appState.countryTag}_focus.txt`,    content: focusTxt },
        { name: `${appState.countryTag}_project.json`, content: projectJson },
        ...Object.entries(locFiles).map(([n, c]) => ({ name: n, content: c }))
    ];

    if (typeof JSZip !== 'undefined') {
        const zip = new JSZip();
        allFiles.forEach(f => zip.file(f.name, f.content));
        const blob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(blob, `${appState.countryTag}_hoi4_mod.zip`, 'application/zip');
        appState.isDirty = false;
        alert(`다운로드 완료: ${appState.countryTag}_hoi4_mod.zip\n포함: 중점 .txt, 프로젝트 .json${Object.keys(locFiles).length ? `, 로컬라이제이션 ${Object.keys(locFiles).length}개` : ''}`);
    } else {
        allFiles.forEach((f, i) => setTimeout(() => downloadBlob(f.content, f.name), i * 300));
        appState.isDirty = false;
    }
}

function exportFocusTxt() {
    if (!Object.keys(appState.focuses).length) { alert('내보낼 중점이 없습니다.'); return; }
    downloadBlob(buildFocusTxt(), `${appState.countryTag}_focus.txt`);
}

// ── .txt 파서 ───────────────────────────────────────────
function parseFocusFile(fileContent) {
    const focuses  = {};
    const settings = {
        treeId: 'my_focus_tree', countryTag: 'GEN', defaultTree: false,
        sharedFocuses: [], continuousFocusPosition: false,
        continuousX: 50, continuousY: 2740, resetOnCivilwar: true,
        initialShowX: 0, initialShowY: 0
    };

    const getVal  = (key, text) => (text.match(new RegExp(`(?:^|\\s)${key}\\s*=\\s*(\\S+)`)) || [])[1];
    const getBool = (key, text) => /yes/i.test(getVal(key, text));

    function extractBlock(text, startIdx) {
        let depth = 0, i = startIdx;
        while (i < text.length) {
            if (text[i] === '{') depth++;
            else if (text[i] === '}') { if (--depth === 0) return text.slice(startIdx + 1, i); }
            i++;
        }
        return '';
    }

    function getBlock(key, text) {
        const rx = new RegExp(`(?:^|\\s)${key}\\s*=\\s*\\{`);
        const m  = rx.exec(text);
        if (!m) return null;
        return extractBlock(text, m.index + m[0].length - 1);
    }

    const treeStart = fileContent.search(/focus_tree\s*=\s*\{/);
    if (treeStart < 0) return null;
    const treeContent = extractBlock(fileContent, fileContent.indexOf('{', treeStart));

    settings.treeId      = getVal('id', treeContent)  || settings.treeId;
    settings.countryTag  = getVal('tag', treeContent) || settings.countryTag;
    settings.defaultTree = getBool('default', treeContent);
    settings.resetOnCivilwar = !(/reset_on_civilwar\s*=\s*no/i.test(treeContent));

    const cfPos = getBlock('continuous_focus_position', treeContent);
    if (cfPos) {
        settings.continuousFocusPosition = true;
        settings.continuousX = parseInt(getVal('x', cfPos)) || 50;
        settings.continuousY = parseInt(getVal('y', cfPos)) || 2740;
    }
    const initPos = getBlock('initial_show_position', treeContent);
    if (initPos) {
        settings.initialShowX = parseInt(getVal('x', initPos)) || 0;
        settings.initialShowY = parseInt(getVal('y', initPos)) || 0;
    }
    settings.sharedFocuses = [...treeContent.matchAll(/shared_focus\s*=\s*(\S+)/g)].map(m => m[1]);

    const focusRx = /\bfocus\s*=\s*\{/g;
    let fm;
    while ((fm = focusRx.exec(treeContent)) !== null) {
        const block = extractBlock(treeContent, treeContent.indexOf('{', fm.index));
        const focus = {};

        focus.id      = getVal('id',   block);
        focus.icon    = getVal('icon', block) || 'GFX_goal_unknown';
        focus.dynamic = getBool('dynamic', block);
        focus.cost    = parseFloat(getVal('cost', block)) || 10;
        focus.x       = parseInt(getVal('x',    block)) || 0;
        focus.y       = parseInt(getVal('y',    block)) || 0;
        focus.relative_position_id = getVal('relative_position_id', block) || null;

        const offsetBlock = getBlock('offset', block);
        focus.offset = offsetBlock
            ? { x: parseInt(getVal('x', offsetBlock)) || 0, y: parseInt(getVal('y', offsetBlock)) || 0 }
            : { x: 0, y: 0 };

        focus.prerequisite = [];
        const preRx = /prerequisite\s*=\s*\{/g;
        let pm;
        while ((pm = preRx.exec(block)) !== null) {
            const pb  = extractBlock(block, block.indexOf('{', pm.index));
            const ids = [...pb.matchAll(/focus\s*=\s*(\S+)/g)].map(m => m[1]);
            if (ids.length === 1) focus.prerequisite.push(ids[0]);
            else if (ids.length > 1) focus.prerequisite.push(ids);
        }

        const mutBlock = getBlock('mutually_exclusive', block);
        focus.mutually_exclusive = mutBlock
            ? [...mutBlock.matchAll(/focus\s*=\s*(\S+)/g)].map(m => m[1]) : [];

        focus.available                = getBlock('available',           block) || '';
        focus.bypass                   = getBlock('bypass',              block) || '';
        focus.bypass_if_unavailable    = getBool('bypass_if_unavailable', block);
        focus.cancel                   = getBlock('cancel',              block) || '';
        focus.allow_branch             = getBlock('allow_branch',        block) || '';
        focus.cancelable               = getBool('cancelable',           block);
        focus.continue_if_invalid      = getBool('continue_if_invalid',  block);
        focus.cancel_if_invalid        = getBool('cancel_if_invalid',    block);
        focus.available_if_capitulated = getBool('available_if_capitulated', block);
        focus.complete_effect          = getBlock('completion_reward',   block) || '';
        focus.select_effect            = getBlock('select_effect',       block) || '';
        focus.ai_will_do               = getBlock('ai_will_do',          block) || '';
        focus.historical_ai            = getBlock('historical_ai',       block) || '';
        focus.text_icon                = getVal('text_icon', block) || '';

        const sfBlock = getBlock('search_filters',      block);
        const wwBlock = getBlock('will_lead_to_war_with', block);
        focus.search_filters       = sfBlock ? sfBlock.match(/\S+/g) || [] : [];
        focus.will_lead_to_war_with = wwBlock ? wwBlock.match(/\S+/g) || [] : [];

        focus.name = focus.id;
        if (focus.id) focuses[focus.id] = focus;
    }

    return { focuses, settings };
}

// ── .yml 파서 (모든 키 저장, 중점 여부 무관) ────────────
function parseLocalisationFile(rawContent) {
    // BOM 제거 + CRLF → LF 정규화
    const fileContent = rawContent.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    const langMatch = fileContent.match(/^l_(\w+)\s*:/m);
    if (!langMatch) return null;
    const lang = langMatch[1];
    if (!appState.localisation[lang]) appState.localisation[lang] = {};

    const result = {};
    // HOI4 yml 형식: " key:0 "value""  (앞에 공백 1개 이상, 따옴표는 " 또는 없을 수도 있음)
    // 패턴: 행 앞 공백 + 키 + :숫자 + 공백 + "값" 또는 값
    const lineRx = /^[ \t]+(\S+?):(\d+)[ \t]+"([^"]*)"/gm;
    let m;
    while ((m = lineRx.exec(fileContent)) !== null) {
        const key   = m[1];
        const value = m[3];
        if (key.endsWith('_desc')) {
            const base = key.slice(0, -5);
            if (!result[base]) result[base] = { name: '', desc: '' };
            result[base].desc = value;
        } else {
            if (!result[key]) result[key] = { name: '', desc: '' };
            result[key].name = value;
        }
    }
    return { lang, data: result };
}

// ── 로컬라이제이션 파일 로더 핸들러 ────────────────────
function handleLocalisationFile(fileContent) {
    const result = parseLocalisationFile(fileContent);
    if (!result) {
        alert('유효한 로컬라이제이션 파일이 아닙니다.\nl_언어코드: 형식으로 시작해야 합니다.');
        return;
    }
    const { lang, data } = result;
    const count = Object.keys(data).length;
    if (!count) { alert('항목을 찾을 수 없습니다.'); return; }

    const existing   = appState.localisation[lang] || {};
    const hasExisting = Object.keys(existing).length > 0;

    const merge = hasExisting &&
        confirm(
            `기존 ${lang} 로컬라이제이션이 있습니다.\n` +
            `[확인] 기존에 합치기 (중복 키는 새 값으로 덮어씀)\n` +
            `[취소] 기존을 지우고 새로 불러오기`
        );

    if (merge) {
        Object.assign(appState.localisation[lang], data);
    } else {
        appState.localisation[lang] = data;
    }

    // 중점과 매칭되는 키 수 계산 (정보 제공용)
    const focusIds  = new Set(Object.keys(appState.focuses));
    const matched   = Object.keys(data).filter(k => focusIds.has(k)).length;
    const unmatched = count - matched;

    appState.isDirty = true;
    alert(
        `${LANG_NAMES[lang] || lang} 로컬라이제이션을 불러왔습니다.\n` +
        `전체 ${count}개 항목 (중점 매칭: ${matched}개, 기타: ${unmatched}개)`
    );
    if (typeof renderLocalisationList === 'function') renderLocalisationList();
}

// ── 불러오기 핸들러 초기화 ──────────────────────────────
function setupFileLoaders() {
    const fileLoaderProject = document.getElementById('file-loader-project');
    const fileLoaderFocus   = document.getElementById('file-loader-focus');
    const fileLoaderLoc     = document.getElementById('file-loader-localisation');

    // 프로젝트 (.zip / .json)
    fileLoaderProject?.addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';

        try {
            if (file.name.endsWith('.zip') && typeof JSZip !== 'undefined') {
                const zip   = await JSZip.loadAsync(await file.arrayBuffer());
                const jsonFile = Object.values(zip.files).find(f => f.name.endsWith('_project.json') || f.name.endsWith('.json'));
                if (!jsonFile) throw new Error('ZIP 안에서 프로젝트 .json 파일을 찾을 수 없습니다.');
                const text = await jsonFile.async('string');
                applyProjectJson(JSON.parse(text));
            } else {
                const text = await file.text();
                applyProjectJson(JSON.parse(text));
            }
        } catch (err) {
            alert('프로젝트 파일을 불러오는 중 오류:\n' + err.message);
        }
    });

    // 중점 파일 (.txt)
    fileLoaderFocus?.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';
        const reader = new FileReader();
        reader.onload = ev => {
            const parsed = parseFocusFile(ev.target.result);
            if (!parsed || !Object.keys(parsed.focuses).length) {
                alert('유효한 중점 블록을 찾을 수 없습니다.\nfocus_tree = { ... } 형식인지 확인해주세요.');
                return;
            }
            const merge = Object.keys(appState.focuses).length > 0 &&
                confirm('기존 중점이 있습니다.\n[확인] 기존에 합치기\n[취소] 기존을 지우고 새로 불러오기');
            if (merge) {
                Object.assign(appState.focuses, parsed.focuses);
            } else {
                appState.focuses = parsed.focuses;
                Object.assign(appState, parsed.settings);
            }
            saveSnapshot('중점 파일 불러오기');
            renderFocusTree();
            alert(`중점 파일을 불러왔습니다. (중점 ${Object.keys(parsed.focuses).length}개)`);
        };
        reader.readAsText(file);
    });

    // 로컬라이제이션 (.yml)
    fileLoaderLoc?.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';
        const reader = new FileReader();
        reader.onload = ev => handleLocalisationFile(ev.target.result);
        reader.readAsText(file, 'utf-8');
    });
}

// ── 프로젝트 JSON 적용 ──────────────────────────────────
function applyProjectJson(proj) {
    if (!proj.focuses) throw new Error('유효하지 않은 프로젝트 파일입니다.');
    const s = proj.settings || {};
    appState.focuses                 = proj.focuses;
    appState.localisation            = proj.localisation || appState.localisation;
    appState.treeId                  = s.treeId                  || 'my_focus_tree';
    appState.countryTag              = s.countryTag              || 'GEN';
    appState.defaultTree             = s.defaultTree             || false;
    appState.sharedFocuses           = s.sharedFocuses           || [];
    appState.continuousFocusPosition = s.continuousFocusPosition || false;
    appState.continuousX             = s.continuousX             || 50;
    appState.continuousY             = s.continuousY             || 2740;
    appState.resetOnCivilwar         = s.resetOnCivilwar !== false;
    appState.initialShowX            = s.initialShowX            || 0;
    appState.initialShowY            = s.initialShowY            || 0;
    saveSnapshot('프로젝트 불러오기');
    renderFocusTree();
    alert(`프로젝트를 불러왔습니다. (중점 ${Object.keys(appState.focuses).length}개)`);
}

// ── 로컬라이제이션 UI ───────────────────────────────────
const LANG_NAMES = {
    english:'영어', korean:'한국어', japanese:'일본어', german:'독일어',
    french:'프랑스어', spanish:'스페인어', russian:'러시아어', polish:'폴란드어',
    braz_por:'브라질 포르투갈어', simp_chinese:'중국어 간체'
};

function exportLocalisation() {
    const lang = document.getElementById('localisation-language')?.value || 'english';
    const loc  = appState.localisation[lang];
    if (!Object.keys(loc || {}).length) { alert('저장된 로컬라이제이션이 없습니다.'); return; }
    // 중점 여부 관계없이 전체 항목 내보내기
    let content = `l_${lang}:\n`;
    Object.entries(loc).forEach(([id, data]) => {
        const name = typeof data === 'object' ? data.name : data;
        const desc = typeof data === 'object' ? data.desc : '';
        content += ` ${id}:0 "${name || ''}"\n`;
        if (desc !== undefined) content += ` ${id}_desc:0 "${desc || ''}"\n`;
    });
    downloadBlob(content, `${appState.countryTag}_focus_l_${lang}.yml`, 'text/yaml;charset=utf-8');
}

function renderLocalisationList() {
    const list    = document.getElementById('localisation-list');
    const langSel = document.getElementById('localisation-language');
    if (!list || !langSel) return;
    const lang    = langSel.value;
    const locData = appState.localisation[lang] || {};
    list.innerHTML = '';

    const focusIds   = new Set(Object.keys(appState.focuses));
    // 중점 매칭 항목: 현재 중점 목록 기준, 로컬라이제이션에 없어도 빈 칸으로 표시
    const matchedKeys   = [...focusIds];
    // 기타 항목: 로컬라이제이션에는 있지만 현재 중점 목록에 없는 키
    const unmatchedKeys = Object.keys(locData).filter(k => !focusIds.has(k));

    function makeItem(id, isMatched) {
        const existing = locData[id];
        const name = typeof existing === 'object' ? existing?.name || '' : (existing || '');
        const desc = typeof existing === 'object' ? existing?.desc || '' : '';

        const item = document.createElement('div');
        item.className = 'localisation-item' + (isMatched ? '' : ' loc-unmatched');
        item.innerHTML = `
            <div class="localisation-item-id">
                ${escapeHtml(id)}
                ${!isMatched ? '<span class="loc-badge">미연결</span>' : ''}
            </div>
            <label class="loc-label">이름</label>
            <input type="text" class="loc-name" value="${escapeHtml(name)}"
                placeholder="${escapeHtml(id)}의 ${LANG_NAMES[lang] || lang} 이름">
            <label class="loc-label" style="margin-top:4px;">설명</label>
            <textarea class="loc-desc" placeholder="설명">${escapeHtml(desc)}</textarea>
            ${!isMatched ? `<button class="loc-delete-btn danger" data-key="${escapeHtml(id)}" title="이 항목 삭제">🗑 삭제</button>` : ''}
        `;
        item.querySelector('.loc-name').addEventListener('input', e => {
            if (!appState.localisation[lang]) appState.localisation[lang] = {};
            const cur = appState.localisation[lang][id];
            appState.localisation[lang][id] = { name: e.target.value, desc: typeof cur === 'object' ? cur?.desc || '' : '' };
            appState.isDirty = true;
        });
        item.querySelector('.loc-desc').addEventListener('input', e => {
            if (!appState.localisation[lang]) appState.localisation[lang] = {};
            const cur = appState.localisation[lang][id];
            appState.localisation[lang][id] = { name: typeof cur === 'object' ? cur?.name || '' : (cur || ''), desc: e.target.value };
            appState.isDirty = true;
        });
        item.querySelector('.loc-delete-btn')?.addEventListener('click', () => {
            if (confirm(`"${id}" 항목을 삭제하시겠습니까?`)) {
                delete appState.localisation[lang][id];
                appState.isDirty = true;
                renderLocalisationList();
            }
        });
        return item;
    }

    // ── 중점 매칭 섹션 ──────────────────────────────────
    if (matchedKeys.length) {
        const header = document.createElement('div');
        header.className   = 'loc-section-header';
        header.textContent = `📌 중점 연결 항목 (${matchedKeys.length}개)`;
        list.appendChild(header);
        matchedKeys.forEach(id => list.appendChild(makeItem(id, true)));
    } else {
        list.innerHTML = '<p class="loc-empty">중점이 없습니다. 먼저 중점을 추가하세요.</p>';
    }

    // ── 기타(미연결) 섹션 ───────────────────────────────
    if (unmatchedKeys.length) {
        const header = document.createElement('div');
        header.className   = 'loc-section-header loc-section-other';
        header.innerHTML   = `📋 기타 항목 (${unmatchedKeys.length}개) <small>— 현재 중점과 연결되지 않은 항목</small>`;
        list.appendChild(header);

        // 접기/펼치기
        const toggle = document.createElement('button');
        toggle.className   = 'secondary loc-toggle-btn';
        toggle.textContent = '펼치기 ▾';
        let expanded = false;
        const otherWrap = document.createElement('div');
        otherWrap.style.display = 'none';
        unmatchedKeys.forEach(id => otherWrap.appendChild(makeItem(id, false)));

        toggle.addEventListener('click', () => {
            expanded = !expanded;
            otherWrap.style.display = expanded ? '' : 'none';
            toggle.textContent = expanded ? '접기 ▴' : '펼치기 ▾';
        });
        list.appendChild(toggle);
        list.appendChild(otherWrap);
    }
}

function setupLocalisationListeners() {
    document.getElementById('localisation-language')
        ?.addEventListener('change', renderLocalisationList);
    document.getElementById('btn-refresh-localisation')
        ?.addEventListener('click', renderLocalisationList);
    document.getElementById('btn-download-localisation')
        ?.addEventListener('click', exportLocalisation);
}
