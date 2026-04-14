import pool from '../config/database.js';

/**
 * Get all rooms for a specific landlord
 */
export const getAllRoomsByLandlord = async (landlordId) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT * FROM rooms 
       WHERE landlord_id = ? 
       ORDER BY room_number ASC`,
      [landlordId]
    );
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
export const getRoomById = async (roomId, landlordId) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT * FROM rooms 
       WHERE id = ? AND landlord_id = ?`,
      [roomId, landlordId]
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
export const createRoom = async (roomData, landlordId) => {
  try {
    const {
      room_number,
      area,
      floor,
      price,
      status,
      description,
    } = roomData;

    // Validation
    if (!room_number || !area || !floor === undefined || !price || !status) {
      throw new Error('Số phòng, diện tích, tầng, giá và trạng thái là bắt buộc');
    }

    // Validate status
    const validStatuses = ['available', 'rented', 'maintenance'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Trạng thái không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}`);
    }

    const connection = await pool.getConnection();

    // Check if room number already exists for this landlord
    const [existing] = await connection.query(
      `SELECT id FROM rooms 
       WHERE room_number = ? AND landlord_id = ?`,
      [room_number, landlordId]
    );

    if (existing.length > 0) {
      connection.release();
      throw new Error(`Phòng số ${room_number} đã tồn tại`);
    }

    // Insert new room
    const [result] = await connection.query(
      `INSERT INTO rooms (room_number, area, floor, price, status, description, landlord_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [room_number, area, floor, price, status, description || '', landlordId]
    );

    connection.release();

    return {
      id: result.insertId,
      room_number,
      area,
      floor,
      price,
      status,
      description,
      landlord_id: landlordId,
    };
  } catch (error) {
    console.error('Database error in createRoom:', error);
    throw error;
  }
};

/**
 * Update a room
 */
export const updateRoom = async (roomId, roomData, landlordId) => {
  try {
    const {
      room_number,
      area,
      floor,
      price,
      status,
      description,
    } = roomData;

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
      `SELECT * FROM rooms WHERE id = ? AND landlord_id = ?`,
      [roomId, landlordId]
    );

    if (existing.length === 0) {
      connection.release();
      throw new Error('Phòng không tìm thấy');
    }

    // If room_number is being changed, check if new number already exists
    if (room_number && room_number !== existing[0].room_number) {
      const [conflict] = await connection.query(
        `SELECT id FROM rooms 
         WHERE room_number = ? AND landlord_id = ? AND id != ?`,
        [room_number, landlordId, roomId]
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
    if (area !== undefined) {
      updateFields.push('area = ?');
      updateValues.push(area);
    }
    if (floor !== undefined) {
      updateFields.push('floor = ?');
      updateValues.push(floor);
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

    updateFields.push('updated_at = NOW()');

    if (updateFields.length === 1) {
      // Only updated_at, no actual changes
      connection.release();
      return existing[0];
    }

    const query = `UPDATE rooms SET ${updateFields.join(', ')} WHERE id = ? AND landlord_id = ?`;
    updateValues.push(roomId, landlordId);

    await connection.query(query, updateValues);
    connection.release();

    return {
      id: roomId,
      room_number: room_number !== undefined ? room_number : existing[0].room_number,
      area: area !== undefined ? area : existing[0].area,
      floor: floor !== undefined ? floor : existing[0].floor,
      price: price !== undefined ? price : existing[0].price,
      status: status !== undefined ? status : existing[0].status,
      description: description !== undefined ? description : existing[0].description,
      landlord_id: landlordId,
    };
  } catch (error) {
    console.error('Database error in updateRoom:', error);
    throw error;
  }
};

/**
 * Delete a room
 */
export const deleteRoom = async (roomId, landlordId) => {
  try {
    const connection = await pool.getConnection();

    // Check if room exists and belongs to landlord
    const [existing] = await connection.query(
      `SELECT * FROM rooms WHERE id = ? AND landlord_id = ?`,
      [roomId, landlordId]
    );

    if (existing.length === 0) {
      connection.release();
      throw new Error('Phòng không tìm thấy');
    }

    // Delete the room
    await connection.query(
      `DELETE FROM rooms WHERE id = ? AND landlord_id = ?`,
      [roomId, landlordId]
    );

    connection.release();

    return { id: roomId, message: 'Xóa phòng thành công' };
  } catch (error) {
    console.error('Database error in deleteRoom:', error);
    throw error;
  }
};
