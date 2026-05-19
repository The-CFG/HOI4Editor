// ════════════════════════════════════════════════════════
//  home.js — 홈 화면
//  의존: state.js, io-parsers.js, io-zip.js, io-image.js, auth.js, cloud-ui.js
//  저장 유틸(_progressShow 등)은 cloud-ui.js로 분리됨
//  저장소: Supabase 전용 (로컬스토리지 미사용)
// ════════════════════════════════════════════════════════

// ── 파일 선택 모달 ───────────────────────────────────────
// filePaths: string[]  — 선택 가능한 전체 파일 경로 목록
// mode: 'download' | 'upload'
// returns: Promise<Set<string> | null>  — null이면 취소
function _showFileSelectModal(filePaths, mode) {
    return new Promise(resolve => {
        const modal   = document.getElementById('file-select-modal');
        const tree    = document.getElementById('fsel-tree');
        const title   = document.getElementById('fsel-title');
        const countEl = document.getElementById('fsel-count');
        const search  = document.getElementById('fsel-search');
        if (!modal || !tree) { resolve(null); return; }

        title.textContent = mode === 'download'
            ? '📦 다운로드할 파일 선택'
            : '📤 업로드할 파일 선택';

        // 체크 상태 관리
        const checked = new Set(filePaths);

        const updateCount = () => {
            countEl.textContent = `${checked.size} / ${filePaths.length}개 선택`;
        };

        // 폴더 트리 렌더링
        const renderTree = (filter = '') => {
            tree.innerHTML = '';
            const lf = filter.toLowerCase();

            // 폴더 → 파일 그룹핑
            const folderMap = {};  // folderPath → [filePath]
            filePaths.forEach(fp => {
                if (lf && !fp.toLowerCase().includes(lf)) return;
                const slash = fp.lastIndexOf('/');
                const folder = slash === -1 ? '' : fp.substring(0, slash);
                if (!folderMap[folder]) folderMap[folder] = [];
                folderMap[folder].push(fp);
            });

            // 폴더 계층 정렬 (루트 → 깊은 순)
            const folders = Object.keys(folderMap).sort((a, b) => {
                if (a === '') return -1;
                if (b === '') return 1;
                return a.localeCompare(b);
            });

            folders.forEach(folder => {
                const files = folderMap[folder].sort();

                // 폴더 헤더 (루트 파일은 헤더 없이 바로)
                if (folder !== '') {
                    // 이 폴더 경로로 시작하는 모든 파일 (직속 + 하위 폴더 재귀 포함)
                    const folderFiles   = filePaths.filter(fp => fp.startsWith(folder + '/'));
                    const folderChecked = folderFiles.length > 0 && folderFiles.every(f => checked.has(f));
                    const folderPartial = !folderChecked && folderFiles.some(f => checked.has(f));
                    const folderRow = document.createElement('div');
                    folderRow.style.cssText = 'display:flex;align-items:center;gap:6px;padding:5px 4px 3px;margin-top:6px;border-bottom:1px solid var(--border,#b2bec3);';
                    folderRow.innerHTML = `
                        <input type="checkbox" class="fsel-folder-cb" data-folder="${escapeHtml(folder)}"
                            style="width:14px;height:14px;accent-color:#4a9eff;flex-shrink:0;cursor:pointer;">
                        <span style="font-size:12px;font-weight:600;color:var(--text-muted);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(folder)}">
                            📁 ${escapeHtml(folder)}
                        </span>
                        <span style="font-size:11px;color:var(--text-muted);">${folderFiles.filter(f => checked.has(f)).length}/${folderFiles.length}</span>
                    `;
                    const cb = folderRow.querySelector('.fsel-folder-cb');
                    cb.checked       = folderChecked;
                    cb.indeterminate = folderPartial;
                    cb.addEventListener('change', () => {
                        // 하위 전체 파일 재귀 토글
                        const allFiles = filePaths.filter(fp => fp.startsWith(folder + '/'));
                        if (cb.checked) allFiles.forEach(f => checked.add(f));
                        else            allFiles.forEach(f => checked.delete(f));
                        renderTree(search.value);
                        updateCount();
                    });
                    tree.appendChild(folderRow);
                }

                // 파일 목록
                files.forEach(fp => {
                    const filename = fp.split('/').pop();
                    const row = document.createElement('div');
                    row.style.cssText = 'display:flex;align-items:center;gap:6px;padding:3px 4px 3px ' + (folder ? '20px' : '4px') + ';';
                    row.innerHTML = `
                        <input type="checkbox" class="fsel-file-cb" data-path="${escapeHtml(fp)}"
                            style="width:13px;height:13px;accent-color:#4a9eff;flex-shrink:0;cursor:pointer;">
                        <span style="font-size:12px;color:var(--text);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(fp)}">
                            ${escapeHtml(filename)}
                        </span>
                        <span style="font-size:11px;color:var(--text-muted);flex-shrink:0;">${_fselFileType(fp)}</span>
                    `;
                    const fileCb = row.querySelector('.fsel-file-cb');
                    fileCb.checked = checked.has(fp);
                    fileCb.addEventListener('change', e => {
                        if (e.target.checked) checked.add(fp);
                        else                  checked.delete(fp);
                        renderTree(search.value);
                        updateCount();
                    });
                    tree.appendChild(row);
                });
            });

            if (tree.innerHTML === '') {
                tree.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:12px 4px;">검색 결과 없음</p>';
            }
            updateCount();
        };

        search.value = '';
        search.oninput = () => renderTree(search.value);
        renderTree();

        // 전체 선택 / 해제
        document.getElementById('fsel-all').onclick  = () => { filePaths.forEach(f => checked.add(f));    renderTree(search.value); };
        document.getElementById('fsel-none').onclick = () => { checked.clear(); renderTree(search.value); };

        // 확인 / 취소 / 닫기
        const cleanup = (result) => {
            modal.style.display = 'none';
            search.oninput = null;
            resolve(result);
        };
        document.getElementById('fsel-confirm').onclick = () => cleanup(new Set(checked));
        document.getElementById('fsel-cancel').onclick  = () => cleanup(null);

        modal.style.display = 'flex';
    });
}

