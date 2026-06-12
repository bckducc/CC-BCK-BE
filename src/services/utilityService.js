import pool from '../config/database.js';
import { validateUtilityReading, validateNotFutureDate, validatePrice } from '../utils/validators.js';


const UTILITY_COLUMNS = `
  id, contract_id, month, year,
  electric_old, electric_new, electric_price,
  water_old, water_new, water_price,
  recorded_date, note
`;

const normalizePositiveInt = (value, fieldName) => {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < 1) {
    throw new Error(`${fieldName} khong hop le`);
  }

  return numberValue;
};

const normalizeMeterValue = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return 0;
  }

  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < 0) {
    throw new Error(`${fieldName} phai la so nguyen khong am`);
  }

  return numberValue;
};

const normalizePrice = (value, fieldName) => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    throw new Error(`${fieldName} phai la so hop le`);
  }

  validatePrice(numberValue, fieldName);

  return numberValue;
};

const normalizeRecordedDate = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('Ngay ghi nhan phai co dinh dang YYYY-MM-DD');
  }

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error('Ngay ghi nhan khong hop le');
  }

  return value;
};

const normalizeNote = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error('Ghi chu khong hop le');
  }

  return value.trim() || null;
};

const buildUtilityPayload = async (utilityData, landlordUserId) => {
  const contractId = normalizePositiveInt(utilityData.contract_id, 'Hop dong');
  const month = normalizePositiveInt(utilityData.month, 'Thang');
  const year = normalizePositiveInt(utilityData.year, 'Nam');

  if (month > 12) {
    throw new Error('Thang phai tu 1 den 12');
  }

  validateNotFutureDate(month, year);

  const electricOld = normalizeMeterValue(utilityData.electric_old, 'Chi so dien cu');
  const electricNew = normalizeMeterValue(utilityData.electric_new, 'Chi so dien moi');
  const waterOld = normalizeMeterValue(utilityData.water_old, 'Chi so nuoc cu');
  const waterNew = normalizeMeterValue(utilityData.water_new, 'Chi so nuoc moi');

  validateUtilityReading(electricOld, electricNew);
  validateUtilityReading(waterOld, waterNew);

  const electricPrice = normalizePrice(utilityData.electric_price, 'Gia dien');
  const waterPrice = normalizePrice(utilityData.water_price, 'Gia nuoc');
  return {
    contract_id: contractId,
    month,
    year,
    electric_old: electricOld,
    electric_new: electricNew,
    electric_price: electricPrice,
    water_old: waterOld,
    water_new: waterNew,
    water_price: waterPrice,
    recorded_date: normalizeRecordedDate(utilityData.recorded_date),
    note: normalizeNote(utilityData.note),
  };
};

