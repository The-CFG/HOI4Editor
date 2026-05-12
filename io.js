// ════════════════════════════════════════════════════════
//  io.js — 파서 / 빌더 / ZIP 전담 (UI 없음)
//  의존: state.js
// ════════════════════════════════════════════════════════

// ── 공용 유틸 ───────────────────────────────────────────
function downloadBlob(content, filename, type = 'text/plain;charset=utf-8') {
    const blob = (content instanceof Blob) ? content : new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}

// ── 파일 유형 감지 ──────────────────────────────────────
// path: 전체 상대 경로 (relPath). filename: 파일명만
function detectFileType(filename, content = '', path = '') {
    const name = filename.toLowerCase();
    const lpath = path.toLowerCase();

    if (name.endsWith('.yml') || name.endsWith('.yaml')) return 'localisation';

    if (name.endsWith('.txt')) {
        if (content.includes('focus_tree'))            return 'national_focus';
        if (lpath.includes('common/ideas'))            return 'ideas';
        if (lpath.includes('common/decisions'))        return 'decisions';
        if (lpath.includes('common/characters'))       return 'characters';
        // 기타 common/ 하위 txt → common_raw (원시 텍스트)
        if (lpath.includes('common/'))                 return 'common_raw';
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
//  국가중점 파서
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
            ? { x: parseInt(getVal('x', ob)) || 0, y: parseInt(getVal('y', ob)) || 0 }
            : { x: 0, y: 0 };

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

        const sfb = getBlock('search_filters',       block);
        const wwb = getBlock('will_lead_to_war_with', block);
        f.search_filters        = sfb ? sfb.match(/\S+/g) || [] : [];
        f.will_lead_to_war_with = wwb ? wwb.match(/\S+/g) || [] : [];

        f.name = f.id;
        if (f.id) focuses[f.id] = f;
    }
    return { focuses, settings };
}

