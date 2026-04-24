import pool from '../../config/database.js';
import {
  validateUtilityReading,
  validateNotFutureDate,
  validatePrice,
  validateVAT,
} from '../../common/utils/validators.js';

export const setUtilityConfig = async (configData, landlordUserId) => {
  const { electric_price, water_price, vat_percent } = configData;

  validatePrice(electric_price);
  validatePrice(water_price);
  validateVAT(vat_percent);

  const connection = await pool.getConnection();

  try {
    const [existing] = await connection.query('SELECT id FROM utility_config LIMIT 1');

    if (existing.length > 0) {
      await connection.query(
        `UPDATE utility_config 
         SET electric_price = ?, water_price = ?, vat_percent = ?, updated_by = ?, updated_at = NOW()
         WHERE id = ?`,
        [electric_price, water_price, vat_percent, landlordUserId, existing[0].id]
      );

      const [updated] = await connection.query('SELECT * FROM utility_config WHERE id = ?', [existing[0].id]);
      return updated[0];
    }

    const [result] = await connection.query(
      `INSERT INTO utility_config (electric_price, water_price, vat_percent, updated_by)
       VALUES (?, ?, ?, ?)`,
      [electric_price, water_price, vat_percent, landlordUserId]
    );

    const [newConfig] = await connection.query('SELECT * FROM utility_config WHERE id = ?', [result.insertId]);
    return newConfig[0];
  } finally {
    connection.release();
  }
};

export const getUtilityConfig = async (landlordUserId) => {
  const connection = await pool.getConnection();

  try {
    const [config] = await connection.query('SELECT * FROM utility_config LIMIT 1');

    if (config.length > 0) return config[0];

    return {
      id: null,
      electric_price: 3500.0,
      water_price: 15000.0,
      vat_percent: 10.0,
      updated_at: null,
      updated_by: null,
    };
  } finally {
    connection.release();
  }
};

