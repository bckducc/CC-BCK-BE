import pool from '../config/database.js';

export const createService = async ({ service_name, price, unit, is_optional }) => {
  if (!service_name || price === undefined) {
    throw new Error('Tên dịch vụ và đơn giá là bắt buộc');
  }
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM services WHERE service_name = ?',
      [service_name]
    );
    if (existing.length > 0) {
      throw new Error(`Dịch vụ "${service_name}" đã tồn tại`);
    }
    const [result] = await connection.query(
      `INSERT INTO services (service_name, price, unit, is_optional) VALUES (?, ?, ?, ?)`,
      [service_name, price, unit || null, is_optional ? 1 : 0]
    );
    return {
      id: result.insertId,
      service_name,
      price,
      unit: unit || null,
      is_optional: !!is_optional,
    };
  } finally {
    connection.release();
  }
};

export const getAllServices = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM services ORDER BY service_name ASC'
    );
    return rows;
  } finally {
    connection.release();
  }
};

export const getServiceById = async (serviceId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM services WHERE id = ?',
      [serviceId]
    );
    if (rows.length === 0) {
      throw new Error('Không tìm thấy dịch vụ');
    }
    return rows[0];
  } finally {
    connection.release();
  }
};

export const updateService = async (serviceId, { service_name, price, unit, is_optional }) => {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT * FROM services WHERE id = ?',
      [serviceId]
    );
    if (existing.length === 0) {
      throw new Error('Không tìm thấy dịch vụ');
    }
    if (service_name && service_name !== existing[0].service_name) {
      const [conflict] = await connection.query(
        'SELECT id FROM services WHERE service_name = ? AND id != ?',
        [service_name, serviceId]
      );
      if (conflict.length > 0) {
        throw new Error(`Dịch vụ "${service_name}" đã tồn tại`);
      }
    }
    const updateFields = [];
    const updateValues = [];
    if (service_name !== undefined) {
      updateFields.push('service_name = ?');
      updateValues.push(service_name);
    }
    if (price !== undefined) {
      updateFields.push('price = ?');
      updateValues.push(price);
    }
    if (unit !== undefined) {
      updateFields.push('unit = ?');
      updateValues.push(unit);
    }
    if (is_optional !== undefined) {
      updateFields.push('is_optional = ?');
      updateValues.push(is_optional ? 1 : 0);
    }
    if (updateFields.length === 0) {
      return existing[0];
    }
    const query = `UPDATE services SET ${updateFields.join(', ')} WHERE id = ?`;
    updateValues.push(serviceId);
    await connection.query(query, updateValues);
    const [updated] = await connection.query(
      'SELECT * FROM services WHERE id = ?',
      [serviceId]
    );
    return updated[0];
  } finally {
    connection.release();
  }
};

export const deleteService = async (serviceId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [existing] = await connection.query(
      'SELECT * FROM services WHERE id = ?',
      [serviceId]
    );
    if (existing.length === 0) {
      throw new Error('Không tìm thấy dịch vụ');
    }
    await connection.query(
      'DELETE FROM room_services WHERE service_id = ?',
      [serviceId]
    );
    await connection.query(
      'DELETE FROM services WHERE id = ?',
      [serviceId]
    );
    await connection.commit();
    return { id: serviceId, message: 'Xóa dịch vụ thành công' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const assignServiceToRoom = async (roomId, serviceId, quantity = 1, applied_date) => {
  const connection = await pool.getConnection();
  try {
    const [roomCheck] = await connection.query(
      'SELECT * FROM rooms WHERE id = ?',
      [roomId]
    );
    if (roomCheck.length === 0) {
      throw new Error('Phòng không tồn tại');
    }
    const [serviceCheck] = await connection.query(
      'SELECT * FROM services WHERE id = ?',
      [serviceId]
    );
    if (serviceCheck.length === 0) {
      throw new Error('Dịch vụ không tồn tại');
    }
    const [existing] = await connection.query(
      'SELECT * FROM room_services WHERE room_id = ? AND service_id = ?',
      [roomId, serviceId]
    );
    if (existing.length > 0) {
      throw new Error('Dịch vụ đã được gán cho phòng này');
    }
    await connection.query(
      'INSERT INTO room_services (room_id, service_id, quantity, applied_date) VALUES (?, ?, ?, ?)',
      [roomId, serviceId, quantity, applied_date || null]
    );
    return {
      room_id: roomId,
      service_id: serviceId,
      quantity,
      applied_date: applied_date || null,
      service_name: serviceCheck[0].service_name,
    };
  } finally {
    connection.release();
  }
};

export const removeServiceFromRoom = async (roomId, serviceId) => {
  const connection = await pool.getConnection();
  try {
    const [roomCheck] = await connection.query(
      'SELECT * FROM rooms WHERE id = ?',
      [roomId]
    );
    if (roomCheck.length === 0) {
      throw new Error('Phòng không tồn tại');
    }
    const [existing] = await connection.query(
      'SELECT * FROM room_services WHERE room_id = ? AND service_id = ?',
      [roomId, serviceId]
    );
    if (existing.length === 0) {
      throw new Error('Dịch vụ chưa được gán cho phòng này');
    }
    await connection.query(
      'DELETE FROM room_services WHERE room_id = ? AND service_id = ?',
      [roomId, serviceId]
    );
    return { room_id: roomId, service_id: serviceId, message: 'Gỡ dịch vụ khỏi phòng thành công' };
  } finally {
    connection.release();
  }
};

export const getRoomServices = async (roomId) => {
  const connection = await pool.getConnection();
  try {
    const [roomCheck] = await connection.query(
      'SELECT * FROM rooms WHERE id = ?',
      [roomId]
    );
    if (roomCheck.length === 0) {
      throw new Error('Phòng không tồn tại');
    }
    const [rows] = await connection.query(
      `SELECT rs.id, rs.room_id, rs.quantity, rs.applied_date, s.id as service_id, s.service_name, s.price, s.unit, s.is_optional
       FROM room_services rs
       INNER JOIN services s ON rs.service_id = s.id
       WHERE rs.room_id = ?`,
      [roomId]
    );
    return rows;
  } finally {
    connection.release();
  }
};

export const updateRoomServiceQuantity = async (roomId, serviceId, quantity) => {
  const connection = await pool.getConnection();
  try {
    const [roomCheck] = await connection.query(
      'SELECT * FROM rooms WHERE id = ?',
      [roomId]
    );
    if (roomCheck.length === 0) {
      throw new Error('Phòng không tồn tại');
    }
    const [existing] = await connection.query(
      'SELECT * FROM room_services WHERE room_id = ? AND service_id = ?',
      [roomId, serviceId]
    );
    if (existing.length === 0) {
      throw new Error('Dịch vụ chưa được gán cho phòng này');
    }
    if (quantity < 1) {
      throw new Error('Số lượng phải lớn hơn 0');
    }
    await connection.query(
      'UPDATE room_services SET quantity = ? WHERE room_id = ? AND service_id = ?',
      [quantity, roomId, serviceId]
    );
    return { room_id: roomId, service_id: serviceId, quantity };
  } finally {
    connection.release();
  }
};
