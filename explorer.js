// ════════════════════════════════════════════════════════
//  explorer.js — 프로젝트 탐색기
//  의존: state.js, io.js, home.js
// ════════════════════════════════════════════════════════

// HOI4 모드 폴더 구조 정의
// parent: 상위 그룹 경로 (표시용, 실제 파일 경로 아님)
const FOLDER_DEFS = [
    // common 그룹
    { path: 'common/national_focus',        label: '국가중점',          type: 'national_focus', ext: '.txt', parent: 'common' },
    { path: 'common/ideas',                 label: '아이디어',          type: 'ideas',          ext: '.txt', parent: 'common' },
    { path: 'common/decisions',             label: '디시전',            type: 'decisions',      ext: '.txt', parent: 'common' },
    { path: 'common/characters',            label: '인물',              type: 'characters',     ext: '.txt', parent: 'common' },
    { path: 'common/bookmarks',             label: '북마크',            type: 'raw_text',       ext: '.txt', parent: 'common' },
    { path: 'common/countries',             label: '국가 정의',         type: 'raw_text',       ext: '.txt', parent: 'common' },
    { path: 'common/country_tags',          label: '국가 태그',         type: 'raw_text',       ext: '.txt', parent: 'common' },
    { path: 'common/dynamic_modifiers',     label: '동적 수정자',       type: 'raw_text',       ext: '.txt', parent: 'common' },
    { path: 'common/effects',               label: '이펙트',            type: 'raw_text',       ext: '.txt', parent: 'common' },
    { path: 'common/modifiers',             label: '수정자',            type: 'raw_text',       ext: '.txt', parent: 'common' },
    { path: 'common/national_focus/shared', label: '공유중점',          type: 'raw_text',       ext: '.txt', parent: 'common' },
    { path: 'common/on_actions',            label: 'on_actions',       type: 'raw_text',       ext: '.txt', parent: 'common' },
    { path: 'common/scripted_effects',      label: '스크립트 이펙트',   type: 'raw_text',       ext: '.txt', parent: 'common' },
    { path: 'common/scripted_triggers',     label: '스크립트 트리거',   type: 'raw_text',       ext: '.txt', parent: 'common' },
    { path: 'common/technologies',          label: '기술',              type: 'raw_text',       ext: '.txt', parent: 'common' },
    { path: 'common/units',                 label: '부대',              type: 'raw_text',       ext: '.txt', parent: 'common' },
    // history 그룹
    { path: 'history/countries',            label: '국가 역사',         type: 'raw_text',       ext: '.txt', parent: 'history' },
    { path: 'history/states',               label: '지역 역사',         type: 'raw_text',       ext: '.txt', parent: 'history' },
    { path: 'history/units',                label: '부대 역사',         type: 'raw_text',       ext: '.txt', parent: 'history' },
    // events 그룹
    { path: 'events',                       label: '이벤트 파일',       type: 'raw_text',       ext: '.txt', parent: 'events' },
    // music / sound
    { path: 'music',                        label: '음악',              type: 'raw_text',       ext: '.txt', parent: 'music' },
    { path: 'sound',                        label: '사운드',            type: 'raw_text',       ext: '.txt', parent: 'sound' },
    // map
    { path: 'map',                          label: '맵',                type: 'raw_text',       ext: '.txt', parent: 'map' },
    // localisation 그룹
    { path: 'localisation/english',         label: '영어 (English)',       type: 'localisation', ext: '.yml', parent: 'localisation' },
    { path: 'localisation/korean',          label: '한국어 (Korean)',      type: 'localisation', ext: '.yml', parent: 'localisation' },
    { path: 'localisation/japanese',        label: '일본어 (Japanese)',    type: 'localisation', ext: '.yml', parent: 'localisation' },
    { path: 'localisation/german',          label: '독일어 (German)',      type: 'localisation', ext: '.yml', parent: 'localisation' },
    { path: 'localisation/french',          label: '프랑스어 (French)',    type: 'localisation', ext: '.yml', parent: 'localisation' },
    { path: 'localisation/spanish',         label: '스페인어 (Spanish)',   type: 'localisation', ext: '.yml', parent: 'localisation' },
    { path: 'localisation/russian',         label: '러시아어 (Russian)',   type: 'localisation', ext: '.yml', parent: 'localisation' },
    { path: 'localisation/polish',          label: '폴란드어 (Polish)',    type: 'localisation', ext: '.yml', parent: 'localisation' },
    { path: 'localisation/braz_por',        label: '포르투갈어 (Braz)',    type: 'localisation', ext: '.yml', parent: 'localisation' },
    { path: 'localisation/simp_chinese',    label: '중국어 간체 (S.Chi)', type: 'localisation', ext: '.yml', parent: 'localisation' },
    // gfx 그룹
    { path: 'gfx/flags',           label: 'flags',     type: 'gfx_folder', ext: '.dds', parent: 'gfx' },
    { path: 'gfx/interface',       label: 'interface', type: 'gfx_folder', ext: '.dds', parent: 'gfx' },
    { path: 'gfx/leaders',         label: 'leaders',   type: 'gfx_folder', ext: '.dds', parent: 'gfx' },
    { path: 'gfx/interface/goals', label: 'goals',     type: 'gfx_folder', ext: '.dds', parent: 'gfx' },
    // interface 그룹
    { path: 'interface', label: 'interface', type: 'gfx_define', ext: '.gfx', parent: 'interface' },
];

