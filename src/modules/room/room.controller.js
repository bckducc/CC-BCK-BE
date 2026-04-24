import { getAllRoomsByLandlord, getRoomById, createRoom, updateRoom, deleteRoom } from './room.service.js';

export const getAllRooms = async (req, res) => {
  try {
    const ownerId = req.user.id;

    if (!ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập. Chỉ chủ nhà mới có thể xem phòng',
      });
    }

    const filters = {
      floor: req.query.floor,
      status: req.query.status,
      min_price: req.query.min_price,
      max_price: req.query.max_price,
      room_number: req.query.room_number,
    };

    const rooms = await getAllRoomsByLandlord(ownerId, filters);

    return res.status(200).json({
      success: true,
      data: rooms,
      total: rooms.length,
    });
  } catch (error) {
    console.error('Get all rooms error:', {
      type: 'GET_ALL_ROOMS_ERROR',
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Không tải được danh sách phòng',
    });
  }
};

export const getRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    if (!ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập',
      });
    }

    const room = await getRoomById(id, ownerId);

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
    console.error('Get room error:', {
      type: 'GET_ROOM_ERROR',
      roomId: req.params.id,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Không tải được thông tin phòng',
    });
  }
};

export const addRoom = async (req, res) => {
  try {
    const ownerId = req.user.id;

    if (!ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập. Chỉ chủ nhà mới có thể tạo phòng',
      });
    }

    const room = await createRoom(req.body, ownerId);

    return res.status(201).json({
      success: true,
      message: 'Tạo phòng thành công',
      data: room,
    });
  } catch (error) {
    console.error('Create room error:', {
      type: 'VALIDATION_ERROR',
      field: 'room',
      value: req.body,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Tạo phòng thất bại',
    });
  }
};

export const modifyRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    if (!ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập',
      });
    }

    const room = await updateRoom(id, req.body, ownerId);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật phòng thành công',
      data: room,
    });
  } catch (error) {
    console.error('Update room error:', {
      type: 'VALIDATION_ERROR',
      field: 'room',
      roomId: req.params.id,
      value: req.body,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Cập nhật phòng thất bại',
    });
  }
};

export const removeRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    if (!ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập',
      });
    }

    await deleteRoom(id, ownerId);

    return res.status(200).json({
      success: true,
      message: 'Xóa phòng thành công',
    });
  } catch (error) {
    console.error('Delete room error:', {
      type: 'VALIDATION_ERROR',
      field: 'room_deletion',
      roomId: req.params.id,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Xóa phòng thất bại',
    });
  }
};