// ── 국가중점 빌더 ───────────────────────────────────────
function buildFocusTxt(fileData) {
    const { settings: s, focuses } = fileData;
    const fb = (key, content, indent = 2) => {
        if (!content?.trim()) return '';
        const t = '\t'.repeat(indent), ti = '\t'.repeat(indent + 1);
        return `${t}${key} = {\n${ti}${content.trim().replace(/\n/g, '\n' + ti)}\n${t}}\n`;
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
//  ZIP 패킹 / 언패킹
// ════════════════════════════════════════════════════════
async function packProjectZip() {
    if (typeof JSZip === 'undefined') return null;
    const zip  = new JSZip();
    const root = appState.project.name || 'hoi4_mod';

    // 각 파일을 바닐라 형식으로 저장 (메타 JSON 없이 순수 모드 파일만 포함)
    Object.entries(appState.project.files).forEach(([path, fd]) => {
        try {
            if (fd.type === 'national_focus')
                zip.file(`${root}/${path}`, buildFocusTxt(fd));
            else if (fd.type === 'localisation')
                zip.file(`${root}/${path}`, buildLocYml(fd));
            else if (fd.type === 'dds' && fd.base64) {
                const bytes = Uint8Array.from(atob(fd.base64), c => c.charCodeAt(0));
                zip.file(`${root}/${path}`, bytes, { binary: true });
            } else if (fd.type === 'image' && fd.base64) {
                const bytes = Uint8Array.from(atob(fd.base64), c => c.charCodeAt(0));
                zip.file(`${root}/${path}`, bytes, { binary: true });
            } else if (fd.type === 'gfx_define')
                zip.file(`${root}/${path}`, buildGfxFile(fd));
            else if (fd.type === 'gui' && fd.raw != null)
                zip.file(`${root}/${path}`, fd.raw);
            else if (fd.raw != null)
                // ideas / decisions / characters / common_raw — 원시 텍스트 저장
                zip.file(`${root}/${path}`, fd.raw);
        } catch(e) { console.warn('pack error', path, e); }
    });

    return zip.generateAsync({ type: 'blob' });
}

async function unpackProjectZip(arrayBuffer) {
    if (typeof JSZip === 'undefined') throw new Error('JSZip 라이브러리가 없습니다.');
    const zip = await JSZip.loadAsync(arrayBuffer);

    // v1 레거시: 구버전 _project.json이 포함된 ZIP 호환 (마이그레이션)
    const oldMeta = Object.values(zip.files)
        .find(f => f.name.endsWith('_project.json') || f.name.endsWith('_hoi4editor_project.json'));
    if (oldMeta) {
        const json = JSON.parse(await oldMeta.async('string'));
        if (json.version === 2) return json;
        return migrateV1Project(json);
    }

    // 표준: 파일 구조 직접 파싱 (메타 JSON 없이 순수 모드 파일만 있는 ZIP)
    const project = { name: '', files: {} };
    const rootFolder = zip.files[Object.keys(zip.files)[0]]?.name.split('/')[0] || 'mod';
    project.name = rootFolder;

    for (const [zipPath, zipFile] of Object.entries(zip.files)) {
        if (zipFile.dir) continue;
        const relPath  = zipPath.replace(rootFolder + '/', '');
        const filename = relPath.split('/').pop().toLowerCase();

        if (filename.endsWith('.dds')) {
            const buf    = await zipFile.async('arraybuffer');
            const base64 = _arrayBufferToBase64Io(buf);
            project.files[relPath] = { type: 'dds', base64, filename };
            continue;
        }
        const _imgExts = ['.png','.jpg','.jpeg','.bmp','.tga'];
        if (_imgExts.some(e => filename.endsWith(e))) {
            const buf    = await zipFile.async('arraybuffer');
            const base64 = _arrayBufferToBase64Io(buf);
            project.files[relPath] = { type: 'image', base64, filename };
            continue;
        }
        if (filename.endsWith('.gfx')) {
            const content = await zipFile.async('string');
            project.files[relPath] = { type: 'gfx_define', sprites: parseGfxFile(content) };
            continue;
        }
        if (filename.endsWith('.gui')) {
            const content = await zipFile.async('string');
            project.files[relPath] = { type: 'gui', raw: content };
            continue;
        }

        const content = await zipFile.async('string');
        const type = detectFileType(filename, content, relPath);
        if (!type) continue;

        if (type === 'national_focus') {
            const parsed = parseFocusFile(content);
            if (parsed) project.files[relPath] = { type, ...parsed };
        } else if (type === 'localisation') {
            const parsed = parseLocalisationFile(content, filename);
            if (parsed) project.files[relPath] = { type, lang: parsed.lang, data: parsed.data };
        } else {
            // ideas / decisions / characters / raw_text 등 모든 텍스트 → 원시 보존
            project.files[relPath] = { type, raw: content };
        }
    }
    return project;
}

// v1 → v2 마이그레이션
function migrateV1Project(v1) {
    const tag  = v1.settings?.countryTag || 'GEN';
    const name = v1.settings?.countryTag || 'MyMod';
    const files = {};

    if (v1.focuses && Object.keys(v1.focuses).length) {
        files[`common/national_focus/${tag}_focus.txt`] = {
            type: 'national_focus',
            settings: v1.settings || {},
            focuses: v1.focuses
        };
    }
    if (v1.localisation) {
        Object.entries(v1.localisation).forEach(([lang, data]) => {
            if (!Object.keys(data).length) return;
            files[`localisation/${lang}/${tag}_l_${lang}.yml`] = {
                type: 'localisation', lang, data
            };
        });
    }
    return { name, files };
}

// ════════════════════════════════════════════════════════
//  GFX 스프라이트 파서 / 빌더
// ════════════════════════════════════════════════════════

// .gfx 파일 → sprites 배열 [{ name, texturefile }]
function parseGfxFile(content) {
    const sprites = [];
    const blockRx = /spriteType\s*=\s*\{([^}]*)\}/g;
    let m;
    while ((m = blockRx.exec(content)) !== null) {
        const block = m[1];
        const nameM    = block.match(/name\s*=\s*"([^"]+)"/);
        const texM     = block.match(/texturefile\s*=\s*"([^"]+)"/);
        if (nameM && texM) {
            sprites.push({ name: nameM[1], texturefile: texM[1] });
        }
    }
    return sprites;
}

// sprites 배열 → .gfx 텍스트
function buildGfxFile(fileData) {
    const sprites = fileData.sprites || [];
    let out = 'spriteTypes = {\n';
    sprites.forEach(s => {
        out += `\tspriteType = {\n`;
        out += `\t\tname = "${s.name}"\n`;
        out += `\t\ttexturefile = "${s.texturefile}"\n`;
        out += `\t}\n`;
    });
    out += '}\n';
    return out;
}

