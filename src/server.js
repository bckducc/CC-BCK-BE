import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import tenantRoutes from './routes/tenant.js';
import roomRoutes from './routes/room.js';
import contractRoutes from './routes/contract.js';
import serviceRoutes from './routes/service.js';
import utilityRoutes from './routes/utility.js';
import invoiceRoutes from './routes/invoice.js';
import dashboardRoutes from './routes/dashboard.js';
import notificationRoutes from './routes/notification.js';
import landlordRoutes from './routes/landlord.js';
import pool from './config/database.js';
import { initDatabase } from './database/init-database.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Apply rate limiting to all API routes
app.use('/api/v1/*', apiRateLimiter);

// API Routes (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/tenant', tenantRoutes);
app.use('/api/v1/contracts', contractRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/utilities', utilityRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/landlord', landlordRoutes);

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
    // Tự động khởi tạo database nếu chưa có
    console.log('🔧 Kiểm tra và khởi tạo database...');
    await initDatabase();
    
    // Test database connection
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();

    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ API Base URL: http://localhost:${PORT}/api/v1`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('');
    console.log('🎉 BCK Manager đã sẵn sàng!');
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
