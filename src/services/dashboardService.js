import pool from '../config/database.js';

export const getLandlordDashboard = async (landlordId) => {
  const connection = await pool.getConnection();
  
  try {
    // Total rooms
    const [roomsStats] = await connection.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'rented' THEN 1 ELSE 0 END) as rented,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance
       FROM rooms WHERE landlord_id = ?`,
      [landlordId]
    );

    // Active contracts
    const [contractsStats] = await connection.query(
      `SELECT COUNT(*) as active_contracts
       FROM contracts c
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE r.landlord_id = ? AND c.status = 'active'`,
      [landlordId]
    );

    // Total tenants
    const [tenantsStats] = await connection.query(
      `SELECT COUNT(*) as total_tenants
       FROM tenant t
       INNER JOIN users u ON t.user_id = u.id
       WHERE u.is_active = TRUE`
    );

    // Unpaid invoices count
    const [unpaidStats] = await connection.query(
      `SELECT COUNT(*) as unpaid_invoices
       FROM invoices i
       INNER JOIN contracts c ON i.contract_id = c.id
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE r.landlord_id = ? AND i.status = 'unpaid'`,
      [landlordId]
    );

    // Monthly revenue (current month)
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [revenueStats] = await connection.query(
      `SELECT COALESCE(SUM(i.total), 0) as monthly_revenue
       FROM invoices i
       INNER JOIN contracts c ON i.contract_id = c.id
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE r.landlord_id = ? AND i.month = ? AND i.year = ? AND i.status = 'paid'`,
      [landlordId, currentMonth, currentYear]
    );

    // Unpaid amount
    const [unpaidAmountStats] = await connection.query(
      `SELECT COALESCE(SUM(i.total), 0) as unpaid_amount
       FROM invoices i
       INNER JOIN contracts c ON i.contract_id = c.id
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE r.landlord_id = ? AND i.status = 'unpaid'`,
      [landlordId]
    );

    // Recent invoices (last 5)
    const [recentInvoices] = await connection.query(
      `SELECT i.*, r.room_number, t.full_name as tenant_name
       FROM invoices i
       INNER JOIN contracts c ON i.contract_id = c.id
       INNER JOIN rooms r ON c.room_id = r.id
       INNER JOIN tenant t ON c.tenant_id = t.id
       WHERE r.landlord_id = ?
       ORDER BY i.created_at DESC
       LIMIT 5`,
      [landlordId]
    );

    return {
      rooms: {
        total: roomsStats[0].total || 0,
        available: roomsStats[0].available || 0,
        rented: roomsStats[0].rented || 0,
        maintenance: roomsStats[0].maintenance || 0,
      },
      contracts: {
        active: contractsStats[0].active_contracts || 0,
      },
      tenants: {
        total: tenantsStats[0].total_tenants || 0,
      },
      invoices: {
        unpaid_count: unpaidStats[0].unpaid_invoices || 0,
        monthly_revenue: revenueStats[0].monthly_revenue || 0,
        unpaid_amount: unpaidAmountStats[0].unpaid_amount || 0,
      },
      recent_invoices: recentInvoices,
    };
  } finally {
    connection.release();
  }
};

export const getTenantDashboard = async (tenantUserId) => {
  const connection = await pool.getConnection();
  
  try {
    // Get tenant info
    const [tenantInfo] = await connection.query(
      'SELECT * FROM tenant WHERE user_id = ?',
      [tenantUserId]
    );

    if (tenantInfo.length === 0) {
      throw new Error('Không tìm thấy thông tin người thuê');
    }

    const tenant = tenantInfo[0];

    // Get active contract
    const [contractInfo] = await connection.query(
      `SELECT c.*, r.room_number, r.floor, r.area, r.price as room_price
       FROM contracts c
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE c.tenant_id = ? AND c.status = 'active'`,
      [tenant.id]
    );

    const activeContract = contractInfo.length > 0 ? contractInfo[0] : null;

    // Get current month invoice
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    let currentInvoice = null;
    if (activeContract) {
      const [invoiceInfo] = await connection.query(
        'SELECT * FROM invoices WHERE contract_id = ? AND month = ? AND year = ?',
        [activeContract.id, currentMonth, currentYear]
      );

      currentInvoice = invoiceInfo.length > 0 ? invoiceInfo[0] : null;
    }

    // Get unread notifications count
    const [notifStats] = await connection.query(
      'SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [tenantUserId]
    );

    return {
      profile: {
        id: tenant.id,
        full_name: tenant.full_name,
        phone: tenant.phone,
        address: tenant.address,
      },
      contract: activeContract ? {
        id: activeContract.id,
        room_number: activeContract.room_number,
        floor: activeContract.floor,
        area: activeContract.area,
        monthly_price: activeContract.monthly_price,
        start_date: activeContract.start_date,
        end_date: activeContract.end_date,
      } : null,
      invoice: currentInvoice ? {
        id: currentInvoice.id,
        month: currentInvoice.month,
        year: currentInvoice.year,
        total: currentInvoice.total,
        status: currentInvoice.status,
        due_date: currentInvoice.due_date,
      } : null,
      notifications: {
        unread_count: notifStats[0].unread || 0,
      },
    };
  } finally {
    connection.release();
  }
};