// GFX ID → base64 dataURL (중점 트리 아이콘 표시용)
// 전체 프로젝트 파일을 순회해 spriteType 정의 → texturefile → DDS base64
function resolveGfxIcon(gfxId) {
    if (!gfxId || gfxId === 'GFX_goal_unknown') return null;
    // 모든 gfx_define 파일에서 name 일치하는 sprite 탐색
    for (const fd of Object.values(appState.project.files)) {
        if (fd.type !== 'gfx_define') continue;
        const sprite = (fd.sprites || []).find(s => s.name === gfxId);
        if (!sprite) continue;
        // texturefile 경로로 DDS 파일 찾기
        const texPath = sprite.texturefile.replace(/\\/g, '/');
        const ddsFile = appState.project.files[texPath];
        if (ddsFile?.type === 'dds' && ddsFile.base64) {
            return _ddsBase64ToDataUrl(ddsFile.base64);
        }
    }
    return null;
}

// DDS base64 → PNG dataURL (Canvas 변환)
// DDS는 브라우저가 직접 렌더링 불가 → RGBA raw 픽셀을 Canvas에 그려 PNG로 변환
function _ddsBase64ToDataUrl(base64) {
    try {
        // ── base64 → Uint8Array (atob 스택 오버플로우 방지) ──
        const b64clean = base64.replace(/^data:[^;]+;base64,/, '');
        const bstr     = atob(b64clean);
        const bytes    = new Uint8Array(bstr.length);
        for (let i = 0; i < bstr.length; i++) bytes[i] = bstr.charCodeAt(i);

        const view = new DataView(bytes.buffer);

        // DDS 매직 검증
        if (view.getUint32(0, true) !== 0x20534444) {
            console.warn('DDS: 잘못된 매직 바이트');
            return null;
        }

        const height  = view.getUint32(12, true);
        const width   = view.getUint32(16, true);
        const pfFlags = view.getUint32(80, true);
        const fourCC  = view.getUint32(84, true);

        // DX10 확장 헤더 여부 (FourCC = 'DX10')
        const isDX10  = fourCC === 0x30315844;
        // 표준 헤더 128B + DX10 확장 20B
        let dataOffset = isDX10 ? 148 : 128;

        const isDXT1  = fourCC === 0x31545844; // BC1
        const isDXT3  = fourCC === 0x33545844; // BC2
        const isDXT5  = fourCC === 0x35545844; // BC3
        // pfFlags bit3 = RGB, bit6 = RGBA uncompressed
        const isUncompressed = !!(pfFlags & 0x40) || !!(pfFlags & 0x04);

        let rgba;
        if (isDXT1) {
            rgba = _decodeDXT1(bytes.subarray(dataOffset), width, height);
        } else if (isDXT5 || isDX10) {
            rgba = _decodeDXT5(bytes.subarray(dataOffset), width, height);
        } else if (isDXT3) {
            // BC2: alpha를 4bit×16pixel 명시, color은 DXT1과 동일
            rgba = _decodeDXT3(bytes.subarray(dataOffset), width, height);
        } else if (isUncompressed) {
            const bpp = view.getUint32(88, true); // bitCount
            if (bpp === 32) rgba = _decodeBGRA32(bytes.subarray(dataOffset), width, height);
            else if (bpp === 24) rgba = _decodeBGR24(bytes.subarray(dataOffset), width, height);
            else { console.warn('DDS: 지원하지 않는 비압축 BPP:', bpp); return null; }
        } else {
            console.warn('DDS: 지원하지 않는 형식. fourCC=0x' + fourCC.toString(16));
            return null;
        }
        if (!rgba) return null;

        const canvas  = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        const ctx     = canvas.getContext('2d');
        const imgData = ctx.createImageData(width, height);
        imgData.data.set(rgba);
        ctx.putImageData(imgData, 0, 0);
        return canvas.toDataURL('image/png');
    } catch(e) {
        console.warn('DDS decode error:', e);
        return null;
    }
}

