// ════════════════════════════════════════════════════════
//  gfx-editor.js — DDS 뷰어 / GFX 스프라이트 편집기
//  의존: state.js, io.js, explorer.js
// ════════════════════════════════════════════════════════

// ── DDS 이미지 뷰어 ─────────────────────────────────────
function renderDdsViewer(filePath, fd) {
    const container = document.getElementById('gfx-editor-content');
    if (!container) return;

    const filename = filePath.split('/').pop();
    const dataUrl  = _ddsBase64ToDataUrl(fd.base64);

    document.getElementById('gfx-editor-title').textContent = `🖼 ${filename}`;

    container.innerHTML = '';

    if (!dataUrl) {
        container.innerHTML = `
            <div class="gfx-placeholder">
                <p>⚠ DDS 디코딩 실패</p>
                <p class="gfx-placeholder-sub">지원 형식: DXT1, DXT5, 비압축 BGRA32</p>
                <p class="gfx-placeholder-sub" style="margin-top:8px;color:var(--text-muted);">경로: ${escapeHtml(filePath)}</p>
            </div>`;
        return;
    }

    const wrap = document.createElement('div');
    wrap.className = 'dds-viewer-wrap';
    wrap.innerHTML = `
        <p class="dds-path" style="margin-bottom:12px;">${escapeHtml(filePath)}</p>
        <div class="dds-viewer-canvas">
            <img src="${dataUrl}" alt="${escapeHtml(filename)}" class="dds-preview-img">
        </div>
        <div class="dds-viewer-actions" style="margin-top:12px;">
            <button id="btn-dds-export-png" class="secondary">💾 PNG로 내보내기</button>
        </div>
    `;
    container.appendChild(wrap);

    document.getElementById('btn-dds-export-png')?.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename.replace(/\.dds$/i, '.png');
        a.click();
    });
}

// ── GFX 스프라이트 편집기 ────────────────────────────────
function renderGfxEditor(filePath, fd) {
    const container = document.getElementById('gfx-editor-content');
    if (!container) return;

    const filename = filePath.split('/').pop();
    document.getElementById('gfx-editor-title').textContent = filename;

    _renderGfxList(container, filePath, fd);
}

function _renderGfxList(container, filePath, fd) {
    const sprites = fd.sprites || [];

    // DDS 파일 목록 수집 (autocomplete용)
    const ddsFiles = Object.keys(appState.project.files)
        .filter(p => p.endsWith('.dds'))
        .sort();

    container.innerHTML = '';

    // 헤더 액션
    const header = document.createElement('div');
    header.className = 'gfx-editor-header';
    header.innerHTML = `
        <div class="gfx-editor-header-row">
            <span class="gfx-file-path">${escapeHtml(filePath)}</span>
            <div style="display:flex;gap:8px;">
                <button id="btn-gfx-add" class="secondary">＋ 스프라이트 추가</button>
                <button id="btn-gfx-save">💾 파일 내보내기</button>
            </div>
        </div>
    `;
    container.appendChild(header);

    // 스프라이트 목록
    const list = document.createElement('div');
    list.className = 'gfx-sprite-list';

    if (!sprites.length) {
        list.innerHTML = '<div class="gfx-empty">스프라이트 없음. ＋ 버튼으로 추가하세요.</div>';
    } else {
        sprites.forEach((sprite, idx) => {
            const item = _makeGfxSpriteItem(sprite, idx, ddsFiles, filePath, fd);
            list.appendChild(item);
        });
    }
    container.appendChild(list);

    // 버튼 이벤트
    document.getElementById('btn-gfx-add')?.addEventListener('click', () => {
        fd.sprites.push({ name: 'GFX_goal_', texturefile: 'gfx/interface/goals/' });
        appState.isDirty = true;
        _renderGfxList(container, filePath, fd);
    });

    document.getElementById('btn-gfx-save')?.addEventListener('click', () => {
        const filename = filePath.split('/').pop();
        downloadBlob(buildGfxFile(fd), filename, 'text/plain;charset=utf-8');
    });
}

