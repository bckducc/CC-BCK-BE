import pool from '../../config/database.js';
import {
  generateMonthlyInvoices,
  getInvoices,
  getInvoiceById,
  getTenantInvoices,
  confirmPayment,
  updateInvoiceStatus,
} from './invoice.service.js';
import * as paymentService from './payment.service.js';

export const generateInvoices = async (req, res) => {
  try {
    const landlordUserId = req.user.id;
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Tháng và năm là bắt buộc',
      });
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (year > currentYear || (year === currentYear && month > currentMonth)) {
      return res.status(400).json({
        success: false,
        message: 'Không thể tạo hóa đơn cho tháng tương lai',
      });
    }

    const invoices = await generateMonthlyInvoices(landlordUserId, parseInt(month), parseInt(year));

    return res.status(201).json({
      success: true,
      message: `Tạo ${invoices.length} hóa đơn thành công`,
      data: invoices,
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
      message: error.message || 'Tạo hóa đơn thất bại',
    });
  }
};

export const listInvoices = async (req, res) => {
  try {
    const landlordUserId = req.user.id;
    const { status, month, year, room_id, page = 1, limit = 20 } = req.query;

    const filters = { status, month, year, room_id };
    const invoices = await getInvoices(filters, landlordUserId);

    const start = (page - 1) * limit;
    const paginatedInvoices = invoices.slice(start, start + parseInt(limit));

    return res.status(200).json({
      success: true,
      data: paginatedInvoices,
      total: invoices.length,
      page: parseInt(page),
      limit: parseInt(limit),
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
      message: 'Không tải được danh sách hóa đơn',
    });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordUserId = req.user.id;

    const invoice = await getInvoiceById(id, landlordUserId);

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
      message: error.message || 'Không tìm thấy hóa đơn',
    });
  }
};

export const listTenantInvoices = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'tenant') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ người thuê mới có thể xem hóa đơn của mình',
      });
    }

    const invoices = await getTenantInvoices(userId);

    return res.status(200).json({
      success: true,
      data: invoices,
      total: invoices.length,
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
      message: 'Không tải được danh sách hóa đơn',
    });
  }
};

export const confirmInvoicePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordUserId = req.user.id;

    const result = await confirmPayment(id, landlordUserId);

    return res.status(200).json({
      success: true,
      message: 'Xác nhận thanh toán thành công',
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
      message: error.message || 'Xác nhận thanh toán thất bại',
    });
  }
};

export const exportInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordUserId = req.user.id;
    const userRole = req.user.role;
    const userId = req.user.id;

    let invoice;

    if (userRole === 'landlord') {
      invoice = await getInvoiceById(id, landlordUserId);
    } else if (userRole === 'tenant') {
      const invoices = await getTenantInvoices(userId);
      invoice = invoices.find((inv) => inv.id === parseInt(id));

      if (!invoice) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem hóa đơn này',
        });
      }

      const connection = await pool.getConnection();
      const [rows] = await connection.query(
        `SELECT i.*, r.room_number, t.full_name as tenant_name, t.phone as tenant_phone
         FROM invoices i
         INNER JOIN rooms r ON i.room_id = r.id
         INNER JOIN tenant t ON i.tenant_id = t.user_id
         WHERE i.id = ?`,
        [id]
      );
      connection.release();
      invoice = rows[0];
    } else {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập',
      });
    }

    const invoiceText = `
=========================================
         HÓA ĐƠN TIỀN PHÒNG
=========================================
Mã hóa đơn: ${invoice.id}
Tháng: ${invoice.month}/${invoice.year}

Phòng: ${invoice.room_number}
Người thuê: ${invoice.tenant_name}
Điện thoại: ${invoice.tenant_phone}

-----------------------------------------
CHI TIẾT:
-----------------------------------------
Tiền phòng:     ${invoice.room_fee.toLocaleString('vi-VN')} VNĐ
Tiền dịch vụ:   ${invoice.service_fee.toLocaleString('vi-VN')} VNĐ
Tiền điện:      ${invoice.electric_fee.toLocaleString('vi-VN')} VNĐ
Tiền nước:      ${invoice.water_fee.toLocaleString('vi-VN')} VNĐ
Phí khác:       ${invoice.other_fees.toLocaleString('vi-VN')} VNĐ
-----------------------------------------
Tổng cộng:      ${invoice.total_amount.toLocaleString('vi-VN')} VNĐ
Giảm giá:       ${invoice.discount.toLocaleString('vi-VN')} VNĐ
-----------------------------------------
THÀNH TIỀN:     ${invoice.final_amount.toLocaleString('vi-VN')} VNĐ
=========================================

Trạng thái: ${
      invoice.status === 'paid'
        ? 'Đã thanh toán'
        : invoice.status === 'overdue'
          ? 'Quá hạn'
          : invoice.status === 'cancelled'
            ? 'Đã hủy'
            : 'Chưa thanh toán'
    }

Hạn thanh toán: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('vi-VN') : 'N/A'}
`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="hoadon_${invoice.month}_${invoice.year}_${invoice.room_number}.txt"`
    );

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
      message: error.message || 'Xuất hóa đơn thất bại',
    });
  }
};

export const recordInvoicePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordUserId = req.user.id;
    const userId = req.user.id;
    const { amount, payment_date, payment_method, transaction_code, note } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền thanh toán là bắt buộc',
      });
    }
    if (!payment_date) {
      return res.status(400).json({
        success: false,
        message: 'Ngày thanh toán là bắt buộc',
      });
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền thanh toán phải là số dương',
      });
    }

    const paymentData = {
      amount: paymentAmount,
      payment_date,
      payment_method,
      transaction_code,
      note,
      received_by: userId,
    };

    const result = await paymentService.recordPayment(id, landlordUserId, paymentData);

    return res.status(200).json({
      success: true,
      message: 'Ghi nhận thanh toán thành công',
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

    if (error.message === 'Invoice not found' || error.message.includes('Không tìm thấy')) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hóa đơn',
      });
    }

    if (error.message.includes('Unauthorized') || error.message.includes('không có quyền')) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền ghi nhận thanh toán cho hóa đơn này',
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Ghi nhận thanh toán thất bại',
    });
  }
};

export const getInvoicePayments = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordUserId = req.user.id;

    const invoice = await getInvoiceById(id, landlordUserId);

    const payments = await paymentService.getPaymentsForInvoice(id);
    const totalPaid = await paymentService.getTotalPaymentsForInvoice(id);

    const invoiceTotal = parseFloat(invoice.final_amount);
    const remainingBalance = Math.max(0, invoiceTotal - totalPaid);

    return res.status(200).json({
      success: true,
      data: {
        payments,
        total_paid: totalPaid,
        remaining_balance: remainingBalance,
        invoice_total: invoiceTotal,
      },
    });
  } catch (error) {
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hóa đơn',
      });
    }

    console.error('Get invoice payments error:', {
      type: 'GET_INVOICE_PAYMENTS_ERROR',
      invoiceId: req.params.id,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      success: false,
      message: 'Không tải được danh sách thanh toán',
    });
  }
};
