import { setUtilityConfig, getUtilityConfig } from '../services/utilityConfigService.js';

/**
 * Set or update utility configuration
 * POST /api/v1/utilities/config
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const setConfig = async (req, res) => {
  try {
    const { electric_price, water_price, vat_percent } = req.body;

    // Validate required fields
    if (electric_price === undefined || water_price === undefined || vat_percent === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: electric_price, water_price, vat_percent'
      });
    }

    // Call service method with landlord user ID
    const config = await setUtilityConfig(
      { electric_price, water_price, vat_percent },
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: 'Cập nhật cấu hình giá điện nước thành công',
      data: config
    });
  } catch (error) {
    console.error('Set utility config error:', {
      type: 'VALIDATION_ERROR',
      field: 'utility_config',
      value: req.body,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get current utility configuration
 * GET /api/v1/utilities/config
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getConfig = async (req, res) => {
  try {
    // Call service method
    const config = await getUtilityConfig(req.user.id);

    return res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get utility config error:', {
      type: 'GET_UTILITY_CONFIG_ERROR',
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy cấu hình giá điện nước'
    });
  }
};
