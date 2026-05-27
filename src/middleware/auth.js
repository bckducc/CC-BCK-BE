import jwt from 'jsonwebtoken';

export const generateToken = (userId, username, role, landlordId = null) => {
  const payload = { id: userId, username, role };
  if (landlordId) {
    payload.landlord_id = landlordId;
  }
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
};

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không có token được cung cấp',
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn',
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực',
      error: error.message,
    });
  }
};

export const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa được xác thực',
      });
    }

    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    if (!rolesArray.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Cấm truy cập - quyền hạn không đủ',
      });
    }

    next();
  };
};
