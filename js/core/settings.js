// ════════════════════════════════════════════════════════
//  settings.js — 앱 환경설정 (테마, 자동 저장 등)
//  의존: 없음 (최초 로드 가능)
// ════════════════════════════════════════════════════════

const APP_SETTINGS_KEY = 'hoi4editor_app_settings';

const _defaultAppSettings = {
    theme:            'dark',  // 'dark' | 'light'
    autoSaveInterval: 30,      // 초 단위. 0 = 비활성화
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

let _appSettings = _loadAppSettings();

// ── 테마 ────────────────────────────────────────────────
function applyTheme(theme) {
    _appSettings.theme = theme;
    _saveAppSettings(_appSettings);
    document.documentElement.setAttribute('data-theme', theme);
}

// FOUC 방지: DOM 준비 전에 즉시 적용
(function _initTheme() {
    document.documentElement.setAttribute('data-theme', _loadAppSettings().theme);
})();

// ── 자동 저장 관리 ───────────────────────────────────────
let _autoSaveTimer = null;

function startAutoSave() {
    stopAutoSave();
    const sec = _appSettings.autoSaveInterval;
    if (!sec || sec <= 0) return;   // 0이면 비활성화
    _autoSaveTimer = setInterval(() => {
        if (typeof appState !== 'undefined' && appState.isDirty && appState.project.name) {
            autoSaveToLocal();
        }
    }, sec * 1000);
}

function stopAutoSave() {
    if (_autoSaveTimer) { clearInterval(_autoSaveTimer); _autoSaveTimer = null; }
}

function setAutoSaveInterval(sec) {
    _appSettings.autoSaveInterval = sec;
    _saveAppSettings(_appSettings);
    startAutoSave();   // 즉시 새 인터벌로 재시작
    _updateAutoSaveStatus();
}

// 헤더 상태 표시 갱신
function _updateAutoSaveStatus() {
    const el = document.getElementById('autosave-status');
    if (!el) return;
    const sec = _appSettings.autoSaveInterval;
    el.textContent = sec > 0 ? `자동 저장: ${sec}초` : '자동 저장: 꺼짐';
}

// ── 환경설정 모달 ────────────────────────────────────────
const AUTOSAVE_OPTIONS = [
    { label: '꺼짐',   value: 0   },
    { label: '10초',   value: 10  },
    { label: '30초',   value: 30  },
    { label: '1분',    value: 60  },
    { label: '3분',    value: 180 },
    { label: '5분',    value: 300 },
];

function openPreferencesModal() {
    document.getElementById('preferences-modal')?.remove();

    const s = _appSettings;
    const modal = document.createElement('div');
    modal.id = 'preferences-modal';
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
                </section>

                <!-- 자동 저장 -->
                <section class="pref-section">
                    <h3 class="pref-section-title">💾 자동 저장</h3>
                    <p class="pref-desc">편집 중 변경사항을 주기적으로 서버에 저장합니다.</p>
                    <div class="pref-autosave-grid">
                        ${AUTOSAVE_OPTIONS.map(o => `
                            <label class="pref-autosave-btn ${s.autoSaveInterval === o.value ? 'active' : ''}">
                                <input type="radio" name="pref-autosave" value="${o.value}"
                                    ${s.autoSaveInterval === o.value ? 'checked' : ''} hidden>
                                ${o.label}
                            </label>
                        `).join('')}
                    </div>
                    <p class="pref-autosave-note" id="pref-autosave-note">
                        ${s.autoSaveInterval > 0
                            ? `현재: <b>${s.autoSaveInterval}초</b>마다 자동 저장`
                            : '현재: 자동 저장 <b>꺼짐</b>'}
                    </p>
                </section>

            </div>
            <div class="pref-footer">
                <button class="pref-btn-close secondary">닫기</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // 테마
    modal.querySelectorAll('input[name="pref-theme"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (!radio.checked) return;
            applyTheme(radio.value);
            modal.querySelectorAll('.pref-theme-card').forEach(c =>
                c.classList.toggle('active', c.querySelector('input').value === radio.value)
            );
        });
    });

    // 자동 저장 간격
    modal.querySelectorAll('input[name="pref-autosave"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (!radio.checked) return;
            const sec = Number(radio.value);
            setAutoSaveInterval(sec);
            modal.querySelectorAll('.pref-autosave-btn').forEach(b =>
                b.classList.toggle('active', Number(b.querySelector('input').value) === sec)
            );
            const note = modal.querySelector('#pref-autosave-note');
            if (note) note.innerHTML = sec > 0
                ? `현재: <b>${sec}초</b>마다 자동 저장`
                : '현재: 자동 저장 <b>꺼짐</b>';
        });
    });

    // 닫기
    const closeModal = () => modal.remove();
    modal.querySelector('.pref-close').addEventListener('click', closeModal);
    modal.querySelector('.pref-btn-close').addEventListener('click', closeModal);
    modal.querySelector('.pref-backdrop').addEventListener('click', closeModal);
    modal.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

// ── 초기화 ──────────────────────────────────────────────
function setupPreferencesListeners() {
    applyTheme(_appSettings.theme);
    startAutoSave();
    _updateAutoSaveStatus();

    document.addEventListener('click', e => {
        if (e.target.closest('#btn-preferences')) openPreferencesModal();
    });
}