/**
 * ============================================
 * 클라이언트 인증 시스템
 * ============================================
 * 
 * 로그인/회원가입 UI 및 API 호출
 */

// ============================================
// 🌐 API 설정
// ============================================

const API_BASE_URL = 'http://localhost:3001/api';

// 현재 로그인한 사용자 정보
let currentUser = null;
let authToken = null;

// ============================================
// 🔧 초기화
// ============================================

/**
 * 페이지 로드 시 로그인 상태 확인
 */
async function initAuth() {
    // localStorage에서 토큰 복원
    const savedToken = localStorage.getItem('rpg_auth_token');
    const savedUser = localStorage.getItem('rpg_auth_user');
    
    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        
        // 서버에서 토큰 유효성 확인
        try {
            const response = await fetch(`${API_BASE_URL}/auth/check`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const data = await response.json();
            
            if (data.success && data.loggedIn) {
                currentUser = data.user;
                updateAuthUI();
                console.log(`✅ 자동 로그인 성공: ${currentUser.username}`);
                return true;
            }
        } catch (error) {
            console.log('⚠️ 서버 연결 실패 - 오프라인 모드');
        }
        
        // 토큰이 유효하지 않으면 정리
        clearAuthData();
    }
    
    updateAuthUI();
    return false;
}

// ============================================
// 🎨 인증 UI 스타일
// ============================================

const authStyles = `
    .auth-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
    }

    .auth-overlay.active {
        opacity: 1;
        visibility: visible;
    }

    .auth-modal {
        background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%);
        border: 3px solid #4da8da;
        border-radius: 20px;
        width: 90%;
        max-width: 400px;
        overflow: hidden;
        box-shadow: 0 0 50px rgba(77, 168, 218, 0.3);
        transform: scale(0.9);
        transition: transform 0.3s ease;
    }

    .auth-overlay.active .auth-modal {
        transform: scale(1);
    }

    .auth-header {
        background: linear-gradient(135deg, #4da8da 0%, #2980b9 100%);
        padding: 20px 25px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .auth-header h2 {
        margin: 0;
        color: #fff;
        font-size: 22px;
    }

    .auth-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: #fff;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .auth-close:hover {
        background: rgba(255, 255, 255, 0.4);
        transform: rotate(90deg);
    }

    .auth-content {
        padding: 30px;
    }

    .auth-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .auth-input-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .auth-input-group label {
        color: #4da8da;
        font-size: 14px;
        font-weight: bold;
    }

    .auth-input {
        background: rgba(0, 0, 0, 0.3);
        border: 2px solid rgba(77, 168, 218, 0.3);
        border-radius: 10px;
        padding: 15px;
        color: #fff;
        font-size: 16px;
        transition: all 0.3s ease;
    }

    .auth-input:focus {
        outline: none;
        border-color: #4da8da;
        box-shadow: 0 0 15px rgba(77, 168, 218, 0.3);
    }

    .auth-input::placeholder {
        color: rgba(255, 255, 255, 0.4);
    }

    .auth-btn {
        background: linear-gradient(135deg, #27ae60, #1e8449);
        border: none;
        border-radius: 12px;
        padding: 15px;
        color: #fff;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .auth-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 20px rgba(39, 174, 96, 0.4);
    }

    .auth-btn:disabled {
        background: #555;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    .auth-switch {
        text-align: center;
        margin-top: 10px;
        color: rgba(255, 255, 255, 0.6);
        font-size: 14px;
    }

    .auth-switch a {
        color: #4da8da;
        cursor: pointer;
        text-decoration: none;
    }

    .auth-switch a:hover {
        text-decoration: underline;
    }

    .auth-error {
        background: rgba(231, 76, 60, 0.2);
        border: 1px solid #e74c3c;
        border-radius: 8px;
        padding: 12px;
        color: #e74c3c;
        font-size: 14px;
        text-align: center;
        display: none;
    }

    .auth-error.show {
        display: block;
    }

    /* 메뉴 버튼의 로그인 상태 표시 */
    .user-status {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 20px;
        background: rgba(77, 168, 218, 0.2);
        border-radius: 10px;
        margin-bottom: 15px;
    }

    .user-status-name {
        color: #4da8da;
        font-weight: bold;
    }

    .user-status-btn {
        background: rgba(231, 76, 60, 0.2);
        border: 1px solid #e74c3c;
        border-radius: 8px;
        padding: 8px 15px;
        color: #e74c3c;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .user-status-btn:hover {
        background: #e74c3c;
        color: #fff;
    }

    /* 메인 메뉴 인증 버튼 */
    .auth-buttons-container {
        display: flex;
        gap: 10px;
        margin-top: 20px;
        justify-content: center;
    }

    .auth-menu-btn {
        padding: 12px 25px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;
    }

    .auth-menu-btn.login {
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: #fff;
    }

    .auth-menu-btn.register {
        background: linear-gradient(135deg, #27ae60, #1e8449);
        color: #fff;
    }

    .auth-menu-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }

    .logged-in-info {
        text-align: center;
        margin-top: 20px;
        padding: 15px;
        background: rgba(39, 174, 96, 0.2);
        border-radius: 10px;
        border: 1px solid #27ae60;
    }

    .logged-in-info span {
        color: #27ae60;
        font-weight: bold;
    }

    .logout-btn {
        margin-top: 10px;
        padding: 8px 20px;
        background: rgba(231, 76, 60, 0.2);
        border: 1px solid #e74c3c;
        border-radius: 8px;
        color: #e74c3c;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .logout-btn:hover {
        background: #e74c3c;
        color: #fff;
    }
`;

