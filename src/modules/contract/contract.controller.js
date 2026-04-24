import { createContract, getContracts, getContractById, getContractByTenant, terminateContract } from './contract.service.js';

export const addContract = async (req, res) => {
  try {
    const landlordUserId = req.user.id;
    const { tenant_id, room_id, start_date, end_date, deposit_amount, monthly_rent } = req.body;

    if (!tenant_id || !room_id || !start_date || !end_date || !deposit_amount || !monthly_rent) {
      return res.status(400).json({
        success: false,
        message: 'Người thuê, phòng, ngày bắt đầu, ngày kết thúc, tiền cọc và tiền thuê là bắt buộc',
      });
    }

    const contract = await createContract(req.body, landlordUserId);

    return res.status(201).json({
      success: true,
      message: 'Tạo hợp đồng thành công',
      data: contract,
    });
  } catch (error) {
    console.error('Create contract error:', {
      type: 'VALIDATION_ERROR',
      field: 'contract',
      value: req.body,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Tạo hợp đồng thất bại',
    });
  }
};

export const listContracts = async (req, res) => {
  try {
    const landlordUserId = req.user.id;
    const { status, tenant_id, room_id, search, page = 1, limit = 20 } = req.query;

    const filters = { status, tenant_id, room_id, search };
    const contracts = await getContracts(filters, landlordUserId);

    const start = (page - 1) * limit;
    const paginatedContracts = contracts.slice(start, start + parseInt(limit));

    return res.status(200).json({
      success: true,
      data: paginatedContracts,
      total: contracts.length,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('List contracts error:', {
      type: 'LIST_CONTRACTS_ERROR',
      userId: req.user?.id,
      filters: req.query,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Không tải được danh sách hợp đồng',
    });
  }
};

export const getContract = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordUserId = req.user.id;

    const contract = await getContractById(id, landlordUserId);

    return res.status(200).json({
      success: true,
      data: contract,
    });
  } catch (error) {
    console.error('Get contract error:', {
      type: 'GET_CONTRACT_ERROR',
      contractId: req.params.id,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy hợp đồng',
    });
  }
};

export const endContract = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordUserId = req.user.id;

    const result = await terminateContract(id, landlordUserId);

    return res.status(200).json({
      success: true,
      message: 'Kết thúc hợp đồng thành công',
      data: result,
    });
  } catch (error) {
    console.error('Terminate contract error:', {
      type: 'TERMINATE_CONTRACT_ERROR',
      contractId: req.params.id,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Kết thúc hợp đồng thất bại',
    });
  }
};

export const getMyContract = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'tenant') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ người thuê mới có thể xem hợp đồng của mình',
      });
    }

    const contract = await getContractByTenant(userId);

    return res.status(200).json({
      success: true,
      data: contract,
    });
  } catch (error) {
    console.error('Get my contract error:', {
      type: 'GET_MY_CONTRACT_ERROR',
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy hợp đồng',
    });
  }
};
