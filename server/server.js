/**
 * ============================================
 * Express 서버 메인 파일
 * ============================================
 * 
 * 보안 기능:
 * - Helmet (보안 HTTP 헤더)
 * - Rate Limiting (과도한 요청 차단)
 * - CORS (교차 출처 요청 제어)
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { initializeDatabase } = require('./db');
const authRoutes = require('./routes/auth');
const saveRoutes = require('./routes/save');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// 🛡️ 보안 미들웨어
// ============================================

// Helmet: 보안 HTTP 헤더 설정
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate Limiting: API 요청 제한 (DDoS 방지)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 100, // IP당 15분에 100회 요청 제한
    message: { 
        success: false, 
        error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' 
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// 로그인 요청에 더 엄격한 제한 (브루트포스 방지)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1시간
    max: 10, // IP당 1시간에 10회 로그인 시도 제한
    message: { 
        success: false, 
        error: '로그인 시도가 너무 많습니다. 1시간 후 다시 시도해주세요.' 
    },
});
app.use('/api/auth/login', authLimiter);

// CORS: 교차 출처 요청 허용
app.use(cors({
    origin: true, // 개발 중에는 모든 origin 허용, 배포 시 특정 도메인으로 변경 권장
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON 파싱
app.use(express.json({ limit: '1mb' })); // 저장 데이터 크기 제한

// ============================================
// 📁 정적 파일 서빙 (게임 파일)
// ============================================
app.use(express.static(path.join(__dirname, '..')));

// ============================================
// 🛣️ API 라우터
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/save', saveRoutes);

// 기본 라우트
app.get('/api', (req, res) => {
    res.json({ 
        message: 'RPG Game API Server',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            save: '/api/save'
        }
    });
});

// ============================================
// ❌ 에러 핸들링
// ============================================

// 404 처리
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ success: false, error: 'API 엔드포인트를 찾을 수 없습니다.' });
    } else {
        next();
    }
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
    console.error('❌ 서버 에러:', err);
    
    // 민감한 에러 정보는 클라이언트에 노출하지 않음
    res.status(500).json({ 
        success: false, 
        error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
    });
});

// ============================================
// 🚀 서버 시작
// ============================================
async function startServer() {
    try {
        // 데이터베이스 초기화
        console.log('🔄 데이터베이스 초기화 중...');
        await initializeDatabase();
        console.log('✅ 데이터베이스 초기화 완료!');

        // 서버 시작
        app.listen(PORT, () => {
            console.log('');
            console.log('============================================');
            console.log(`⚔️  RPG Game Server is running!`);
            console.log(`📍 Local: http://localhost:${PORT}`);
            console.log(`🎮 Game:  http://localhost:${PORT}/rpgmain.html`);
            console.log('============================================');
            console.log('');
        });
    } catch (error) {
        console.error('❌ 서버 시작 실패:', error);
        process.exit(1);
    }
}

startServer();
