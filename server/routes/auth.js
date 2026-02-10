/**
 * ============================================
 * 인증 API 라우터
 * ============================================
 * 
 * 보안 기능:
 * - bcrypt 비밀번호 해싱 (솔트 + 해시)
 * - 입력값 검증 (express-validator)
 * - Prepared Statements (SQL 인젝션 방지)
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { query } = require('../db');

const router = express.Router();

// 비밀번호 해싱 강도 (높을수록 안전하지만 느림)
const SALT_ROUNDS = 12;

// ============================================
// 입력 검증 규칙
// ============================================

const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 2, max: 20 })
        .withMessage('아이디는 2~20자여야 합니다.')
        .matches(/^[a-zA-Z0-9가-힣_]+$/)
        .withMessage('아이디는 영문, 한글, 숫자, 밑줄(_)만 사용할 수 있습니다.')
        .escape(), // XSS 방지
    body('password')
        .isLength({ min: 4, max: 100 })
        .withMessage('비밀번호는 4자 이상이어야 합니다.')
];

const loginValidation = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('아이디를 입력해주세요.')
        .escape(),
    body('password')
        .notEmpty()
        .withMessage('비밀번호를 입력해주세요.')
];

// ============================================
// 📝 회원가입
// POST /api/auth/register
// ============================================
router.post('/register', registerValidation, async (req, res) => {
    try {
        // 입력 검증 결과 확인
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                error: errors.array()[0].msg 
            });
        }

        const { username, password } = req.body;

        // 사용자 중복 확인 (Prepared Statement 사용)
        const existingUsers = await query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                success: false, 
                error: '이미 사용 중인 아이디입니다.' 
            });
        }

        // 비밀번호 해싱 (bcrypt)
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // 사용자 생성 (Prepared Statement 사용)
        const result = await query(
            'INSERT INTO users (username, password_hash) VALUES (?, ?)',
            [username, passwordHash]
        );

        console.log(`✅ 새 사용자 가입: ${username} (ID: ${result.insertId})`);

        res.status(201).json({
            success: true,
            message: '회원가입이 완료되었습니다!',
            user: {
                id: result.insertId,
                username: username
            }
        });

    } catch (error) {
        console.error('❌ 회원가입 에러:', error);
        res.status(500).json({ 
            success: false, 
            error: '회원가입 중 오류가 발생했습니다.' 
        });
    }
});

// ============================================
// 🔐 로그인
// POST /api/auth/login
// ============================================
router.post('/login', loginValidation, async (req, res) => {
    try {
        // 입력 검증 결과 확인
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                error: errors.array()[0].msg 
            });
        }

        const { username, password } = req.body;

        // 사용자 조회 (Prepared Statement 사용)
        const users = await query(
            'SELECT id, username, password_hash FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            // 보안: 사용자 존재 여부를 노출하지 않음
            return res.status(401).json({ 
                success: false, 
                error: '아이디 또는 비밀번호가 올바르지 않습니다.' 
            });
        }

        const user = users[0];

        // 비밀번호 확인 (bcrypt)
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                error: '아이디 또는 비밀번호가 올바르지 않습니다.' 
            });
        }

        // 마지막 로그인 시간 업데이트
        await query(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [user.id]
        );

        console.log(`✅ 로그인 성공: ${username}`);

        // 간단한 토큰 생성 (실제 운영 시 JWT 사용 권장)
        const token = Buffer.from(`${user.id}:${Date.now()}:${process.env.SESSION_SECRET}`)
            .toString('base64');

        res.json({
            success: true,
            message: '로그인 성공!',
            user: {
                id: user.id,
                username: user.username
            },
            token: token
        });

    } catch (error) {
        console.error('❌ 로그인 에러:', error);
        res.status(500).json({ 
            success: false, 
            error: '로그인 중 오류가 발생했습니다.' 
        });
    }
});

// ============================================
// 🔍 로그인 상태 확인
// GET /api/auth/check
// ============================================
router.get('/check', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.json({ 
                success: false, 
                loggedIn: false 
            });
        }

        const token = authHeader.split(' ')[1];
        
        // 토큰 디코딩
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        const [userId] = decoded.split(':');

        if (!userId) {
            return res.json({ 
                success: false, 
                loggedIn: false 
            });
        }

        // 사용자 조회
        const users = await query(
            'SELECT id, username FROM users WHERE id = ?',
            [parseInt(userId)]
        );

        if (users.length === 0) {
            return res.json({ 
                success: false, 
                loggedIn: false 
            });
        }

        res.json({
            success: true,
            loggedIn: true,
            user: {
                id: users[0].id,
                username: users[0].username
            }
        });

    } catch (error) {
        console.error('❌ 인증 확인 에러:', error);
        res.json({ 
            success: false, 
            loggedIn: false 
        });
    }
});

// ============================================
// 🚪 로그아웃
// POST /api/auth/logout
// ============================================
router.post('/logout', (req, res) => {
    // 클라이언트 측에서 토큰 삭제 처리
    res.json({
        success: true,
        message: '로그아웃 되었습니다.'
    });
});

module.exports = router;
