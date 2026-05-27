import pool from '../config/database.js';
import { validatePrice } from '../utils/validators.js';

/**
 * Get all rooms for a specific landlord (by owner_id)
 */
export const getAllRoomsByLandlord = async (ownerId, filters = {}) => {
  const { floor, status, min_price, max_price, room_number } = filters;
  try {
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

/**
 * Get a specific room by ID
 */
export const getRoomById = async (roomId, ownerId) => {
  try {
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

/**
 * Create a new room
 */
export const createRoom = async (roomData, ownerId) => {
  try {
    const {
      room_number,
      floor,
      area,
      price,
      status,
      description,
      deposit,
    } = roomData;

    // Validation
    if (!room_number || !price) {
      throw new Error('Số phòng và giá là bắt buộc');
    }

    // Validate price and deposit
    validatePrice(price, 'room_price');
    validatePrice(deposit || 0, 'deposit');

    // Validate status
    const validStatuses = ['available', 'rented', 'maintenance'];
    if (status && !validStatuses.includes(status)) {
      throw new Error(`Trạng thái không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}`);
    }

    const connection = await pool.getConnection();

    // Check if room number already exists for this landlord
    const [existing] = await connection.query(
      `SELECT id FROM rooms 
       WHERE room_number = ? AND owner_id = ?`,
      [room_number, ownerId]
    );

    if (existing.length > 0) {
      connection.release();
      throw new Error(`Phòng số ${room_number} đã tồn tại`);
    }

    // Insert new room
    const [result] = await connection.query(
      `INSERT INTO rooms (room_number, floor, area, price, status, description, owner_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        room_number, 
        floor || null, 
        area || null, 
        price, 
        status || 'available', 
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
      status: status || 'available',
      description,
      owner_id: ownerId,
    };
  } catch (error) {
    console.error('Database error in createRoom:', error);
    throw error;
  }
};

/**
 * Update a room
 */
export const updateRoom = async (roomId, roomData, ownerId) => {
  try {
    const {
      room_number,
      floor,
      area,
      price,
      status,
      description,
      deposit,
    } = roomData;

    // Validate price and deposit if provided
    if (price !== undefined) {
      validatePrice(price, 'room_price');
    }
    if (deposit !== undefined) {
      validatePrice(deposit, 'deposit');
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['available', 'rented', 'maintenance'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Trạng thái không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}`);
      }
    }

    const connection = await pool.getConnection();

    // Check if room exists and belongs to landlord
    const [existing] = await connection.query(
      `SELECT * FROM rooms WHERE id = ? AND owner_id = ?`,
      [roomId, ownerId]
    );

    if (existing.length === 0) {
      connection.release();
      throw new Error('Phòng không tìm thấy');
    }

    // If room_number is being changed, check if new number already exists
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

    // Build update fields dynamically
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
    if (deposit !== undefined) {
      updateFields.push('deposit = ?');
      updateValues.push(deposit);
    }

    if (updateFields.length === 0) {
      // No actual changes
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
      deposit: deposit !== undefined ? deposit : existing[0].deposit,
      owner_id: ownerId,
    };
  } catch (error) {
    console.error('Database error in updateRoom:', error);
    throw error;
  }
};

/**
 * Delete a room
 */
export const deleteRoom = async (roomId, ownerId) => {
  try {
    const connection = await pool.getConnection();

    // Check if room exists and belongs to landlord
    const [existing] = await connection.query(
      `SELECT * FROM rooms WHERE id = ? AND owner_id = ?`,
      [roomId, ownerId]
    );

    if (existing.length === 0) {
      connection.release();
      throw new Error('Phòng không tìm thấy');
    }

    // Check for active contracts
    const [activeContracts] = await connection.query(
      `SELECT id FROM contracts WHERE room_id = ? AND status = 'active'`,
      [roomId]
    );

    if (activeContracts.length > 0) {
      connection.release();
      throw new Error('Phòng đang có người thuê, không thể xóa');
    }

    // Delete the room
    await connection.query(
      `DELETE FROM rooms WHERE id = ? AND owner_id = ?`,
      [roomId, ownerId]
    );

    connection.release();

    return { id: roomId, message: 'Xóa phòng thành công' };
  } catch (error) {
    console.error('Database error in deleteRoom:', error);
    throw error;
  }
};
