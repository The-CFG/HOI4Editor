let isSignUpMode = false;

const CloudAuth = {
    // ── 기본 인증 ──────────────────────────────────────────
    async getUser() {
        const { data: { user } } = await _supabase.auth.getUser();
        return user;
    },

    async signUp(email, password) {
        return await _supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: undefined }
        });
    },

    async login(email, password) {
        return await _supabase.auth.signInWithPassword({ email, password });
    },

    async logout() {
        await _supabase.auth.signOut();
        _updateAuthStatus(null);
    },

    // ── 프로젝트 목록 조회 (projects 테이블) ────────────────
    // 반환: [{ name, updated_at }, ...]
    async listProjects() {
        const user = await this.getUser();
        if (!user) return [];
        const { data, error } = await _supabase
            .from('projects')
            .select('name, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });
        if (error) { console.error('listProjects 오류:', error.message); return []; }
        return data || [];
    },

    // ── 프로젝트 메타 upsert (projects 테이블) ───────────────
    async _saveProjectMeta(userId, name) {
        const { error } = await _supabase.from('projects').upsert({
            user_id: userId,
            name,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,name' });
        if (error) console.error('프로젝트 메타 저장 오류:', error.message);
    },

    // ── 프로젝트 저장 (파일별 분리) ─────────────────────────
    // appState.project.files 를 직접 참조해 file_path 1개 = 행 1개로 upsert
    async saveProject(projectName) {
        if (!projectName) return;
        const user = await this.getUser();
        if (!user) return;

        const files = appState?.project?.files;
        if (!files) return;

        await this._saveProjectMeta(user.id, projectName);

        const rows       = [];   // text 기반 파일
        const imgUploads = [];   // 이미지 파일

        for (const [filePath, fd] of Object.entries(files)) {
            if (!fd) continue;

            // 이미지 (dds / image) → Storage upload
            if ((fd.type === 'dds' || fd.type === 'image') && fd.base64) {
                imgUploads.push({ filePath, fd });
                continue;
            }

            // 텍스트 직렬화
            let content = null;
            if (fd.type === 'national_focus')    content = buildFocusTxt(fd);
            else if (fd.type === 'localisation') content = buildLocYml(fd);
            else if (fd.type === 'gfx_define')   content = buildGfxFile(fd);
            else if (fd.raw != null)              content = fd.raw;
            else                                  content = JSON.stringify(fd);

            rows.push({
                user_id:      user.id,
                project_name: projectName,
                file_path:    filePath,
                file_type:    fd.type || 'raw',
                content:      content,
                storage_path: null,
                updated_at:   new Date().toISOString()
            });
        }

        // 텍스트 파일 일괄 upsert (200개씩 분할)
        const CHUNK = 200;
        for (let i = 0; i < rows.length; i += CHUNK) {
            const chunk = rows.slice(i, i + CHUNK);
            const { error } = await _supabase
                .from('project_files')
                .upsert(chunk, { onConflict: 'user_id,project_name,file_path' });
            if (error) console.error('project_files upsert 오류:', error.message);
        }

        // 이미지 파일 → Storage 업로드 후 storage_path 저장
        for (const { filePath, fd } of imgUploads) {
            try {
                const b64clean = fd.base64.replace(/^data:[^;]+;base64,/, '');
                const byteStr  = atob(b64clean);
                const arr      = new Uint8Array(byteStr.length);
                for (let b = 0; b < byteStr.length; b++) arr[b] = byteStr.charCodeAt(b);
                const storagePath = `${user.id}/${projectName}/${filePath}`;
                const { error: upErr } = await _supabase.storage
                    .from('mod-images')
                    .upload(storagePath, arr, { upsert: true });
                if (upErr) { console.error('이미지 업로드 오류:', upErr.message); continue; }

                const { error: rowErr } = await _supabase
                    .from('project_files')
                    .upsert({
                        user_id:      user.id,
                        project_name: projectName,
                        file_path:    filePath,
                        file_type:    fd.type,
                        content:      null,
                        storage_path: storagePath,
                        updated_at:   new Date().toISOString()
                    }, { onConflict: 'user_id,project_name,file_path' });
                if (rowErr) console.error('이미지 행 upsert 오류:', rowErr.message);
            } catch (e) {
                console.error(`이미지 처리 실패 (${filePath}):`, e);
            }
        }

        console.log(`[클라우드] "${projectName}" 저장 완료 (텍스트 ${rows.length}개, 이미지 ${imgUploads.length}개)`);
    },

    // ── 프로젝트 로드 ────────────────────────────────────────
    // 반환: { name, files } 또는 null
    async loadProject(projectName) {
        const user = await this.getUser();
        if (!user) return null;

        const { data, error } = await _supabase
            .from('project_files')
            .select('file_path, file_type, content, storage_path')
            .eq('user_id', user.id)
            .eq('project_name', projectName);

        if (error) { console.error('loadProject 오류:', error.message); return null; }
        if (!data || data.length === 0) return null;

        const files = {};

        for (const row of data) {
            const { file_path, file_type, content, storage_path } = row;

            // 이미지 → Storage download → base64
            if (storage_path) {
                try {
                    const { data: blob, error: dlErr } = await _supabase.storage
                        .from('mod-images')
                        .download(storage_path);
                    if (dlErr) { console.error('이미지 다운로드 오류:', dlErr.message); continue; }
                    const b64 = await _blobToBase64(blob);
                    files[file_path] = { type: file_type, base64: b64 };
                } catch (e) {
                    console.error(`이미지 복원 실패 (${file_path}):`, e);
                }
                continue;
            }

            // 텍스트 파일 → parseSingleFile 또는 raw 복원
            if (file_type === 'national_focus' || file_type === 'localisation'
                || file_type === 'gfx_define'  || file_type === 'gui') {
                const filename = file_path.split('/').pop();
                const parsed   = parseSingleFile(content, filename, file_path);
                files[file_path] = parsed || { type: file_type, raw: content };
            } else {
                // raw / unknown — JSON이면 파싱, 아니면 raw로
                try {
                    files[file_path] = JSON.parse(content);
                } catch {
                    files[file_path] = { type: file_type, raw: content };
                }
            }
        }

        console.log(`[클라우드] "${projectName}" 로드 완료 (파일 ${Object.keys(files).length}개)`);
        return { name: projectName, files };
    },

    // ── 프로젝트 삭제 ────────────────────────────────────────
    async deleteProject(projectName) {
        const user = await this.getUser();
        if (!user) return;

        // 1. Storage 이미지 삭제
        const { data: imgRows } = await _supabase
            .from('project_files')
            .select('storage_path')
            .eq('user_id', user.id)
            .eq('project_name', projectName)
            .not('storage_path', 'is', null);

        if (imgRows?.length) {
            const paths = imgRows.map(r => r.storage_path);
            const { error: stErr } = await _supabase.storage.from('mod-images').remove(paths);
            if (stErr) console.error('Storage 삭제 오류:', stErr.message);
        }

        // 2. project_files 행 전체 삭제
        await _supabase.from('project_files')
            .delete()
            .eq('user_id', user.id)
            .eq('project_name', projectName);

        // 3. projects 메타 행 삭제
        await _supabase.from('projects')
            .delete()
            .eq('user_id', user.id)
            .eq('name', projectName);

        console.log(`[클라우드] "${projectName}" 삭제 완료`);
    }
};

// ── Blob → base64 헬퍼 ──────────────────────────────────────
function _blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

// ── 로그인 상태 표시 ────────────────────────────────────────
function _updateAuthStatus(user) {
    const statusEl = document.getElementById('auth-status-text');
    const btnOpen  = document.getElementById('btn-open-auth');
    if (!statusEl) return;
    if (user) {
        statusEl.textContent = `✅ ${user.email} 로그인됨`;
        if (btnOpen) btnOpen.textContent = '🌐 로그아웃';
    } else {
        statusEl.textContent = '';
        if (btnOpen) btnOpen.textContent = '🌐 서버 동기화 로그인';
    }
}

// ── 모달 열기 / 닫기 헬퍼 ──────────────────────────────────
function _openModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'flex';
}
function _closeModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'none';
}

