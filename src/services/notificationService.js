import pool from '../config/database.js';

export const createNotification = async (userId, notifData) => {
  const { title, content, type, reference_id, reference_type } = notifData;

  if (!title || !content) {
    throw new Error('Tiêu đề và nội dung là bắt buộc');
  }

  const connection = await pool.getConnection();
  
  try {
    const [result] = await connection.query(
      `INSERT INTO notifications (user_id, title, content, type, reference_id, reference_type) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, title, content, type || 'announcement', reference_id || null, reference_type || null]
    );

    return {
      id: result.insertId,
      user_id: userId,
      title,
      content,
      type: type || 'announcement',
    };
  } finally {
    connection.release();
  }
};

export const getNotificationsByUser = async (userId, filters) => {
  const { is_read, type, limit = 50 } = filters;
  const connection = await pool.getConnection();
  
  try {
    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [userId];

    if (is_read !== undefined) {
      query += ' AND is_read = ?';
      params.push(is_read === 'true' ? 1 : 0);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY is_read ASC, created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const [rows] = await connection.query(query, params);
    return rows;
  } finally {
    connection.release();
  }
};

export const markAsRead = async (notificationId, userId) => {
  const connection = await pool.getConnection();
  
  try {
    // Check if notification belongs to user
    const [existing] = await connection.query(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    if (existing.length === 0) {
      throw new Error('Không tìm thấy thông báo');
    }

    await connection.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [notificationId]
    );

    return { id: notificationId, is_read: true };
  } finally {
    connection.release();
  }
};

export const markAllAsRead = async (userId) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    return { message: 'Đánh dấu tất cả đã đọc thành công' };
  } finally {
    connection.release();
  }
};

export const getUnreadCount = async (userId) => {
  const connection = await pool.getConnection();
  
  try {
    const [rows] = await connection.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    return rows[0].count;
  } finally {
    connection.release();
  }
};

export const deleteNotification = async (notificationId, userId) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.query(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    return { id: notificationId, message: 'Xóa thông báo thành công' };
  } finally {
    connection.release();
  }
};