// 부모 그룹 정의 (표시 전용 — 실제 파일 경로 없음)
const PARENT_DEFS = [
    { key: 'common',       label: 'common',       icon: '📂' },
    { key: 'history',      label: 'history',      icon: '📂' },
    { key: 'events',       label: 'events',       icon: '📂' },
    { key: 'music',        label: 'music',        icon: '📂' },
    { key: 'sound',        label: 'sound',        icon: '📂' },
    { key: 'map',          label: 'map',           icon: '📂' },
    { key: 'localisation', label: 'localisation', icon: '📂' },
    { key: 'gfx',          label: 'gfx',          icon: '📂' },
    { key: 'interface',    label: 'interface',    icon: '📂' },
];

// 현재 펼쳐진 폴더 / 부모 그룹 추적
const _expandedFolders = new Set();
const _expandedParents = new Set(['common', 'localisation', 'history', 'events']); // 기본 펼침

// 사용자가 직접 생성한 폴더 목록 (파일 없어도 트리에 유지)
const _customFolders = new Set();

// ── 탐색기 렌더링 ───────────────────────────────────────
function renderExplorer() {
    const titleEl = document.getElementById('explorer-project-name');
    if (titleEl) titleEl.textContent = appState.project.name || '새 프로젝트';

    const tree = document.getElementById('explorer-tree');
    if (!tree) return;
    tree.innerHTML = '';

    // 파일 경로 → 폴더별 그룹핑 (루트 직속 파일은 '' 키로 따로 모음)
    const filesByFolder = {};
    const rootFiles = [];
    Object.keys(appState.project.files).forEach(path => {
        const slashIdx = path.lastIndexOf('/');
        if (slashIdx === -1) {
            // 폴더 없는 루트 파일 — filesByFolder에 넣지 않음
            rootFiles.push(path);
            return;
        }
        const folder = path.substring(0, slashIdx);
        if (!filesByFolder[folder]) filesByFolder[folder] = [];
        filesByFolder[folder].push(path);
    });

    // 모든 실존 폴더 수집 (빈 문자열 키 제외)
    const definedPaths = new Set(FOLDER_DEFS.map(d => d.path));
    const allFolderSet = new Set([
        ...definedPaths,
        ...Object.keys(filesByFolder).filter(k => k !== ''),
        ..._customFolders
    ]);

    // 부모 그룹 키 Set
    const parentKeys = new Set(PARENT_DEFS.map(p => p.key));

    // 폴더를 계층별로 분류
    // depth=1: 부모 직속 (예: common/national_focus)
    // depth>1: 더 깊은 하위 (예: common/national_focus/sub)
    const getFoldersByParent = (parentKey) => {
        return [...allFolderSet]
            .filter(fp => {
                const parts = fp.split('/');
                return parts[0] === parentKey && parts.length >= 2;
            })
            .sort();
    };

    // ── 부모 그룹 렌더링 ──────────────────────────────
    PARENT_DEFS.forEach(parentDef => {
        const isParentExpanded = _expandedParents.has(parentDef.key);

        const parentEl = document.createElement('div');
        parentEl.className = 'tree-parent';

        const parentHeader = document.createElement('div');
        parentHeader.className = 'tree-parent-header';
        parentHeader.innerHTML = `
            <span class="tree-arrow">${isParentExpanded ? '▾' : '▸'}</span>
            <span class="tree-folder-icon">${parentDef.icon}</span>
            <span class="tree-parent-label">${escapeHtml(parentDef.label)}</span>
            <div class="tree-folder-actions">
                <button class="tree-btn" data-action="new-subfolder"  data-folder="${escapeHtml(parentDef.key)}" title="새 하위 폴더">📁+</button>
                <button class="tree-btn" data-action="new-file"       data-folder="${escapeHtml(parentDef.key)}" title="새 파일">＋</button>
                <button class="tree-btn" data-action="import-file"    data-folder="${escapeHtml(parentDef.key)}" title="파일 가져오기">📥</button>
            </div>
        `;
        parentHeader.addEventListener('click', e => {
            if (e.target.closest('.tree-folder-actions')) return;
            _expandedParents[isParentExpanded ? 'delete' : 'add'](parentDef.key);
            renderExplorer();
        });
        parentEl.appendChild(parentHeader);

        if (isParentExpanded) {
            const childrenWrap = document.createElement('div');
            childrenWrap.className = 'tree-children';

            // interface처럼 parent키 자체가 실제 경로인 경우 직접 파일 표시
            const selfAsDef = FOLDER_DEFS.find(d => d.path === parentDef.key);
            if (selfAsDef) {
                // 이 폴더 자체에 있는 직속 파일들
                const selfFiles = filesByFolder[parentDef.key] || [];
                selfFiles.sort().forEach(filePath => {
                    const filename  = filePath.split('/').pop();
                    const isCurrent = filePath === appState.currentFile;
                    const fileEl    = document.createElement('div');
                    fileEl.className = 'tree-file' + (isCurrent ? ' active' : '');
                    fileEl.title     = filePath;
                    fileEl.innerHTML = `
                        <span class="tree-file-icon">${_fileIcon(filePath)}</span>
                        <span class="tree-file-name">${escapeHtml(filename)}</span>
                        <div class="tree-file-actions">
                            <button class="tree-btn" data-action="export-file" data-path="${escapeHtml(filePath)}" title="내보내기">💾</button>
                            <button class="tree-btn danger" data-action="delete-file" data-path="${escapeHtml(filePath)}" title="삭제">🗑</button>
                        </div>
                    `;
                    fileEl.addEventListener('click', e => {
                        if (e.target.closest('.tree-file-actions')) return;
                        openFile(filePath);
                    });
                    childrenWrap.appendChild(fileEl);
                });
            }

            // 이 부모 바로 아래 1단계 자식 폴더들
            const directChildren = getFoldersByParent(parentDef.key)
                .filter(fp => fp.split('/').length === 2);

            directChildren.forEach(fp => {
                const def = FOLDER_DEFS.find(d => d.path === fp);
                childrenWrap.appendChild(
                    _makeFolderEl(fp, def, filesByFolder, allFolderSet)
                );
            });

            parentEl.appendChild(childrenWrap);
        }
        tree.appendChild(parentEl);
    });

    // ── 완전 미분류 최상위 폴더 (정의된 부모 아님) ──────
    [...allFolderSet]
        .filter(fp => {
            const top = fp.split('/')[0];
            return !parentKeys.has(top) && fp.split('/').length === 1;
        })
        .sort()
        .forEach(fp => {
            tree.appendChild(_makeFolderEl(fp, null, filesByFolder, allFolderSet));
        });

    // ── 루트 직속 파일 (descriptor.mod 등 폴더 없는 파일) ──
    const sortedRootFiles = [...rootFiles].sort();
    if (sortedRootFiles.length) {
        const rootSection = document.createElement('div');
        rootSection.className = 'tree-parent';
        rootSection.innerHTML = `
            <div class="tree-parent-header" style="cursor:default;">
                <span class="tree-folder-icon">📄</span>
                <span class="tree-parent-label">루트 파일</span>
            </div>
        `;
        const rootList = document.createElement('div');
        rootList.className = 'tree-children';
        sortedRootFiles.forEach(filePath => {
            const isCurrent = filePath === appState.currentFile;
            const fileEl = document.createElement('div');
            fileEl.className = 'tree-file' + (isCurrent ? ' active' : '');
            fileEl.title = filePath;
            fileEl.innerHTML = `
                <span class="tree-file-icon">${_fileIcon(filePath)}</span>
                <span class="tree-file-name">${escapeHtml(filePath)}</span>
                <div class="tree-file-actions">
                    <button class="tree-btn" data-action="export-file" data-path="${escapeHtml(filePath)}" title="내보내기">💾</button>
                    <button class="tree-btn danger" data-action="delete-file" data-path="${escapeHtml(filePath)}" title="삭제">🗑</button>
                </div>
            `;
            fileEl.addEventListener('click', e => {
                if (e.target.closest('.tree-file-actions')) return;
                openFile(filePath);
            });
            rootList.appendChild(fileEl);
        });
        rootSection.appendChild(rootList);
        tree.appendChild(rootSection);
    }

    // ── 버튼 이벤트 위임 ──────────────────────────────
    tree.querySelectorAll('.tree-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const { action, folder, path } = btn.dataset;
            if (action === 'new-file')       _newFile(folder);
            if (action === 'import-file')    _importFile(folder);
            if (action === 'export-file')    _exportFile(path);
            if (action === 'delete-file')    _deleteFile(path);
            if (action === 'new-subfolder')  _newSubFolder(folder);
            if (action === 'delete-folder')  _deleteFolder(folder);
        });
    });
}

