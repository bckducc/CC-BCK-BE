import express from 'express';
import {
  generateInvoices,
  listInvoices,
  getInvoice,
  listTenantInvoices,
  confirmInvoicePayment,
  exportInvoicePDF,
  recordInvoicePayment,
  getInvoicePayments,
} from '../controllers/invoiceController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// ========== Invoice Management (Landlord) ==========
router.post('/generate', requireRole('landlord'), generateInvoices);
router.get('/', requireRole('landlord'), listInvoices);
router.get('/:id', requireRole('landlord'), getInvoice);
router.put('/:id/pay', requireRole('landlord'), confirmInvoicePayment);

// ========== Payment Management (Landlord) ==========
router.post('/:id/payments', requireRole('landlord'), recordInvoicePayment);
router.get('/:id/payments', requireRole('landlord'), getInvoicePayments);

// ========== Tenant View (Own Invoices) ==========
router.get('/my/invoices', requireRole('tenant'), listTenantInvoices);

// ========== Export (Both) ==========
router.get('/:id/export', exportInvoicePDF);

export default router;