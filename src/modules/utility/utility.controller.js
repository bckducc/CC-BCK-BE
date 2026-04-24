import {
  recordUtilityReading,
  getUtilityReading,
  getUtilityReadingsByRoom,
  getAllUtilityReadings,
  deleteUtilityReading,
  setUtilityConfig,
  getUtilityConfig,
} from './utility.service.js';

export const setConfig = async (req, res) => {
  try {
    const { electric_price, water_price, vat_percent } = req.body;

    if (electric_price === undefined || water_price === undefined || vat_percent === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: electric_price, water_price, vat_percent',
      });
    }

    const config = await setUtilityConfig({ electric_price, water_price, vat_percent }, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật cấu hình giá điện nước thành công',
      data: config,
    });
  } catch (error) {
    console.error('Set utility config error:', {
      type: 'VALIDATION_ERROR',
      field: 'utility_config',
      value: req.body,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getConfig = async (req, res) => {
  try {
    const config = await getUtilityConfig(req.user.id);

    return res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Get utility config error:', {
      type: 'GET_UTILITY_CONFIG_ERROR',
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy cấu hình giá điện nước',
    });
  }
};

export const recordReading = async (req, res) => {
  try {
    const landlordUserId = req.user.id;
    const { room_id, month, year, electric_price, water_price } = req.body;

    if (!room_id || !month || !year || electric_price === undefined || water_price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Phòng, tháng, năm, giá điện và giá nước là bắt buộc',
      });
    }

    const utility = await recordUtilityReading(req.body, landlordUserId);

    return res.status(200).json({
      success: true,
      message: 'Ghi nhận chỉ số điện nước thành công',
      data: utility,
    });
  } catch (error) {
    console.error('Record utility reading error:', {
      type: 'VALIDATION_ERROR',
      field: 'utility_reading',
      value: req.body,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Ghi nhận chỉ số điện nước thất bại',
    });
  }
};

export const getReading = async (req, res) => {
  try {
    const landlordUserId = req.user.id;
    const { room_id, month, year } = req.query;

    if (!room_id || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Phòng, tháng và năm là bắt buộc',
      });
    }

    const utility = await getUtilityReading(parseInt(room_id), parseInt(month), parseInt(year), landlordUserId);

    if (!utility) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chỉ số điện nước',
      });
    }

    return res.status(200).json({
      success: true,
      data: utility,
    });
  } catch (error) {
    console.error('Get utility reading error:', {
      type: 'GET_UTILITY_READING_ERROR',
      roomId: req.query.room_id,
      month: req.query.month,
      year: req.query.year,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Không tải được chỉ số điện nước',
    });
  }
};

export const getRoomReadings = async (req, res) => {
  try {
    const landlordUserId = req.user.id;
    const { room_id } = req.params;

    if (!room_id) {
      return res.status(400).json({
        success: false,
        message: 'Phòng là bắt buộc',
      });
    }

    const utilities = await getUtilityReadingsByRoom(parseInt(room_id), landlordUserId);

    return res.status(200).json({
      success: true,
      data: utilities,
      total: utilities.length,
    });
  } catch (error) {
    console.error('Get room utility readings error:', {
      type: 'GET_ROOM_UTILITY_READINGS_ERROR',
      roomId: req.params.room_id,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Không tải được danh sách chỉ số điện nước',
    });
  }
};

export const listReadings = async (req, res) => {
  try {
    const landlordUserId = req.user.id;
    const { month, year, room_id, page = 1, limit = 20 } = req.query;

    const filters = { month, year, room_id };
    const utilities = await getAllUtilityReadings(landlordUserId, filters);

    const start = (page - 1) * limit;
    const paginatedUtilities = utilities.slice(start, start + parseInt(limit));

    return res.status(200).json({
      success: true,
      data: paginatedUtilities,
      total: utilities.length,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('List utility readings error:', {
      type: 'LIST_UTILITY_READINGS_ERROR',
      userId: req.user?.id,
      filters: req.query,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Không tải được danh sách chỉ số điện nước',
    });
  }
};

export const removeReading = async (req, res) => {
  try {
    const landlordUserId = req.user.id;
    const { room_id, month, year } = req.query;

    if (!room_id || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Phòng, tháng và năm là bắt buộc',
      });
    }

    await deleteUtilityReading(parseInt(room_id), parseInt(month), parseInt(year), landlordUserId);

    return res.status(200).json({
      success: true,
      message: 'Xóa chỉ số điện nước thành công',
    });
  } catch (error) {
    console.error('Delete utility reading error:', {
      type: 'DELETE_UTILITY_READING_ERROR',
      roomId: req.query.room_id,
      month: req.query.month,
      year: req.query.year,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Xóa chỉ số điện nước thất bại',
    });
  }
};
