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
// .dds/.png/.jpg/.gfx/.gui 는 unpackProjectZip에서 먼저 처리하므로 여기선 텍스트만 다룸
function detectFileType(filename, content = '', path = '') {
    const name  = filename.toLowerCase();
    const lpath = path.toLowerCase();

    // ── 이미 별도 처리되는 바이너리/특수 형식 ───────────
    if (name.endsWith('.yml') || name.endsWith('.yaml')) return 'localisation';
    if (name.endsWith('.gfx')) return 'gfx_define';
    if (name.endsWith('.gui')) return 'gui';
    if (name.endsWith('.dds')) return 'dds';
    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') ||
        name.endsWith('.bmp') || name.endsWith('.tga')) return 'image';

    // ── 국가중점 / common 특수 폴더 ─────────────────────
    if (name.endsWith('.txt')) {
        if (content.includes('focus_tree'))           return 'national_focus';
        if (lpath.includes('common/ideas'))           return 'ideas';
        if (lpath.includes('common/decisions'))       return 'decisions';
        if (lpath.includes('common/characters'))      return 'characters';
    }

    // ── 나머지 모든 텍스트성 파일 → raw_text ────────────
    // HOI4 모드가 사용하는 텍스트 확장자를 전부 포괄
    const TEXT_EXTS = [
        '.txt', '.mod', '.cfg', '.lua', '.csv',
        '.asset', '.settings', '.pdx', '.info', '.shader',
    ];
    if (TEXT_EXTS.some(e => name.endsWith(e))) return 'raw_text';

    return null;   // 진짜 바이너리 등 — 스킵
}

// ── 경로 헬퍼 ───────────────────────────────────────────
function suggestPath(type, filename) {
    if (type === 'national_focus') return `common/national_focus/${filename}`;
    if (type === 'ideas')          return `common/ideas/${filename}`;
    if (type === 'decisions')      return `common/decisions/${filename}`;
    if (type === 'characters')     return `common/characters/${filename}`;
    if (type === 'localisation') {
        const m = filename.match(/l_(\w+)/i);
        const lang = m ? m[1].toLowerCase() : 'english';
        return `localisation/${lang}/${filename}`;
    }
    // raw_text: 파일명 그대로 (descriptor.mod 등은 루트)
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

    // 프로젝트 메타 (재불러오기용)
    zip.file(`${root}/_hoi4editor_project.json`, JSON.stringify({
        version: 2,
        name: appState.project.name,
        files: appState.project.files
    }, null, 2));

    // 각 파일을 바닐라 형식으로 저장
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

    // v2: _hoi4editor_project.json 우선
    const metaFile = Object.values(zip.files)
        .find(f => f.name.endsWith('_hoi4editor_project.json'));
    if (metaFile) {
        const json = JSON.parse(await metaFile.async('string'));
        if (json.version === 2) return json;
    }

    // v1: 기존 _project.json 호환
    const oldMeta = Object.values(zip.files)
        .find(f => f.name.endsWith('_project.json'));
    if (oldMeta) {
        const json = JSON.parse(await oldMeta.async('string'));
        return migrateV1Project(json);
    }

    // 메타 없음: 파일 구조 직접 파싱
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
    for (const fd of Object.values(appState.project.files)) {
        if (fd.type !== 'gfx_define') continue;
        const sprite = (fd.sprites || []).find(s => s.name === gfxId);
        if (!sprite) continue;
        const texPath = sprite.texturefile.replace(/\\/g, '/');
        const texFile = appState.project.files[texPath];
        if (!texFile?.base64) continue;
        if (texFile.type === 'dds') return _ddsBase64ToDataUrl(texFile.base64);
        if (texFile.type === 'image') {
            const ext = texPath.split('.').pop().toLowerCase();
            return _imageBase64ToDataUrl(texFile.base64, ext);
        }
    }
    return null;
}

// ── image type → dataURL 통합 헬퍼 ─────────────────────
// PNG/JPG/BMP: 브라우저 직접 표시. TGA: Canvas 디코딩.
function _imageBase64ToDataUrl(base64, ext) {
    if (ext === 'tga') return _tgaBase64ToDataUrl(base64);
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
               : ext === 'bmp' ? 'image/bmp'
               : 'image/png';
    return `data:${mime};base64,${base64}`;
}

