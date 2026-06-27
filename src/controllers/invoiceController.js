import {
  previewInvoice,
  generateMonthlyInvoices,
  getInvoices,
  getInvoiceById,
  getTenantInvoices,
  getTenantInvoiceById,
  confirmPayment,
  updateInvoiceStatus,
} from '../services/invoiceService.js';
import * as paymentService from '../services/paymentService.js';

const paginate = (rows, page = 1, limit = 20) => {
  const currentPage = parseInt(page);
  const pageSize = parseInt(limit);
  const start = (currentPage - 1) * pageSize;

  return {
    data: rows.slice(start, start + pageSize),
    total: rows.length,
    page: currentPage,
    limit: pageSize,
  };
};

export const generateInvoices = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Thang va nam la bat buoc',
      });
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (year > currentYear || (year === currentYear && month > currentMonth)) {
      return res.status(400).json({
        success: false,
        message: 'Khong the tao hoa don cho thang tuong lai',
      });
    }

    const result = await generateMonthlyInvoices(req.user.id, parseInt(month), parseInt(year), req.body);

    return res.status(201).json({
      success: true,
      message: `Tao ${result.created_count} hoa don thanh cong`,
      data: result,
    });
  } catch (error) {
    console.error('Generate invoices error:', {
      type: 'VALIDATION_ERROR',
      field: 'invoice_generation',
      value: { month: req.body.month, year: req.body.year },
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Tao hoa don that bai',
    });
  }
};

export const previewGeneratedInvoice = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Thang va nam la bat buoc',
      });
    }

    const preview = await previewInvoice(req.user.id, parseInt(month), parseInt(year), req.body);

    return res.status(200).json({
      success: true,
      data: preview,
    });
  } catch (error) {
    console.error('Preview invoice error:', {
      type: 'VALIDATION_ERROR',
      field: 'invoice_preview',
      value: { month: req.body.month, year: req.body.year, contract_id: req.body.contract_id },
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Khong xem truoc duoc hoa don',
    });
  }
};

export const listInvoices = async (req, res) => {
  try {
    const { status, month, year, room_id, page = 1, limit = 20 } = req.query;
    const invoices = await getInvoices({ status, month, year, room_id }, req.user.id);
    const result = paginate(invoices, page, limit);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('List invoices error:', {
      type: 'LIST_INVOICES_ERROR',
      userId: req.user?.id,
      filters: req.query,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Khong tai duoc danh sach hoa don',
    });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const invoice = await getInvoiceById(req.params.id, req.user.id);

    return res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Get invoice error:', {
      type: 'GET_INVOICE_ERROR',
      invoiceId: req.params.id,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(404).json({
      success: false,
      message: error.message || 'Khong tim thay hoa don',
    });
  }
};

export const listTenantInvoices = async (req, res) => {
  try {
    const { status, month, year, room_id, page = 1, limit = 20 } = req.query;
    const invoices = await getTenantInvoices(req.user.id, { status, month, year, room_id });
    const result = paginate(invoices, page, limit);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('List tenant invoices error:', {
      type: 'LIST_TENANT_INVOICES_ERROR',
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Khong tai duoc danh sach hoa don',
    });
  }
};

export const getTenantInvoice = async (req, res) => {
  try {
    const invoice = await getTenantInvoiceById(req.params.id, req.user.id);

    return res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Get tenant invoice error:', {
      type: 'GET_TENANT_INVOICE_ERROR',
      invoiceId: req.params.id,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(403).json({
      success: false,
      message: error.message || 'Ban khong co quyen xem hoa don nay',
    });
  }
};

export const confirmInvoicePayment = async (req, res) => {
  try {
    const result = await confirmPayment(req.params.id, req.user.id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Xac nhan thanh toan thanh cong',
      data: result,
    });
  } catch (error) {
    console.error('Confirm payment error:', {
      type: 'VALIDATION_ERROR',
      field: 'payment_confirmation',
      invoiceId: req.params.id,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Xac nhan thanh toan that bai',
    });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Trang thai la bat buoc',
      });
    }

    const result = await updateInvoiceStatus(req.params.id, status, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Cap nhat trang thai thanh cong',
      data: result,
    });
  } catch (error) {
    console.error('Update invoice status error:', {
      type: 'VALIDATION_ERROR',
      field: 'invoice_status',
      invoiceId: req.params.id,
      value: req.body.status,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Cap nhat trang thai that bai',
    });
  }
};

