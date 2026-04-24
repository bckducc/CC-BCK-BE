import pool from '../../config/database.js';

export const updateLandlordProfile = async (userId, landlordData) => {
  const { full_name, phone, bank_name, bank_account_number, bank_account_name } = landlordData;

  const connection = await pool.getConnection();

  try {
    const [existing] = await connection.query('SELECT * FROM landlord WHERE user_id = ?', [userId]);

    if (existing.length === 0) {
      throw new Error('Không tìm thấy thông tin chủ nhà');
    }

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
    if (bank_name !== undefined) {
      updateFields.push('bank_name = ?');
      updateValues.push(bank_name);
    }
    if (bank_account_number !== undefined) {
      updateFields.push('bank_account_number = ?');
      updateValues.push(bank_account_number);
    }
    if (bank_account_name !== undefined) {
      updateFields.push('bank_account_name = ?');
      updateValues.push(bank_account_name);
    }

    if (updateFields.length === 0) {
      return existing[0];
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(userId);

    const query = `UPDATE landlord SET ${updateFields.join(', ')} WHERE user_id = ?`;
    await connection.query(query, updateValues);

    const [updated] = await connection.query('SELECT * FROM landlord WHERE user_id = ?', [userId]);
    return updated[0];
  } finally {
    connection.release();
  }
};
