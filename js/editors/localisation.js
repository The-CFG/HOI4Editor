// ════════════════════════════════════════════════════════
//  localisation.js — 로컬라이제이션 파일 편집기
//  의존: state.js, io.js, explorer.js
// ════════════════════════════════════════════════════════

const LANG_NAMES = {
    english:'영어', korean:'한국어', japanese:'일본어', german:'독일어',
    french:'프랑스어', spanish:'스페인어', russian:'러시아어', polish:'폴란드어',
    braz_por:'브라질 포르투갈어', simp_chinese:'중국어 간체'
};

// ── 로컬라이제이션 변경 → 중점 이름 즉시 반영 ───────────
function _syncLocToFocuses(key, nameVal) {
    Object.values(appState.project.files).forEach(fd => {
        if (fd.type !== 'national_focus') return;
        if (fd.focuses[key]) fd.focuses[key].name = nameVal || key;
    });
}

// ── 편집기 툴바 설정 ─────────────────────────────────────
function setupLocEditorToolbar() {
    const fd       = currentFileData();
    const filename = appState.currentFile?.split('/').pop() || '';
    const lang     = fd?.lang || 'english';

    const titleEl = document.getElementById('loc-editor-title');
    if (titleEl) titleEl.textContent = `${filename}  (${LANG_NAMES[lang] || lang})`;

    document.getElementById('btn-loc-back')?.addEventListener('click', () => {
        switchView('explorer-view');
        renderExplorer();
    });
    document.getElementById('btn-loc-save-server')?.addEventListener('click', () => {
        if (!fd || !appState.currentFile) return;
        _saveCurrentFileToServer(appState.currentFile, fd);
    });
    document.getElementById('btn-loc-save-file')?.addEventListener('click', () => {
        if (!fd) return;
        downloadBlob(buildLocYml(fd), filename, 'text/yaml;charset=utf-8');
    });
    document.getElementById('btn-loc-import-file')?.addEventListener('click', _locImportFile);
    document.getElementById('btn-loc-raw-edit')?.addEventListener('click', () => {
        if (!fd || !appState.currentFile) return;
        const container = document.getElementById('localisation-list');
        if (!container) return;
        _renderRawWithReturn(
            container, appState.currentFile, fd,
            buildLocYml(fd),
            (newRaw) => {
                let parsed;
                try { parsed = parseLocalisationFile(newRaw, filename); }
                catch (e) { return { ok: false, msg: e.message }; }
                if (!parsed) return { ok: false, msg: 'l_언어: 헤더를 찾을 수 없습니다.' };
                fd.lang = parsed.lang;
                fd.data = parsed.data;
                appState.project.files[appState.currentFile] = fd;
                appState.isDirty = true;
                return { ok: true };
            },
            () => renderLocalisationList()
        );
    });
}

// ── 파일 내 불러오기 (덮어쓰기 / 병합) ──────────────────
function _locImportFile() {
    const input  = document.createElement('input');
    input.type   = 'file';
    input.accept = '.yml,.yaml';
    input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;
        const content = await file.text();
        const parsed  = parseLocalisationFile(content, file.name);
        if (!parsed) { alert('유효한 로컬라이제이션 파일이 아닙니다.'); return; }

        const fd = currentFileData();
        if (!fd) return;

        if (parsed.lang !== fd.lang) {
            if (!confirm(`현재 파일은 "${LANG_NAMES[fd.lang] || fd.lang}"이고,\n` +
                         `불러온 파일은 "${LANG_NAMES[parsed.lang] || parsed.lang}"입니다.\n계속하시겠습니까?`))
                return;
        }
        const hasExisting = Object.keys(fd.data).length > 0;
        const merge = hasExisting && confirm(
            '기존 항목이 있습니다.\n[확인] 병합 (중복 키는 새 값으로)\n[취소] 덮어쓰기'
        );
        if (merge) Object.assign(fd.data, parsed.data);
        else       fd.data = parsed.data;

        appState.isDirty = true;
        renderLocalisationList();
        CloudAuth.saveProject(appState.project.name).catch(console.error);
        alert(`불러오기 완료 (${Object.keys(parsed.data).length}개 항목)`);
    };
    input.click();
}

