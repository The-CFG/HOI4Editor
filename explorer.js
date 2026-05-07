// ════════════════════════════════════════════════════════
//  explorer.js — 프로젝트 탐색기
//  의존: state.js, io.js, home.js
// ════════════════════════════════════════════════════════

// HOI4 모드 폴더 구조 정의
// parent: 상위 그룹 경로 (표시용, 실제 파일 경로 아님)
const FOLDER_DEFS = [
    // common 그룹
    { path: 'common/national_focus', label: '국가중점',   type: 'national_focus', ext: '.txt', parent: 'common' },
    // localisation 그룹
    { path: 'localisation/english',      label: '영어 (English)',       type: 'localisation', ext: '.yml', parent: 'localisation' },
    { path: 'localisation/korean',       label: '한국어 (Korean)',      type: 'localisation', ext: '.yml', parent: 'localisation' },
    { path: 'localisation/japanese',     label: '일본어 (Japanese)',    type: 'localisation', ext: '.yml', parent: 'localisation' },
    { path: 'localisation/german',       label: '독일어 (German)',      type: 'localisation', ext: '.yml', parent: 'localisation' },
    { path: 'localisation/french',       label: '프랑스어 (French)',    type: 'localisation', ext: '.yml', parent: 'localisation' },
    { path: 'localisation/spanish',      label: '스페인어 (Spanish)',   type: 'localisation', ext: '.yml', parent: 'localisation' },
    { path: 'localisation/russian',      label: '러시아어 (Russian)',   type: 'localisation', ext: '.yml', parent: 'localisation' },
    { path: 'localisation/polish',       label: '폴란드어 (Polish)',    type: 'localisation', ext: '.yml', parent: 'localisation' },
    { path: 'localisation/braz_por',     label: '포르투갈어 (Braz)',    type: 'localisation', ext: '.yml', parent: 'localisation' },
    { path: 'localisation/simp_chinese', label: '중국어 간체 (S.Chi)', type: 'localisation', ext: '.yml', parent: 'localisation' },
];

// 부모 그룹 정의 (표시 전용 — 실제 파일 경로 없음)
const PARENT_DEFS = [
    { key: 'common',       label: 'common',       icon: '📂' },
    { key: 'localisation', label: 'localisation', icon: '📂' },
];

// 현재 펼쳐진 폴더 / 부모 그룹 추적
const _expandedFolders = new Set();
const _expandedParents = new Set(['common', 'localisation']); // 기본 펼침

// ── 탐색기 렌더링 ───────────────────────────────────────
function renderExplorer() {
    const titleEl = document.getElementById('explorer-project-name');
    if (titleEl) titleEl.textContent = appState.project.name || '새 프로젝트';

    const tree = document.getElementById('explorer-tree');
    if (!tree) return;
    tree.innerHTML = '';

    // 파일 경로 → 폴더별 그룹핑
    const filesByFolder = {};
    Object.keys(appState.project.files).forEach(path => {
        const folder = path.substring(0, path.lastIndexOf('/'));
        if (!filesByFolder[folder]) filesByFolder[folder] = [];
        filesByFolder[folder].push(path);
    });

    // 정의된 폴더 + 프로젝트에 존재하는 미정의 폴더
    const definedPaths = new Set(FOLDER_DEFS.map(d => d.path));
    const allFolders   = new Set([...definedPaths, ...Object.keys(filesByFolder)]);

    // 부모 그룹별로 자식 폴더 모으기
    const parentMap = {}; // { 'common': [...def], 'localisation': [...def] }
    PARENT_DEFS.forEach(p => { parentMap[p.key] = []; });

    FOLDER_DEFS.forEach(def => {
        if (parentMap[def.parent]) parentMap[def.parent].push(def);
    });

    // 정의되지 않은 부모(=미분류) 폴더 처리
    const ungrouped = [...allFolders].filter(fp => {
        const def = FOLDER_DEFS.find(d => d.path === fp);
        return !def; // 정의 없는 폴더
    }).sort();

    // ── 부모 그룹 렌더링 ──────────────────────────────
    PARENT_DEFS.forEach(parentDef => {
        const children = parentMap[parentDef.key] || [];
        // 이 그룹에 파일이 있는 자식 폴더만 (+ 정의된 모든 자식 표시)
        const isParentExpanded = _expandedParents.has(parentDef.key);

        const parentEl = document.createElement('div');
        parentEl.className = 'tree-parent';

        const parentHeader = document.createElement('div');
        parentHeader.className = 'tree-parent-header';
        parentHeader.innerHTML = `
            <span class="tree-arrow">${isParentExpanded ? '▾' : '▸'}</span>
            <span class="tree-folder-icon">${parentDef.icon}</span>
            <span class="tree-parent-label">${escapeHtml(parentDef.label)}</span>
        `;
        parentHeader.addEventListener('click', () => {
            _expandedParents[isParentExpanded ? 'delete' : 'add'](parentDef.key);
            renderExplorer();
        });
        parentEl.appendChild(parentHeader);

        if (isParentExpanded) {
            const childrenWrap = document.createElement('div');
            childrenWrap.className = 'tree-children';

            children.forEach(def => {
                childrenWrap.appendChild(
                    _makeFolderEl(def.path, def, filesByFolder[def.path] || [])
                );
            });

            // 이 부모 아래 미분류 폴더 (예: common/decisions 등)
            ungrouped
                .filter(fp => fp.startsWith(parentDef.key + '/'))
                .forEach(fp => {
                    childrenWrap.appendChild(
                        _makeFolderEl(fp, null, filesByFolder[fp] || [])
                    );
                });

            parentEl.appendChild(childrenWrap);
        }
        tree.appendChild(parentEl);
    });

    // ── 완전 미분류 폴더 (common/localisation 모두 아님) ──
    ungrouped
        .filter(fp => !PARENT_DEFS.some(p => fp.startsWith(p.key + '/')))
        .forEach(fp => {
            tree.appendChild(_makeFolderEl(fp, null, filesByFolder[fp] || []));
        });

    // ── 버튼 이벤트 위임 ──────────────────────────────
    tree.querySelectorAll('.tree-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const { action, folder, path } = btn.dataset;
            if (action === 'new-file')    _newFile(folder);
            if (action === 'import-file') _importFile(folder);
            if (action === 'export-file') _exportFile(path);
            if (action === 'delete-file') _deleteFile(path);
        });
    });
}

