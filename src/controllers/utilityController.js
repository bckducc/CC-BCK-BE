import {
  recordUtilityReading,
  getUtilityReading,
  getUtilityReadingsByRoom,
  getAllUtilityReadings,
  deleteUtilityReading,
} from '../services/utilityService.js';

/**
 * Record or update utility reading
 */
export const recordReading = async (req, res) => {
  try {
    const landlordUserId = req.user.id;
    const {
      room_id,
      month,
      year,
      electric_old,
      electric_new,
      electric_price,
      water_old,
      water_new,
      water_price,
      recorded_date,
      note
    } = req.body;

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
      timestamp: new Date().toISOString()
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Ghi nhận chỉ số điện nước thất bại',
    });
  }
};

/**
 * Get utility reading for specific room/month/year
 */
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

    const utility = await getUtilityReading(
      parseInt(room_id),
      parseInt(month),
      parseInt(year),
      landlordUserId
    );

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
      timestamp: new Date().toISOString()
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Không tải được chỉ số điện nước',
    });
  }
};

/**
 * Get all utility readings for a room
 */
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
      timestamp: new Date().toISOString()
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Không tải được danh sách chỉ số điện nước',
    });
  }
};

/**
 * Get all utility readings for landlord
 */
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
      timestamp: new Date().toISOString()
    });
    return res.status(500).json({
      success: false,
      message: 'Không tải được danh sách chỉ số điện nước',
    });
  }
};

/**
 * Delete utility reading
 */
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

    await deleteUtilityReading(
      parseInt(room_id),
      parseInt(month),
      parseInt(year),
      landlordUserId
    );

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
      timestamp: new Date().toISOString()
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Xóa chỉ số điện nước thất bại',
    });
  }
};
