import { getLandlordDashboard, getTenantDashboard } from './dashboard.service.js';

export const getLandlordStats = async (req, res) => {
  try {
    const landlordId = req.user.landlord_id;
    const stats = await getLandlordDashboard(landlordId);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get landlord dashboard error:', {
      type: 'GET_LANDLORD_DASHBOARD_ERROR',
      landlordId: req.user?.landlord_id,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Không tải được dashboard',
    });
  }
};

export const getTenantStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'tenant') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ người thuê mới có thể xem dashboard',
      });
    }

    const stats = await getTenantDashboard(userId);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get tenant dashboard error:', {
      type: 'GET_TENANT_DASHBOARD_ERROR',
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Không tải được dashboard',
    });
  }
};
