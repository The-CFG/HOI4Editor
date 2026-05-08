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
    { key: 'gfx',          label: 'gfx',          icon: '📂' },
    { key: 'interface',    label: 'interface',     icon: '📂' },
];

// 현재 펼쳐진 폴더 / 부모 그룹 추적
const _expandedFolders = new Set();
const _expandedParents = new Set(['common', 'localisation']); // 기본 펼침

// 사용자가 직접 생성한 폴더 목록 (파일 없어도 트리에 유지)
const _customFolders = new Set();

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

    // 모든 실존 폴더 수집 (파일이 있는 폴더 + 정의된 폴더 + 커스텀 폴더)
    const definedPaths = new Set(FOLDER_DEFS.map(d => d.path));
    const allFolderSet = new Set([
        ...definedPaths,
        ...Object.keys(filesByFolder),
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
                <button class="tree-btn" data-action="new-subfolder" data-folder="${escapeHtml(parentDef.key)}" title="새 하위 폴더">📁+</button>
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

            // 이 부모 바로 아래 1단계 폴더들만 렌더링 (재귀로 하위 처리)
            const directChildren = getFoldersByParent(parentDef.key)
                .filter(fp => fp.split('/').length === 2); // parentKey/childName

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
    if (path.includes('localisation'))   return '🌐';
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
        applyLocToAllFocuses(fd);   // 열 때 로컬라이제이션 일괄 반영
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