export const recordUtilityReading = async (utilityData, landlordUserId) => {
  const utility = await buildUtilityPayload(utilityData, landlordUserId);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [contractCheck] = await connection.query(
      `SELECT c.id
       FROM contracts c
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE c.id = ? AND r.owner_id = ?
       FOR UPDATE`,
      [utility.contract_id, landlordUserId]
    );

    if (contractCheck.length === 0) {
      throw new Error('Hop dong khong ton tai hoac khong thuoc ve ban');
    }

    const [existing] = await connection.query(
      'SELECT id FROM utilities WHERE contract_id = ? AND month = ? AND year = ? FOR UPDATE',
      [utility.contract_id, utility.month, utility.year]
    );

    let result;

    if (existing.length > 0) {
      await connection.query(
        `UPDATE utilities
         SET electric_old = ?, electric_new = ?, electric_price = ?,
             water_old = ?, water_new = ?, water_price = ?,
             recorded_date = ?, note = ?
         WHERE contract_id = ? AND month = ? AND year = ?`,
        [
          utility.electric_old,
          utility.electric_new,
          utility.electric_price,
          utility.water_old,
          utility.water_new,
          utility.water_price,
          utility.recorded_date,
          utility.note,
          utility.contract_id,
          utility.month,
          utility.year,
        ]
      );

      const [updated] = await connection.query(
        `SELECT ${UTILITY_COLUMNS} FROM utilities WHERE contract_id = ? AND month = ? AND year = ?`,
        [utility.contract_id, utility.month, utility.year]
      );
      result = updated[0];
    } else {
      const [insertResult] = await connection.query(
        `INSERT INTO utilities (
          contract_id, month, year,
          electric_old, electric_new, electric_price,
          water_old, water_new, water_price,
          recorded_date, note
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          utility.contract_id,
          utility.month,
          utility.year,
          utility.electric_old,
          utility.electric_new,
          utility.electric_price,
          utility.water_old,
          utility.water_new,
          utility.water_price,
          utility.recorded_date,
          utility.note,
        ]
      );

      const [created] = await connection.query(
        `SELECT ${UTILITY_COLUMNS} FROM utilities WHERE id = ?`,
        [insertResult.insertId]
      );
      result = created[0];
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

export const getUtilityReading = async (contractId, month, year, landlordUserId) => {
  const normalizedContractId = normalizePositiveInt(contractId, 'Hop dong');
  const normalizedMonth = normalizePositiveInt(month, 'Thang');
  const normalizedYear = normalizePositiveInt(year, 'Nam');
  const connection = await pool.getConnection();

  try {
    const [contractCheck] = await connection.query(
      `SELECT c.id
       FROM contracts c
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE c.id = ? AND r.owner_id = ?`,
      [normalizedContractId, landlordUserId]
    );

    if (contractCheck.length === 0) {
      throw new Error('Hop dong khong ton tai hoac khong thuoc ve ban');
    }

    const [rows] = await connection.query(
      `SELECT ${UTILITY_COLUMNS} FROM utilities WHERE contract_id = ? AND month = ? AND year = ?`,
      [normalizedContractId, normalizedMonth, normalizedYear]
    );

    return rows[0] || null;
  } finally {
    connection.release();
  }
};

export const getUtilityReadingsByContract = async (contractId, landlordUserId) => {
  const normalizedContractId = normalizePositiveInt(contractId, 'Hop dong');
  const connection = await pool.getConnection();

  try {
    const [contractCheck] = await connection.query(
      `SELECT c.id
       FROM contracts c
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE c.id = ? AND r.owner_id = ?`,
      [normalizedContractId, landlordUserId]
    );

    if (contractCheck.length === 0) {
      throw new Error('Hop dong khong ton tai hoac khong thuoc ve ban');
    }

    const [rows] = await connection.query(
      `SELECT ${UTILITY_COLUMNS} FROM utilities WHERE contract_id = ? ORDER BY year DESC, month DESC`,
      [normalizedContractId]
    );

    return rows;
  } finally {
    connection.release();
  }
};

export const getUtilityReadingsByRoom = async (roomId, landlordUserId) => {
  const normalizedRoomId = normalizePositiveInt(roomId, 'Phong');
  const connection = await pool.getConnection();

  try {
    const [roomCheck] = await connection.query(
      'SELECT id FROM rooms WHERE id = ? AND owner_id = ?',
      [normalizedRoomId, landlordUserId]
    );

    if (roomCheck.length === 0) {
      throw new Error('Phong khong ton tai hoac khong thuoc ve ban');
    }

    const [rows] = await connection.query(
      `SELECT u.id, u.contract_id, u.month, u.year,
              u.electric_old, u.electric_new, u.electric_price,
              u.water_old, u.water_new, u.water_price,
              u.recorded_date, u.note
       FROM utilities u
       INNER JOIN contracts c ON u.contract_id = c.id
       WHERE c.room_id = ?
       ORDER BY u.year DESC, u.month DESC`,
      [normalizedRoomId]
    );

    return rows;
  } finally {
    connection.release();
  }
};

export const getAllUtilityReadings = async (landlordUserId, filters = {}) => {
  const { month, year, room_id, contract_id } = filters;
  const connection = await pool.getConnection();

  try {
    let query = `
      SELECT u.id, u.contract_id, c.room_id, u.month, u.year,
             u.electric_old, u.electric_new, u.electric_price,
             u.water_old, u.water_new, u.water_price,
             u.recorded_date, u.note,
             c.contract_code, c.tenant_id,
             r.room_number, r.floor
      FROM utilities u
      INNER JOIN contracts c ON u.contract_id = c.id
      INNER JOIN rooms r ON c.room_id = r.id
      WHERE r.owner_id = ?
    `;
    const params = [landlordUserId];

    if (month) {
      query += ' AND u.month = ?';
      params.push(normalizePositiveInt(month, 'Thang'));
    }

    if (year) {
      query += ' AND u.year = ?';
      params.push(normalizePositiveInt(year, 'Nam'));
    }

    if (room_id) {
      query += ' AND c.room_id = ?';
      params.push(normalizePositiveInt(room_id, 'Phong'));
    }

    if (contract_id) {
      query += ' AND u.contract_id = ?';
      params.push(normalizePositiveInt(contract_id, 'Hop dong'));
    }

    query += ' ORDER BY u.year DESC, u.month DESC, r.room_number ASC';

    const [rows] = await connection.query(query, params);
    return rows;
  } finally {
    connection.release();
  }
};

export const deleteUtilityReading = async (contractId, month, year, landlordUserId) => {
  const normalizedContractId = normalizePositiveInt(contractId, 'Hop dong');
  const normalizedMonth = normalizePositiveInt(month, 'Thang');
  const normalizedYear = normalizePositiveInt(year, 'Nam');
  const connection = await pool.getConnection();

  try {
    const [contractCheck] = await connection.query(
      `SELECT c.id
       FROM contracts c
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE c.id = ? AND r.owner_id = ?`,
      [normalizedContractId, landlordUserId]
    );

    if (contractCheck.length === 0) {
      throw new Error('Hop dong khong ton tai hoac khong thuoc ve ban');
    }

    const [existing] = await connection.query(
      'SELECT id FROM utilities WHERE contract_id = ? AND month = ? AND year = ?',
      [normalizedContractId, normalizedMonth, normalizedYear]
    );

    if (existing.length === 0) {
      throw new Error('Khong tim thay chi so dien nuoc');
    }

    await connection.query(
      'DELETE FROM utilities WHERE contract_id = ? AND month = ? AND year = ?',
      [normalizedContractId, normalizedMonth, normalizedYear]
    );

    return {
      contract_id: normalizedContractId,
      month: normalizedMonth,
      year: normalizedYear,
    };
  } finally {
    connection.release();
  }
};