// ── DXT1 (BC1) 디코더 ────────────────────────────────────
function _decodeDXT1(data, w, h) {
    const out = new Uint8Array(w * h * 4);
    let src = 0;
    for (let by = 0; by < Math.ceil(h / 4); by++) {
        for (let bx = 0; bx < Math.ceil(w / 4); bx++) {
            const c0 = data[src] | (data[src+1] << 8); src += 2;
            const c1 = data[src] | (data[src+1] << 8); src += 2;
            const codes = (data[src]) | (data[src+1]<<8) | (data[src+2]<<16) | (data[src+3]<<24); src += 4;
            const cols = _dxtColors(c0, c1, false);
            for (let py = 0; py < 4; py++) {
                for (let px = 0; px < 4; px++) {
                    const x = bx*4+px, y = by*4+py;
                    if (x >= w || y >= h) continue;
                    const ci = (codes >> ((py*4+px)*2)) & 3;
                    const o  = (y*w+x)*4;
                    out[o]=cols[ci*4]; out[o+1]=cols[ci*4+1]; out[o+2]=cols[ci*4+2]; out[o+3]=cols[ci*4+3];
                }
            }
        }
    }
    return out;
}

// ── DXT3 (BC2) 디코더 ────────────────────────────────────
function _decodeDXT3(data, w, h) {
    const out = new Uint8Array(w * h * 4);
    let src = 0;
    for (let by = 0; by < Math.ceil(h / 4); by++) {
        for (let bx = 0; bx < Math.ceil(w / 4); bx++) {
            // 4bit alpha per pixel (8 bytes)
            const abytes = data.subarray(src, src+8); src += 8;
            const c0 = data[src] | (data[src+1]<<8); src+=2;
            const c1 = data[src] | (data[src+1]<<8); src+=2;
            const codes = data[src]|(data[src+1]<<8)|(data[src+2]<<16)|(data[src+3]<<24); src+=4;
            const cols = _dxtColors(c0, c1, true);
            for (let py = 0; py < 4; py++) {
                for (let px = 0; px < 4; px++) {
                    const x = bx*4+px, y = by*4+py;
                    if (x>=w||y>=h) continue;
                    const pi = py*4+px;
                    const ci = (codes >> (pi*2)) & 3;
                    // 4bit alpha: 2 pixels per byte
                    const aByte = abytes[Math.floor(pi/2)];
                    const a4    = (pi%2===0) ? (aByte&0xF) : (aByte>>4);
                    const o     = (y*w+x)*4;
                    out[o]=cols[ci*4]; out[o+1]=cols[ci*4+1]; out[o+2]=cols[ci*4+2];
                    out[o+3] = (a4 * 17); // 0-15 → 0-255
                }
            }
        }
    }
    return out;
}

// ── DXT5 (BC3) 디코더 ────────────────────────────────────
function _decodeDXT5(data, w, h) {
    const out = new Uint8Array(w * h * 4);
    let src = 0;
    for (let by = 0; by < Math.ceil(h / 4); by++) {
        for (let bx = 0; bx < Math.ceil(w / 4); bx++) {
            const a0 = data[src++], a1 = data[src++];
            const abits = [data[src++],data[src++],data[src++],data[src++],data[src++],data[src++]];
            const alphas = _dxtAlphas(a0, a1);
            const c0 = data[src] | (data[src+1]<<8); src+=2;
            const c1 = data[src] | (data[src+1]<<8); src+=2;
            const codes = data[src]|(data[src+1]<<8)|(data[src+2]<<16)|(data[src+3]<<24); src+=4;
            const cols = _dxtColors(c0, c1, true);
            for (let py = 0; py < 4; py++) {
                for (let px = 0; px < 4; px++) {
                    const x = bx*4+px, y = by*4+py;
                    if (x>=w||y>=h) continue;
                    const pi = py*4+px;
                    const ci = (codes >> (pi*2)) & 3;
                    const ai = _dxtAlphaIdx(abits, pi);
                    const o  = (y*w+x)*4;
                    out[o]=cols[ci*4]; out[o+1]=cols[ci*4+1]; out[o+2]=cols[ci*4+2]; out[o+3]=alphas[ai];
                }
            }
        }
    }
    return out;
}

