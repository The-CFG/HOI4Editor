let isSignUpMode = false;

/**
 * [범용 인증 엔진] 
 * 로그인, 회원가입, 로그아웃 등 핵심 기능을 담당합니다.
 */
const CloudAuth = {
    // 현재 로그인된 유저 정보 확인
    async getUser() {
        const { data: { user } } = await _supabase.auth.getUser();
        return user;
    },

    // 회원가입
    async signUp(email, password) {
        return await _supabase.auth.signUp({ email, password });
    },

    // 로그인
    async login(email, password) {
        return await _supabase.auth.signInWithPassword({ email, password });
    },

    // 로그아웃
    async logout() {
        await _supabase.auth.signOut();
        location.reload(); // 상태 초기화를 위해 새로고침
    },

    /**
     * [범용 데이터 저장] 
     * @param {string} type 프로젝트 구분 (예: 'hoi4_editor', 'the_beat')
     * @param {string} name 프로젝트 이름
     * @param {object} data 저장할 JSON 객체 (appState.project 등)
     */
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

        if (error) console.error("Cloud Sync Error:", error.message);
        else console.log(`[${type}] "${name}" 서버 동기화 완료`);
    }
};

/**
 * [로그인 UI 제어]
 * 모달 창 열기/닫기 및 입력 처리를 담당합니다.
 */
function setupAuthUI() {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    const title = document.getElementById('auth-title');
    const executeBtn = document.getElementById('btn-auth-execute');
    const switchBtn = document.getElementById('auth-switch');
    const closeBtn = document.getElementById('btn-auth-close');
    const openBtn = document.getElementById('btn-open-auth');

    // 모달 열기
    openBtn?.addEventListener('click', () => modal.classList = 'flex');

    // 모달 닫기
    closeBtn?.addEventListener('click', () => modal.classList = 'none');

    // 로그인 <-> 회원가입 모드 전환
    switchBtn?.addEventListener('click', () => {
        isSignUpMode = !isSignUpMode;
        title.innerText = isSignUpMode ? "서버 계정 생성" : "서버 로그인";
        executeBtn.innerText = isSignUpMode ? "가입하기" : "로그인";
        switchBtn.innerText = isSignUpMode ? "이미 계정이 있나요? 로그인" : "계정이 없으신가요? 회원가입";
    });

    // 실행 버튼 클릭
    executeBtn?.addEventListener('click', async () => {
        const email = document.getElementById('auth-email').value;
        const pw = document.getElementById('auth-password').value;

        if (!email || !pw) return alert("이메일과 비밀번호를 입력해주세요.");

        executeBtn.disabled = true;
        executeBtn.innerText = "처리 중...";

        try {
            const { data, error } = isSignUpMode 
                ? await CloudAuth.signUp(email, pw)
                : await CloudAuth.login(email, pw);

            if (error) throw error;

            if (isSignUpMode) {
                alert("가입 신청 완료! 이메일 인증 후 로그인해주세요.");
            } else {
                alert("로그인되었습니다. 이제 서버 동기화가 활성화됩니다.");
                modal.classList = 'none';
            }
        } catch (err) {
            alert("인증 오류: " + err.message);
        } finally {
            executeBtn.disabled = false;
            executeBtn.innerText = isSignUpMode ? "가입하기" : "로그인";
        }
    });
}