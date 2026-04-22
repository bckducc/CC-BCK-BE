import pool from '../config/database.js';
import { validateNotPastDate } from '../utils/validators.js';

export const createContract = async (contractData, landlordUserId) => {
  const { 
    tenant_id, 
    room_id, 
    contract_code,
    start_date, 
    end_date, 
    deposit_amount, 
    monthly_rent,
    terms,
    signed_date
  } = contractData;

  if (!tenant_id || !room_id || !start_date || !end_date || !deposit_amount || !monthly_rent) {
    throw new Error('Người thuê, phòng, ngày bắt đầu, ngày kết thúc, tiền cọc và tiền thuê là bắt buộc');
  }

  // Validate start date is not in the past
  validateNotPastDate(start_date);

  // Validate end date is after start date
  if (new Date(end_date) <= new Date(start_date)) {
    throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
  }

  const connection = await pool.getConnection();
  
  try {
    // Start transaction for atomic operations
    await connection.beginTransaction();

    // Check if tenant exists (tenant_id is user_id in tenant table)
    const [tenantCheck] = await connection.query(
      `SELECT t.*, u.is_active 
       FROM tenant t 
       INNER JOIN users u ON t.user_id = u.id 
       WHERE t.user_id = ?`,
      [tenant_id]
    );

    if (tenantCheck.length === 0) {
      throw new Error('Người thuê không tồn tại');
    }

    if (!tenantCheck[0].is_active) {
      throw new Error('Người thuê đã bị vô hiệu hóa');
    }

    // Check if room exists and belongs to landlord
    const [roomCheck] = await connection.query(
      'SELECT * FROM rooms WHERE id = ? AND owner_id = ?',
      [room_id, landlordUserId]
    );

    if (roomCheck.length === 0) {
      throw new Error('Phòng không tồn tại hoặc không thuộc về bạn');
    }

    if (roomCheck[0].status !== 'available') {
      throw new Error('Phòng không trống, hiện đang được thuê');
    }

    // Check if tenant already has active contract with FOR UPDATE lock
    const [tenantContracts] = await connection.query(
      'SELECT id FROM contracts WHERE tenant_id = ? AND status = "active" FOR UPDATE',
      [tenant_id]
    );

    if (tenantContracts.length > 0) {
      throw new Error('Người thuê này đã có phòng');
    }

    // Check if room already has active contract with FOR UPDATE lock
    const [roomContracts] = await connection.query(
      'SELECT id FROM contracts WHERE room_id = ? AND status = "active" FOR UPDATE',
      [room_id]
    );

    if (roomContracts.length > 0) {
      throw new Error('Phòng đã có người thuê');
    }

    // Check if contract_code is unique (if provided)
    if (contract_code) {
      const [codeCheck] = await connection.query(
        'SELECT id FROM contracts WHERE contract_code = ?',
        [contract_code]
      );

      if (codeCheck.length > 0) {
        throw new Error('Mã hợp đồng đã tồn tại');
      }
    }

    // Insert contract
    const [result] = await connection.query(
      `INSERT INTO contracts (room_id, tenant_id, contract_code, start_date, end_date, deposit_amount, monthly_rent, terms, signed_date, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [room_id, tenant_id, contract_code || null, start_date, end_date, deposit_amount, monthly_rent, terms || null, signed_date || null]
    );

    const contractId = result.insertId;

    // Update room status to rented
    await connection.query(
      'UPDATE rooms SET status = "rented" WHERE id = ?',
      [room_id]
    );

    // Commit transaction
    await connection.commit();

    // Get created contract
    const [newContract] = await connection.query(
      'SELECT * FROM contracts WHERE id = ?',
      [contractId]
    );

    return newContract[0];
  } catch (error) {
    // Rollback transaction on error
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getContracts = async (filters, landlordUserId) => {
  const { status, tenant_id, room_id, search } = filters;
  const connection = await pool.getConnection();
  
  try {
    let query = `
      SELECT c.*, t.full_name as tenant_name, t.phone as tenant_phone, r.room_number, r.floor
      FROM contracts c
      INNER JOIN tenant t ON c.tenant_id = t.user_id
      INNER JOIN rooms r ON c.room_id = r.id
      WHERE r.owner_id = ?
    `;
    const params = [landlordUserId];

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (tenant_id) {
      query += ' AND c.tenant_id = ?';
      params.push(tenant_id);
    }

    if (room_id) {
      query += ' AND c.room_id = ?';
      params.push(room_id);
    }

    if (search) {
      query += ' AND (t.full_name LIKE ? OR r.room_number LIKE ? OR c.contract_code LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY c.created_at DESC';

    const [rows] = await connection.query(query, params);
    return rows;
  } finally {
    connection.release();
  }
};

export const getContractById = async (contractId, landlordUserId) => {
  const connection = await pool.getConnection();
  
  try {
    const [rows] = await connection.query(
      `SELECT c.*, t.full_name as tenant_name, t.phone as tenant_phone, t.identity_card,
              r.room_number, r.floor, r.area, r.price as room_price
       FROM contracts c
       INNER JOIN tenant t ON c.tenant_id = t.user_id
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE c.id = ? AND r.owner_id = ?`,
      [contractId, landlordUserId]
    );

    if (rows.length === 0) {
      throw new Error('Không tìm thấy hợp đồng');
    }

    return rows[0];
  } finally {
    connection.release();
  }
};

export const getContractByTenant = async (tenantUserId) => {
  const connection = await pool.getConnection();
  
  try {
    const [rows] = await connection.query(
      `SELECT c.*, r.room_number, r.floor
       FROM contracts c
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE c.tenant_id = ? AND c.status = 'active'
       ORDER BY c.created_at DESC
       LIMIT 1`,
      [tenantUserId]
    );

    return rows[0] || null;
  } finally {
    connection.release();
  }
};

export const terminateContract = async (contractId, landlordUserId) => {
  const connection = await pool.getConnection();
  
  try {
    // Start transaction for atomic operations
    await connection.beginTransaction();

    // Get contract details with FOR UPDATE lock to prevent race conditions
    const [contractCheck] = await connection.query(
      `SELECT c.*, r.owner_id 
       FROM contracts c
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE c.id = ?
       FOR UPDATE`,
      [contractId]
    );

    if (contractCheck.length === 0) {
      throw new Error('Không tìm thấy hợp đồng');
    }

    if (contractCheck[0].owner_id !== landlordUserId) {
      throw new Error('Bạn không có quyền kết thúc hợp đồng này');
    }

    // Check contract status before updating
    if (contractCheck[0].status === 'terminated') {
      throw new Error('Hợp đồng đã được kết thúc trước đó');
    }

    // Update contract status
    await connection.query(
      `UPDATE contracts SET status = 'terminated' WHERE id = ?`,
      [contractId]
    );

    // Update room status to available atomically
    await connection.query(
      'UPDATE rooms SET status = "available" WHERE id = ?',
      [contractCheck[0].room_id]
    );

    // Commit transaction
    await connection.commit();

    return { 
      id: contractId, 
      status: 'terminated',
    };
  } catch (error) {
    // Rollback transaction on error
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getActiveContractsByRoom = async (roomId) => {
  const connection = await pool.getConnection();
  
  try {
    const [rows] = await connection.query(
      'SELECT * FROM contracts WHERE room_id = ? AND status = "active"',
      [roomId]
    );

    return rows;
  } finally {
    connection.release();
  }
};

export const getActiveContractsCount = async (landlordUserId) => {
  const connection = await pool.getConnection();
  
  try {
    const [rows] = await connection.query(
      `SELECT COUNT(*) as count 
       FROM contracts c
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE r.owner_id = ? AND c.status = 'active'`,
      [landlordUserId]
    );

    return rows[0].count;
  } finally {
    connection.release();
  }
};