// ── 폴더 노드 생성 (재귀) ───────────────────────────────
function _makeFolderEl(folderPath, def, filesByFolder, allFolderSet) {
    const isExpanded = _expandedFolders.has(folderPath);
    const label      = def?.label || folderPath.split('/').pop();
    const isBuiltin  = !!def; // FOLDER_DEFS에 정의된 폴더

    const folderEl = document.createElement('div');
    folderEl.className = 'tree-folder';

    const header = document.createElement('div');
    header.className = 'tree-folder-header' + (isExpanded ? ' expanded' : '');
    header.title     = folderPath;
    header.innerHTML = `
        <span class="tree-arrow">${isExpanded ? '▾' : '▸'}</span>
        <span class="tree-folder-icon">📁</span>
        <span class="tree-folder-label">${escapeHtml(label)}</span>
        <div class="tree-folder-actions">
            <button class="tree-btn" data-action="new-subfolder"  data-folder="${escapeHtml(folderPath)}" title="새 하위 폴더">📁+</button>
            <button class="tree-btn" data-action="new-file"       data-folder="${escapeHtml(folderPath)}" title="새 파일">＋</button>
            <button class="tree-btn" data-action="import-file"    data-folder="${escapeHtml(folderPath)}" title="파일 불러오기">📥</button>
            ${!isBuiltin ? `<button class="tree-btn danger" data-action="delete-folder" data-folder="${escapeHtml(folderPath)}" title="폴더 삭제">🗑</button>` : ''}
        </div>
    `;
    header.addEventListener('click', e => {
        if (e.target.closest('.tree-folder-actions')) return;
        _expandedFolders[isExpanded ? 'delete' : 'add'](folderPath);
        renderExplorer();
    });
    folderEl.appendChild(header);

    if (isExpanded) {
        const contentWrap = document.createElement('div');
        contentWrap.className = 'tree-file-list';

        // 직속 하위 폴더 (folderPath/X — 깊이 1 더)
        const depth = folderPath.split('/').length;
        const subFolders = allFolderSet
            ? [...allFolderSet].filter(fp => {
                const parts = fp.split('/');
                return parts.length === depth + 1 && fp.startsWith(folderPath + '/');
            }).sort()
            : [];

        subFolders.forEach(subPath => {
            const subDef = FOLDER_DEFS.find(d => d.path === subPath);
            const subEl  = _makeFolderEl(subPath, subDef, filesByFolder, allFolderSet);
            subEl.style.marginLeft = '12px';
            contentWrap.appendChild(subEl);
        });

        // 직속 파일
        const files = (filesByFolder && filesByFolder[folderPath]) || [];
        if (!subFolders.length && !files.length) {
            contentWrap.innerHTML += '<div class="tree-empty">비어 있음</div>';
        } else {
            files.sort().forEach(filePath => {
                const filename  = filePath.split('/').pop();
                const isCurrent = filePath === appState.currentFile;
                const fileEl    = document.createElement('div');
                fileEl.className = 'tree-file' + (isCurrent ? ' active' : '');
                fileEl.title     = filePath;
                fileEl.innerHTML = `
                    <span class="tree-file-icon">${_fileIcon(filePath)}</span>
                    <span class="tree-file-name">${escapeHtml(filename)}</span>
                    <div class="tree-file-actions">
                        <button class="tree-btn" data-action="export-file" data-path="${escapeHtml(filePath)}" title="내보내기">💾</button>
                        <button class="tree-btn danger" data-action="delete-file" data-path="${escapeHtml(filePath)}" title="삭제">🗑</button>
                    </div>
                `;
                fileEl.addEventListener('click', e => {
                    if (e.target.closest('.tree-file-actions')) return;
                    openFile(filePath);
                });
                contentWrap.appendChild(fileEl);
            });
        }

        folderEl.appendChild(contentWrap);
    }
    return folderEl;
}