// ════════════════════════════════════════════════════════
//  TGA 디코더  base64 → PNG dataURL
//  지원: Type 2 (비압축 RGB/RGBA), Type 10 (RLE RGB/RGBA)
//  원점: 좌하단(기본) / 좌상단(ImageDescriptor bit5) 모두 처리
// ════════════════════════════════════════════════════════
function _tgaBase64ToDataUrl(base64) {
    try {
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

        // ── TGA 헤더 파싱 (18바이트) ──────────────────────
        const idLength      = bytes[0];          // 이미지 ID 길이
        // bytes[1]: 컬러맵 타입 (0 = 없음)
        const imageType     = bytes[2];          // 2=비압축RGB, 10=RLE RGB
        // bytes[3..7]: 컬러맵 정보 (사용 안 함)
        // bytes[8..9]: X 원점
        // bytes[10..11]: Y 원점
        const width  = bytes[12] | (bytes[13] << 8);
        const height = bytes[14] | (bytes[15] << 8);
        const bpp    = bytes[16];                // 비트/픽셀: 24 또는 32
        const imgDesc = bytes[17];               // bit5=1 → 원점 좌상단

        if (width === 0 || height === 0) return null;
        if (bpp !== 24 && bpp !== 32) return null;   // 16bpp 등 미지원
        if (imageType !== 2 && imageType !== 10) return null; // 컬러맵/흑백 미지원

        const bytesPerPixel = bpp >> 3;          // 3 or 4
        const originTop     = (imgDesc & 0x20) !== 0; // bit5: 행 저장 방향

        // 컬러맵/이미지 ID 건너뜀 → 픽셀 데이터 시작 오프셋
        let src = 18 + idLength;

        // ── 픽셀 읽기 (BGRA → RGBA 변환 포함) ────────────
        const pixels = new Uint8Array(width * height * 4);

        if (imageType === 2) {
            // Type 2: 비압축
            for (let i = 0; i < width * height; i++) {
                const b = bytes[src++], g = bytes[src++], r = bytes[src++];
                const a = bytesPerPixel === 4 ? bytes[src++] : 255;
                pixels[i * 4]     = r;
                pixels[i * 4 + 1] = g;
                pixels[i * 4 + 2] = b;
                pixels[i * 4 + 3] = a;
            }
        } else {
            // Type 10: RLE 압축
            let i = 0;
            while (i < width * height) {
                const pkt = bytes[src++];
                const count = (pkt & 0x7F) + 1;
                if (pkt & 0x80) {
                    // Run-length 패킷 — 같은 픽셀 반복
                    const b = bytes[src++], g = bytes[src++], r = bytes[src++];
                    const a = bytesPerPixel === 4 ? bytes[src++] : 255;
                    for (let k = 0; k < count; k++, i++) {
                        pixels[i * 4]     = r;
                        pixels[i * 4 + 1] = g;
                        pixels[i * 4 + 2] = b;
                        pixels[i * 4 + 3] = a;
                    }
                } else {
                    // Raw 패킷 — 픽셀 그대로 복사
                    for (let k = 0; k < count; k++, i++) {
                        const b = bytes[src++], g = bytes[src++], r = bytes[src++];
                        const a = bytesPerPixel === 4 ? bytes[src++] : 255;
                        pixels[i * 4]     = r;
                        pixels[i * 4 + 1] = g;
                        pixels[i * 4 + 2] = b;
                        pixels[i * 4 + 3] = a;
                    }
                }
            }
        }

        // ── Canvas에 그리기 ────────────────────────────────
        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        const ctx     = canvas.getContext('2d');
        const imgData = ctx.createImageData(width, height);

        if (originTop) {
            // 좌상단 원점 → 그대로 복사
            imgData.data.set(pixels);
        } else {
            // 좌하단 원점 → 행을 뒤집어서 복사
            const rowBytes = width * 4;
            for (let row = 0; row < height; row++) {
                const srcRow = (height - 1 - row) * rowBytes;
                imgData.data.set(pixels.subarray(srcRow, srcRow + rowBytes), row * rowBytes);
            }
        }

        ctx.putImageData(imgData, 0, 0);
        return canvas.toDataURL('image/png');
    } catch (e) {
        console.warn('TGA decode error:', e);
        return null;
    }
}

