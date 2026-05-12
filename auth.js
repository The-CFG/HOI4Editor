let isSignUpMode = false;

const CloudAuth = {
    async getUser() {
        const { data: { user } } = await _supabase.auth.getUser();
        return user;
    },

    async signUp(email, password) {
        // emailRedirectTo 없이 가입 — Supabase 설정에서 이메일 인증 해제 시 즉시 로그인 가능
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

    async saveProject(type, name, data) {
        const user = await this.getUser();
        if (!user) return;
        const { error } = await _supabase.from('user_projects').upsert({
            user_id: user.id,
            project_type: type,
            project_name: name,
            content: data,
            updated_at: new Date()
        });
        if (error) console.error('Cloud Sync Error:', error.message);
        else console.log(`[${type}] "${name}" 서버 동기화 완료`);
    }
};

// ── 로그인 상태 표시 ─────────────────────────────────────
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

// ── 모달 열기 / 닫기 헬퍼 ───────────────────────────────
function _openModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'flex';
}
function _closeModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'none';
}

// ── UI 이벤트 연결 ───────────────────────────────────────
function setupAuthUI() {
    const modal      = document.getElementById('auth-modal');
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
            }
        } else {
            isSignUpMode = false;
            if (title)      title.textContent      = '서버 로그인';
            if (executeBtn) executeBtn.textContent  = '로그인';
            if (switchBtn)  switchBtn.textContent   = '계정이 없으신가요? 회원가입';
            _openModal();
        }
    });

    // 닫기
    closeBtn?.addEventListener('click', _closeModal);
    // 모달 배경 클릭 시 닫기
    modal.addEventListener('click', e => { if (e.target === modal) _closeModal(); });

    // 로그인 ↔ 회원가입 전환
    switchBtn?.addEventListener('click', () => {
        isSignUpMode = !isSignUpMode;
        if (title)      title.textContent      = isSignUpMode ? '서버 계정 생성' : '서버 로그인';
        if (executeBtn) executeBtn.textContent  = isSignUpMode ? '가입하기'       : '로그인';
        if (switchBtn)  switchBtn.textContent   = isSignUpMode ? '이미 계정이 있나요? 로그인' : '계정이 없으신가요? 회원가입';
    });

    // 실행
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
                // 이메일 인증이 꺼져 있으면 즉시 세션 생성됨
                if (data?.session) {
                    _updateAuthStatus(data.session.user);
                    alert('회원가입 및 로그인 완료!');
                    _closeModal();
                } else {
                    alert('가입 신청 완료!\nSupabase 대시보드에서 이메일 인증을 비활성화하면 바로 로그인할 수 있습니다.');
                }
            } else {
                _updateAuthStatus(data.user);
                alert('로그인 완료! 서버 동기화가 활성화됩니다.');
                _closeModal();
            }
        } catch (err) {
            // Email not confirmed 안내
            if (err.message?.includes('Email not confirmed')) {
                alert(
                    '이메일 인증이 필요합니다.\n\n' +
                    '해결 방법:\n' +
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