function _fileIcon(path) {
    if (path.includes('national_focus')) return '🎯';
    if (path.includes('ideas'))          return '💡';
    if (path.includes('decisions'))      return '⚖️';
    if (path.includes('characters'))     return '👤';
    if (path.includes('history/countries')) return '🏛';
    if (path.includes('history/states'))    return '🗺';
    if (path.includes('history/units'))     return '⚔️';
    if (path.includes('history/'))          return '📜';
    if (path.includes('events/') || path.startsWith('events/')) return '📰';
    if (path.includes('localisation'))   return '🌐';
    if (path.endsWith('.mod') || path.endsWith('.info')) return '🔧';
    if (path.endsWith('.dds'))           return '🖼';
    if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') ||
        path.endsWith('.bmp') || path.endsWith('.tga')) return '🖼';
    if (path.endsWith('.gfx'))           return '🎨';
    if (path.endsWith('.gui'))           return '🖥';
    if (path.endsWith('.lua'))           return '📜';
    if (path.endsWith('.csv'))           return '📊';
    return '📄';
}

// ── 새 하위 폴더 만들기 ─────────────────────────────────
function _newSubFolder(parentPath) {
    const name = prompt(`"${parentPath}" 아래 생성할 폴더 이름:`, '');
    if (!name?.trim()) return;

    // 슬래시 포함 금지 (단일 이름만)
    const sanitized = name.trim().replace(/[\\/]/g, '');
    if (!sanitized) return;

    const newPath = `${parentPath}/${sanitized}`;

    // 이미 있는 경우
    if (_customFolders.has(newPath) || FOLDER_DEFS.some(d => d.path === newPath)) {
        alert('이미 같은 이름의 폴더가 있습니다.');
        return;
    }

    _customFolders.add(newPath);
    _expandedFolders.add(newPath);
    // 부모도 펼쳐두기
    _expandedFolders.add(parentPath);
    const topKey = parentPath.split('/')[0];
    _expandedParents.add(topKey);

    appState.isDirty = true;
    renderExplorer();
}

