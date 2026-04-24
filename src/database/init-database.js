import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDatabase() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '12102004',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
  };

  const dbName = process.env.DB_NAME || 'ccbck';

  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Kết nối MySQL thành công');

    const [databases] = await connection.query(
      `SHOW DATABASES LIKE '${dbName}'`
    );

    if (databases.length === 0) {
      console.log(`📦 Tạo database '${dbName}'...`);
      await connection.query(
        `CREATE DATABASE ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      console.log(`✅ Database '${dbName}' đã được tạo`);
    } else {
      console.log(`✅ Database '${dbName}' đã tồn tại`);
    }

    await connection.query(`USE ${dbName}`);

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

async function runSchemaFiles(connection) {
  const schemaDir = path.join(__dirname, 'schema');
  
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
      
      await connection.query(sql);
      console.log(`  ✅ ${file} hoàn tất`);
      
    } catch (error) {
      console.error(`  ❌ Lỗi khi chạy ${file}:`, error.message);
      throw error;
    }
  }
}