// ── UI 이벤트 연결 ──────────────────────────────────────────
function setupAuthUI() {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    const title      = document.getElementById('auth-title');
    const executeBtn = document.getElementById('btn-auth-execute');
    const switchBtn  = document.getElementById('auth-switch');
    const closeBtn   = document.getElementById('btn-auth-close');
    const openBtn    = document.getElementById('btn-open-auth');

    // 로그인 버튼 / 로그아웃 분기
    openBtn?.addEventListener('click', async () => {
        const user = await CloudAuth.getUser();
        if (user) {
            if (confirm(`${user.email} 에서 로그아웃하시겠습니까?`)) {
                await CloudAuth.logout();
                renderRecentList();  // 홈 목록 갱신
            }
        } else {
            isSignUpMode = false;
            if (title)      title.textContent     = '서버 로그인';
            if (executeBtn) executeBtn.textContent = '로그인';
            if (switchBtn)  switchBtn.textContent  = '계정이 없으신가요? 회원가입';
            _openModal();
        }
    });

    closeBtn?.addEventListener('click', _closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) _closeModal(); });

    // 로그인 ↔ 회원가입 전환
    switchBtn?.addEventListener('click', () => {
        isSignUpMode = !isSignUpMode;
        if (title)      title.textContent     = isSignUpMode ? '서버 계정 생성' : '서버 로그인';
        if (executeBtn) executeBtn.textContent = isSignUpMode ? '가입하기'       : '로그인';
        if (switchBtn)  switchBtn.textContent  = isSignUpMode
            ? '이미 계정이 있나요? 로그인'
            : '계정이 없으신가요? 회원가입';
    });

    // 실행 (로그인 / 회원가입)
    executeBtn?.addEventListener('click', async () => {
        const email = document.getElementById('auth-email')?.value?.trim();
        const pw    = document.getElementById('auth-password')?.value;
        if (!email || !pw) { alert('이메일과 비밀번호를 입력해주세요.'); return; }

        executeBtn.disabled    = true;
        executeBtn.textContent = '처리 중...';

        try {
            const { data, error } = isSignUpMode
                ? await CloudAuth.signUp(email, pw)
                : await CloudAuth.login(email, pw);

            if (error) throw error;

            if (isSignUpMode) {
                if (data?.session) {
                    _updateAuthStatus(data.session.user);
                    alert('회원가입 및 로그인 완료!');
                    _closeModal();
                    renderRecentList();
                } else {
                    alert('가입 신청 완료!\nSupabase 대시보드에서 이메일 인증을 비활성화하면 바로 로그인할 수 있습니다.');
                }
            } else {
                _updateAuthStatus(data.user);
                alert('로그인 완료! 서버 동기화가 활성화됩니다.');
                _closeModal();
                renderRecentList();  // 클라우드 프로젝트 목록 즉시 갱신
            }
        } catch (err) {
            if (err.message?.includes('Email not confirmed')) {
                alert(
                    '이메일 인증이 필요합니다.\n\n해결 방법:\n' +
                    '① Supabase 대시보드 → Authentication → Providers → Email → "Confirm email" 비활성화\n' +
                    '② 또는 가입 시 받은 인증 메일에서 링크 클릭 후 다시 로그인'
                );
            } else {
                alert('인증 오류: ' + err.message);
            }
        } finally {
            executeBtn.disabled    = false;
            executeBtn.textContent = isSignUpMode ? '가입하기' : '로그인';
        }
    });

    // 페이지 로드 시 현재 로그인 상태 반영
    CloudAuth.getUser().then(user => _updateAuthStatus(user));
}
