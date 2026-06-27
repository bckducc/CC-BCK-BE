import pool from '../config/database.js';
import { validatePrice } from '../utils/validators.js';

let ensureRoomDepositColumnPromise = null;

const calculateRoomDeposit = (price, deposit) => {
  if (deposit !== undefined && deposit !== null && deposit !== '') {
    return Number(deposit);
  }

  return Number(price || 0) * 2;
};

const ensureRoomDepositColumn = async () => {
  if (!ensureRoomDepositColumnPromise) {
    ensureRoomDepositColumnPromise = (async () => {
      const connection = await pool.getConnection();

      try {
        const [columns] = await connection.query(
          `SHOW COLUMNS FROM rooms LIKE 'deposit'`
        );

        if (columns.length === 0) {
          await connection.query(
            `ALTER TABLE rooms ADD COLUMN deposit DECIMAL(12, 2) DEFAULT 0 AFTER price`
          );
        }

        await connection.query(
          `UPDATE rooms SET deposit = price * 2 WHERE deposit IS NULL OR deposit = 0`
        );
      } finally {
        connection.release();
      }
    })();
  }

  return ensureRoomDepositColumnPromise;
};

export const getAllRoomsByLandlord = async (ownerId, filters = {}) => {
  const { floor, status, min_price, max_price, room_number } = filters;
  try {
    await ensureRoomDepositColumn();
    const connection = await pool.getConnection();
    
    let query = 'SELECT * FROM rooms WHERE owner_id = ?';
    const params = [ownerId];

    if (floor) {
      query += ' AND floor = ?';
      params.push(floor);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (min_price) {
      query += ' AND price >= ?';
      params.push(parseFloat(min_price));
    }
    if (max_price) {
      query += ' AND price <= ?';
      params.push(parseFloat(max_price));
    }
    if (room_number) {
      query += ' AND room_number LIKE ?';
      params.push(`%${room_number}%`);
    }

    query += ' ORDER BY room_number ASC';

    const [rows] = await connection.query(query, params);
    connection.release();
    return rows;
  } catch (error) {
    console.error('Database error in getAllRoomsByLandlord:', error);
    throw error;
  }
};

export const getRoomById = async (roomId, ownerId) => {
  try {
    await ensureRoomDepositColumn();
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT * FROM rooms 
       WHERE id = ? AND owner_id = ?`,
      [roomId, ownerId]
    );
    connection.release();
    
    return rows[0] || null;
  } catch (error) {
    console.error('Database error in getRoomById:', error);
    throw error;
  }
};

export const createRoom = async (roomData, ownerId) => {
  try {
    await ensureRoomDepositColumn();
    const {
      room_number,
      floor,
      area,
      price,
      description,
      deposit,
    } = roomData;

    if (!room_number || !price) {
      throw new Error('Số phòng và giá là bắt buộc');
    }

    const roomDeposit = calculateRoomDeposit(price, deposit);

    validatePrice(price, 'room_price');
    validatePrice(roomDeposit, 'deposit');

    const connection = await pool.getConnection();

    const [existing] = await connection.query(
      `SELECT id FROM rooms 
       WHERE room_number = ? AND owner_id = ?`,
      [room_number, ownerId]
    );

    if (existing.length > 0) {
      connection.release();
      throw new Error(`Phòng số ${room_number} đã tồn tại`);
    }

    const [result] = await connection.query(
      `INSERT INTO rooms (room_number, floor, area, price, deposit, status, description, owner_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        room_number, 
        floor || null, 
        area || null, 
        price, 
        roomDeposit,
        'available', 
        description || null, 
        ownerId
      ]
    );

    connection.release();

    return {
      id: result.insertId,
      room_number,
      floor,
      area,
      price,
      deposit: roomDeposit,
      status: 'available',
      description,
      owner_id: ownerId,
    };
  } catch (error) {
    console.error('Database error in createRoom:', error);
    throw error;
  }
};

