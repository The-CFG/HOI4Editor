// ════════════════════════════════════════════════════════
//  io-parsers.js — 텍스트 파서 / 빌더 / 공용 유틸
//  의존: 없음 (순수 함수)
// ════════════════════════════════════════════════════════

// ── 공용 유틸 ───────────────────────────────────────────
function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function downloadBlob(content, filename, type = 'text/plain;charset=utf-8') {
    const blob = (content instanceof Blob) ? content : new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}

// ── 파일 유형 감지 ──────────────────────────────────────
function detectFileType(filename, content = '', path = '') {
    const name  = filename.toLowerCase();
    const lpath = path.toLowerCase();
    if (name.endsWith('.yml') || name.endsWith('.yaml')) return 'localisation';
    if (name.endsWith('.gfx')) return 'gfx_define';
    if (name.endsWith('.gui')) return 'gui';
    if (name.endsWith('.txt')) {
        if (content.includes('focus_tree'))       return 'national_focus';
        if (lpath.includes('common/ideas'))       return 'ideas';
        if (lpath.includes('common/decisions'))   return 'decisions';
        if (lpath.includes('common/characters'))  return 'characters';
        if (lpath.includes('common/'))            return 'common_raw';
    }
    return null;
}

// ── 경로 헬퍼 ───────────────────────────────────────────
function suggestPath(type, filename) {
    if (type === 'national_focus') return `common/national_focus/${filename}`;
    if (type === 'ideas')          return `common/ideas/${filename}`;
    if (type === 'decisions')      return `common/decisions/${filename}`;
    if (type === 'characters')     return `common/characters/${filename}`;
    if (type === 'common_raw')     return `common/${filename}`;
    if (type === 'localisation') {
        const m = filename.match(/l_(\w+)/i);
        const lang = m ? m[1].toLowerCase() : 'english';
        return `localisation/${lang}/${filename}`;
    }
    return filename;
}