// 파일 타입 레이블
function _fselFileType(path) {
    if (path.includes('national_focus')) return '🎯 중점';
    if (path.includes('localisation'))   return '🌐 로컬';
    if (path.includes('ideas'))          return '💡 아이디어';
    if (path.includes('decisions'))      return '⚖️ 디시전';
    if (path.includes('characters'))     return '👤 인물';
    if (path.endsWith('.dds') || path.endsWith('.png') ||
        path.endsWith('.tga') || path.endsWith('.bmp')) return '🖼 이미지';
    if (path.endsWith('.gfx'))  return '🎨 GFX';
    if (path.endsWith('.gui'))  return '🖥 GUI';
    return '📄 파일';
}


function setupHomeListeners() {
    document.getElementById('btn-create-project')
        ?.addEventListener('click', createNewProject);
    document.getElementById('new-project-name')
        ?.addEventListener('keydown', e => { if (e.key === 'Enter') createNewProject(); });

    const zipLoader = document.getElementById('file-loader-project-zip');
    document.getElementById('btn-open-project-zip')
        ?.addEventListener('click', () => zipLoader?.click());
    zipLoader?.addEventListener('change', async e => {
        const file = e.target.files[0];
        if (file) await loadProjectFile(file);
        e.target.value = '';
    });

    const dirLoader = document.getElementById('file-loader-project-dir');
    document.getElementById('btn-open-project-dir')
        ?.addEventListener('click', () => dirLoader?.click());
    dirLoader?.addEventListener('change', async e => {
        if (e.target.files.length) await loadProjectFromFolder(e.target.files);
        e.target.value = '';
    });
}