// ── 폴더 삭제 ───────────────────────────────────────────
function _deleteFolder(folderPath) {
    // 하위 파일 목록
    const childFiles = Object.keys(appState.project.files)
        .filter(p => p.startsWith(folderPath + '/'));

    const msg = childFiles.length
        ? `"${folderPath.split('/').pop()}" 폴더와 내부 파일 ${childFiles.length}개를 모두 삭제하시겠습니까?`
        : `"${folderPath.split('/').pop()}" 폴더를 삭제하시겠습니까?`;

    if (!confirm(msg)) return;

    // 파일 삭제
    childFiles.forEach(p => {
        if (appState.currentFile === p) {
            switchView('explorer-view');
            appState.currentFile = null;
        }
        delete appState.project.files[p];
    });

    // 하위 커스텀 폴더 전부 제거
    [..._customFolders].forEach(fp => {
        if (fp === folderPath || fp.startsWith(folderPath + '/'))
            _customFolders.delete(fp);
    });
    _expandedFolders.delete(folderPath);

    appState.isDirty = true;
    renderExplorer();
}


function _newFile(folderPath) {
    const def = FOLDER_DEFS.find(d => d.path === folderPath);
    // 확장자 추론: def가 있으면 def.ext, 없으면 폴더명/파일 위치로 추론
    let ext = def?.ext || '.txt';
    if (!def) {
        if (folderPath === 'interface' || folderPath.startsWith('interface/')) ext = '.gfx';
        else if (folderPath.startsWith('gfx/')) ext = '.dds';
        else if (folderPath.startsWith('localisation/')) ext = '.yml';
    }
    const name = prompt(`새 파일 이름 (확장자 포함, 예: GEN_focus${ext}):`, `new_file${ext}`);
    if (!name?.trim()) return;

    const filePath = `${folderPath}/${name.trim()}`;
    if (appState.project.files[filePath]) {
        alert('같은 이름의 파일이 이미 있습니다.');
        return;
    }

    if (def?.type === 'national_focus') {
        appState.project.files[filePath] = makeNationalFocusFile();
    } else if (def?.type === 'localisation') {
        const lang = folderPath.split('/').pop();
        appState.project.files[filePath] = makeLocalisationFile(lang);
    } else if (def?.type === 'ideas' || def?.type === 'decisions' || def?.type === 'characters') {
        appState.project.files[filePath] = { type: def.type, raw: '' };
    } else if (def?.type === 'raw_text') {
        appState.project.files[filePath] = { type: 'raw_text', raw: '' };
    } else if (def?.type === 'gfx_define' || filePath.endsWith('.gfx')) {
        appState.project.files[filePath] = { type: 'gfx_define', sprites: [] };
    } else if (filePath.endsWith('.gui')) {
        appState.project.files[filePath] = { type: 'gui', raw: '' };
    } else {
        // 기타 텍스트 파일 (.txt, .mod, .cfg, .lua 등) → raw_text
        appState.project.files[filePath] = { type: 'raw_text', raw: '' };
    }

    appState.isDirty = true;
    _expandedFolders.add(folderPath);
    renderExplorer();
    openFile(filePath);
}

