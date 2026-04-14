import {
  getAllRoomsByLandlord,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from '../services/roomService.js';

/**
 * Get all rooms for the authenticated landlord
 */
export const getAllRooms = async (req, res) => {
  try {
    const landlordId = req.user.landlord_id;

    if (!landlordId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập. Chỉ chủ nhà mới có thể xem phòng',
      });
    }

    const rooms = await getAllRoomsByLandlord(landlordId);

    return res.status(200).json({
      success: true,
      data: rooms,
      total: rooms.length,
    });
  } catch (error) {
    console.error('Get all rooms error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không tải được danh sách phòng',
      error: error.message,
    });
  }
};

/**
 * Get a specific room by ID
 */
export const getRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordId = req.user.landlord_id;

    if (!landlordId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập',
      });
    }

    const room = await getRoomById(id, landlordId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng',
      });
    }

    return res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Get room error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không tải được thông tin phòng',
      error: error.message,
    });
  }
};

/**
 * Create a new room
 */
export const addRoom = async (req, res) => {
  try {
    const landlordId = req.user.landlord_id;

    if (!landlordId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập. Chỉ chủ nhà mới có thể tạo phòng',
      });
    }

    const room = await createRoom(req.body, landlordId);

    return res.status(201).json({
      success: true,
      message: 'Tạo phòng thành công',
      data: room,
    });
  } catch (error) {
    console.error('Create room error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Tạo phòng thất bại',
    });
  }
};

/**
 * Update a room
 */
export const modifyRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordId = req.user.landlord_id;

    if (!landlordId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập',
      });
    }

    const room = await updateRoom(id, req.body, landlordId);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật phòng thành công',
      data: room,
    });
  } catch (error) {
    console.error('Update room error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Cập nhật phòng thất bại',
    });
  }
};

/**
 * Delete a room
 */
export const removeRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordId = req.user.landlord_id;

    if (!landlordId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập',
      });
    }

    await deleteRoom(id, landlordId);

    return res.status(200).json({
      success: true,
      message: 'Xóa phòng thành công',
    });
  } catch (error) {
    console.error('Delete room error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Xóa phòng thất bại',
    });
  }
};
