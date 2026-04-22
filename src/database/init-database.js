import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Tự động khởi tạo database và chạy schema khi server start
 * Chỉ chạy nếu database chưa tồn tại hoặc chưa có tables
 */
export async function initDatabase() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  };

  const dbName = process.env.DB_NAME || 'bck_manager';

  let connection;

  try {
    // Kết nối MySQL (không chỉ định database)
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Kết nối MySQL thành công');

    // Kiểm tra database đã tồn tại chưa
    const [databases] = await connection.query(
      `SHOW DATABASES LIKE '${dbName}'`
    );

    if (databases.length === 0) {
      // Tạo database mới
      console.log(`📦 Tạo database '${dbName}'...`);
      await connection.query(
        `CREATE DATABASE ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      console.log(`✅ Database '${dbName}' đã được tạo`);
    } else {
      console.log(`✅ Database '${dbName}' đã tồn tại`);
    }

    // Chuyển sang database
    await connection.query(`USE ${dbName}`);

    // Kiểm tra xem đã có tables chưa
    const [tables] = await connection.query('SHOW TABLES');

    if (tables.length === 0) {
      console.log('📋 Chưa có tables, bắt đầu khởi tạo schema...');
      await runSchemaFiles(connection);
      console.log('✅ Khởi tạo schema hoàn tất!');
    } else {
      console.log(`✅ Database đã có ${tables.length} tables, bỏ qua khởi tạo`);
    }

  } catch (error) {
    console.error('❌ Lỗi khởi tạo database:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * Chạy các file schema theo thứ tự
 */
async function runSchemaFiles(connection) {
  const schemaDir = path.join(__dirname, 'schema');
  
  // Thứ tự chạy schema files (quan trọng vì foreign keys)
  const schemaFiles = [
    '01-users.sql',
    '00-rooms.sql',
    '02-contracts.sql',
    '03-services.sql',
    '04-utilities.sql',
    '05-invoices.sql',
    '06-notifications.sql',
    '07-utility-config.sql'
  ];

  for (const file of schemaFiles) {
    const filePath = path.join(schemaDir, file);
    
    try {
      console.log(`  📄 Chạy ${file}...`);
      const sql = await fs.readFile(filePath, 'utf8');
      
      // Chạy SQL (có thể có nhiều statements)
      await connection.query(sql);
      console.log(`  ✅ ${file} hoàn tất`);
      
    } catch (error) {
      console.error(`  ❌ Lỗi khi chạy ${file}:`, error.message);
      throw error;
    }
  }
}
