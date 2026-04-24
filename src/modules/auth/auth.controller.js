import bcrypt from 'bcryptjs';
import { findUserByUsername, getUserWithLandlordInfo, getUserWithTenantInfo } from './auth.service.js';
import { generateToken } from '../../common/middleware/auth.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Tên tài khoản và mật khẩu là bắt buộc',
      });
    }

    console.log(`Login attempt: ${username}`);

    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tên tài khoản hoặc mật khẩu không chính xác',
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa',
      });
    }

    let passwordMatch = false;
    if (user.password && user.password.startsWith('$2')) {
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      passwordMatch = password === user.password;
    }

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Tên tài khoản hoặc mật khẩu không chính xác',
      });
    }

    let userWithInfo;
    if (user.role === 'landlord') {
      userWithInfo = await getUserWithLandlordInfo(user.id);
      if (!userWithInfo) {
        return res.status(404).json({
          success: false,
          message: 'Thông tin chủ nhà không tìm thấy',
        });
      }
    } else if (user.role === 'tenant') {
      userWithInfo = await getUserWithTenantInfo(user.id);
      if (!userWithInfo) {
        return res.status(404).json({
          success: false,
          message: 'Thông tin người thuê không tìm thấy',
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Vai trò người dùng không hợp lệ',
      });
    }

    const token =
      user.role === 'landlord' && userWithInfo.landlord_id
        ? generateToken(user.id, user.username, user.role, userWithInfo.landlord_id)
        : generateToken(user.id, user.username, user.role);

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: userWithInfo.id,
        username: userWithInfo.username,
        role: userWithInfo.role,
        name: userWithInfo.full_name || 'Unknown',
        email: `${userWithInfo.username}@${user.role}.local`,
        phone: userWithInfo.phone || '',
        idNumber: userWithInfo.identity_card || null,
        gender: userWithInfo.gender || null,
        birthday: userWithInfo.birthday || null,
        landlord_id: userWithInfo.landlord_id || null,
        createdAt: userWithInfo.created_at,
      },
    });
  } catch (error) {
    console.error('Login error:', {
      type: 'LOGIN_ERROR',
      username: req.body.username,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Đăng nhập thất bại',
    });
  }
};

export const me = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let userWithInfo;
    if (userRole === 'landlord') {
      userWithInfo = await getUserWithLandlordInfo(userId);
    } else if (userRole === 'tenant') {
      userWithInfo = await getUserWithTenantInfo(userId);
    } else {
      return res.status(403).json({
        success: false,
        message: 'Vai trò người dùng không hợp lệ',
      });
    }

    if (!userWithInfo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: userWithInfo.id,
        username: userWithInfo.username,
        role: userWithInfo.role,
        name: userWithInfo.full_name,
        email: `${userWithInfo.username}@${userRole}.local`,
        phone: userWithInfo.phone,
        address: userWithInfo.address || null,
        idNumber: userWithInfo.identity_card || null,
        gender: userWithInfo.gender || null,
        birthday: userWithInfo.birthday || null,
        createdAt: userWithInfo.created_at,
      },
    });
  } catch (error) {
    console.error('Get user error:', {
      type: 'GET_USER_ERROR',
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Lấy thông tin người dùng thất bại',
    });
  }
};

export const logout = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công',
    });
  } catch (error) {
    console.error('Logout error:', {
      type: 'LOGOUT_ERROR',
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Đăng xuất thất bại',
    });
  }
};

export const checkUser = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Tên tài khoản là bắt buộc',
      });
    }

    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Check user error:', {
      type: 'CHECK_USER_ERROR',
      username: req.query.username,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Kiểm tra người dùng thất bại',
    });
  }
};