// ── 외부 파일 가져오기 ───────────────────────────────────
function _importFile(targetFolder) {
    const input = document.createElement('input');
    input.type  = 'file';
    input.accept = '.txt,.yml,.yaml,.json,.dds,.gfx,.gui,.png,.jpg,.jpeg,.bmp,.tga,.mod,.cfg,.lua,.csv';
    input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;
        const nameLow = file.name.toLowerCase();

        // DDS 이미지 처리
        if (nameLow.endsWith('.dds')) {
            const arrayBuf = await file.arrayBuffer();
            const base64   = _arrayBufferToBase64(arrayBuf);
            const dest = prompt(
                `DDS 파일을 저장할 경로:`,
                targetFolder ? `${targetFolder}/${file.name}` : `gfx/interface/goals/${file.name}`
            );
            if (!dest?.trim()) return;
            const destPath = dest.trim();
            if (appState.project.files[destPath]) {
                if (!confirm(`"${destPath}"에 이미 파일이 있습니다. 덮어쓰시겠습니까?`)) return;
            }
            appState.project.files[destPath] = { type: 'dds', base64, filename: file.name };
            appState.isDirty = true;
            const folder = destPath.substring(0, destPath.lastIndexOf('/'));
            _expandedFolders.add(folder);
            renderExplorer();
            CloudAuth.saveProject(appState.project.name).catch(console.error);
            return;
        }

        // PNG / JPG / BMP / TGA 이미지 처리
        const imgExts = ['.png', '.jpg', '.jpeg', '.bmp', '.tga'];
        if (imgExts.some(e => nameLow.endsWith(e))) {
            const arrayBuf = await file.arrayBuffer();
            const base64   = _arrayBufferToBase64(arrayBuf);
            const dest = prompt(
                `이미지 파일을 저장할 경로:`,
                targetFolder ? `${targetFolder}/${file.name}` : `gfx/interface/goals/${file.name}`
            );
            if (!dest?.trim()) return;
            const destPath = dest.trim();
            if (appState.project.files[destPath]) {
                if (!confirm(`"${destPath}"에 이미 파일이 있습니다. 덮어쓰시겠습니까?`)) return;
            }
            appState.project.files[destPath] = { type: 'image', base64, filename: file.name };
            appState.isDirty = true;
            const folder = destPath.substring(0, destPath.lastIndexOf('/'));
            _expandedFolders.add(folder);
            renderExplorer();
            CloudAuth.saveProject(appState.project.name).catch(console.error);
            return;
        }

        // GFX 파일 처리
        if (nameLow.endsWith('.gfx')) {
            const content = await file.text();
            const dest = prompt(
                `GFX 파일을 저장할 경로:`,
                targetFolder ? `${targetFolder}/${file.name}` : `interface/${file.name}`
            );
            if (!dest?.trim()) return;
            const destPath = dest.trim();
            if (appState.project.files[destPath]) {
                if (!confirm(`"${destPath}"에 이미 파일이 있습니다. 덮어쓰시겠습니까?`)) return;
            }
            const parsed = parseGfxFile(content);
            appState.project.files[destPath] = { type: 'gfx_define', sprites: parsed };
            appState.isDirty = true;
            const folder = destPath.substring(0, destPath.lastIndexOf('/'));
            _expandedFolders.add(folder);
            renderExplorer();
            CloudAuth.saveProject(appState.project.name).catch(console.error);
            return;
        }

        // GUI 파일 처리 (원시 텍스트 저장 — 편집기 추후 구현)
        if (nameLow.endsWith('.gui')) {
            const content = await file.text();
            const dest = prompt(
                `GUI 파일을 저장할 경로:`,
                targetFolder ? `${targetFolder}/${file.name}` : `interface/${file.name}`
            );
            if (!dest?.trim()) return;
            const destPath = dest.trim();
            if (appState.project.files[destPath]) {
                if (!confirm(`"${destPath}"에 이미 파일이 있습니다. 덮어쓰시겠습니까?`)) return;
            }
            appState.project.files[destPath] = { type: 'gui', raw: content };
            appState.isDirty = true;
            const folder = destPath.substring(0, destPath.lastIndexOf('/'));
            _expandedFolders.add(folder);
            renderExplorer();
            CloudAuth.saveProject(appState.project.name).catch(console.error);
            return;
        }

        // 텍스트 파일 처리 — parseSingleFile로 먼저 시도, 실패 시 raw_text로 폴백
        const content  = await file.text();
        const parsed   = parseSingleFile(content, file.name, targetFolder ? `${targetFolder}/${file.name}` : file.name);
        const fileData = parsed || { type: 'raw_text', raw: content };

        const suggested = parsed ? suggestPath(parsed.type, file.name) : (targetFolder ? `${targetFolder}/${file.name}` : file.name);
        const dest = prompt(
            `파일을 추가할 경로를 입력하세요.\n(폴더/파일명 형식)`,
            targetFolder ? `${targetFolder}/${file.name}` : suggested
        );
        if (!dest?.trim()) return;
        const destPath = dest.trim();
        if (appState.project.files[destPath]) {
            if (!confirm(`"${destPath}"에 이미 파일이 있습니다. 덮어쓰시겠습니까?`)) return;
        }
        appState.project.files[destPath] = fileData;
        appState.isDirty = true;
        const folder = destPath.includes('/') ? destPath.substring(0, destPath.lastIndexOf('/')) : null;
        if (folder) _expandedFolders.add(folder);
        renderExplorer();
        CloudAuth.saveProject(appState.project.name).catch(console.error);
    };
    input.click();
}