// ── 색상 팔레트 생성 (RGB565 → RGBA8888) ─────────────────
// DDS pixel 순서: B-G-R (little-endian RGB565)
// RGB565: bit15-11=R, bit10-5=G, bit4-0=B
function _dxtColors(c0, c1, forceAlpha) {
    // RGB565 디코딩 (R=bit[15:11], G=bit[10:5], B=bit[4:0])
    const r0=((c0>>11)&31)*255/31|0, g0=((c0>>5)&63)*255/63|0, b0=(c0&31)*255/31|0;
    const r1=((c1>>11)&31)*255/31|0, g1=((c1>>5)&63)*255/63|0, b1=(c1&31)*255/31|0;
    const c = new Uint8Array(16);
    // col0
    c[0]=r0; c[1]=g0; c[2]=b0; c[3]=255;
    // col1
    c[4]=r1; c[5]=g1; c[6]=b1; c[7]=255;
    if (!forceAlpha && c0 <= c1) {
        // 1-bit alpha mode
        c[8]=(r0+r1+1)>>1; c[9]=(g0+g1+1)>>1; c[10]=(b0+b1+1)>>1; c[11]=255;
        c[12]=0; c[13]=0; c[14]=0; c[15]=0; // transparent
    } else {
        c[8]=(2*r0+r1)/3|0; c[9]=(2*g0+g1)/3|0; c[10]=(2*b0+b1)/3|0; c[11]=255;
        c[12]=(r0+2*r1)/3|0; c[13]=(g0+2*g1)/3|0; c[14]=(b0+2*b1)/3|0; c[15]=255;
    }
    return c;
}

function _dxtAlphas(a0, a1) {
    const a = new Uint8Array(8);
    a[0]=a0; a[1]=a1;
    if (a0 > a1) {
        for (let i = 1; i <= 6; i++) a[i+1] = ((7-i)*a0 + i*a1) / 7 | 0;
    } else {
        for (let i = 1; i <= 4; i++) a[i+1] = ((5-i)*a0 + i*a1) / 5 | 0;
        a[6]=0; a[7]=255;
    }
    return a;
}

function _dxtAlphaIdx(abits, pi) {
    const bitOff  = pi * 3;
    const byteOff = bitOff >> 3;
    const bitShift = bitOff & 7;
    const word = (abits[byteOff] | (abits[byteOff+1]<<8) | (abits[byteOff+2]<<16));
    return (word >> bitShift) & 7;
}

// ── 비압축 BGRA32 디코더 ─────────────────────────────────
function _decodeBGRA32(data, w, h) {
    const out = new Uint8Array(w * h * 4);
    for (let i = 0; i < w * h; i++) {
        const s = i * 4;
        out[s]   = data[s+2]; // R ← B 위치의 값 (DDS는 B,G,R,A 순)
        out[s+1] = data[s+1]; // G
        out[s+2] = data[s];   // B ← R 위치
        out[s+3] = data[s+3]; // A
    }
    return out;
}

// ── 비압축 BGR24 디코더 ──────────────────────────────────
function _decodeBGR24(data, w, h) {
    const out = new Uint8Array(w * h * 4);
    for (let i = 0; i < w * h; i++) {
        const s = i * 3, o = i * 4;
        out[o]   = data[s+2]; // R
        out[o+1] = data[s+1]; // G
        out[o+2] = data[s];   // B
        out[o+3] = 255;
    }
    return out;
}

// ── 비압축 BGRA fallback ─────────────────────────────────
function _decodeBGRA(data, w, h) {
    const out = new Uint8Array(w * h * 4);
    for (let i = 0; i < w * h; i++) {
        out[i*4]   = data[i*4+2]; // R
        out[i*4+1] = data[i*4+1]; // G
        out[i*4+2] = data[i*4];   // B
        out[i*4+3] = data[i*4+3]; // A
    }
    return out;
}

// ── ArrayBuffer → base64 헬퍼 (ZIP 언패킹용) ────────────
function _arrayBufferToBase64Io(buf) {
    const bytes = new Uint8Array(buf);
    let binary = '';
    const chunk = 8192;
    for (let i = 0; i < bytes.length; i += chunk)
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    return btoa(binary);
}

// ── 단일 파일 파싱 (탐색기·편집기 공용) ─────────────────
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
    if (type === 'ideas' || type === 'decisions' || type === 'characters' || type === 'common_raw') {
        return { type, raw: content };
    }
    return null;
}
