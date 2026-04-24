import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  assignServiceToRoom,
  removeServiceFromRoom,
  getRoomServices,
  updateRoomServicePrice,
} from './service.service.js';

export const addService = async (req, res) => {
  try {
    const landlordId = req.user.landlord_id;
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Tên dịch vụ và đơn giá là bắt buộc',
      });
    }

    const service = await createService(req.body, landlordId);

    return res.status(201).json({
      success: true,
      message: 'Tạo dịch vụ thành công',
      data: service,
    });
  } catch (error) {
    console.error('Create service error:', {
      type: 'VALIDATION_ERROR',
      field: 'service',
      value: req.body,
      userId: req.user?.id,
      landlordId: req.user?.landlord_id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Tạo dịch vụ thất bại',
    });
  }
};

export const listServices = async (req, res) => {
  try {
    const landlordId = req.user.landlord_id;
    const services = await getAllServices(landlordId);

    return res.status(200).json({
      success: true,
      data: services,
      total: services.length,
    });
  } catch (error) {
    console.error('List services error:', {
      type: 'LIST_SERVICES_ERROR',
      userId: req.user?.id,
      landlordId: req.user?.landlord_id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Không tải được danh sách dịch vụ',
    });
  }
};

export const getService = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordId = req.user.landlord_id;

    const service = await getServiceById(id, landlordId);

    return res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error('Get service error:', {
      type: 'GET_SERVICE_ERROR',
      serviceId: req.params.id,
      userId: req.user?.id,
      landlordId: req.user?.landlord_id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy dịch vụ',
    });
  }
};

export const editService = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordId = req.user.landlord_id;

    const service = await updateService(id, req.body, landlordId);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật dịch vụ thành công',
      data: service,
    });
  } catch (error) {
    console.error('Update service error:', {
      type: 'VALIDATION_ERROR',
      field: 'service',
      serviceId: req.params.id,
      value: req.body,
      userId: req.user?.id,
      landlordId: req.user?.landlord_id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Cập nhật dịch vụ thất bại',
    });
  }
};

export const removeService = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordId = req.user.landlord_id;

    await deleteService(id, landlordId);

    return res.status(200).json({
      success: true,
      message: 'Xóa dịch vụ thành công',
    });
  } catch (error) {
    console.error('Delete service error:', {
      type: 'DELETE_SERVICE_ERROR',
      serviceId: req.params.id,
      userId: req.user?.id,
      landlordId: req.user?.landlord_id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Xóa dịch vụ thất bại',
    });
  }
};

export const assignService = async (req, res) => {
  try {
    const landlordId = req.user.landlord_id;
    const { room_id, service_id, custom_price } = req.body;

    if (!room_id || !service_id) {
      return res.status(400).json({
        success: false,
        message: 'Phòng và dịch vụ là bắt buộc',
      });
    }

    const result = await assignServiceToRoom(room_id, service_id, landlordId, custom_price);

    return res.status(201).json({
      success: true,
      message: 'Gán dịch vụ vào phòng thành công',
      data: result,
    });
  } catch (error) {
    console.error('Assign service error:', {
      type: 'VALIDATION_ERROR',
      field: 'service_assignment',
      value: req.body,
      userId: req.user?.id,
      landlordId: req.user?.landlord_id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Gán dịch vụ thất bại',
    });
  }
};

export const getRoomServiceList = async (req, res) => {
  try {
    const { room_id } = req.params;
    const landlordId = req.user.landlord_id;

    const services = await getRoomServices(room_id, landlordId);

    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error('Get room services error:', {
      type: 'GET_ROOM_SERVICES_ERROR',
      roomId: req.params.room_id,
      userId: req.user?.id,
      landlordId: req.user?.landlord_id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Không tải được danh sách dịch vụ của phòng',
    });
  }
};

export const removeServiceFromRoomHandler = async (req, res) => {
  try {
    const { room_id, service_id } = req.params;
    const landlordId = req.user.landlord_id;

    await removeServiceFromRoom(room_id, service_id, landlordId);

    return res.status(200).json({
      success: true,
      message: 'Gỡ dịch vụ khỏi phòng thành công',
    });
  } catch (error) {
    console.error('Remove service from room error:', {
      type: 'REMOVE_SERVICE_FROM_ROOM_ERROR',
      roomId: req.params.room_id,
      serviceId: req.params.service_id,
      userId: req.user?.id,
      landlordId: req.user?.landlord_id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Gỡ dịch vụ thất bại',
    });
  }
};

export const updateRoomServicePriceHandler = async (req, res) => {
  try {
    const { room_id, service_id } = req.params;
    const landlordId = req.user.landlord_id;
    const { custom_price } = req.body;

    if (custom_price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Giá dịch vụ là bắt buộc',
      });
    }

    const result = await updateRoomServicePrice(room_id, service_id, landlordId, custom_price);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật giá dịch vụ thành công',
      data: result,
    });
  } catch (error) {
    console.error('Update room service price error:', {
      type: 'VALIDATION_ERROR',
      field: 'room_service_price',
      roomId: req.params.room_id,
      serviceId: req.params.service_id,
      value: req.body.custom_price,
      userId: req.user?.id,
      landlordId: req.user?.landlord_id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Cập nhật giá thất bại',
    });
  }
};
