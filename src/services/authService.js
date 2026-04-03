import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

export const findUserByUsername = async (username) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    connection.release();
    
    const user = rows[0];
    if (user) {
      console.log(`Found user: ${user.username} (id: ${user.id})`); // Debug
    }
    return user || null;
  } catch (error) {
    console.error('Database error in findUserByUsername:', error);
    throw error;
  }
};

export const getUserWithLandlordInfo = async (userId) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT 
        u.id, 
        u.username, 
        u.role, 
        u.is_active,
        u.created_at,
        l.full_name,
        l.phone,
        l.bank_name,
        l.bank_account_number,
        l.bank_account_name
      FROM users u
      LEFT JOIN landlord l ON u.id = l.user_id
      WHERE u.id = ?`,
      [userId]
    );
    connection.release();
    
    const user = rows[0];
    if (!user) {
      throw new Error(`Không tìm thấy người dùng có id ${userId}`);
    }
    
    console.log('User with landlord info:', user); // Debug
    return user;
  } catch (error) {
    console.error('Database error in getUserWithLandlordInfo:', error);
    throw error;
  }
};

export const getUserWithTenantInfo = async (userId) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT 
        u.id, 
        u.username, 
        u.role, 
        u.is_active,
        u.created_at,
        t.full_name,
        t.phone,
        t.identity_card,
        t.birthday,
        t.gender,
        t.address
      FROM users u
      LEFT JOIN tenant t ON u.id = t.user_id
      WHERE u.id = ?`,
      [userId]
    );
    connection.release();
    
    const user = rows[0];
    if (!user) {
      throw new Error(`Không tìm thấy người dùng có id ${userId}`);
    }
    
    console.log('User with tenant info:', user); // Debug
    return user;
  } catch (error) {
    console.error('Database error in getUserWithTenantInfo:', error);
    throw error;
  }
};

export const validatePassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error validating password:', error);
    throw error;
  }
};

export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
};
