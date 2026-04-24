import pool from '../../config/database.js';
import bcrypt from 'bcryptjs';

export const createTenant = async (tenantData, landlordId) => {
  const { username, password, full_name, phone, identity_card, birthday, gender, address } = tenantData;

  if (!username || !password || !full_name) {
    throw new Error('Tên đăng nhập, mật khẩu và họ tên là bắt buộc');
  }

  if (password.length < 6) {
    throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
  }

  const connection = await pool.getConnection();

  try {
    const [existingUser] = await connection.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      throw new Error('Tên đăng nhập đã tồn tại');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [userResult] = await connection.query(
      'INSERT INTO users (username, password, role, is_active) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, 'tenant', true]
    );
    const userId = userResult.insertId;

    const [tenantResult] = await connection.query(
      `INSERT INTO tenant (user_id, full_name, phone, identity_card, birthday, gender, address) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, full_name, phone || null, identity_card || null, birthday || null, gender || null, address || null]
    );

    return {
      id: tenantResult.insertId,
      user_id: userId,
      username,
      full_name,
      phone: phone || null,
      identity_card: identity_card || null,
      birthday: birthday || null,
      gender: gender || null,
      address: address || null,
      is_active: true,
    };
  } finally {
    connection.release();
  }
};

export const getAllTenants = async (landlordId, filters = {}) => {
  const { is_active, has_active_contract } = filters;
  const connection = await pool.getConnection();

  try {
    let query = `
      SELECT 
        t.id, t.user_id, t.full_name, t.phone, t.identity_card, t.birthday, t.gender, t.address, t.created_at,
        u.username, u.is_active, u.created_at as user_created_at,
        CASE WHEN c.status = 'active' THEN TRUE ELSE FALSE END as has_active_contract
      FROM tenant t
      INNER JOIN users u ON t.user_id = u.id
      LEFT JOIN contracts c ON c.tenant_id = t.user_id AND c.status = 'active'
      WHERE (u.id IN (SELECT user_id FROM landlord WHERE user_id = ?)
      OR EXISTS (SELECT 1 FROM rooms r WHERE r.owner_id = ?))
    `;
    const params = [landlordId, landlordId];

    if (is_active !== undefined) {
      query += ' AND u.is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    if (has_active_contract === 'true') {
      query += ' AND EXISTS (SELECT 1 FROM contracts c2 WHERE c2.tenant_id = t.user_id AND c2.status = "active")';
    } else if (has_active_contract === 'false') {
      query +=
        ' AND NOT EXISTS (SELECT 1 FROM contracts c2 WHERE c2.tenant_id = t.user_id AND c2.status = "active")';
    }

    query += ' ORDER BY t.created_at DESC';

    const [rows] = await connection.query(query, params);
    return rows.length > 0 ? rows : [];
  } finally {
    connection.release();
  }
};

export const searchTenants = async (keyword, landlordId, filters = {}) => {
  const { is_active, has_active_contract } = filters;
  const connection = await pool.getConnection();

  try {
    const searchPattern = `%${keyword}%`;
    let query = `
      SELECT 
        t.id, t.user_id, t.full_name, t.phone, t.identity_card, t.birthday, t.gender, t.address, t.created_at,
        u.username, u.is_active,
        CASE WHEN EXISTS (SELECT 1 FROM contracts c2 WHERE c2.tenant_id = t.user_id AND c2.status = "active") THEN TRUE ELSE FALSE END as has_active_contract
      FROM tenant t
      INNER JOIN users u ON t.user_id = u.id
      WHERE (t.full_name LIKE ? OR t.phone LIKE ? OR t.identity_card LIKE ? OR u.username LIKE ?)
      AND (
        u.id IN (SELECT user_id FROM landlord WHERE user_id = ?)
        OR EXISTS (SELECT 1 FROM rooms r WHERE r.owner_id = ? AND r.id IN (SELECT room_id FROM contracts WHERE tenant_id = t.user_id))
      )
    `;
    const params = [searchPattern, searchPattern, searchPattern, searchPattern, landlordId, landlordId];

    if (is_active !== undefined) {
      query += ' AND u.is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    if (has_active_contract === 'true') {
      query += ' AND EXISTS (SELECT 1 FROM contracts c2 WHERE c2.tenant_id = t.user_id AND c2.status = "active")';
    } else if (has_active_contract === 'false') {
      query +=
        ' AND NOT EXISTS (SELECT 1 FROM contracts c2 WHERE c2.tenant_id = t.user_id AND c2.status = "active")';
    }

    query += ' ORDER BY t.created_at DESC LIMIT 50';

    const [rows] = await connection.query(query, params);
    return rows;
  } finally {
    connection.release();
  }
};

export const getTenantById = async (tenantId) => {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      `SELECT 
        t.id, t.user_id, t.full_name, t.phone, t.identity_card, t.birthday, t.gender, t.address, t.created_at,
        u.username, u.is_active
      FROM tenant t
      INNER JOIN users u ON t.user_id = u.id
      WHERE t.id = ?`,
      [tenantId]
    );

    if (rows.length === 0) {
      throw new Error('Không tìm thấy người thuê');
    }

    return rows[0];
  } finally {
    connection.release();
  }
};

export const toggleTenantStatus = async (tenantId) => {
  const connection = await pool.getConnection();

  try {
    const [current] = await connection.query(
      `SELECT u.is_active FROM tenant t INNER JOIN users u ON t.user_id = u.id WHERE t.id = ?`,
      [tenantId]
    );

    if (current.length === 0) {
      throw new Error('Không tìm thấy người thuê');
    }

    const newStatus = current[0].is_active ? 0 : 1;

    await connection.query('UPDATE users u INNER JOIN tenant t ON u.id = t.user_id SET u.is_active = ? WHERE t.id = ?', [
      newStatus,
      tenantId,
    ]);

    return { id: tenantId, is_active: newStatus === 1 };
  } finally {
    connection.release();
  }
};

export const updateTenant = async (tenantId, tenantData) => {
  const { full_name, phone, identity_card, birthday, gender, address } = tenantData;

  const connection = await pool.getConnection();

  try {
    const [existing] = await connection.query('SELECT * FROM tenant WHERE id = ?', [tenantId]);
    if (existing.length === 0) throw new Error('Không tìm thấy người thuê');

    const updateFields = [];
    const updateValues = [];

    if (full_name !== undefined) {
      updateFields.push('full_name = ?');
      updateValues.push(full_name);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (identity_card !== undefined) {
      updateFields.push('identity_card = ?');
      updateValues.push(identity_card);
    }
    if (birthday !== undefined) {
      updateFields.push('birthday = ?');
      updateValues.push(birthday);
    }
    if (gender !== undefined) {
      updateFields.push('gender = ?');
      updateValues.push(gender);
    }
    if (address !== undefined) {
      updateFields.push('address = ?');
      updateValues.push(address);
    }

    if (updateFields.length === 0) return existing[0];

    updateFields.push('updated_at = NOW()');
    updateValues.push(tenantId);

    const query = `UPDATE tenant SET ${updateFields.join(', ')} WHERE id = ?`;
    await connection.query(query, updateValues);

    const [updated] = await connection.query('SELECT * FROM tenant WHERE id = ?', [tenantId]);
    return updated[0];
  } finally {
    connection.release();
  }
};

export const getTenantByUserId = async (userId) => {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      `SELECT 
        t.id, t.user_id, t.full_name, t.phone, t.identity_card, t.birthday, t.gender, t.address, t.created_at,
        u.username, u.is_active
      FROM tenant t
      INNER JOIN users u ON t.user_id = u.id
      WHERE t.user_id = ?`,
      [userId]
    );

    if (rows.length === 0) throw new Error('Không tìm thấy thông tin người thuê');
    return rows[0];
  } finally {
    connection.release();
  }
};