export const updateRoom = async (roomId, roomData, ownerId) => {
  try {
    await ensureRoomDepositColumn();
    const {
      room_number,
      floor,
      area,
      price,
      status,
      description,
      deposit,
    } = roomData;

    if (price !== undefined) {
      validatePrice(price, 'room_price');
    }
    if (status) {
      const validStatuses = ['available', 'rented', 'maintenance'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Trạng thái không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}`);
      }
    }

    const connection = await pool.getConnection();

    const [existing] = await connection.query(
      `SELECT * FROM rooms WHERE id = ? AND owner_id = ?`,
      [roomId, ownerId]
    );

    if (existing.length === 0) {
      connection.release();
      throw new Error('Phòng không tìm thấy');
    }

    const roomDeposit = price !== undefined || deposit !== undefined
      ? calculateRoomDeposit(price !== undefined ? price : existing[0].price, deposit)
      : undefined;

    if (roomDeposit !== undefined) {
      validatePrice(roomDeposit, 'deposit');
    }

    if (room_number && room_number !== existing[0].room_number) {
      if (existing[0].status === 'rented') {
        connection.release();
        throw new Error('Không được sửa số phòng nếu phòng đang có người thuê');
      }

      const [conflict] = await connection.query(
        `SELECT id FROM rooms 
         WHERE room_number = ? AND owner_id = ? AND id != ?`,
        [room_number, ownerId, roomId]
      );

      if (conflict.length > 0) {
        connection.release();
        throw new Error(`Phòng số ${room_number} đã tồn tại`);
      }
    }

    const updateFields = [];
    const updateValues = [];

    if (room_number !== undefined) {
      updateFields.push('room_number = ?');
      updateValues.push(room_number);
    }
    if (floor !== undefined) {
      updateFields.push('floor = ?');
      updateValues.push(floor);
    }
    if (area !== undefined) {
      updateFields.push('area = ?');
      updateValues.push(area);
    }
    if (price !== undefined) {
      updateFields.push('price = ?');
      updateValues.push(price);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (roomDeposit !== undefined) {
      updateFields.push('deposit = ?');
      updateValues.push(roomDeposit);
    }

    if (updateFields.length === 0) {
      connection.release();
      return existing[0];
    }

    const query = `UPDATE rooms SET ${updateFields.join(', ')} WHERE id = ? AND owner_id = ?`;
    updateValues.push(roomId, ownerId);

    await connection.query(query, updateValues);
    connection.release();

    return {
      id: roomId,
      room_number: room_number !== undefined ? room_number : existing[0].room_number,
      floor: floor !== undefined ? floor : existing[0].floor,
      area: area !== undefined ? area : existing[0].area,
      price: price !== undefined ? price : existing[0].price,
      status: status !== undefined ? status : existing[0].status,
      description: description !== undefined ? description : existing[0].description,
      deposit: roomDeposit !== undefined ? roomDeposit : existing[0].deposit,
      owner_id: ownerId,
    };
  } catch (error) {
    console.error('Database error in updateRoom:', error);
    throw error;
  }
};

export const deleteRoom = async (roomId, ownerId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      `SELECT * FROM rooms WHERE id = ? AND owner_id = ? FOR UPDATE`,
      [roomId, ownerId]
    );

    if (existing.length === 0) {
      throw new Error('Phòng không tìm thấy');
    }

    const [activeContracts] = await connection.query(
      `SELECT id FROM contracts WHERE room_id = ? AND status = 'active'`,
      [roomId]
    );

    if (activeContracts.length > 0) {
      throw new Error('Phòng đang có người thuê, không thể xóa');
    }

    const [historyRows] = await connection.query(
      `SELECT
        COUNT(DISTINCT c.id) as contract_count,
        COUNT(DISTINCT i.id) as invoice_count,
        COUNT(DISTINCT u.id) as utility_count
       FROM contracts c
       LEFT JOIN invoices i ON i.contract_id = c.id
       LEFT JOIN utilities u ON u.contract_id = c.id
       WHERE c.room_id = ?`,
      [roomId]
    );

    const history = historyRows[0] || {};
    if (Number(history.invoice_count) > 0 || Number(history.utility_count) > 0) {
      throw new Error('Phòng đã có hóa đơn hoặc chỉ số điện nước, không thể xóa để bảo toàn dữ liệu');
    }

    if (Number(history.contract_count) > 0) {
      throw new Error('Phòng đã có lịch sử hợp đồng, không thể xóa');
    }

    await connection.query(
      `DELETE FROM room_services WHERE room_id = ?`,
      [roomId]
    );

    await connection.query(
      `DELETE FROM rooms WHERE id = ? AND owner_id = ?`,
      [roomId, ownerId]
    );

    await connection.commit();

    return { id: roomId, message: 'Xóa phòng thành công' };
  } catch (error) {
    await connection.rollback();
    console.error('Database error in deleteRoom:', error);
    throw error;
  } finally {
    connection.release();
  }
};
