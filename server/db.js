/**
 * ============================================
 * MariaDB 데이터베이스 연결 및 초기화
 * ============================================
 * 
 * 보안 기능:
 * - 커넥션 풀 사용 (효율적인 연결 관리)
 * - Prepared Statements (SQL 인젝션 방지)
 * - 연결 정보 환경 변수 분리
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// 커넥션 풀 설정
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rpg_game',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // 보안 설정
    multipleStatements: false, // SQL 인젝션 방지: 다중 쿼리 비활성화
});

/**
 * 데이터베이스 및 테이블 초기화
 */
async function initializeDatabase() {
    // 먼저 데이터베이스 없이 연결
    const tempConnection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true, // 초기화 시에만 허용
    });

    try {
        // 데이터베이스 생성
        await tempConnection.query(`
            CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'rpg_game'}
            CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);
        console.log('✅ 데이터베이스 생성/확인 완료');

        // 데이터베이스 선택
        await tempConnection.query(`USE ${process.env.DB_NAME || 'rpg_game'}`);

        // users 테이블 생성
        await tempConnection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP NULL,
                INDEX idx_username (username)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ users 테이블 생성/확인 완료');

        // game_saves 테이블 생성
        await tempConnection.query(`
            CREATE TABLE IF NOT EXISTS game_saves (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                save_data JSON NOT NULL,
                play_time_seconds INT DEFAULT 0,
                player_name VARCHAR(50),
                player_level INT DEFAULT 1,
                saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ game_saves 테이블 생성/확인 완료');

    } finally {
        await tempConnection.end();
    }
}

/**
 * Prepared Statement를 사용한 안전한 쿼리 실행
 * @param {string} sql - SQL 쿼리 (? 플레이스홀더 사용)
 * @param {Array} params - 파라미터 배열
 * @returns {Promise} 쿼리 결과
 */
async function query(sql, params = []) {
    const [results] = await pool.execute(sql, params);
    return results;
}

/**
 * 트랜잭션 실행
 * @param {Function} callback - 트랜잭션 내에서 실행할 함수
 */
async function transaction(callback) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    pool,
    query,
    transaction,
    initializeDatabase
};
