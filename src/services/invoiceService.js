import pool from '../config/database.js';
import { createNotification } from './notificationService.js';

const VALID_STATUSES = ['pending', 'paid', 'overdue', 'cancelled'];
const VALID_PAYMENT_METHODS = ['cash', 'bank_transfer', 'other'];

const toNumber = (value, defaultValue = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : defaultValue;
};

const requirePositiveInt = (value, fieldName) => {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue < 1) {
    throw new Error(`${fieldName} khong hop le`);
  }
  return numberValue;
};

const normalizePaymentDate = (paymentDate) => {
  if (!paymentDate) {
    return new Date().toISOString().slice(0, 10);
  }

  if (typeof paymentDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(paymentDate)) {
    throw new Error('Ngay thanh toan phai co dinh dang YYYY-MM-DD');
  }

  const date = new Date(`${paymentDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== paymentDate) {
    throw new Error('Ngay thanh toan khong hop le');
  }

  return paymentDate;
};

const normalizeDueDate = (dueDate) => {
  if (!dueDate) {
    return null;
  }

  if (typeof dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    throw new Error('Han thanh toan phai co dinh dang YYYY-MM-DD');
  }

  const date = new Date(`${dueDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dueDate) {
    throw new Error('Han thanh toan khong hop le');
  }

  return dueDate;
};

const buildDueDate = (month, year) => {
  let dueMonth = month + 1;
  let dueYear = year;

  if (dueMonth > 12) {
    dueMonth = 1;
    dueYear += 1;
  }

  return `${dueYear}-${String(dueMonth).padStart(2, '0')}-05`;
};

const normalizeInvoice = (invoice) => {
  if (!invoice) {
    return invoice;
  }

  const totalAmount = toNumber(invoice.total_amount, (
    toNumber(invoice.room_fee) +
    toNumber(invoice.service_fee) +
    toNumber(invoice.electric_fee) +
    toNumber(invoice.water_fee) +
    toNumber(invoice.other_fees)
  ));

  return {
    ...invoice,
    total_amount: totalAmount,
    discount: toNumber(invoice.discount),
    final_amount: toNumber(invoice.final_amount, totalAmount - toNumber(invoice.discount)),
  };
};

const getInvoiceDetailsById = async (connection, invoiceId) => {
  const [rows] = await connection.query(
    `SELECT i.*,
            c.status as contract_status, c.start_date, c.end_date, c.monthly_rent,
            r.room_number, r.floor, r.area,
            t.full_name as tenant_name, t.phone as tenant_phone, t.identity_card,
            l.full_name as landlord_name, l.phone as landlord_phone,
            l.bank_name, l.bank_account_number, l.bank_account_name
     FROM invoices i
     INNER JOIN contracts c ON i.contract_id = c.id
     INNER JOIN rooms r ON c.room_id = r.id
     INNER JOIN tenant t ON c.tenant_id = t.user_id
     INNER JOIN landlord l ON r.owner_id = l.user_id
     WHERE i.id = ?`,
    [invoiceId]
  );

  return normalizeInvoice(rows[0]);
};

const calculateInvoiceAmounts = async (connection, contract, month, year, options = {}) => {
  const [utilityRows] = await connection.query(
    'SELECT * FROM utilities WHERE contract_id = ? AND month = ? AND year = ?',
    [contract.id, month, year]
  );

  let electricFee = 0;
  let waterFee = 0;
  let utilityWarning = null;

  if (utilityRows.length > 0) {
    const utility = utilityRows[0];
    electricFee = Math.max(0, utility.electric_new - utility.electric_old) * toNumber(utility.electric_price);
    waterFee = Math.max(0, utility.water_new - utility.water_old) * toNumber(utility.water_price);
  } else {
    utilityWarning = 'Chua nhap chi so dien nuoc, hoa don duoc tao voi tien dien nuoc bang 0';
  }

  const [roomServices] = await connection.query(
    `SELECT rs.quantity, s.id as service_id, s.service_name, s.price, s.unit
     FROM room_services rs
     INNER JOIN services s ON rs.service_id = s.id
     WHERE rs.room_id = ?`,
    [contract.room_id]
  );

  const serviceFee = roomServices.reduce((sum, service) => {
    return sum + toNumber(service.price) * toNumber(service.quantity, 1);
  }, 0);

  const roomFee = toNumber(contract.room_price ?? contract.monthly_rent);
  const otherFees = toNumber(options.other_fees);
  const discount = toNumber(options.discount);
  const totalAmount = roomFee + serviceFee + electricFee + waterFee + otherFees;
  const finalAmount = Math.max(0, totalAmount - discount);
  const dueDate = normalizeDueDate(options.due_date) || buildDueDate(month, year);

  return {
    contract_id: contract.id,
    tenant_id: contract.tenant_id,
    room_id: contract.room_id,
    room_number: contract.room_number,
    tenant_name: contract.tenant_name,
    month,
    year,
    room_fee: roomFee,
    service_fee: serviceFee,
    electric_fee: electricFee,
    water_fee: waterFee,
    other_fees: otherFees,
    discount,
    total_amount: totalAmount,
    final_amount: finalAmount,
    due_date: dueDate,
    utility: utilityRows[0] || null,
    services: roomServices,
    warning: utilityWarning,
  };
};

const getActiveContractsForInvoice = async (connection, landlordUserId, filters = {}) => {
  const contractId = filters.contract_id ? requirePositiveInt(filters.contract_id, 'Hop dong') : null;
  const tenantId = filters.tenant_id ? requirePositiveInt(filters.tenant_id, 'Nguoi thue') : null;

  let contractsQuery = `
    SELECT c.id, c.room_id, c.tenant_id, c.monthly_rent,
           r.room_number, r.owner_id,
           r.price as room_price,
           t.full_name as tenant_name
    FROM contracts c
    INNER JOIN rooms r ON c.room_id = r.id
    INNER JOIN tenant t ON c.tenant_id = t.user_id
    WHERE r.owner_id = ? AND c.status = 'active'
  `;
  const contractsParams = [landlordUserId];

  if (contractId) {
    contractsQuery += ' AND c.id = ?';
    contractsParams.push(contractId);
  }

  if (tenantId) {
    contractsQuery += ' AND c.tenant_id = ?';
    contractsParams.push(tenantId);
  }

  const [contracts] = await connection.query(contractsQuery, contractsParams);
  return contracts;
};

export const previewInvoice = async (landlordUserId, month, year, options = {}) => {
  const normalizedMonth = requirePositiveInt(month, 'Thang');
  const normalizedYear = requirePositiveInt(year, 'Nam');
  const connection = await pool.getConnection();

  if (normalizedMonth > 12) {
    throw new Error('Thang phai tu 1 den 12');
  }

  try {
    const contracts = await getActiveContractsForInvoice(connection, landlordUserId, options);

    if (contracts.length === 0) {
      throw new Error('Khong co hop dong dang hoat dong phu hop');
    }

    if (contracts.length > 1) {
      throw new Error('Vui long chon mot nguoi thue de xem truoc hoa don');
    }

    const [existingInvoice] = await connection.query(
      'SELECT id FROM invoices WHERE contract_id = ? AND month = ? AND year = ?',
      [contracts[0].id, normalizedMonth, normalizedYear]
    );

    const preview = await calculateInvoiceAmounts(connection, contracts[0], normalizedMonth, normalizedYear, options);

    return {
      ...preview,
      existing_invoice_id: existingInvoice[0]?.id || null,
    };
  } finally {
    connection.release();
  }
};

export const generateMonthlyInvoices = async (landlordUserId, month, year, options = {}) => {
  const normalizedMonth = requirePositiveInt(month, 'Thang');
  const normalizedYear = requirePositiveInt(year, 'Nam');
  const connection = await pool.getConnection();

  if (normalizedMonth > 12) {
    throw new Error('Thang phai tu 1 den 12');
  }

  try {
    await connection.beginTransaction();

    const contracts = await getActiveContractsForInvoice(connection, landlordUserId, options);

    if (contracts.length === 0) {
      throw new Error('Khong co hop dong dang hoat dong phu hop');
    }

    const created = [];
    const skipped = [];
    const warnings = [];

    for (const contract of contracts) {
      const [existingInvoice] = await connection.query(
        'SELECT id FROM invoices WHERE contract_id = ? AND month = ? AND year = ? FOR UPDATE',
        [contract.id, normalizedMonth, normalizedYear]
      );

      if (existingInvoice.length > 0) {
        skipped.push({
          contract_id: contract.id,
          room_id: contract.room_id,
          room_number: contract.room_number,
          reason: 'invoice_exists',
        });
        continue;
      }

      const calculated = await calculateInvoiceAmounts(connection, contract, normalizedMonth, normalizedYear, options);

      if (calculated.warning) {
        warnings.push({
          contract_id: contract.id,
          room_id: contract.room_id,
          room_number: contract.room_number,
          message: calculated.warning,
        });
      }

      const [invoiceResult] = await connection.query(
        `INSERT INTO invoices (
          contract_id, month, year,
          room_fee, service_fee, electric_fee, water_fee, other_fees,
          total_amount, discount, final_amount, due_date, status, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
        [
          contract.id,
          normalizedMonth,
          normalizedYear,
          calculated.room_fee,
          calculated.service_fee,
          calculated.electric_fee,
          calculated.water_fee,
          calculated.other_fees,
          calculated.total_amount,
          calculated.discount,
          calculated.final_amount,
          calculated.due_date,
        ]
      );

      const invoice = await getInvoiceDetailsById(connection, invoiceResult.insertId);
      created.push(invoice);

      await createNotification(contract.tenant_id, {
        title: `Hoa don moi - Thang ${normalizedMonth}/${normalizedYear}`,
        content: `Hoa don phong ${contract.room_number} thang ${normalizedMonth}/${normalizedYear} da duoc tao voi tong tien ${calculated.final_amount.toLocaleString('vi-VN')} VND. Han thanh toan: ${calculated.due_date}.`,
        type: 'invoice',
        reference_id: invoiceResult.insertId,
        reference_type: 'invoice',
      });
    }

    await connection.commit();

    return {
      created,
      skipped,
      warnings,
      created_count: created.length,
      skipped_count: skipped.length,
      warning_count: warnings.length,
    };
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
      SELECT i.*, r.room_number, t.full_name as tenant_name, t.phone as tenant_phone
      FROM invoices i
      INNER JOIN contracts c ON i.contract_id = c.id
      INNER JOIN rooms r ON c.room_id = r.id
      INNER JOIN tenant t ON c.tenant_id = t.user_id
      WHERE r.owner_id = ?
    `;
    const params = [landlordUserId];

    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }

    if (month) {
      query += ' AND i.month = ?';
      params.push(requirePositiveInt(month, 'Thang'));
    }

    if (year) {
      query += ' AND i.year = ?';
      params.push(requirePositiveInt(year, 'Nam'));
    }

    if (room_id) {
      query += ' AND c.room_id = ?';
      params.push(requirePositiveInt(room_id, 'Phong'));
    }

    query += ' ORDER BY i.year DESC, i.month DESC, i.id DESC';

    const [rows] = await connection.query(query, params);
    return rows.map(normalizeInvoice);
  } finally {
    connection.release();
  }
};

export const getInvoiceById = async (invoiceId, landlordUserId) => {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      `SELECT i.id
       FROM invoices i
       INNER JOIN contracts c ON i.contract_id = c.id
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE i.id = ? AND r.owner_id = ?`,
      [invoiceId, landlordUserId]
    );

    if (rows.length === 0) {
      throw new Error('Khong tim thay hoa don');
    }

    return await getInvoiceDetailsById(connection, invoiceId);
  } finally {
    connection.release();
  }
};