function _makeGfxSpriteItem(sprite, idx, ddsFiles, filePath, fd) {
    const item = document.createElement('div');
    item.className = 'gfx-sprite-item';

    // 미리보기 이미지
    const texPath = sprite.texturefile?.replace(/\\/g, '/');
    const ddsFile = texPath ? appState.project.files[texPath] : null;
    const previewUrl = ddsFile?.type === 'dds' ? _ddsBase64ToDataUrl(ddsFile.base64) : null;
    const previewHtml = previewUrl
        ? `<img src="${previewUrl}" class="gfx-sprite-thumb" alt="preview">`
        : `<div class="gfx-sprite-thumb-placeholder">🖼</div>`;

    item.innerHTML = `
        <div class="gfx-sprite-preview">${previewHtml}</div>
        <div class="gfx-sprite-fields">
            <div class="form-group" style="margin-bottom:8px;">
                <label style="font-size:11px;color:var(--text-muted);">GFX ID (name)</label>
                <input type="text" class="gfx-name-input" value="${escapeHtml(sprite.name)}" placeholder="GFX_goal_my_icon">
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label style="font-size:11px;color:var(--text-muted);">텍스처 파일 (texturefile)</label>
                <div style="position:relative;">
                    <input type="text" class="gfx-tex-input" value="${escapeHtml(sprite.texturefile)}" placeholder="gfx/interface/goals/my_icon.dds" autocomplete="off">
                    <div class="gfx-tex-dropdown ac-dropdown"></div>
                </div>
            </div>
        </div>
        <div class="gfx-sprite-actions">
            <button class="tree-btn danger gfx-delete-btn" title="삭제">🗑</button>
        </div>
    `;

    // name 입력 이벤트
    item.querySelector('.gfx-name-input').addEventListener('input', e => {
        fd.sprites[idx].name = e.target.value;
        appState.isDirty = true;
        // 중점 트리도 갱신 (열려있으면)
        if (document.getElementById('focus-editor-view')?.classList.contains('hidden') === false)
            renderFocusTree();
    });

    // texturefile 자동완성
    const texInput = item.querySelector('.gfx-tex-input');
    const texDrop  = item.querySelector('.gfx-tex-dropdown');
    texInput.addEventListener('input', e => {
        fd.sprites[idx].texturefile = e.target.value;
        appState.isDirty = true;
        const q = e.target.value.toLowerCase();
        const matches = ddsFiles.filter(p => p.toLowerCase().includes(q)).slice(0, 8);
        if (matches.length && q) {
            texDrop.innerHTML = matches.map(p =>
                `<div class="ac-item" data-val="${escapeHtml(p)}">${escapeHtml(p)}</div>`
            ).join('');
            texDrop.classList.add('active');
        } else {
            texDrop.classList.remove('active');
        }
        // 미리보기 갱신
        const tp = e.target.value.replace(/\\/g, '/');
        const df = appState.project.files[tp];
        const pu = df?.type === 'dds' ? _ddsBase64ToDataUrl(df.base64) : null;
        const prev = item.querySelector('.gfx-sprite-preview');
        prev.innerHTML = pu
            ? `<img src="${pu}" class="gfx-sprite-thumb" alt="preview">`
            : `<div class="gfx-sprite-thumb-placeholder">🖼</div>`;
        if (document.getElementById('focus-editor-view')?.classList.contains('hidden') === false)
            renderFocusTree();
    });

    texDrop.addEventListener('click', e => {
        const itm = e.target.closest('.ac-item');
        if (!itm) return;
        texInput.value = itm.dataset.val;
        fd.sprites[idx].texturefile = itm.dataset.val;
        texDrop.classList.remove('active');
        appState.isDirty = true;
        texInput.dispatchEvent(new Event('input'));
    });

    document.addEventListener('click', e => {
        if (!texInput.contains(e.target) && !texDrop.contains(e.target))
            texDrop.classList.remove('active');
    }, { capture: true });

    // 삭제
    item.querySelector('.gfx-delete-btn').addEventListener('click', () => {
        if (!confirm(`"${fd.sprites[idx].name}" 스프라이트를 삭제하시겠습니까?`)) return;
        fd.sprites.splice(idx, 1);
        appState.isDirty = true;
        const container = document.getElementById('gfx-editor-content');
        _renderGfxList(container, filePath, fd);
        if (document.getElementById('focus-editor-view')?.classList.contains('hidden') === false)
            renderFocusTree();
    });

    return item;
}

// ── GUI 뷰어 (미구현 — 원시 텍스트 표시) ────────────────
function renderGuiViewer(filePath, fd) {
    const container = document.getElementById('gfx-editor-content');
    if (!container) return;

    const filename = filePath.split('/').pop();
    document.getElementById('gfx-editor-title').textContent = `🖥 ${filename}`;

    container.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'dds-viewer-wrap';
    wrap.style.maxWidth = '100%';
    wrap.innerHTML = `
        <p class="dds-path" style="margin-bottom:12px;">${escapeHtml(filePath)}</p>
        <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:6px;padding:12px;margin-bottom:12px;">
            <p style="color:var(--text-muted);font-size:13px;margin-bottom:10px;">⚠ GUI 편집기는 아직 구현되지 않았습니다. 원시 텍스트로 표시합니다.</p>
            <textarea id="gui-raw-editor" style="width:100%;min-height:400px;font-family:monospace;font-size:12px;background:var(--bg-primary);color:var(--text-primary);border:1px solid var(--border);border-radius:4px;padding:8px;resize:vertical;box-sizing:border-box;">${escapeHtml(fd.raw || '')}</textarea>
        </div>
        <div style="display:flex;gap:8px;">
            <button id="btn-gui-save-raw" class="secondary">💾 변경사항 저장</button>
            <button id="btn-gui-export" class="secondary">📤 파일 내보내기</button>
        </div>
    `;
    container.appendChild(wrap);

    document.getElementById('btn-gui-save-raw')?.addEventListener('click', () => {
        const val = document.getElementById('gui-raw-editor')?.value || '';
        appState.project.files[filePath].raw = val;
        appState.isDirty = true;
        alert('저장되었습니다.');
    });

    document.getElementById('btn-gui-export')?.addEventListener('click', () => {
        const val = document.getElementById('gui-raw-editor')?.value || fd.raw || '';
        downloadBlob(val, filename, 'text/plain;charset=utf-8');
    });
}

// ── GFX 편집기 툴바 ─────────────────────────────────────
function setupGfxEditorListeners() {
    document.getElementById('btn-gfx-back')
        ?.addEventListener('click', () => switchView('explorer-view'));
}
