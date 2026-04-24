import pool from '../../config/database.js';

export const getTotalPaymentsForInvoice = async (invoiceId) => {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      'SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments WHERE invoice_id = ?',
      [invoiceId]
    );

    return parseFloat(rows[0].total_paid);
  } finally {
    connection.release();
  }
};

export const getPaymentsForInvoice = async (invoiceId) => {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      `SELECT p.*, u.username as received_by_username
       FROM payments p
       LEFT JOIN users u ON p.received_by = u.id
       WHERE p.invoice_id = ?
       ORDER BY p.payment_date DESC, p.created_at DESC`,
      [invoiceId]
    );

    return rows;
  } finally {
    connection.release();
  }
};

export const getRemainingBalance = async (invoiceId) => {
  const connection = await pool.getConnection();

  try {
    const [invoiceRows] = await connection.query('SELECT final_amount FROM invoices WHERE id = ?', [invoiceId]);

    if (invoiceRows.length === 0) {
      throw new Error('Invoice not found');
    }

    const invoiceTotal = parseFloat(invoiceRows[0].final_amount);
    const totalPaid = await getTotalPaymentsForInvoice(invoiceId);
    const remainingBalance = invoiceTotal - totalPaid;

    return Math.max(0, remainingBalance);
  } finally {
    connection.release();
  }
};

export const recordPayment = async (invoiceId, landlordUserId, paymentData) => {
  const { amount, payment_date, payment_method, transaction_code, note, received_by } = paymentData;

  if (!amount || amount <= 0) {
    throw new Error('Số tiền thanh toán phải lớn hơn 0');
  }

  if (!payment_date) {
    throw new Error('Ngày thanh toán là bắt buộc');
  }

  const validMethods = ['cash', 'bank_transfer'];
  if (payment_method && !validMethods.includes(payment_method)) {
    throw new Error('Phương thức thanh toán không hợp lệ');
  }

  const paymentDateObj = new Date(payment_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (paymentDateObj > today) {
    throw new Error('Ngày thanh toán không được trong tương lai');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [invoiceCheck] = await connection.query(
      `SELECT i.*, r.owner_id
       FROM invoices i
       INNER JOIN rooms r ON i.room_id = r.id
       WHERE i.id = ?`,
      [invoiceId]
    );

    if (invoiceCheck.length === 0) {
      throw new Error('Không tìm thấy hóa đơn');
    }

    if (invoiceCheck[0].owner_id !== landlordUserId) {
      throw new Error('Bạn không có quyền ghi nhận thanh toán cho hóa đơn này');
    }

    const invoice = invoiceCheck[0];
    const invoiceTotal = parseFloat(invoice.final_amount);

    const [paymentSumRows] = await connection.query(
      'SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments WHERE invoice_id = ?',
      [invoiceId]
    );

    const totalPaid = parseFloat(paymentSumRows[0].total_paid);
    const remainingBalance = invoiceTotal - totalPaid;

    if (amount > remainingBalance) {
      throw new Error(`Số tiền thanh toán ${amount} vượt quá số tiền còn lại ${remainingBalance.toFixed(2)}`);
    }

    const [paymentResult] = await connection.query(
      `INSERT INTO payments (invoice_id, amount, payment_date, payment_method, transaction_code, note, received_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        invoiceId,
        amount,
        payment_date,
        payment_method || 'cash',
        transaction_code || null,
        note || null,
        received_by || null,
      ]
    );

    const paymentId = paymentResult.insertId;
    const newTotalPaid = totalPaid + amount;

    if (newTotalPaid >= invoiceTotal) {
      await connection.query('UPDATE invoices SET status = ?, updated_at = NOW() WHERE id = ?', ['paid', invoiceId]);
      invoice.status = 'paid';
    }

    await connection.commit();

    const [paymentRows] = await connection.query('SELECT * FROM payments WHERE id = ?', [paymentId]);

    return {
      payment: paymentRows[0],
      invoice: {
        id: invoice.id,
        status: invoice.status,
        total_amount: invoiceTotal,
        total_paid: newTotalPaid,
        remaining_balance: Math.max(0, invoiceTotal - newTotalPaid),
      },
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