export const getTenantInvoices = async (tenantUserId, filters = {}) => {
  const { status, month, year, room_id } = filters;
  const connection = await pool.getConnection();

  try {
    let query = `
      SELECT i.*, r.room_number, l.full_name as landlord_name
      FROM invoices i
      INNER JOIN contracts c ON i.contract_id = c.id
      INNER JOIN rooms r ON c.room_id = r.id
      INNER JOIN landlord l ON r.owner_id = l.user_id
      WHERE c.tenant_id = ?
    `;
    const params = [tenantUserId];

    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }

    if (month) {
      query += ' AND i.month = ?';
      params.push(requirePositiveInt(month, 'Thang'));
    }

    if (year) {
      query += ' AND i.year = ?';
      params.push(requirePositiveInt(year, 'Nam'));
    }

    if (room_id) {
      query += ' AND c.room_id = ?';
      params.push(requirePositiveInt(room_id, 'Phong'));
    }

    query += ' ORDER BY i.year DESC, i.month DESC, i.id DESC';

    const [rows] = await connection.query(query, params);
    return rows.map(normalizeInvoice);
  } finally {
    connection.release();
  }
};

export const getTenantInvoiceById = async (invoiceId, tenantUserId) => {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      `SELECT i.id
       FROM invoices i
       INNER JOIN contracts c ON i.contract_id = c.id
       WHERE i.id = ? AND c.tenant_id = ?`,
      [invoiceId, tenantUserId]
    );

    if (rows.length === 0) {
      throw new Error('Ban khong co quyen xem hoa don nay');
    }

    return await getInvoiceDetailsById(connection, invoiceId);
  } finally {
    connection.release();
  }
};

