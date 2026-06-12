import express from 'express';
import {
  generateInvoices,
  listInvoices,
  getInvoice,
  listTenantInvoices,
  getTenantInvoice,
  confirmInvoicePayment,
  exportInvoicePDF,
  recordInvoicePayment,
  getInvoicePayments,
} from '../controllers/invoiceController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/my/invoices', requireRole('tenant'), listTenantInvoices);
router.get('/my/invoices/:id', requireRole('tenant'), getTenantInvoice);

router.post('/generate', requireRole('landlord'), generateInvoices);
router.get('/', requireRole('landlord'), listInvoices);
router.put('/:id/pay', requireRole('landlord'), confirmInvoicePayment);

router.post('/:id/payments', requireRole('landlord'), recordInvoicePayment);
router.get('/:id/payments', requireRole('landlord'), getInvoicePayments);

router.get('/:id/export', exportInvoicePDF);
router.get('/:id', requireRole('landlord'), getInvoice);

export default router;