// ── 폴더 노드 생성 ───────────────────────────────────────
function _makeFolderEl(folderPath, def, files) {
    const isExpanded = _expandedFolders.has(folderPath);
    const label      = def?.label || folderPath.split('/').pop();

    const folderEl = document.createElement('div');
    folderEl.className = 'tree-folder';

    const header = document.createElement('div');
    header.className = 'tree-folder-header' + (isExpanded ? ' expanded' : '');
    header.title     = folderPath; // 경로는 툴팁으로
    header.innerHTML = `
        <span class="tree-arrow">${isExpanded ? '▾' : '▸'}</span>
        <span class="tree-folder-icon">📁</span>
        <span class="tree-folder-label">${escapeHtml(label)}</span>
        <div class="tree-folder-actions">
            <button class="tree-btn" data-action="new-file"    data-folder="${escapeHtml(folderPath)}" title="새 파일">＋</button>
            <button class="tree-btn" data-action="import-file" data-folder="${escapeHtml(folderPath)}" title="파일 불러오기">📥</button>
        </div>
    `;
    header.addEventListener('click', e => {
        if (e.target.closest('.tree-folder-actions')) return;
        _expandedFolders[isExpanded ? 'delete' : 'add'](folderPath);
        renderExplorer();
    });
    folderEl.appendChild(header);

    if (isExpanded) {
        const fileList = document.createElement('div');
        fileList.className = 'tree-file-list';
        if (!files.length) {
            fileList.innerHTML = '<div class="tree-empty">파일 없음</div>';
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
                fileList.appendChild(fileEl);
            });
        }
        folderEl.appendChild(fileList);
    }
    return folderEl;
}

function _fileIcon(path) {
    if (path.includes('national_focus')) return '🎯';
    if (path.includes('localisation'))   return '🌐';
    return '📄';
}

// ── 새 파일 만들기 ───────────────────────────────────────
function _newFile(folderPath) {
    const def = FOLDER_DEFS.find(d => d.path === folderPath);
    const ext = def?.ext || '.txt';
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
    } else {
        appState.project.files[filePath] = { type: 'unknown' };
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
    input.accept = '.txt,.yml,.yaml,.json';
    input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;
        const content  = await file.text();
        const parsed   = parseSingleFile(content, file.name);
        if (!parsed) {
            alert(`"${file.name}" 파일 유형을 인식할 수 없습니다.\n지원 형식: 국가중점 .txt, 로컬라이제이션 .yml`);
            return;
        }

        // 대상 폴더 선택 다이얼로그
        const suggested = suggestPath(parsed.type, file.name);
        const dest = prompt(
            `파일을 추가할 경로를 입력하세요.\n(폴더/파일명 형식)`,
            targetFolder ? `${targetFolder}/${file.name}` : suggested
        );
        if (!dest?.trim()) return;
        const destPath = dest.trim();

        if (appState.project.files[destPath]) {
            if (!confirm(`"${destPath}"에 이미 파일이 있습니다. 덮어쓰시겠습니까?`)) return;
        }

        appState.project.files[destPath] = parsed;
        appState.isDirty = true;
        const folder = destPath.substring(0, destPath.lastIndexOf('/'));
        _expandedFolders.add(folder);
        renderExplorer();
    };
    input.click();
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
    renderExplorer();
}

// ── 파일 열기 (편집기로 진입) ────────────────────────────
function openFile(filePath) {
    const fd = appState.project.files[filePath];
    if (!fd) return;
    appState.currentFile = filePath;
    appState.selectedFocusId = null;
    resetHistory();
    autoSaveToLocal();  // 탐색기에서 파일 열 때 현재 상태 로컬 저장

    if (fd.type === 'national_focus') {
        switchView('focus-editor-view');
        setupFocusEditorToolbar();
        renderFocusTree();
    } else if (fd.type === 'localisation') {
        switchView('localisation-editor-view');
        setupLocEditorToolbar();
        renderLocalisationList();
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
        ?.addEventListener('click', saveProjectZip);

    document.getElementById('btn-explorer-import')
        ?.addEventListener('click', () => _importFile(''));
}
