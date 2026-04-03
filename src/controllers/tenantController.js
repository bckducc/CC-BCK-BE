import { getUserWithTenantInfo } from '../services/authService.js';

export const getTenantDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const tenantInfo = await getUserWithTenantInfo(userId);

    if (!tenantInfo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người thuê',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        profile: {
          id: tenantInfo.id,
          username: tenantInfo.username,
          full_name: tenantInfo.full_name,
          phone: tenantInfo.phone,
          identity_card: tenantInfo.identity_card,
          birthday: tenantInfo.birthday,
          gender: tenantInfo.gender,
          address: tenantInfo.address,
          created_at: tenantInfo.created_at,
        },
        dashboard: {
          role: 'tenant',
          status: 'active',
          message: 'Chào mừng bạn quay trở lại!',
        },
      },
    });
  } catch (error) {
    console.error('Get tenant dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không tải được dashboard',
      error: error.message,
    });
  }
};

/**
 * Update tenant profile information
 */
export const updateTenantProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, identity_card, birthday, gender, address } = req.body;

    // Validation
    if (!full_name) {
      return res.status(400).json({
        success: false,
        message: 'Tên đầy đủ là bắt buộc',
      });
    }

    // TODO: Execute update query to database
    // For now, return success message
    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: {
        id: userId,
        full_name,
        phone,
        identity_card,
        birthday,
        gender,
        address,
      },
    });
  } catch (error) {
    console.error('Update tenant profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Cập nhật thông tin thất bại',
      error: error.message,
    });
  }
};