let authStyleInjected = false;

function injectAuthStyles() {
    if (authStyleInjected) return;
    
    const style = document.createElement('style');
    style.id = 'auth-styles';
    style.textContent = authStyles;
    document.head.appendChild(style);
    authStyleInjected = true;
}

// ============================================
// 🎨 UI 표시 함수
// ============================================

/**
 * 로그인 모달 표시
 */
function showLoginModal() {
    injectAuthStyles();
    hideAuthModal(); // 기존 모달 제거
    
    const modalHTML = `
        <div class="auth-overlay" id="authOverlay" onclick="closeAuthOnOverlay(event)">
            <div class="auth-modal">
                <div class="auth-header">
                    <h2>🔐 로그인</h2>
                    <button class="auth-close" onclick="hideAuthModal()">✕</button>
                </div>
                <div class="auth-content">
                    <div class="auth-error" id="authError"></div>
                    <form class="auth-form" onsubmit="handleLogin(event)">
                        <div class="auth-input-group">
                            <label>아이디</label>
                            <input type="text" class="auth-input" id="loginUsername" 
                                   placeholder="아이디를 입력하세요" required>
                        </div>
                        <div class="auth-input-group">
                            <label>비밀번호</label>
                            <input type="password" class="auth-input" id="loginPassword" 
                                   placeholder="비밀번호를 입력하세요" required>
                        </div>
                        <button type="submit" class="auth-btn" id="loginBtn">로그인</button>
                    </form>
                    <div class="auth-switch">
                        계정이 없으신가요? <a onclick="showRegisterModal()">회원가입</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setTimeout(() => {
        document.getElementById('authOverlay').classList.add('active');
        document.getElementById('loginUsername').focus();
    }, 10);
}

/**
 * 회원가입 모달 표시
 */
function showRegisterModal() {
    injectAuthStyles();
    hideAuthModal();
    
    const modalHTML = `
        <div class="auth-overlay" id="authOverlay" onclick="closeAuthOnOverlay(event)">
            <div class="auth-modal">
                <div class="auth-header">
                    <h2>📝 회원가입</h2>
                    <button class="auth-close" onclick="hideAuthModal()">✕</button>
                </div>
                <div class="auth-content">
                    <div class="auth-error" id="authError"></div>
                    <form class="auth-form" onsubmit="handleRegister(event)">
                        <div class="auth-input-group">
                            <label>아이디 (2~20자)</label>
                            <input type="text" class="auth-input" id="registerUsername" 
                                   placeholder="영문, 한글, 숫자, _" required
                                   minlength="2" maxlength="20">
                        </div>
                        <div class="auth-input-group">
                            <label>비밀번호 (4자 이상)</label>
                            <input type="password" class="auth-input" id="registerPassword" 
                                   placeholder="비밀번호를 입력하세요" required
                                   minlength="4">
                        </div>
                        <div class="auth-input-group">
                            <label>비밀번호 확인</label>
                            <input type="password" class="auth-input" id="registerPasswordConfirm" 
                                   placeholder="비밀번호를 다시 입력하세요" required>
                        </div>
                        <button type="submit" class="auth-btn" id="registerBtn">회원가입</button>
                    </form>
                    <div class="auth-switch">
                        이미 계정이 있으신가요? <a onclick="showLoginModal()">로그인</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setTimeout(() => {
        document.getElementById('authOverlay').classList.add('active');
        document.getElementById('registerUsername').focus();
    }, 10);
}

/**
 * 모달 닫기
 */
