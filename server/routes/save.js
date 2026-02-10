/**
 * ============================================
 * 저장/불러오기 API 라우터
 * ============================================
 * 
 * 보안 기능:
 * - 토큰 인증
 * - Prepared Statements (SQL 인젝션 방지)
 * - 저장 데이터 크기 제한
 */

const express = require('express');
const { query } = require('../db');

const router = express.Router();

// ============================================
// 🔒 인증 미들웨어
// ============================================
async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                error: '로그인이 필요합니다.' 
            });
        }

        const token = authHeader.split(' ')[1];
        
        // 토큰 디코딩
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        const [userId] = decoded.split(':');

        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                error: '유효하지 않은 토큰입니다.' 
            });
        }

        // 사용자 조회
        const users = await query(
            'SELECT id, username FROM users WHERE id = ?',
            [parseInt(userId)]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                error: '사용자를 찾을 수 없습니다.' 
            });
        }

        // 요청에 사용자 정보 추가
        req.user = users[0];
        next();

    } catch (error) {
        console.error('❌ 인증 에러:', error);
        res.status(401).json({ 
            success: false, 
            error: '인증에 실패했습니다.' 
        });
    }
}

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// ============================================
// 💾 게임 저장
// POST /api/save
// ============================================
router.post('/', async (req, res) => {
    try {
        const { saveData, playTimeSeconds, playerName, playerLevel } = req.body;
        const userId = req.user.id;

        if (!saveData) {
            return res.status(400).json({ 
                success: false, 
                error: '저장할 데이터가 없습니다.' 
            });
        }

        // 저장 데이터 크기 검증 (1MB 제한)
        const dataSize = JSON.stringify(saveData).length;
        if (dataSize > 1024 * 1024) {
            return res.status(400).json({ 
                success: false, 
                error: '저장 데이터가 너무 큽니다. (최대 1MB)' 
            });
        }

        // 기존 저장 데이터 확인
        const existingSaves = await query(
            'SELECT id FROM game_saves WHERE user_id = ?',
            [userId]
        );

        if (existingSaves.length > 0) {
            // 기존 데이터 업데이트 (Prepared Statement)
            await query(
                `UPDATE game_saves 
                 SET save_data = ?, play_time_seconds = ?, player_name = ?, player_level = ?
                 WHERE user_id = ?`,
                [
                    JSON.stringify(saveData), 
                    playTimeSeconds || 0, 
                    playerName || '용사', 
                    playerLevel || 1,
                    userId
                ]
            );
            console.log(`✅ 게임 저장 업데이트: ${req.user.username}`);
        } else {
            // 새로 저장 (Prepared Statement)
            await query(
                `INSERT INTO game_saves (user_id, save_data, play_time_seconds, player_name, player_level)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    userId, 
                    JSON.stringify(saveData), 
                    playTimeSeconds || 0, 
                    playerName || '용사', 
                    playerLevel || 1
                ]
            );
            console.log(`✅ 새 게임 저장: ${req.user.username}`);
        }

        res.json({
            success: true,
            message: '게임이 저장되었습니다!',
            savedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ 저장 에러:', error);
        res.status(500).json({ 
            success: false, 
            error: '저장 중 오류가 발생했습니다.' 
        });
    }
});

// ============================================
// 📂 게임 불러오기
// GET /api/save
// ============================================
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;

        // 저장 데이터 조회 (Prepared Statement)
        const saves = await query(
            `SELECT save_data, play_time_seconds, player_name, player_level, saved_at
             FROM game_saves WHERE user_id = ?`,
            [userId]
        );

        if (saves.length === 0) {
            return res.json({
                success: true,
                hasSave: false,
                message: '저장된 게임이 없습니다.'
            });
        }

        const save = saves[0];
        
        res.json({
            success: true,
            hasSave: true,
            saveData: typeof save.save_data === 'string' 
                ? JSON.parse(save.save_data) 
                : save.save_data,
            playTimeSeconds: save.play_time_seconds,
            playerName: save.player_name,
            playerLevel: save.player_level,
            savedAt: save.saved_at
        });

    } catch (error) {
        console.error('❌ 불러오기 에러:', error);
        res.status(500).json({ 
            success: false, 
            error: '불러오기 중 오류가 발생했습니다.' 
        });
    }
});

// ============================================
// 🗑️ 저장 데이터 삭제
// DELETE /api/save
// ============================================
router.delete('/', async (req, res) => {
    try {
        const userId = req.user.id;

        // 저장 데이터 삭제 (Prepared Statement)
        const result = await query(
            'DELETE FROM game_saves WHERE user_id = ?',
            [userId]
        );

        if (result.affectedRows === 0) {
            return res.json({
                success: true,
                message: '삭제할 저장 데이터가 없습니다.'
            });
        }

        console.log(`🗑️ 저장 데이터 삭제: ${req.user.username}`);

        res.json({
            success: true,
            message: '저장 데이터가 삭제되었습니다.'
        });

    } catch (error) {
        console.error('❌ 삭제 에러:', error);
        res.status(500).json({ 
            success: false, 
            error: '삭제 중 오류가 발생했습니다.' 
        });
    }
});

// ============================================
// ℹ️ 저장 정보만 조회 (요약)
// GET /api/save/info
// ============================================
router.get('/info', async (req, res) => {
    try {
        const userId = req.user.id;

        const saves = await query(
            `SELECT player_name, player_level, play_time_seconds, saved_at
             FROM game_saves WHERE user_id = ?`,
            [userId]
        );

        if (saves.length === 0) {
            return res.json({
                success: true,
                hasSave: false
            });
        }

        const save = saves[0];
        
        res.json({
            success: true,
            hasSave: true,
            playerName: save.player_name,
            playerLevel: save.player_level,
            playTimeSeconds: save.play_time_seconds,
            savedAt: save.saved_at
        });

    } catch (error) {
        console.error('❌ 정보 조회 에러:', error);
        res.status(500).json({ 
            success: false, 
            error: '조회 중 오류가 발생했습니다.' 
        });
    }
});

module.exports = router;
