import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  assignServiceToRooms,
  removeServiceFromRoom,
  getRoomServices,
  updateRoomServiceQuantity,
} from '../services/serviceService.js';

export const addService = async (req, res) => {
  try {
    const { service_name, price, unit, is_optional } = req.body;
    if (!service_name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Tên dịch vụ và đơn giá là bắt buộc',
      });
    }
    const service = await createService({ service_name, price, unit, is_optional });
    return res.status(201).json({
      success: true,
      message: 'Tạo dịch vụ thành công',
      data: service,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Tạo dịch vụ thất bại',
    });
  }
};

export const listServices = async (req, res) => {
  try {
    const services = await getAllServices();
    return res.status(200).json({
      success: true,
      data: services,
      total: services.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Không tải được danh sách dịch vụ',
    });
  }
};

export const getService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await getServiceById(id);
    return res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy dịch vụ',
    });
  }
};

export const editService = async (req, res) => {
  try {
    const { id } = req.params;
    const { service_name, price, unit, is_optional } = req.body;
    const service = await updateService(id, { service_name, price, unit, is_optional });
    return res.status(200).json({
      success: true,
      message: 'Cập nhật dịch vụ thành công',
      data: service,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Cập nhật dịch vụ thất bại',
    });
  }
};

export const removeService = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteService(id);
    return res.status(200).json({
      success: true,
      message: 'Xóa dịch vụ thành công',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Xóa dịch vụ thất bại',
    });
  }
};

export const assignService = async (req, res) => {
  try {
    const { room_id, room_ids, service_id, quantity, applied_date } = req.body;
    const targetRoomIds = Array.isArray(room_ids) ? room_ids : room_id ? [room_id] : [];
    if (targetRoomIds.length === 0 || !service_id) {
      return res.status(400).json({
        success: false,
        message: 'Cần chọn ít nhất một phòng và một dịch vụ',
      });
    }
    const result = await assignServiceToRooms(
      targetRoomIds,
      service_id,
      quantity,
      applied_date,
      req.user.id
    );
    return res.status(201).json({
      success: true,
      message: 'Gán dịch vụ vào các phòng thành công',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Gán dịch vụ thất bại',
    });
  }
};

export const getRoomServiceList = async (req, res) => {
  try {
    const { room_id } = req.params;
    const services = await getRoomServices(room_id);
    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Không tải được danh sách dịch vụ của phòng',
    });
  }
};

export const removeServiceFromRoomHandler = async (req, res) => {
  try {
    const { room_id, service_id } = req.params;
    await removeServiceFromRoom(room_id, service_id);
    return res.status(200).json({
      success: true,
      message: 'Gỡ dịch vụ khỏi phòng thành công',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Gỡ dịch vụ thất bại',
    });
  }
};

export const updateRoomServiceQuantityHandler = async (req, res) => {
  try {
    const { room_id, service_id } = req.params;
    const { quantity } = req.body;
    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng là bắt buộc',
      });
    }
    const result = await updateRoomServiceQuantity(room_id, service_id, quantity);
    return res.status(200).json({
      success: true,
      message: 'Cập nhật số lượng dịch vụ thành công',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Cập nhật số lượng thất bại',
    });
  }
};