export const exportInvoicePDF = async (req, res) => {
  try {
    const invoice = req.user.role === 'tenant'
      ? await getTenantInvoiceById(req.params.id, req.user.id)
      : await getInvoiceById(req.params.id, req.user.id);

    const money = (value) => Number(value || 0).toLocaleString('vi-VN');
    const invoiceText = `
=========================================
           HOA DON TIEN PHONG
=========================================
Ma hoa don: ${invoice.id}
Thang: ${invoice.month}/${invoice.year}

Phong: ${invoice.room_number}
Nguoi thue: ${invoice.tenant_name}
Dien thoai: ${invoice.tenant_phone || 'N/A'}
Chu nha: ${invoice.landlord_name || 'N/A'}
Dien thoai chu nha: ${invoice.landlord_phone || 'N/A'}
Ngan hang: ${invoice.bank_name || 'N/A'}
So tai khoan: ${invoice.bank_account_number || 'N/A'}
Chu tai khoan: ${invoice.bank_account_name || 'N/A'}

-----------------------------------------
CHI TIET:
-----------------------------------------
Tien phong:      ${money(invoice.room_fee)} VND
Tien dich vu:    ${money(invoice.service_fee)} VND
Tien dien:       ${money(invoice.electric_fee)} VND
Tien nuoc:       ${money(invoice.water_fee)} VND
Phi khac:        ${money(invoice.other_fees)} VND
Tong cong:       ${money(invoice.total_amount)} VND
Giam gia:        ${money(invoice.discount)} VND
-----------------------------------------
THANH TIEN:      ${money(invoice.final_amount)} VND
=========================================

Trang thai: ${invoice.status}
Han thanh toan: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('vi-VN') : 'N/A'}
`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="hoadon_${invoice.month}_${invoice.year}_${invoice.room_number}.txt"`);

    return res.status(200).send(invoiceText);
  } catch (error) {
    console.error('Export invoice error:', {
      type: 'EXPORT_INVOICE_ERROR',
      invoiceId: req.params.id,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Xuat hoa don that bai',
    });
  }
};

export const recordInvoicePayment = async (req, res) => {
  try {
    const { amount, payment_date, payment_method, transaction_code, note } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'So tien thanh toan la bat buoc',
      });
    }

    if (!payment_date) {
      return res.status(400).json({
        success: false,
        message: 'Ngay thanh toan la bat buoc',
      });
    }

    const result = await paymentService.recordPayment(req.params.id, req.user.id, {
      amount: parseFloat(amount),
      payment_date,
      payment_method,
      transaction_code,
      note,
      received_by: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: 'Ghi nhan thanh toan thanh cong',
      data: result,
    });
  } catch (error) {
    console.error('Record payment error:', {
      type: 'VALIDATION_ERROR',
      field: 'payment_record',
      invoiceId: req.params.id,
      value: { amount: req.body.amount },
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Ghi nhan thanh toan that bai',
    });
  }
};

export const getInvoicePayments = async (req, res) => {
  try {
    const invoice = await getInvoiceById(req.params.id, req.user.id);
    const payments = await paymentService.getPaymentsForInvoice(req.params.id);
    const totalPaid = await paymentService.getTotalPaymentsForInvoice(req.params.id);
    const invoiceTotal = parseFloat(invoice.final_amount);

    return res.status(200).json({
      success: true,
      data: {
        payments,
        total_paid: totalPaid,
        remaining_balance: Math.max(0, invoiceTotal - totalPaid),
        invoice_total: invoiceTotal,
      },
    });
  } catch (error) {
    console.error('Get invoice payments error:', {
      type: 'GET_INVOICE_PAYMENTS_ERROR',
      invoiceId: req.params.id,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Khong tai duoc danh sach thanh toan',
    });
  }
};