export const confirmPayment = async (invoiceId, landlordUserId, paymentData = {}) => {
  const amount = paymentData.amount === undefined ? null : toNumber(paymentData.amount);
  const paymentDate = normalizePaymentDate(paymentData.payment_date);
  const paymentMethod = paymentData.payment_method || 'cash';

  if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    throw new Error('Phuong thuc thanh toan khong hop le');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [invoiceRows] = await connection.query(
      `SELECT i.*, r.owner_id, c.tenant_id
       FROM invoices i
       INNER JOIN contracts c ON i.contract_id = c.id
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE i.id = ?
       FOR UPDATE`,
      [invoiceId]
    );

    if (invoiceRows.length === 0) {
      throw new Error('Khong tim thay hoa don');
    }

    const invoice = normalizeInvoice(invoiceRows[0]);

    if (invoice.owner_id !== landlordUserId) {
      throw new Error('Ban khong co quyen xac nhan hoa don nay');
    }

    if (invoice.status === 'paid') {
      throw new Error('Hoa don nay da duoc thanh toan');
    }

    const [paidRows] = await connection.query(
      'SELECT COALESCE(SUM(amount), 0) AS total_paid FROM payments WHERE invoice_id = ?',
      [invoiceId]
    );

    const totalPaid = toNumber(paidRows[0].total_paid);
    const remaining = Math.max(0, invoice.final_amount - totalPaid);
    const paymentAmount = amount === null ? remaining : amount;

    if (paymentAmount <= 0) {
      throw new Error('So tien thanh toan phai lon hon 0');
    }

    if (paymentAmount > remaining) {
      throw new Error('So tien thanh toan vuot qua so tien con lai');
    }

    if (paymentAmount < remaining) {
      throw new Error('Xac nhan thanh toan can thanh toan du so tien con lai');
    }

    const [paymentResult] = await connection.query(
      `INSERT INTO payments (
        invoice_id, amount, payment_date, payment_method,
        transaction_code, note, received_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        invoiceId,
        paymentAmount,
        paymentDate,
        paymentMethod,
        paymentData.transaction_code || null,
        paymentData.note || null,
        landlordUserId,
      ]
    );

    const newTotalPaid = totalPaid + paymentAmount;
    const newStatus = 'paid';

    await connection.query(
      'UPDATE invoices SET status = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, invoiceId]
    );

    await createNotification(invoice.tenant_id, {
      title: 'Thanh toan hoa don',
      content: `Hoa don thang ${invoice.month}/${invoice.year} da duoc ghi nhan thanh toan ${paymentAmount.toLocaleString('vi-VN')} VND.`,
      type: 'invoice',
      reference_id: invoiceId,
      reference_type: 'invoice',
    });

    await connection.commit();

    return {
      id: Number(invoiceId),
      status: newStatus,
      payment_id: paymentResult.insertId,
      total_paid: newTotalPaid,
      remaining_balance: Math.max(0, invoice.final_amount - newTotalPaid),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateInvoiceStatus = async (invoiceId, status, landlordUserId) => {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error('Trang thai khong hop le');
  }

  const connection = await pool.getConnection();

  try {
    const [invoiceRows] = await connection.query(
      `SELECT i.id
       FROM invoices i
       INNER JOIN contracts c ON i.contract_id = c.id
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE i.id = ? AND r.owner_id = ?`,
      [invoiceId, landlordUserId]
    );

    if (invoiceRows.length === 0) {
      throw new Error('Khong tim thay hoa don');
    }

    await connection.query(
      'UPDATE invoices SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, invoiceId]
    );

    return { id: Number(invoiceId), status };
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
       INNER JOIN contracts c ON i.contract_id = c.id
       INNER JOIN rooms r ON c.room_id = r.id
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
       INNER JOIN contracts c ON i.contract_id = c.id
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE r.owner_id = ? AND i.year = ? AND i.status = 'paid'
       GROUP BY i.year, i.month
       ORDER BY i.month`,
      [landlordUserId, requirePositiveInt(year, 'Nam')]
    );

    return rows;
  } finally {
    connection.release();
  }
};
