import dotenv from 'dotenv';
<<<<<<< Updated upstream
import authRoutes from './routes/auth.js';
import tenantRoutes from './routes/tenant.js';
import roomRoutes from './routes/room.js';
import pool from './config/database.js';
=======
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import pool from './config/database.js';
import { initDatabase } from './database/init-database.js';
>>>>>>> Stashed changes

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 5002;

<<<<<<< Updated upstream
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// API Routes (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/tenant', tenantRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy route',
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Lỗi server nội bộ',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start Server
const server = app.listen(PORT, async () => {
  try {
    // Test database connection
=======
const server = app.listen(PORT, async () => {
  try {
    console.log('🔧 Kiểm tra và khởi tạo database...');
    await initDatabase();
    
>>>>>>> Stashed changes
    const connection = await pool.getConnection();
    console.log('✓ Database connected successfully');
    connection.release();

    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ API Base URL: http://localhost:${PORT}/api`);
    console.log(`✓ Environment: ${process.env.NODE_ENV}`);
  } catch (error) {
    console.error('✗ Failed to connect to database:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
