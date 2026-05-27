// ════════════════════════════════════════════════════════
//  settings.js — 앱 환경설정 (테마, 향후 UI 옵션 등)
//  의존: 없음 (최초 로드 가능)
//  로드 순서: state.js 이전 또는 이후 모두 가능
// ════════════════════════════════════════════════════════

// ── 기본값 ───────────────────────────────────────────────
const APP_SETTINGS_KEY = 'hoi4editor_app_settings';

const _defaultAppSettings = {
    theme: 'dark',   // 'dark' | 'light'
};

// ── 로드 / 저장 ─────────────────────────────────────────
function _loadAppSettings() {
    try {
        const raw = localStorage.getItem(APP_SETTINGS_KEY);
        return raw ? { ..._defaultAppSettings, ...JSON.parse(raw) } : { ..._defaultAppSettings };
    } catch {
        return { ..._defaultAppSettings };
    }
}

function _saveAppSettings(s) {
    try { localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(s)); } catch { /* 무시 */ }
}

// 현재 앱 설정 (런타임 상태)
let _appSettings = _loadAppSettings();

// ── 테마 적용 ────────────────────────────────────────────
function applyTheme(theme) {
    _appSettings.theme = theme;
    _saveAppSettings(_appSettings);
    document.documentElement.setAttribute('data-theme', theme);
    // 테마 토글 버튼 아이콘 갱신 (어디서든 접근 가능하도록)
    document.querySelectorAll('.theme-toggle-icon').forEach(el => {
        el.textContent = theme === 'light' ? '🌙' : '☀️';
    });
}

// 초기 실행 — DOM 준비 전에도 data-theme 세팅 (FOUC 방지)
(function _initTheme() {
    const s = _loadAppSettings();
    document.documentElement.setAttribute('data-theme', s.theme);
})();

// ── 환경설정 모달 렌더링 ─────────────────────────────────
function openPreferencesModal() {
    // 기존 모달 제거
    document.getElementById('preferences-modal')?.remove();

    const s    = _appSettings;
    const modal = document.createElement('div');
    modal.id    = 'preferences-modal';
    modal.innerHTML = `
        <div class="pref-backdrop"></div>
        <div class="pref-dialog" role="dialog" aria-modal="true" aria-label="환경설정">
            <div class="pref-header">
                <span class="pref-title">⚙ 환경설정</span>
                <button class="pref-close" title="닫기" aria-label="닫기">✕</button>
            </div>
            <div class="pref-body">

                <!-- 테마 -->
                <section class="pref-section">
                    <h3 class="pref-section-title">🎨 테마</h3>
                    <div class="pref-row">
                        <div class="pref-theme-cards">
                            <label class="pref-theme-card ${s.theme === 'dark' ? 'active' : ''}">
                                <input type="radio" name="pref-theme" value="dark" ${s.theme === 'dark' ? 'checked' : ''} hidden>
                                <div class="pref-theme-preview pref-theme-dark">
                                    <div class="ptk-bar"></div>
                                    <div class="ptk-content">
                                        <div class="ptk-panel"></div>
                                        <div class="ptk-main"></div>
                                    </div>
                                </div>
                                <span class="pref-theme-label">🌙 다크 (기본)</span>
                            </label>
                            <label class="pref-theme-card ${s.theme === 'light' ? 'active' : ''}">
                                <input type="radio" name="pref-theme" value="light" ${s.theme === 'light' ? 'checked' : ''} hidden>
                                <div class="pref-theme-preview pref-theme-light">
                                    <div class="ptk-bar"></div>
                                    <div class="ptk-content">
                                        <div class="ptk-panel"></div>
                                        <div class="ptk-main"></div>
                                    </div>
                                </div>
                                <span class="pref-theme-label">☀️ 라이트</span>
                            </label>
                        </div>
                    </div>
                </section>

                <!-- 향후 옵션 자리 -->
                <section class="pref-section">
                    <h3 class="pref-section-title">🔧 편집기</h3>
                    <p class="pref-placeholder">추가 옵션이 여기에 표시됩니다.</p>
                </section>

            </div>
            <div class="pref-footer">
                <button class="pref-btn-close secondary">닫기</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // 테마 카드 클릭
    modal.querySelectorAll('input[name="pref-theme"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (!radio.checked) return;
            applyTheme(radio.value);
            modal.querySelectorAll('.pref-theme-card').forEach(c =>
                c.classList.toggle('active', c.querySelector('input').value === radio.value)
            );
        });
    });

    // 닫기
    const closeModal = () => modal.remove();
    modal.querySelector('.pref-close').addEventListener('click', closeModal);
    modal.querySelector('.pref-btn-close').addEventListener('click', closeModal);
    modal.querySelector('.pref-backdrop').addEventListener('click', closeModal);
    modal.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

// ── 환경설정 버튼 리스너 등록 ────────────────────────────
function setupPreferencesListeners() {
    // 초기 테마 적용
    applyTheme(_appSettings.theme);

    document.addEventListener('click', e => {
        if (e.target.closest('#btn-preferences')) openPreferencesModal();
    });
}