// ── 로컬라이제이션 목록 렌더링 ───────────────────────────
function renderLocalisationList() {
    const list     = document.getElementById('localisation-list');
    const searchEl = document.getElementById('loc-search');
    if (!list) return;

    const fd    = currentFileData();
    const data  = fd?.data || {};
    const lang  = fd?.lang || 'english';
    const query = searchEl?.value.trim().toLowerCase() || '';

    list.innerHTML = '';

    const allKeys  = Object.keys(data).sort();
    const filtered = query
        ? allKeys.filter(k => {
            const e = data[k];
            const n = typeof e === 'object' ? e.name || '' : e || '';
            return k.toLowerCase().includes(query) || n.toLowerCase().includes(query);
          })
        : allKeys;

    if (!filtered.length) {
        list.innerHTML = `<p class="loc-empty">${query ? '검색 결과가 없습니다.' : '항목이 없습니다.'}</p>`;
        return;
    }

    filtered.forEach(id => {
        const entry = data[id];
        const name  = typeof entry === 'object' ? entry.name || '' : entry || '';
        const desc  = typeof entry === 'object' ? entry.desc || '' : '';

        const item = document.createElement('div');
        item.className = 'localisation-item';
        item.innerHTML = `
            <div class="localisation-item-id">${escapeHtml(id)}</div>
            <label class="loc-label">이름</label>
            <input type="text" class="loc-name" value="${escapeHtml(name)}"
                placeholder="${escapeHtml(id)}의 ${LANG_NAMES[lang] || lang} 이름">
            <label class="loc-label" style="margin-top:4px;">설명 (_desc)</label>
            <textarea class="loc-desc" placeholder="설명">${escapeHtml(desc)}</textarea>
            <button class="loc-delete-btn danger" title="삭제">🗑 삭제</button>
        `;

        const save = (nameVal, descVal) => {
            data[id] = { name: nameVal, desc: descVal };
            appState.isDirty = true;
            // 같은 키를 가진 중점이 있으면 name 즉시 반영
            _syncLocToFocuses(id, nameVal);
        };
        item.querySelector('.loc-name').addEventListener('input', e =>
            save(e.target.value, (typeof data[id] === 'object' ? data[id].desc : '') || ''));
        item.querySelector('.loc-desc').addEventListener('input', e =>
            save((typeof data[id] === 'object' ? data[id].name : data[id]) || '', e.target.value));
        item.querySelector('.loc-delete-btn').addEventListener('click', () => {
            if (confirm(`"${id}" 항목을 삭제하시겠습니까?`)) {
                delete data[id];
                appState.isDirty = true;
                renderLocalisationList();
            }
        });

        list.appendChild(item);
    });
}

// ── 로컬라이제이션 편집기 전용 이벤트 연결 ──────────────
function setupLocalisationEditorListeners() {
    document.getElementById('loc-search')
        ?.addEventListener('input', renderLocalisationList);

    document.getElementById('btn-loc-add-entry')?.addEventListener('click', () => {
        const keyInput = document.getElementById('loc-new-key');
        const newKey   = keyInput?.value.trim();
        if (!newKey) { alert('추가할 ID를 입력해주세요.'); return; }
        const fd = currentFileData();
        if (!fd) return;
        if (fd.data[newKey]) { alert(`"${newKey}" 항목이 이미 존재합니다.`); return; }
        fd.data[newKey] = { name: '', desc: '' };
        appState.isDirty = true;
        if (keyInput) keyInput.value = '';
        renderLocalisationList();
    });

    document.getElementById('loc-new-key')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('btn-loc-add-entry')?.click();
    });
}