function _arrayBufferToBase64(buf) {
    const bytes = new Uint8Array(buf);
    let binary  = '';
    const chunk = 8192;
    for (let i = 0; i < bytes.length; i += chunk)
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    return btoa(binary);
}

// ── 파일 내보내기 ─────────────────────────────────────────
function _exportFile(filePath) {
    const fd = appState.project.files[filePath];
    if (!fd) return;
    const filename = filePath.split('/').pop();
    try {
        if (fd.type === 'national_focus')
            downloadBlob(buildFocusTxt(fd), filename);
        else if (fd.type === 'localisation')
            downloadBlob(buildLocYml(fd), filename, 'text/yaml;charset=utf-8');
        else if (fd.type === 'dds') {
            const bytes = Uint8Array.from(atob(fd.base64), c => c.charCodeAt(0));
            downloadBlob(new Blob([bytes], { type: 'application/octet-stream' }), filename);
        } else if (fd.type === 'image') {
            const ext  = filename.split('.').pop().toLowerCase();
            const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
                       : ext === 'bmp' ? 'image/bmp' : 'image/png';
            const bytes = Uint8Array.from(atob(fd.base64), c => c.charCodeAt(0));
            downloadBlob(new Blob([bytes], { type: mime }), filename);
        } else if (fd.type === 'gfx_define')
            downloadBlob(buildGfxFile(fd), filename, 'text/plain;charset=utf-8');
        else if (fd.type === 'gui')
            downloadBlob(fd.raw || '', filename, 'text/plain;charset=utf-8');
        else if (fd.raw != null)
            // ideas / decisions / characters / common_raw
            downloadBlob(fd.raw, filename, 'text/plain;charset=utf-8');
    } catch(e) { alert('내보내기 오류: ' + e.message); }
}

// ── 파일 삭제 ────────────────────────────────────────────
function _deleteFile(filePath) {
    if (!confirm(`"${filePath.split('/').pop()}"을 삭제하시겠습니까?`)) return;
    if (appState.currentFile === filePath) {
        switchView('explorer-view');
        appState.currentFile = null;
    }
    delete appState.project.files[filePath];
    appState.isDirty = true;
    // 서버에서도 해당 행 삭제
    CloudAuth.deleteFile(appState.project.name, filePath).catch(console.error);
    renderExplorer();
}

// ── 탐색기 오른쪽 본문에 인라인 렌더링 ─────────────────
// GFX/DDS/GUI 뷰어는 별도 뷰 전환 없이 explorer-main에 직접 렌더링
function _renderInExplorerMain(renderFn) {
    const main = document.querySelector('#explorer-view .explorer-main');
    if (!main) return;
    // 안내 문구 제거 후 컨테이너 삽입
    main.innerHTML = `
        <div id="gfx-editor-content" class="gfx-editor-content" style="width:100%;height:100%;overflow-y:auto;padding:20px;box-sizing:border-box;"></div>
    `;
    renderFn();
}

