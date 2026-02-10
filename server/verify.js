const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api';
// 아이디 길이 제한 20자 고려 (user_ + 6자리 난수 = 11자)
const USERNAME = `user_${Date.now().toString().slice(-6)}`;
const PASSWORD = 'password1234';

async function testApi() {
    console.log(`🚀 API 테스트 시작 (사용자: ${USERNAME})`);

    // 1. 회원가입
    console.log('\n1. 회원가입 시도...');
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: USERNAME, password: PASSWORD })
    });
    const registerResult = await registerResponse.json();
    console.log('회원가입 결과:', registerResult);

    if (!registerResult.success) {
        console.error('❌ 회원가입 실패');
        return;
    }

    // 2. 로그인
    console.log('\n2. 로그인 시도...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: USERNAME, password: PASSWORD })
    });
    const loginResult = await loginResponse.json();
    console.log('로그인 결과:', loginResult.success ? '성공' : '실패');

    if (!loginResult.success || !loginResult.token) {
        console.error('❌ 로그인 실패 - 토큰 없음');
        return;
    }
    const token = loginResult.token;

    // 3. 데이터 저장
    console.log('\n3. 데이터 저장 시도...');
    const saveDataPayload = {
        saveData: {
            player: { name: "API_TEST_HERO", level: 99, hp: 1000 },
            gold: 5000,
            inventory: ["Sword", "Shield"]
        },
        playTimeSeconds: 120,
        playerName: "API_TEST_HERO",
        playerLevel: 99
    };

    const saveResponse = await fetch(`${BASE_URL}/save`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(saveDataPayload)
    });
    const saveResult = await saveResponse.json();
    console.log('저장 결과:', saveResult);

    if (!saveResult.success) {
        console.error('❌ 저장 실패');
        return;
    }

    // 4. 데이터 불러오기
    console.log('\n4. 데이터 불러오기 시도...');
    const loadResponse = await fetch(`${BASE_URL}/save`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const loadResult = await loadResponse.json();
    console.log('불러오기 결과:', loadResult.success ? '성공' : '실패');

    if (loadResult.success && loadResult.saveData.player.name === "API_TEST_HERO") {
        console.log('✅ 데이터 검증 성공: 플레이어 이름 일치');
    } else {
        console.error('❌ 데이터 검증 실패:', loadResult);
    }
}

testApi();
