import {
  recordUtilityReading,
  getUtilityReading,
  getUtilityReadingsByContract,
  getUtilityReadingsByRoom,
  getAllUtilityReadings,
  getUtilityReadingsByTenant,
  deleteUtilityReading,
} from '../services/utilityService.js';

export const recordReading = async (req, res) => {
  try {
    const landlordUserId = req.user.id;
    const { contract_id, room_id, month, year, electric_price, water_price } = req.body;

    if ((!contract_id && !room_id) || !month || !year || electric_price === undefined || water_price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Phòng hoặc hợp đồng, tháng, năm, giá điện và giá nước là bắt buộc',
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
    const { contract_id, month, year } = req.query;

    if (!contract_id || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Hop dong, thang va nam la bat buoc',
      });
    }

    const utility = await getUtilityReading(
      parseInt(contract_id),
      parseInt(month),
      parseInt(year),
      landlordUserId
    );

    if (!utility) {
      return res.status(404).json({
        success: false,
        message: 'Khong tim thay chi so dien nuoc',
      });
    }

    return res.status(200).json({
      success: true,
      data: utility,
    });
  } catch (error) {
    console.error('Get utility reading error:', {
      type: 'GET_UTILITY_READING_ERROR',
      contractId: req.query.contract_id,
      month: req.query.month,
      year: req.query.year,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Khong tai duoc chi so dien nuoc',
    });
  }
};

export const getContractReadings = async (req, res) => {
  try {
    const landlordUserId = req.user.id;
    const { contract_id } = req.params;

    if (!contract_id) {
      return res.status(400).json({
        success: false,
        message: 'Hop dong la bat buoc',
      });
    }

    const utilities = await getUtilityReadingsByContract(parseInt(contract_id), landlordUserId);

    return res.status(200).json({
      success: true,
      data: utilities,
      total: utilities.length,
    });
  } catch (error) {
    console.error('Get contract utility readings error:', {
      type: 'GET_CONTRACT_UTILITY_READINGS_ERROR',
      contractId: req.params.contract_id,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Khong tai duoc danh sach chi so dien nuoc',
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
        message: 'Phong la bat buoc',
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
      message: error.message || 'Khong tai duoc danh sach chi so dien nuoc',
    });
  }
};

export const listReadings = async (req, res) => {
  try {
    const landlordUserId = req.user.id;
    const { month, year, room_id, contract_id, page = 1, limit = 20 } = req.query;

    const filters = { month, year, room_id, contract_id };
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
      message: 'Khong tai duoc danh sach chi so dien nuoc',
    });
  }
};

export const listMyReadings = async (req, res) => {
  try {
    const tenantUserId = req.user.id;
    const { month, year, contract_id, page = 1, limit = 100 } = req.query;

    const utilities = await getUtilityReadingsByTenant(tenantUserId, { month, year, contract_id });
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
    console.error('List my utility readings error:', {
      type: 'LIST_MY_UTILITY_READINGS_ERROR',
      userId: req.user?.id,
      filters: req.query,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Khong tai duoc lich su dien nuoc',
    });
  }
};

export const removeReading = async (req, res) => {
  try {
    const landlordUserId = req.user.id;
    const { contract_id, month, year } = req.query;

    if (!contract_id || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Hop dong, thang va nam la bat buoc',
      });
    }

    await deleteUtilityReading(
      parseInt(contract_id),
      parseInt(month),
      parseInt(year),
      landlordUserId
    );

    return res.status(200).json({
      success: true,
      message: 'Xoa chi so dien nuoc thanh cong',
    });
  } catch (error) {
    console.error('Delete utility reading error:', {
      type: 'DELETE_UTILITY_READING_ERROR',
      contractId: req.query.contract_id,
      month: req.query.month,
      year: req.query.year,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Xoa chi so dien nuoc that bai',
    });
  }
};