// ── 탐색기 오른쪽 본문을 안내 문구로 초기화 ────────────
function _resetExplorerMain() {
    const main = document.querySelector('#explorer-view .explorer-main');
    if (!main) return;
    main.innerHTML = `
        <div class="explorer-placeholder">
            <p>👈 왼쪽에서 파일을 선택하거나<br>새 파일을 만드세요.</p>
            <p class="explorer-placeholder-sub">
                폴더 옆 <strong>＋</strong> 버튼으로 새 파일,<br>
                <strong>📥</strong> 버튼으로 외부 파일을 가져올 수 있습니다.
            </p>
        </div>
    `;
}

// ── 파일 열기 (편집기로 진입) ────────────────────────────
async function openFile(filePath) {
    let fd = appState.project.files[filePath];
    if (!fd) return;

    // stub(목록만 로드된 상태)이면 서버에서 실제 내용 가져오기
    if (fd._stub) {
        const fileEl = document.querySelector(`.tree-file[title="${CSS.escape(filePath)}"]`);
        if (fileEl) fileEl.style.opacity = '0.5';
        try {
            const loaded = await CloudAuth.fetchFile(
                appState.project.name, filePath, fd.type
            );
            if (loaded) {
                appState.project.files[filePath] = loaded;
                fd = loaded;
            } else {
                alert(`"${filePath.split('/').pop()}" 파일을 서버에서 불러오지 못했습니다.`);
                if (fileEl) fileEl.style.opacity = '';
                return;
            }
        } catch(e) {
            alert(`파일 로드 실패: ${e.message}`);
            if (fileEl) fileEl.style.opacity = '';
            return;
        }
        if (fileEl) fileEl.style.opacity = '';
    }

    appState.currentFile     = filePath;
    appState.selectedFocusId = null;
    resetHistory();

    if (fd.type === 'national_focus') {
        switchView('focus-editor-view');
        setupFocusEditorToolbar();
        applyLocToAllFocuses(fd);
        renderFocusTree();
    } else if (fd.type === 'localisation') {
        switchView('localisation-editor-view');
        setupLocEditorToolbar();
        renderLocalisationList();
    } else if (fd.type === 'dds') {
        _renderInExplorerMain(() => renderDdsViewer(filePath, fd));
    } else if (fd.type === 'image') {
        _renderInExplorerMain(() => renderImageViewer(filePath, fd));
    } else if (fd.type === 'gfx_define') {
        _renderInExplorerMain(() => renderGfxEditor(filePath, fd));
    } else if (fd.type === 'gui') {
        _renderInExplorerMain(() => renderGuiViewer(filePath, fd));
    } else if (fd.type === 'ideas' || fd.type === 'decisions' || fd.type === 'characters' ||
               fd.type === 'raw_text' || fd.type === 'common_raw') {
        // raw_text: history, events, descriptor.mod 등 모든 텍스트 파일
        _renderInExplorerMain(() => renderRawTextEditor(filePath, fd));
    } else {
        alert('아직 지원하지 않는 파일 형식입니다.');
        appState.currentFile = null;
    }
    renderExplorer();
}

// ── 탐색기 툴바 이벤트 ──────────────────────────────────
function setupExplorerListeners() {
    document.getElementById('btn-explorer-back')
        ?.addEventListener('click', showHomeView);
    document.getElementById('btn-save-project')
        ?.addEventListener('click', async () => {
            await saveProjectZip();                                           // ZIP 다운로드
            CloudAuth.saveProject(appState.project.name).catch(console.error); // 서버 동기화
        });
    document.getElementById('btn-explorer-import')
        ?.addEventListener('click', () => _importFile(''));

    document.getElementById('btn-rename-project')?.addEventListener('click', async () => {
        const current = appState.project.name || '';
        const newName = prompt('새 프로젝트(모드) 이름을 입력하세요:', current);
        if (!newName?.trim() || newName.trim() === current) return;
        appState.project.name = newName.trim();
        appState.isDirty = true;
        // 서버에 새 이름으로 메타 생성 (비동기)
        CloudAuth.getUser().then(user => {
            if (user) CloudAuth._saveProjectMeta(user.id, newName.trim())
                .catch(e => console.warn('이름 변경 서버 반영 실패:', e));
        });
        renderExplorer();
    });
}