function hideAuthModal() {
    const overlay = document.getElementById('authOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }
}

function closeAuthOnOverlay(event) {
    if (event.target.id === 'authOverlay') {
        hideAuthModal();
    }
}

/**
 * 에러 메시지 표시
 */
function showAuthError(message) {
    const errorDiv = document.getElementById('authError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
    }
}

/**
 * 메인 메뉴 인증 UI 업데이트
 */
function updateAuthUI() {
    // 메인 메뉴의 인증 상태 표시 영역 찾기
    const menuFooter = document.querySelector('.menu-footer');
    if (!menuFooter) return;
    
    // 기존 인증 UI 제거
    const existingAuthUI = document.getElementById('authStatusUI');
    if (existingAuthUI) existingAuthUI.remove();
    
    let authUIHTML;
    
    if (isLoggedIn()) {
        authUIHTML = `
            <div id="authStatusUI" class="logged-in-info">
                👤 <span>${currentUser.username}</span>님 환영합니다!
                <br>
                <button class="logout-btn" onclick="handleLogout()">로그아웃</button>
            </div>
        `;
    } else {
        authUIHTML = `
            <div id="authStatusUI" class="auth-buttons-container">
                <button class="auth-menu-btn login" onclick="showLoginModal()">🔐 로그인</button>
                <button class="auth-menu-btn register" onclick="showRegisterModal()">📝 회원가입</button>
            </div>
        `;
    }
    
    menuFooter.insertAdjacentHTML('beforebegin', authUIHTML);
}

// ============================================
// 📡 API 호출 함수
// ============================================

/**
 * 로그인 처리
 */
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    
    if (!username || !password) {
        showAuthError('아이디와 비밀번호를 입력해주세요.');
        return;
    }
    
    loginBtn.disabled = true;
    loginBtn.textContent = '로그인 중...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // 로그인 성공
            currentUser = data.user;
            authToken = data.token;
            
            // localStorage에 저장
            localStorage.setItem('rpg_auth_token', authToken);
            localStorage.setItem('rpg_auth_user', JSON.stringify(currentUser));
            
            hideAuthModal();
            updateAuthUI();
            showToast(`✅ ${currentUser.username}님, 환영합니다!`, 'success');
            console.log(`✅ 로그인 성공: ${currentUser.username}`);
        } else {
            showAuthError(data.error || '로그인에 실패했습니다.');
        }
    } catch (error) {
        console.error('❌ 로그인 에러:', error);
        showAuthError('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = '로그인';
    }
}

/**
 * 회원가입 처리
 */
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const registerBtn = document.getElementById('registerBtn');
    
    // 유효성 검사
    if (!username || !password) {
        showAuthError('모든 필드를 입력해주세요.');
        return;
    }
    
    if (password !== passwordConfirm) {
        showAuthError('비밀번호가 일치하지 않습니다.');
        return;
    }
    
    if (password.length < 4) {
        showAuthError('비밀번호는 4자 이상이어야 합니다.');
        return;
    }
    
    registerBtn.disabled = true;
    registerBtn.textContent = '가입 중...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            hideAuthModal();
            showToast('✅ 회원가입이 완료되었습니다! 로그인해주세요.', 'success');
            
            // 자동으로 로그인 모달 표시
            setTimeout(() => showLoginModal(), 500);
        } else {
            showAuthError(data.error || '회원가입에 실패했습니다.');
        }
    } catch (error) {
        console.error('❌ 회원가입 에러:', error);
        showAuthError('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
    } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = '회원가입';
    }
}

/**
 * 로그아웃 처리
 */
async function handleLogout() {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
    } catch (error) {
        // 서버 에러는 무시 (로컬 로그아웃 진행)
    }
    
    clearAuthData();
    updateAuthUI();
    showToast('🚪 로그아웃 되었습니다.', 'info');
    console.log('🚪 로그아웃 완료');
}

/**
 * 인증 데이터 정리
 */
function clearAuthData() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('rpg_auth_token');
    localStorage.removeItem('rpg_auth_user');
}

// ============================================
// 🔧 유틸리티 함수
// ============================================

/**
 * 로그인 상태 확인
 */
function isLoggedIn() {
    return currentUser !== null && authToken !== null;
}

/**
 * 현재 사용자 정보 반환
 */
function getCurrentUser() {
    return currentUser;
}

/**
 * 인증 토큰 반환
 */
function getAuthToken() {
    return authToken;
}

// ============================================
// 🚀 초기화
// ============================================

// DOM 로드 후 인증 상태 확인
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

console.log('🔐 인증 시스템 로드 완료!');
