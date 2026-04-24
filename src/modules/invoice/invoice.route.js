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
} from './invoice.controller.js';
import { authMiddleware, requireRole } from '../../common/middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/generate', requireRole('landlord'), generateInvoices);
router.get('/', requireRole('landlord'), listInvoices);
router.get('/:id', requireRole('landlord'), getInvoice);
router.put('/:id/pay', requireRole('landlord'), confirmInvoicePayment);
router.post('/:id/payments', requireRole('landlord'), recordInvoicePayment);
router.get('/:id/payments', requireRole('landlord'), getInvoicePayments);
router.get('/my/invoices', requireRole('tenant'), listTenantInvoices);
router.get('/:id/export', exportInvoicePDF);

export default router;
