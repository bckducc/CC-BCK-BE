import pool from '../../config/database.js';
import { validatePrice } from '../../common/utils/validators.js';

export const createService = async (serviceData, landlordId) => {
  const { name, description, price, unit } = serviceData;

  if (!name || !price) {
    throw new Error('Tên dịch vụ và đơn giá là bắt buộc');
  }

  validatePrice(price);

  const connection = await pool.getConnection();

  try {
    const [existing] = await connection.query('SELECT id FROM services WHERE name = ? AND landlord_id = ?', [
      name,
      landlordId,
    ]);

    if (existing.length > 0) {
      throw new Error(`Dịch vụ "${name}" đã tồn tại`);
    }

    const [result] = await connection.query(
      `INSERT INTO services (landlord_id, name, description, price, unit, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [landlordId, name, description || null, price, unit || 'month']
    );

    return {
      id: result.insertId,
      landlord_id: landlordId,
      name,
      description: description || null,
      price,
      unit: unit || 'month',
      is_active: true,
    };
  } finally {
    connection.release();
  }
};

export const getAllServices = async (landlordId) => {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      'SELECT * FROM services WHERE landlord_id = ? AND is_active = TRUE ORDER BY name ASC',
      [landlordId]
    );

    return rows;
  } finally {
    connection.release();
  }
};

export const getServiceById = async (serviceId, landlordId) => {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query('SELECT * FROM services WHERE id = ? AND landlord_id = ?', [
      serviceId,
      landlordId,
    ]);

    if (rows.length === 0) {
      throw new Error('Không tìm thấy dịch vụ');
    }

    return rows[0];
  } finally {
    connection.release();
  }
};

export const updateService = async (serviceId, serviceData, landlordId) => {
  const { name, description, price, unit, is_active } = serviceData;

  const connection = await pool.getConnection();

  try {
    const [existing] = await connection.query('SELECT * FROM services WHERE id = ? AND landlord_id = ?', [
      serviceId,
      landlordId,
    ]);

    if (existing.length === 0) {
      throw new Error('Không tìm thấy dịch vụ');
    }

    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      if (name !== existing[0].name) {
        const [conflict] = await connection.query(
          'SELECT id FROM services WHERE name = ? AND landlord_id = ? AND id != ?',
          [name, landlordId, serviceId]
        );

        if (conflict.length > 0) {
          throw new Error(`Dịch vụ "${name}" đã tồn tại`);
        }
      }
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (price !== undefined) {
      validatePrice(price);
      updateFields.push('price = ?');
      updateValues.push(price);
    }
    if (unit !== undefined) {
      updateFields.push('unit = ?');
      updateValues.push(unit);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active);
    }

    if (updateFields.length === 0) {
      return existing[0];
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(serviceId, landlordId);

    const query = `UPDATE services SET ${updateFields.join(', ')} WHERE id = ? AND landlord_id = ?`;
    await connection.query(query, updateValues);

    const [updated] = await connection.query('SELECT * FROM services WHERE id = ?', [serviceId]);
    return updated[0];
  } finally {
    connection.release();
  }
};

export const deleteService = async (serviceId, landlordId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.query('SELECT * FROM services WHERE id = ? AND landlord_id = ?', [
      serviceId,
      landlordId,
    ]);

    if (existing.length === 0) {
      throw new Error('Không tìm thấy dịch vụ');
    }

    await connection.query('DELETE FROM room_services WHERE service_id = ?', [serviceId]);
    await connection.query('DELETE FROM services WHERE id = ?', [serviceId]);

    await connection.commit();
    return { id: serviceId, message: 'Xóa dịch vụ thành công' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const assignServiceToRoom = async (roomId, serviceId, landlordId, customPrice) => {
  const connection = await pool.getConnection();

  try {
    const [roomCheck] = await connection.query('SELECT * FROM rooms WHERE id = ? AND landlord_id = ?', [
      roomId,
      landlordId,
    ]);
    if (roomCheck.length === 0) {
      throw new Error('Phòng không tồn tại hoặc không thuộc về bạn');
    }

    const [serviceCheck] = await connection.query('SELECT * FROM services WHERE id = ? AND landlord_id = ?', [
      serviceId,
      landlordId,
    ]);
    if (serviceCheck.length === 0) {
      throw new Error('Dịch vụ không tồn tại');
    }

    const [existing] = await connection.query('SELECT * FROM room_services WHERE room_id = ? AND service_id = ?', [
      roomId,
      serviceId,
    ]);
    if (existing.length > 0) {
      throw new Error('Dịch vụ đã được gán cho phòng này');
    }

    const price = customPrice || serviceCheck[0].price;
    await connection.query('INSERT INTO room_services (room_id, service_id, custom_price) VALUES (?, ?, ?)', [
      roomId,
      serviceId,
      price,
    ]);

    return {
      room_id: roomId,
      service_id: serviceId,
      custom_price: price,
      service_name: serviceCheck[0].name,
    };
  } finally {
    connection.release();
  }
};

export const removeServiceFromRoom = async (roomId, serviceId, landlordId) => {
  const connection = await pool.getConnection();

  try {
    const [roomCheck] = await connection.query('SELECT * FROM rooms WHERE id = ? AND landlord_id = ?', [
      roomId,
      landlordId,
    ]);
    if (roomCheck.length === 0) {
      throw new Error('Phòng không tồn tại');
    }

    const [existing] = await connection.query('SELECT * FROM room_services WHERE room_id = ? AND service_id = ?', [
      roomId,
      serviceId,
    ]);
    if (existing.length === 0) {
      throw new Error('Dịch vụ chưa được gán cho phòng này');
    }

    await connection.query('DELETE FROM room_services WHERE room_id = ? AND service_id = ?', [roomId, serviceId]);
    return { room_id: roomId, service_id: serviceId, message: 'Gỡ dịch vụ khỏi phòng thành công' };
  } finally {
    connection.release();
  }
};

export const getRoomServices = async (roomId, landlordId) => {
  const connection = await pool.getConnection();

  try {
    const [roomCheck] = await connection.query('SELECT * FROM rooms WHERE id = ? AND landlord_id = ?', [
      roomId,
      landlordId,
    ]);
    if (roomCheck.length === 0) {
      throw new Error('Phòng không tồn tại');
    }

    const [rows] = await connection.query(
      `SELECT rs.id, rs.custom_price, s.id as service_id, s.name, s.description, s.unit
       FROM room_services rs
       INNER JOIN services s ON rs.service_id = s.id
       WHERE rs.room_id = ? AND s.is_active = TRUE`,
      [roomId]
    );

    return rows;
  } finally {
    connection.release();
  }
};

export const updateRoomServicePrice = async (roomId, serviceId, landlordId, newPrice) => {
  const connection = await pool.getConnection();

  try {
    const [roomCheck] = await connection.query('SELECT * FROM rooms WHERE id = ? AND landlord_id = ?', [
      roomId,
      landlordId,
    ]);
    if (roomCheck.length === 0) {
      throw new Error('Phòng không tồn tại');
    }

    const [existing] = await connection.query('SELECT * FROM room_services WHERE room_id = ? AND service_id = ?', [
      roomId,
      serviceId,
    ]);
    if (existing.length === 0) {
      throw new Error('Dịch vụ chưa được gán cho phòng này');
    }

    if (newPrice < 0) {
      throw new Error('Giá không được âm');
    }

    await connection.query('UPDATE room_services SET custom_price = ? WHERE room_id = ? AND service_id = ?', [
      newPrice,
      roomId,
      serviceId,
    ]);

    return { room_id: roomId, service_id: serviceId, custom_price: newPrice };
  } finally {
    connection.release();
  }
};