export const recordUtilityReading = async (utilityData, landlordUserId) => {
  let {
    room_id,
    month,
    year,
    electric_old,
    electric_new,
    electric_price,
    water_old,
    water_new,
    water_price,
    recorded_date,
    note,
  } = utilityData;

  if (!room_id || !month || !year) {
    throw new Error('Phòng, tháng, năm là bắt buộc');
  }
  if (month < 1 || month > 12) {
    throw new Error('Tháng phải từ 1 đến 12');
  }

  validateUtilityReading(electric_old, electric_new);
  validateUtilityReading(water_old, water_new);
  validateNotFutureDate(month, year);

  if (electric_price === undefined || water_price === undefined) {
    const config = await getUtilityConfig(landlordUserId);
    if (electric_price === undefined) electric_price = config.electric_price;
    if (water_price === undefined) water_price = config.water_price;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [roomCheck] = await connection.query('SELECT id FROM rooms WHERE id = ? AND owner_id = ? FOR UPDATE', [
      room_id,
      landlordUserId,
    ]);
    if (roomCheck.length === 0) {
      throw new Error('Phòng không tồn tại hoặc không thuộc về bạn');
    }

    const [existing] = await connection.query(
      'SELECT id FROM utilities WHERE room_id = ? AND month = ? AND year = ? FOR UPDATE',
      [room_id, month, year]
    );

    let result;
    if (existing.length > 0) {
      await connection.query(
        `UPDATE utilities 
         SET electric_old = ?, electric_new = ?, electric_price = ?,
             water_old = ?, water_new = ?, water_price = ?,
             recorded_date = ?, note = ?
         WHERE room_id = ? AND month = ? AND year = ?`,
        [
          electric_old || 0,
          electric_new || 0,
          electric_price,
          water_old || 0,
          water_new || 0,
          water_price,
          recorded_date || new Date().toISOString().split('T')[0],
          note || null,
          room_id,
          month,
          year,
        ]
      );

      const [updated] = await connection.query('SELECT * FROM utilities WHERE room_id = ? AND month = ? AND year = ?', [
        room_id,
        month,
        year,
      ]);
      result = updated[0];
    } else {
      const [insertResult] = await connection.query(
        `INSERT INTO utilities (room_id, month, year, electric_old, electric_new, electric_price, water_old, water_new, water_price, recorded_date, note, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          room_id,
          month,
          year,
          electric_old || 0,
          electric_new || 0,
          electric_price,
          water_old || 0,
          water_new || 0,
          water_price,
          recorded_date || new Date().toISOString().split('T')[0],
          note || null,
        ]
      );

      const [newUtility] = await connection.query('SELECT * FROM utilities WHERE id = ?', [insertResult.insertId]);
      result = newUtility[0];
    }

    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getUtilityReading = async (roomId, month, year, landlordUserId) => {
  const connection = await pool.getConnection();

  try {
    const [roomCheck] = await connection.query('SELECT * FROM rooms WHERE id = ? AND owner_id = ?', [
      roomId,
      landlordUserId,
    ]);
    if (roomCheck.length === 0) {
      throw new Error('Phòng không tồn tại hoặc không thuộc về bạn');
    }

    const [rows] = await connection.query('SELECT * FROM utilities WHERE room_id = ? AND month = ? AND year = ?', [
      roomId,
      month,
      year,
    ]);

    return rows[0] || null;
  } finally {
    connection.release();
  }
};

export const getUtilityReadingsByRoom = async (roomId, landlordUserId) => {
  const connection = await pool.getConnection();

  try {
    const [roomCheck] = await connection.query('SELECT * FROM rooms WHERE id = ? AND owner_id = ?', [
      roomId,
      landlordUserId,
    ]);
    if (roomCheck.length === 0) {
      throw new Error('Phòng không tồn tại hoặc không thuộc về bạn');
    }

    const [rows] = await connection.query('SELECT * FROM utilities WHERE room_id = ? ORDER BY year DESC, month DESC', [
      roomId,
    ]);
    return rows;
  } finally {
    connection.release();
  }
};

export const getAllUtilityReadings = async (landlordUserId, filters = {}) => {
  const { month, year, room_id } = filters;
  const connection = await pool.getConnection();

  try {
    let query = `
      SELECT u.*, r.room_number, r.floor
      FROM utilities u
      INNER JOIN rooms r ON u.room_id = r.id
      WHERE r.owner_id = ?
    `;
    const params = [landlordUserId];

    if (month) {
      query += ' AND u.month = ?';
      params.push(parseInt(month));
    }
    if (year) {
      query += ' AND u.year = ?';
      params.push(parseInt(year));
    }
    if (room_id) {
      query += ' AND u.room_id = ?';
      params.push(room_id);
    }

    query += ' ORDER BY u.year DESC, u.month DESC, r.room_number ASC';

    const [rows] = await connection.query(query, params);
    return rows;
  } finally {
    connection.release();
  }
};

export const deleteUtilityReading = async (roomId, month, year, landlordUserId) => {
  const connection = await pool.getConnection();

  try {
    const [roomCheck] = await connection.query('SELECT * FROM rooms WHERE id = ? AND owner_id = ?', [
      roomId,
      landlordUserId,
    ]);
    if (roomCheck.length === 0) {
      throw new Error('Phòng không tồn tại hoặc không thuộc về bạn');
    }

    const [existing] = await connection.query('SELECT * FROM utilities WHERE room_id = ? AND month = ? AND year = ?', [
      roomId,
      month,
      year,
    ]);
    if (existing.length === 0) {
      throw new Error('Không tìm thấy chỉ số điện nước');
    }

    await connection.query('DELETE FROM utilities WHERE room_id = ? AND month = ? AND year = ?', [roomId, month, year]);
    return { message: 'Xóa chỉ số điện nước thành công' };
  } finally {
    connection.release();
  }
};
