// ════════════════════════════════════════════════════════
//  home.js — 홈 화면
//  의존: state.js, io.js, auth.js
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
                    const folderChecked  = files.every(f => checked.has(f));
                    const folderPartial  = !folderChecked && files.some(f => checked.has(f));
                    const folderRow = document.createElement('div');
                    folderRow.style.cssText = 'display:flex;align-items:center;gap:6px;padding:5px 4px 3px;margin-top:6px;border-bottom:1px solid var(--border,#b2bec3);';
                    folderRow.innerHTML = `
                        <input type="checkbox" class="fsel-folder-cb" data-folder="${escapeHtml(folder)}"
                            style="width:14px;height:14px;accent-color:#4a9eff;flex-shrink:0;cursor:pointer;">
                        <span style="font-size:12px;font-weight:600;color:var(--text-muted);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(folder)}">
                            📁 ${escapeHtml(folder)}
                        </span>
                        <span style="font-size:11px;color:var(--text-muted);">${files.filter(f => checked.has(f)).length}/${files.length}</span>
                    `;
                    const cb = folderRow.querySelector('.fsel-folder-cb');
                    cb.checked       = folderChecked;
                    cb.indeterminate = folderPartial;
                    cb.addEventListener('change', () => {
                        const allFiles = filePaths.filter(fp => {
                            const sl = fp.lastIndexOf('/');
                            return (sl === -1 ? '' : fp.substring(0, sl)) === folder;
                        });
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
        document.getElementById('fsel-close').onclick   = () => cleanup(null);

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


function _progressShow(title, icon = '☁️') {
    const modal = document.getElementById('progress-modal');
    if (!modal) return;
    document.getElementById('progress-title').textContent    = title;
    document.getElementById('progress-icon').textContent     = icon;
    document.getElementById('progress-detail').textContent   = '';
    document.getElementById('progress-bar-fill').style.width = '0%';
    document.getElementById('progress-pct').textContent      = '0%';
    document.getElementById('progress-step-label').textContent = '';
    modal.style.display = 'flex';
}

function _progressUpdate(pct, detail) {
    const fill = document.getElementById('progress-bar-fill');
    if (fill) fill.style.width = pct + '%';
    const pctEl = document.getElementById('progress-pct');
    if (pctEl) pctEl.textContent = pct + '%';
    const detailEl = document.getElementById('progress-detail');
    if (detailEl) detailEl.textContent = detail || '';
}

function _progressHide() {
    const modal = document.getElementById('progress-modal');
    if (modal) modal.style.display = 'none';
}

// ── 홈 화면 진입 ─────────────────────────────────────────
function showHomeView() {
    appState.project     = { name: '', files: {} };
    appState.currentFile = null;
    switchView('home-view');
    renderRecentList();
}

// ── 최근 목록 렌더링 (클라우드 전용) ────────────────────
async function renderRecentList() {
    const el = document.getElementById('recent-list');
    if (!el) return;

    const user = await CloudAuth.getUser();

    if (!user) {
        el.innerHTML = '<p class="home-empty">🔒 로그인하면 프로젝트 목록이 표시됩니다.</p>';
        return;
    }

    el.innerHTML = '<p class="home-empty" style="color:var(--text-muted)">☁️ 불러오는 중...</p>';

    let projects = [];
    try {
        projects = await CloudAuth.listProjects();
    } catch (e) {
        el.innerHTML = '<p class="home-empty" style="color:#e07070;">⚠ 서버 연결 실패. 잠시 후 다시 시도해주세요.</p>';
        console.error('프로젝트 목록 조회 실패:', e);
        return;
    }

    if (!projects.length) {
        el.innerHTML = '<p class="home-empty">저장된 프로젝트가 없습니다. 새 프로젝트를 만들어보세요.</p>';
        return;
    }

    el.innerHTML = '';
    for (const p of projects) {
        const item = document.createElement('div');
        item.className = 'recent-item clickable';
        item.title = `"${p.name}" 불러오기`;
        item.innerHTML = `
            <span class="recent-name">📁 ${escapeHtml(p.name)}</span>
            <span class="recent-date">${new Date(p.updated_at).toLocaleDateString('ko-KR')}</span>
            <span class="recent-status">☁️</span>
            <button class="recent-delete-btn" title="프로젝트 삭제">🗑</button>
        `;

        item.addEventListener('click', e => {
            if (e.target.classList.contains('recent-delete-btn')) return;
            _openCloudProject(p.name);
        });

        item.querySelector('.recent-delete-btn').addEventListener('click', async e => {
            e.stopPropagation();
            if (!confirm(`"${p.name}" 프로젝트를 서버에서 완전히 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
            item.style.opacity = '0.4';
            try {
                await CloudAuth.deleteProject(p.name);
                renderRecentList();
            } catch (err) {
                alert('삭제 실패: ' + err.message);
                item.style.opacity = '1';
            }
        });

        el.appendChild(item);
    }
}

// ── 클라우드에서 프로젝트 열기 (목록만 로드 → 지연 로딩) ─
async function _openCloudProject(name) {
    _progressShow(`"${name}" 목록 불러오는 중...`, '☁️');
    _progressUpdate(10, '파일 목록 조회 중...');

    let proj;
    try {
        proj = await CloudAuth.loadProjectMeta(name);
    } catch (e) {
        _progressHide();
        alert(`불러오기 실패: ${e.message}`);
        renderRecentList();
        return;
    }

    _progressUpdate(100, '완료!');
    _progressHide();

    if (!proj) {
        alert(`"${name}" 데이터를 불러올 수 없습니다.`);
        renderRecentList();
        return;
    }

    appState.project     = proj;
    appState.currentFile = null;
    appState.isDirty     = false;
    resetHistory();
    switchView('explorer-view');
    renderExplorer();
}

// ── 새 프로젝트 ──────────────────────────────────────────
async function createNewProject() {
    const nameEl = document.getElementById('new-project-name');
    const name   = nameEl?.value.trim();
    if (!name) { alert('프로젝트(모드) 이름을 입력해주세요.'); return; }

    const user = await CloudAuth.getUser();
    if (!user) { alert('프로젝트를 만들려면 먼저 로그인해주세요.'); return; }

    const proj = { name, files: {} };
    appState.project     = proj;
    appState.currentFile = null;
    appState.isDirty     = false;
    resetHistory();

    // 서버에 메타 즉시 생성
    try {
        await CloudAuth._saveProjectMeta(user.id, name);
    } catch (e) {
        console.warn('서버 메타 생성 실패:', e);
    }

    if (nameEl) nameEl.value = '';
    switchView('explorer-view');
    renderExplorer();
}

// ── 프로젝트 불러오기 (ZIP) ──────────────────────────────
async function loadProjectFile(file) {
    const user = await CloudAuth.getUser();
    if (!user) { alert('ZIP을 불러오려면 먼저 로그인해주세요.'); return; }

    try {
        let proj;
        if (file.name.endsWith('.zip')) {
            proj = await unpackProjectZip(await file.arrayBuffer());
        } else if (file.name.endsWith('.json')) {
            const json = JSON.parse(await file.text());
            proj = json.version === 2 ? json : migrateV1Project(json);
        } else {
            alert('ZIP 또는 JSON 파일만 불러올 수 있습니다.');
            return;
        }
        if (!proj) { alert('프로젝트를 파싱할 수 없습니다.'); return; }

        // ── 파일 선택 모달 ──────────────────────────────
        const allPaths = Object.keys(proj.files).sort();
        const selected = await _showFileSelectModal(allPaths, 'upload');
        if (!selected) return; // 취소
        if (selected.size === 0) { alert('선택된 파일이 없습니다.'); return; }

        // 선택된 파일만 추출
        const filteredFiles = {};
        selected.forEach(p => { if (proj.files[p]) filteredFiles[p] = proj.files[p]; });
        proj = { ...proj, files: filteredFiles };

        appState.project     = proj;
        appState.currentFile = null;
        appState.isDirty     = true;
        resetHistory();

        // 서버에 즉시 저장
        try {
            _progressShow(`"${proj.name}" 서버에 업로드 중...`, '📤');
            await CloudAuth.saveProject(proj.name, (pct, detail) => {
                _progressUpdate(pct, detail);
            });
            _progressHide();
            appState.isDirty = false;
        } catch (e) {
            _progressHide();
            console.warn('ZIP 업로드 후 서버 저장 실패:', e);
        }

        switchView('explorer-view');
        renderExplorer();
        alert(`"${proj.name}" 불러오기 완료 (${selected.size}개 파일)`);
    } catch (err) {
        alert('프로젝트 불러오기 오류:\n' + err.message);
    }
}

// ── 프로젝트 ZIP 내보내기 + 서버 동기화 ─────────────────
async function saveProjectZip() {
    if (!appState.project.name) { alert('먼저 프로젝트를 만들거나 불러와주세요.'); return; }

    try {
        // ── 1. stub 파일 서버에서 로드 ───────────────────
        const stubPaths = Object.entries(appState.project.files)
            .filter(([, fd]) => fd?._stub === true)
            .map(([p]) => p);

        if (stubPaths.length > 0) {
            const user = await CloudAuth.getUser().catch(() => null);
            if (!user) {
                alert('서버에 저장된 파일이 있지만 로그인 상태가 아닙니다.\n로그인 후 다시 시도해주세요.');
                return;
            }
            _progressShow(`파일 불러오는 중... (0 / ${stubPaths.length})`, '☁️');
            for (let i = 0; i < stubPaths.length; i++) {
                const fp = stubPaths[i];
                _progressUpdate(
                    Math.round((i / stubPaths.length) * 80),
                    `${fp.split('/').pop()} (${i + 1} / ${stubPaths.length})`
                );
                try {
                    const fd = await CloudAuth.fetchFile(
                        appState.project.name, fp,
                        appState.project.files[fp].type
                    );
                    if (fd) appState.project.files[fp] = fd;
                } catch (e) {
                    console.warn(`stub 로드 실패 (${fp}):`, e);
                }
            }
            _progressHide();
        }

        // ── 2. 파일 선택 모달 ────────────────────────────
        const allPaths = Object.keys(appState.project.files).sort();
        const selected = await _showFileSelectModal(allPaths, 'download');
        if (!selected) return; // 취소
        if (selected.size === 0) { alert('선택된 파일이 없습니다.'); return; }

        // ── 3. ZIP 패킹 ───────────────────────────────────
        _progressShow('ZIP 생성 중...', '📦');
        _progressUpdate(10, `${selected.size}개 파일 압축 중...`);
        const blob = await packProjectZip(selected);
        _progressHide();

        if (!blob) { alert('JSZip 라이브러리를 불러오지 못했습니다.'); return; }

        // 전체 선택이면 원본 이름, 부분 선택이면 _partial 접미사
        const isPartial = selected.size < allPaths.length;
        const zipName   = isPartial
            ? `${appState.project.name}_partial.zip`
            : `${appState.project.name}.zip`;
        downloadBlob(blob, zipName, 'application/zip');

        // ── 4. 서버 동기화 (로그인 상태, 전체 선택 시만) ─
        if (!isPartial) {
            try {
                const user = await CloudAuth.getUser().catch(() => null);
                if (user) {
                    _progressShow(`"${appState.project.name}" 서버에 저장 중...`, '💾');
                    await CloudAuth.saveProject(appState.project.name, (pct, detail) => {
                        _progressUpdate(pct, detail);
                    });
                    _progressHide();
                    appState.isDirty = false;
                }
            } catch (e) {
                _progressHide();
                console.warn('서버 동기화 실패:', e);
            }
        }

    } catch (err) {
        _progressHide();
        alert('저장 중 오류가 발생했습니다:\n' + err.message);
    }
}

// ── 자동 저장 (30초 인터벌 / beforeunload 에서 호출) ─────
function autoSaveToLocal() {
    if (!appState.project.name) return;
    // 로컬스토리지 없음 — 서버에만 저장
    CloudAuth.getUser().then(user => {
        if (user) CloudAuth.saveProject(appState.project.name)
            .then(() => { appState.isDirty = false; })
            .catch(e => console.warn('자동 저장 실패:', e));
    }).catch(() => {});
}

// ── 홈 화면 이벤트 연결 ──────────────────────────────────
function setupHomeListeners() {
    document.getElementById('btn-create-project')
        ?.addEventListener('click', createNewProject);
    document.getElementById('new-project-name')
        ?.addEventListener('keydown', e => { if (e.key === 'Enter') createNewProject(); });

    const loaderEl = document.getElementById('file-loader-project');
    document.getElementById('btn-open-project')
        ?.addEventListener('click', () => loaderEl?.click());
    loaderEl?.addEventListener('change', async e => {
        const file = e.target.files[0];
        if (file) await loadProjectFile(file);
        e.target.value = '';
    });
}
