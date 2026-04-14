import { findUserByUsername, getUserWithLandlordInfo, getUserWithTenantInfo, validatePassword } from '../services/authService.js';
import { generateToken } from '../middleware/auth.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Tên tài khoản và mật khẩu là bắt buộc',
      });
    }

    console.log(`Login attempt: ${username}`); // Debug

    // Find user
    const user = await findUserByUsername(username);

    if (!user) {
      console.log(`User not found: ${username}`); // Debug
      return res.status(401).json({
        success: false,
        message: 'Tên tài khoản hoặc mật khẩu không chính xác',
      });
    }

    console.log(`User found: ${user.username}`); // Debug

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa',
      });
    }

    // Validate password (comparing plain text for now, should be hashed in production)
    // TODO: Hash passwords in database and use bcrypt comparison
    const passwordMatch = password === user.password;

    if (!passwordMatch) {
      console.log(`Password mismatch for user: ${username}`); // Debug
      return res.status(401).json({
        success: false,
        message: 'Tên tài khoản hoặc mật khẩu không chính xác',
      });
    }

    // Get user info based on role
    let userWithInfo;
    
    if (user.role === 'landlord') {
      userWithInfo = await getUserWithLandlordInfo(user.id);
      
      if (!userWithInfo) {
        console.log(`Landlord info not found for user id: ${user.id}`); // Debug
        return res.status(404).json({
          success: false,
          message: 'Thông tin chủ nhà không tìm thấy',
        });
      }
    } else if (user.role === 'tenant') {
      userWithInfo = await getUserWithTenantInfo(user.id);
      
      if (!userWithInfo) {
        console.log(`Tenant info not found for user id: ${user.id}`); // Debug
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

    // Generate JWT token with landlord_id if applicable
    let token;
    if (user.role === 'landlord' && userWithInfo.landlord_id) {
      token = generateToken(user.id, user.username, user.role, userWithInfo.landlord_id);
    } else {
      token = generateToken(user.id, user.username, user.role);
    }

    console.log(`Login successful for user: ${username}`); // Debug

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
    console.error('Login error:', error.message, error.stack); // Better debugging
    return res.status(500).json({
      success: false,
      message: error.message || 'Đăng nhập thất bại',
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
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lấy thông tin người dùng thất bại',
      error: error.message,
    });
  }
};

export const logout = (req, res) => {
  try {
    // JWT is stateless, logout is handled on client side by removing token
    return res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Đăng xuất thất bại',
      error: error.message,
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
    console.error('Error checking user:', error);
    return res.status(500).json({
      success: false,
      message: 'Kiểm tra người dùng thất bại',
      error: error.message,
    });
  }
};
