import express from 'express';
import cors from 'cors';

import authRoutes from './modules/auth/auth.route.js';
import tenantRoutes from './modules/tenant/tenant.route.js';
import roomRoutes from './modules/room/room.route.js';
import contractRoutes from './modules/contract/contract.route.js';
import serviceRoutes from './modules/service/service.route.js';
import utilityRoutes from './modules/utility/utility.route.js';
import invoiceRoutes from './modules/invoice/invoice.route.js';
import dashboardRoutes from './modules/dashboard/dashboard.route.js';
import notificationRoutes from './modules/notification/notification.route.js';
import landlordRoutes from './modules/landlord/landlord.route.js';

import { apiRateLimiter } from './common/middleware/rateLimiter.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/*', apiRateLimiter);

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

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy route',
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Lỗi server nội bộ',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;
