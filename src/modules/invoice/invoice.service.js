import pool from '../../config/database.js';
import { createNotification } from '../notification/notification.service.js';

export const generateMonthlyInvoices = async (landlordUserId, month, year) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [contracts] = await connection.query(
      `SELECT c.*, r.room_number, r.area, r.price as room_price, r.owner_id, c.tenant_id
       FROM contracts c
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE r.owner_id = ? AND c.status = 'active'`,
      [landlordUserId]
    );

    if (contracts.length === 0) {
      await connection.rollback();
      throw new Error('Không có hợp đồng đang hoạt động');
    }

    const generatedInvoices = [];

    for (const contract of contracts) {
      const [existingInvoice] = await connection.query(
        'SELECT id FROM invoices WHERE contract_id = ? AND month = ? AND year = ? FOR UPDATE',
        [contract.id, month, year]
      );

      if (existingInvoice.length > 0) continue;

      const [utilityReading] = await connection.query('SELECT * FROM utilities WHERE room_id = ? AND month = ? AND year = ?', [
        contract.room_id,
        month,
        year,
      ]);

      let electric_fee = 0;
      let water_fee = 0;

      if (utilityReading.length > 0) {
        const util = utilityReading[0];
        const electric_consumption = util.electric_new - util.electric_old;
        const water_consumption = util.water_new - util.water_old;
        electric_fee = electric_consumption * util.electric_price;
        water_fee = water_consumption * util.water_price;
      }

      const [roomServices] = await connection.query(
        `SELECT rs.quantity, s.service_name, s.price, s.unit
         FROM room_services rs
         INNER JOIN services s ON rs.service_id = s.id
         WHERE rs.room_id = ?`,
        [contract.room_id]
      );

      const service_fee = roomServices.reduce((sum, rs) => sum + parseFloat(rs.price) * rs.quantity, 0);

      const room_fee = parseFloat(contract.monthly_rent);
      const other_fees = 0;
      const discount = 0;
      const total_amount = room_fee + service_fee + electric_fee + water_fee + other_fees;
      const final_amount = total_amount - discount;

      let dueMonth = month + 1;
      let dueYear = year;
      if (dueMonth > 12) {
        dueMonth = 1;
        dueYear = year + 1;
      }
      const dueDate = `${dueYear}-${String(dueMonth).padStart(2, '0')}-05`;

      const [invoiceResult] = await connection.query(
        `INSERT INTO invoices (
          room_id, tenant_id, contract_id, month, year, 
          room_fee, service_fee, electric_fee, water_fee, other_fees,
          total_amount, discount, final_amount, due_date, status, created_at, updated_at
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
        [
          contract.room_id,
          contract.tenant_id,
          contract.id,
          month,
          year,
          room_fee,
          service_fee,
          electric_fee,
          water_fee,
          other_fees,
          total_amount,
          discount,
          final_amount,
          dueDate,
        ]
      );

      const invoiceId = invoiceResult.insertId;

      generatedInvoices.push({
        id: invoiceId,
        contract_id: contract.id,
        room_number: contract.room_number,
        tenant_id: contract.tenant_id,
        total_amount,
        final_amount,
      });

      await createNotification(contract.tenant_id, {
        title: `Hóa đơn mới - Tháng ${month}/${year}`,
        content: `Hóa đơn phòng ${contract.room_number} tháng ${month}/${year} đã được tạo với tổng tiền ${final_amount.toLocaleString()} VNĐ. Hạn thanh toán: ${dueDate}.`,
        type: 'invoice',
        reference_id: invoiceId,
        reference_type: 'invoice',
      });
    }

    await connection.commit();
    return generatedInvoices;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getInvoices = async (filters, landlordUserId) => {
  const { status, month, year, room_id } = filters;
  const connection = await pool.getConnection();

  try {
    let query = `
      SELECT i.*, c.status as contract_status, r.room_number, t.full_name as tenant_name, t.phone as tenant_phone
      FROM invoices i
      INNER JOIN contracts c ON i.contract_id = c.id
      INNER JOIN rooms r ON i.room_id = r.id
      INNER JOIN tenant t ON i.tenant_id = t.user_id
      WHERE r.owner_id = ?
    `;
    const params = [landlordUserId];

    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }

    if (month && year) {
      query += ' AND i.month = ? AND i.year = ?';
      params.push(parseInt(month), parseInt(year));
    }

    if (room_id) {
      query += ' AND i.room_id = ?';
      params.push(room_id);
    }

    query += ' ORDER BY i.year DESC, i.month DESC';

    const [rows] = await connection.query(query, params);
    return rows;
  } finally {
    connection.release();
  }
};

export const getInvoiceById = async (invoiceId, landlordUserId) => {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      `SELECT i.*, c.status as contract_status, c.start_date, c.end_date, c.monthly_rent,
              r.room_number, r.floor, r.area,
              t.full_name as tenant_name, t.phone as tenant_phone, t.identity_card
       FROM invoices i
       INNER JOIN contracts c ON i.contract_id = c.id
       INNER JOIN rooms r ON i.room_id = r.id
       INNER JOIN tenant t ON i.tenant_id = t.user_id
       WHERE i.id = ? AND r.owner_id = ?`,
      [invoiceId, landlordUserId]
    );

    if (rows.length === 0) throw new Error('Không tìm thấy hóa đơn');
    return rows[0];
  } finally {
    connection.release();
  }
};

export const getTenantInvoices = async (tenantUserId) => {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      `SELECT i.*, r.room_number
       FROM invoices i
       INNER JOIN rooms r ON i.room_id = r.id
       WHERE i.tenant_id = ?
       ORDER BY i.year DESC, i.month DESC`,
      [tenantUserId]
    );

    return rows;
  } finally {
    connection.release();
  }
};

export const confirmPayment = async (invoiceId, landlordUserId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [invoiceCheck] = await connection.query(
      `SELECT i.*, r.owner_id
       FROM invoices i
       INNER JOIN rooms r ON i.room_id = r.id
       WHERE i.id = ?
       FOR UPDATE`,
      [invoiceId]
    );

    if (invoiceCheck.length === 0) {
      await connection.rollback();
      throw new Error('Không tìm thấy hóa đơn');
    }

    if (invoiceCheck[0].owner_id !== landlordUserId) {
      await connection.rollback();
      throw new Error('Bạn không có quyền xác nhận hóa đơn này');
    }

    if (invoiceCheck[0].status === 'paid') {
      await connection.rollback();
      throw new Error('Hóa đơn này đã được thanh toán');
    }

    await connection.query(`UPDATE invoices SET status = 'paid', updated_at = NOW() WHERE id = ?`, [invoiceId]);

    await createNotification(invoiceCheck[0].tenant_id, {
      title: 'Thanh toán thành công',
      content: `Hóa đơn tháng ${invoiceCheck[0].month}/${invoiceCheck[0].year} của bạn đã được xác nhận thanh toán thành công.`,
      type: 'invoice',
      reference_id: invoiceId,
      reference_type: 'invoice',
    });

    await connection.commit();
    return { id: invoiceId, status: 'paid' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateInvoiceStatus = async (invoiceId, status, landlordUserId) => {
  const validStatuses = ['pending', 'paid', 'overdue', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error('Trạng thái không hợp lệ');
  }

  const connection = await pool.getConnection();

  try {
    const [invoiceCheck] = await connection.query(
      `SELECT i.*, r.owner_id
       FROM invoices i
       INNER JOIN rooms r ON i.room_id = r.id
       WHERE i.id = ?`,
      [invoiceId]
    );

    if (invoiceCheck.length === 0) throw new Error('Không tìm thấy hóa đơn');
    if (invoiceCheck[0].owner_id !== landlordUserId) throw new Error('Bạn không có quyền cập nhật hóa đơn này');

    await connection.query(`UPDATE invoices SET status = ?, updated_at = NOW() WHERE id = ?`, [status, invoiceId]);
    return { id: invoiceId, status };
  } finally {
    connection.release();
  }
};

export const getUnpaidCount = async (landlordUserId) => {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      `SELECT COUNT(*) as count 
       FROM invoices i
       INNER JOIN rooms r ON i.room_id = r.id
       WHERE r.owner_id = ? AND i.status IN ('pending', 'overdue')`,
      [landlordUserId]
    );

    return rows[0].count;
  } finally {
    connection.release();
  }
};

export const getRevenueByMonth = async (landlordUserId, year) => {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      `SELECT i.year, i.month, SUM(i.final_amount) as revenue, COUNT(*) as invoice_count
       FROM invoices i
       INNER JOIN rooms r ON i.room_id = r.id
       WHERE r.owner_id = ? AND i.year = ? AND i.status = 'paid'
       GROUP BY i.year, i.month
       ORDER BY i.month`,
      [landlordUserId, year]
    );

    return rows;
  } finally {
    connection.release();
  }
};
