import pool from '../../config/database.js';
import {
  createTenant,
  getAllTenants,
  searchTenants,
  getTenantById,
  toggleTenantStatus,
  updateTenant,
} from './tenant.service.js';
import { getUserWithTenantInfo } from '../auth/auth.service.js';

export const createNewTenant = async (req, res) => {
  try {
    const landlordId = req.user.landlord_id;
    const { username, password, full_name } = req.body;

    if (!username || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập, mật khẩu và họ tên là bắt buộc',
      });
    }

    const tenant = await createTenant(req.body, landlordId);

    return res.status(201).json({
      success: true,
      message: 'Tạo tài khoản người thuê thành công',
      data: {
        id: tenant.id,
        username: tenant.username,
        full_name: tenant.full_name,
        phone: tenant.phone,
      },
    });
  } catch (error) {
    console.error('Create tenant error:', {
      type: 'VALIDATION_ERROR',
      field: 'tenant',
      value: { username: req.body.username, full_name: req.body.full_name },
      userId: req.user?.id,
      landlordId: req.user?.landlord_id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Tạo người thuê thất bại',
    });
  }
};

export const listTenants = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const { search, is_active, has_active_contract, page = 1, limit = 20 } = req.query;
    const filters = { is_active, has_active_contract };

    let tenants;
    if (search) {
      tenants = await searchTenants(search, landlordId, filters);
    } else {
      tenants = await getAllTenants(landlordId, filters);
    }

    const start = (page - 1) * limit;
    const paginatedTenants = tenants.slice(start, start + parseInt(limit));

    return res.status(200).json({
      success: true,
      data: paginatedTenants,
      total: tenants.length,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('List tenants error:', {
      type: 'LIST_TENANTS_ERROR',
      userId: req.user?.id,
      landlordId: req.user?.landlord_id,
      filters: req.query,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Không tải được danh sách người thuê',
    });
  }
};

export const getTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await getTenantById(id);

    return res.status(200).json({
      success: true,
      data: tenant,
    });
  } catch (error) {
    console.error('Get tenant error:', {
      type: 'GET_TENANT_ERROR',
      tenantId: req.params.id,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy người thuê',
    });
  }
};

export const changeTenantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await toggleTenantStatus(id);

    return res.status(200).json({
      success: true,
      message: result.is_active ? 'Mở khóa tài khoản thành công' : 'Khóa tài khoản thành công',
      data: result,
    });
  } catch (error) {
    console.error('Toggle tenant status error:', {
      type: 'TOGGLE_TENANT_STATUS_ERROR',
      tenantId: req.params.id,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Thay đổi trạng thái thất bại',
    });
  }
};

export const editTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await updateTenant(id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: tenant,
    });
  } catch (error) {
    console.error('Update tenant error:', {
      type: 'VALIDATION_ERROR',
      field: 'tenant',
      tenantId: req.params.id,
      value: req.body,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Cập nhật thất bại',
    });
  }
};

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

export const updateTenantProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, identity_card, birthday, gender, address } = req.body;

    if (!full_name) {
      return res.status(400).json({
        success: false,
        message: 'Tên đầy đủ là bắt buộc',
      });
    }

    const connection = await pool.getConnection();

    try {
      await connection.query(
        `UPDATE tenant SET full_name = ?, phone = ?, identity_card = ?, birthday = ?, gender = ?, address = ? WHERE user_id = ?`,
        [full_name, phone || null, identity_card || null, birthday || null, gender || null, address || null, userId]
      );

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
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update tenant profile error:', {
      type: 'VALIDATION_ERROR',
      field: 'tenant_profile',
      value: req.body,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Cập nhật thông tin thất bại',
    });
  }
};