// DDS base64 → PNG dataURL (Canvas 변환)
// DDS는 브라우저가 직접 렌더링 불가 → RGBA raw 픽셀을 Canvas에 그려 PNG로 변환
function _ddsBase64ToDataUrl(base64) {
    try {
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const view  = new DataView(bytes.buffer);

        // DDS 헤더 검증 (매직 'DDS ')
        if (view.getUint32(0, true) !== 0x20534444) return null;

        const height = view.getUint32(12, true);
        const width  = view.getUint32(16, true);
        const pfFlags = view.getUint32(80, true);  // pixelformat flags
        const fourCC  = view.getUint32(84, true);  // FourCC

        // BC1(DXT1)=0x31545844, BC3(DXT5)=0x35545844
        const isDXT1 = fourCC === 0x31545844;
        const isDXT5 = fourCC === 0x35545844;

        let rgba;
        const dataOffset = 128; // 표준 DDS 헤더 크기

        if (isDXT1) {
            rgba = _decodeDXT1(bytes.subarray(dataOffset), width, height);
        } else if (isDXT5) {
            rgba = _decodeDXT5(bytes.subarray(dataOffset), width, height);
        } else {
            // 비압축 BGRA32 fallback
            rgba = _decodeBGRA(bytes.subarray(dataOffset), width, height);
        }
        if (!rgba) return null;

        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(width, height);
        imgData.data.set(rgba);
        ctx.putImageData(imgData, 0, 0);
        return canvas.toDataURL('image/png');
    } catch(e) {
        console.warn('DDS decode error:', e);
        return null;
    }
}

// ── DXT1 디코더 ─────────────────────────────────────────
function _decodeDXT1(data, w, h) {
    const out = new Uint8Array(w * h * 4);
    let src = 0;
    for (let by = 0; by < Math.ceil(h / 4); by++) {
        for (let bx = 0; bx < Math.ceil(w / 4); bx++) {
            const c0 = data[src] | (data[src+1] << 8); src += 2;
            const c1 = data[src] | (data[src+1] << 8); src += 2;
            const codes = data[src] | (data[src+1]<<8) | (data[src+2]<<16) | (data[src+3]<<24); src += 4;
            const cols = _dxtColors(c0, c1, false);
            for (let py = 0; py < 4; py++) {
                for (let px = 0; px < 4; px++) {
                    const x = bx * 4 + px, y = by * 4 + py;
                    if (x >= w || y >= h) continue;
                    const idx = (codes >> ((py * 4 + px) * 2)) & 3;
                    const o = (y * w + x) * 4;
                    out[o]=cols[idx*4]; out[o+1]=cols[idx*4+1]; out[o+2]=cols[idx*4+2]; out[o+3]=cols[idx*4+3];
                }
            }
        }
    }
    return out;
}

// ── DXT5 디코더 ─────────────────────────────────────────
function _decodeDXT5(data, w, h) {
    const out = new Uint8Array(w * h * 4);
    let src = 0;
    for (let by = 0; by < Math.ceil(h / 4); by++) {
        for (let bx = 0; bx < Math.ceil(w / 4); bx++) {
            // Alpha block
            const a0 = data[src++], a1 = data[src++];
            const abits = [data[src++],data[src++],data[src++],data[src++],data[src++],data[src++]];
            const alphas = _dxtAlphas(a0, a1);
            // Color block
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

function _dxtColors(c0, c1, forceAlpha) {
    const r0=((c0>>11)&31)*8, g0=((c0>>5)&63)*4, b0=(c0&31)*8;
    const r1=((c1>>11)&31)*8, g1=((c1>>5)&63)*4, b1=(c1&31)*8;
    const c = new Uint8Array(16);
    c[0]=r0;c[1]=g0;c[2]=b0;c[3]=255;
    c[4]=r1;c[5]=g1;c[6]=b1;c[7]=255;
    if (!forceAlpha && c0 <= c1) {
        c[8]=(r0+r1)>>1; c[9]=(g0+g1)>>1; c[10]=(b0+b1)>>1; c[11]=255;
        c[12]=0; c[13]=0; c[14]=0; c[15]=0;
    } else {
        c[8]=((2*r0+r1)/3)|0; c[9]=((2*g0+g1)/3)|0; c[10]=((2*b0+b1)/3)|0; c[11]=255;
        c[12]=((r0+2*r1)/3)|0; c[13]=((g0+2*g1)/3)|0; c[14]=((b0+2*b1)/3)|0; c[15]=255;
    }
    return c;
}

function _dxtAlphas(a0, a1) {
    const a = new Uint8Array(8);
    a[0]=a0; a[1]=a1;
    if (a0>a1) {
        for(let i=1;i<6;i++) a[i+1]=((( 6-i)*a0+(i)*a1)/6)|0;
    } else {
        for(let i=1;i<4;i++) a[i+1]=(((4-i)*a0+(i)*a1)/4)|0;
        a[6]=0; a[7]=255;
    }
    return a;
}

function _dxtAlphaIdx(abits, pi) {
    const bitOff = pi * 3;
    const byteOff = bitOff >> 3;
    const bitShift = bitOff & 7;
    const val = (abits[byteOff]|(abits[byteOff+1]<<8)) >> bitShift;
    return val & 7;
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
    // ideas / decisions / characters / raw_text 등 텍스트 → 원시 보존
    return { type, raw: content };
}