// ════════════════════════════════════════════════════════
//  국가중점 파서 / 빌더
// ════════════════════════════════════════════════════════
function parseFocusFile(fileContent) {
    const focuses  = {};
    const settings = {
        treeId: 'my_focus_tree', countryTag: 'GEN', defaultTree: false,
        sharedFocuses: [], continuousFocusPosition: false,
        continuousX: 50, continuousY: 2740, resetOnCivilwar: true,
        initialShowX: 0, initialShowY: 0
    };
    const getVal  = (key, text) =>
        (text.match(new RegExp(`(?:^|\\s)${key}\\s*=\\s*(\\S+)`)) || [])[1];
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

    settings.treeId      = getVal('id',  treeContent) || settings.treeId;
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
    settings.sharedFocuses =
        [...treeContent.matchAll(/shared_focus\s*=\s*(\S+)/g)].map(m => m[1]);

    const focusRx = /\bfocus\s*=\s*\{/g;
    let fm;
    while ((fm = focusRx.exec(treeContent)) !== null) {
        const block = extractBlock(treeContent, treeContent.indexOf('{', fm.index));
        const f = {};
        f.id      = getVal('id',   block);
        f.icon    = getVal('icon', block) || 'GFX_goal_unknown';
        f.dynamic = getBool('dynamic', block);
        f.cost    = parseFloat(getVal('cost', block)) || 10;
        f.x       = parseInt(getVal('x', block))  || 0;
        f.y       = parseInt(getVal('y', block))  || 0;
        f.relative_position_id = getVal('relative_position_id', block) || null;

        const ob = getBlock('offset', block);
        f.offset = ob
            ? {
                x: parseInt(getVal('x', ob)) || 0,
                y: parseInt(getVal('y', ob)) || 0,
                trigger: getBlock('trigger', ob) || ''
              }
            : { x: 0, y: 0, trigger: '' };

        f.prerequisite = [];
        const preRx = /prerequisite\s*=\s*\{/g;
        let pm;
        while ((pm = preRx.exec(block)) !== null) {
            const pb  = extractBlock(block, block.indexOf('{', pm.index));
            const ids = [...pb.matchAll(/focus\s*=\s*(\S+)/g)].map(m => m[1]);
            if (ids.length === 1) f.prerequisite.push(ids[0]);
            else if (ids.length > 1) f.prerequisite.push(ids);
        }
        const mb = getBlock('mutually_exclusive', block);
        f.mutually_exclusive = mb
            ? [...mb.matchAll(/focus\s*=\s*(\S+)/g)].map(m => m[1]) : [];

        f.available                = getBlock('available',           block) || '';
        f.bypass                   = getBlock('bypass',              block) || '';
        f.bypass_if_unavailable    = getBool('bypass_if_unavailable', block);
        f.cancel                   = getBlock('cancel',              block) || '';
        f.allow_branch             = getBlock('allow_branch',        block) || '';
        f.cancelable               = getBool('cancelable',           block);
        f.continue_if_invalid      = getBool('continue_if_invalid',  block);
        f.cancel_if_invalid        = getBool('cancel_if_invalid',    block);
        f.available_if_capitulated = getBool('available_if_capitulated', block);
        f.complete_effect          = getBlock('completion_reward',   block) || '';
        f.select_effect            = getBlock('select_effect',       block) || '';
        f.ai_will_do               = getBlock('ai_will_do',          block) || '';
        f.historical_ai            = getBlock('historical_ai',       block) || '';
        f.text_icon                = getVal('text_icon', block) || '';

        const sfb = getBlock('search_filters',        block);
        const wwb = getBlock('will_lead_to_war_with', block);
        f.search_filters        = sfb ? sfb.match(/\S+/g) || [] : [];
        f.will_lead_to_war_with = wwb ? wwb.match(/\S+/g) || [] : [];

        f.name = f.id;
        if (f.id) focuses[f.id] = f;
    }
    return { focuses, settings };
}

function buildFocusTxt(fileData) {
    const { settings: s, focuses } = fileData;
    const fb = (key, content, indent = 2) => {
        if (!content?.trim()) return '';
        const t = '\t'.repeat(indent), ti = '\t'.repeat(indent + 1);
        // 기존 들여쓰기를 제거(dedent)한 뒤 ti로 재적용
        const dedented = content.split('\n')
            .map(l => l.replace(/^[\t ]+/, ''))
            .join('\n')
            .trim();
        return `${t}${key} = {\n${ti}${dedented.replace(/\n/g, '\n' + ti)}\n${t}}\n`;
    };
    const fBool = (key, val, indent = 2) => val ? '\t'.repeat(indent) + `${key} = yes\n` : '';

    let out = `focus_tree = {\n\tid = ${s.treeId}\n`;
    if (s.defaultTree) out += `\tdefault = yes\n`;
    out += `\tcountry = {\n\t\tfactor = 0\n\t\tmodifier = {\n\t\t\tadd = 10\n\t\t\ttag = ${s.countryTag}\n\t\t}\n\t}\n`;
    if (s.continuousFocusPosition)
        out += `\tcontinuous_focus_position = { x = ${s.continuousX} y = ${s.continuousY} }\n`;
    if (!s.resetOnCivilwar) out += `\treset_on_civilwar = no\n`;
    if (s.initialShowX || s.initialShowY)
        out += `\tinitial_show_position = {\n\t\tx = ${s.initialShowX}\n\t\ty = ${s.initialShowY}\n\t}\n`;
    s.sharedFocuses.forEach(sf => { out += `\tshared_focus = ${sf}\n`; });
    out += '\n';

    Object.values(focuses).forEach(f => {
        out += `\tfocus = {\n`;
        out += `\t\tid = ${f.id}\n\t\ticon = ${f.icon}\n`;
        if (f.dynamic) out += `\t\tdynamic = yes\n`;
        out += `\t\tcost = ${f.cost}\n`;
        (f.prerequisite || []).forEach(item => {
            out += Array.isArray(item)
                ? `\t\tprerequisite = { ${item.map(p => `focus = ${p}`).join(' ')} }\n`
                : `\t\tprerequisite = { focus = ${item} }\n`;
        });
        if (f.mutually_exclusive?.length)
            out += `\t\tmutually_exclusive = { ${f.mutually_exclusive.map(p => `focus = ${p}`).join(' ')} }\n`;
        if (f.relative_position_id) out += `\t\trelative_position_id = ${f.relative_position_id}\n`;
        out += `\t\tx = ${f.x}\n\t\ty = ${f.y}\n`;
        if (f.offset?.x || f.offset?.y || f.offset?.trigger?.trim()) {
            out += `\t\toffset = {\n`;
            out += `\t\t\tx = ${f.offset?.x || 0}\n`;
            out += `\t\t\ty = ${f.offset?.y || 0}\n`;
            if (f.offset?.trigger?.trim()) {
                const trigDedented = f.offset.trigger.split('\n').map(l => l.replace(/^[\t ]+/, '')).join('\n').trim();
                out += `\t\t\ttrigger = {\n\t\t\t\t${trigDedented.replace(/\n/g, '\n\t\t\t\t')}\n\t\t\t}\n`;
            }
            out += `\t\t}\n`;
        }
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

// ════════════════════════════════════════════════════════
//  로컬라이제이션 파서 / 빌더
// ════════════════════════════════════════════════════════
function parseLocalisationFile(rawContent, filename = '') {
    const fc = rawContent.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    let lang = '';
    const nm = filename.match(/l_(\w+)/i);
    if (nm) lang = nm[1].toLowerCase();
    else {
        const hm = fc.match(/^l_(\w+)\s*:/m);
        if (hm) lang = hm[1].toLowerCase();
    }
    if (!lang) return null;
    const data = {};
    const rx = /^[ \t]+(\S+?):(\d+)[ \t]+"([^"]*)"/gm;
    let m;
    while ((m = rx.exec(fc)) !== null) {
        const key = m[1], val = m[3];
        if (key.endsWith('_desc')) {
            const base = key.slice(0, -5);
            if (!data[base]) data[base] = { name: '', desc: '' };
            data[base].desc = val;
        } else {
            if (!data[key]) data[key] = { name: '', desc: '' };
            data[key].name = val;
        }
    }
    return { lang, data };
}

function buildLocYml(fileData) {
    const { lang, data } = fileData;
    let out = `l_${lang}:\n`;
    Object.entries(data).forEach(([id, entry]) => {
        const name = typeof entry === 'object' ? entry.name || '' : entry || '';
        const desc = typeof entry === 'object' ? entry.desc || '' : '';
        out += ` ${id}:0 "${name}"\n`;
        out += ` ${id}_desc:0 "${desc}"\n`;
    });
    return out;
}

// ════════════════════════════════════════════════════════
//  GFX 파서 / 빌더
// ════════════════════════════════════════════════════════
function parseGfxFile(content) {
    const sprites = [];
    function extractBlock(text, openIdx) {
        let depth = 0, i = openIdx;
        while (i < text.length) {
            if (text[i] === '{') depth++;
            else if (text[i] === '}') { if (--depth === 0) return text.slice(openIdx + 1, i); }
            i++;
        }
        return '';
    }
    const blockRx = /\b(\w*[Ss]priteType)\s*=\s*\{/g;
    let m;
    while ((m = blockRx.exec(content)) !== null) {
        const block   = extractBlock(content, content.indexOf('{', m.index));
        const nameM   = block.match(/\bname\s*=\s*"([^"]+)"/);
        const texM    = block.match(/\btexturefile\s*=\s*"([^"]+)"/);
        if (!nameM || !texM) continue;
        const framesM = block.match(/\bnoOfFrames\s*=\s*(\d+)/);
        sprites.push({
            name:        nameM[1],
            texturefile: texM[1],
            noOfFrames:  framesM ? parseInt(framesM[1]) : 1,
        });
    }
    return sprites;
}

function buildGfxFile(fileData) {
    const sprites = fileData.sprites || [];
    let out = 'spriteTypes = {\n';
    sprites.forEach(s => {
        out += `\tspriteType = {\n`;
        out += `\t\tname = "${s.name}"\n`;
        out += `\t\ttexturefile = "${s.texturefile}"\n`;
        if (s.noOfFrames && s.noOfFrames > 1)
            out += `\t\tnoOfFrames = ${s.noOfFrames}\n`;
        out += `\t}\n`;
    });
    out += '}\n';
    return out;
}

// ── 단일 파일 파싱 공용 함수 ─────────────────────────────
function parseSingleFile(content, filename, path = '') {
    const type = detectFileType(filename, content, path || filename);
    if (!type) return null;
    if (type === 'national_focus') {
        const parsed = parseFocusFile(content);
        if (!parsed) return null;
        return { type, ...parsed };
    }
    if (type === 'localisation') {
        const parsed = parseLocalisationFile(content, filename);
        if (!parsed) return null;
        return { type, lang: parsed.lang, data: parsed.data };
    }
    if (type === 'gfx_define') {
        return { type, sprites: parseGfxFile(content) };
    }
    if (type === 'gui') {
        return { type, raw: content };
    }
    if (type === 'ideas' || type === 'decisions' || type === 'characters' || type === 'common_raw') {
        return { type, raw: content };
    }
    return null;
}

// ── v1 → v2 마이그레이션 ────────────────────────────────
function migrateV1Project(v1) {
    const tag  = v1.settings?.countryTag || 'GEN';
    const name = v1.settings?.countryTag || 'MyMod';
    const files = {};
    if (v1.focuses && Object.keys(v1.focuses).length) {
        files[`common/national_focus/${tag}_focus.txt`] = {
            type: 'national_focus', settings: v1.settings || {}, focuses: v1.focuses
        };
    }
    if (v1.localisation) {
        Object.entries(v1.localisation).forEach(([lang, data]) => {
            if (!Object.keys(data).length) return;
            files[`localisation/${lang}/${tag}_l_${lang}.yml`] = { type: 'localisation', lang, data };
        });
    }
    return { name, files };
}
