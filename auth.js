// Netlify에 설정한 환경변수 값 입력
const SUPABASE_URL = 'https://your-project.id.supabase.co';
const SUPABASE_KEY = 'your-anon-key';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const CloudAuth = {
    // [인증] 회원가입/로그인/로그아웃
    async signUp(email, password) { return await _supabase.auth.signUp({ email, password }); },
    async login(email, password) { return await _supabase.auth.signInWithPassword({ email, password }); },
    async logout() { await _supabase.auth.signOut(); },
    
    // [상태] 현재 유저 정보 가져오기
    async getUser() {
        const { data: { user } } = await _supabase.auth.getUser();
        return user;
    },

    // [데이터] 서버에 프로젝트 저장 (재사용 가능하게 테이블 설계)
    async saveProject(projectName, projectData) {
        const user = await this.getUser();
        if (!user) return;

        return await _supabase.from('user_projects').upsert({
            user_id: user.id,
            project_type: 'hoi4_editor', // 나중에 'the_beat'로 변경 가능
            project_name: projectName,
            content: projectData, // JSON 데이터
            updated_at: new Date()
        });
    }
};