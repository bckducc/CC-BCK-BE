import pool from '../config/database.js';
import { synchronizeRoomStatuses } from './roomService.js';

export const getLandlordDashboard = async (landlordId) => {
  const connection = await pool.getConnection();
  
  try {
    await synchronizeRoomStatuses(connection, landlordId);

    const [rooms] = await connection.query(
      `SELECT id, room_number, floor, area, price, status, description, created_at
       FROM rooms
       WHERE owner_id = ?
       ORDER BY room_number ASC`,
      [landlordId]
    );

    const [roomsStats] = await connection.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'rented' THEN 1 ELSE 0 END) as rented,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance
       FROM rooms WHERE owner_id = ?`,
      [landlordId]
    );

    const [contractsStats] = await connection.query(
      `SELECT COUNT(*) as active_contracts
       FROM contracts c
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE r.owner_id = ? AND c.status = 'active'`,
      [landlordId]
    );

    const [tenantsStats] = await connection.query(
      `SELECT COUNT(DISTINCT c.tenant_id) as total_tenants
       FROM contracts c
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE r.owner_id = ? AND c.status = 'active'`,
      [landlordId]
    );

    const [unpaidStats] = await connection.query(
      `SELECT
         COUNT(*) as unpaid_invoices,
         COALESCE(SUM(outstanding.remaining_amount), 0) as unpaid_amount
       FROM (
         SELECT GREATEST(i.final_amount - COALESCE(p.total_paid, 0), 0) as remaining_amount
         FROM invoices i
         INNER JOIN contracts c ON i.contract_id = c.id
         INNER JOIN rooms r ON c.room_id = r.id
         LEFT JOIN (
           SELECT invoice_id, SUM(amount) as total_paid
           FROM payments
           GROUP BY invoice_id
         ) p ON p.invoice_id = i.id
         WHERE r.owner_id = ? AND i.status IN ('pending', 'overdue')
       ) outstanding
       WHERE outstanding.remaining_amount > 0`,
      [landlordId]
    );

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const monthStart = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    const nextMonthStart = `${nextMonthYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const [revenueStats] = await connection.query(
      `SELECT COALESCE(SUM(p.amount), 0) as monthly_revenue
       FROM payments p
       INNER JOIN invoices i ON p.invoice_id = i.id
       INNER JOIN contracts c ON i.contract_id = c.id
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE r.owner_id = ? AND p.payment_date >= ? AND p.payment_date < ?`,
      [landlordId, monthStart, nextMonthStart]
    );

    const [recentInvoices] = await connection.query(
      `SELECT i.*, r.room_number, t.full_name as tenant_name
       FROM invoices i
       INNER JOIN contracts c ON i.contract_id = c.id
       INNER JOIN rooms r ON c.room_id = r.id
       INNER JOIN \`tenant\` t ON c.tenant_id = t.user_id
       WHERE r.owner_id = ?
       ORDER BY i.created_at DESC
       LIMIT 6`,
      [landlordId]
    );

    return {
      rooms: {
        total: Number(roomsStats[0].total || 0),
        available: Number(roomsStats[0].available || 0),
        rented: Number(roomsStats[0].rented || 0),
        maintenance: Number(roomsStats[0].maintenance || 0),
        list: rooms,
      },
      contracts: {
        active: Number(contractsStats[0].active_contracts || 0),
      },
      tenants: {
        total: Number(tenantsStats[0].total_tenants || 0),
      },
      invoices: {
        unpaid_count: Number(unpaidStats[0].unpaid_invoices || 0),
        monthly_revenue: Number(revenueStats[0].monthly_revenue || 0),
        unpaid_amount: Number(unpaidStats[0].unpaid_amount || 0),
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
    const [tenantInfo] = await connection.query(
      'SELECT * FROM \`tenant\` WHERE user_id = ?',
      [tenantUserId]
    );

    if (tenantInfo.length === 0) {
      throw new Error('Không tìm thấy thông tin người thuê');
    }

    const tenant = tenantInfo[0];

    const [contractInfo] = await connection.query(
      `SELECT c.*, r.room_number, r.floor, r.area, r.price as room_price
       FROM contracts c
       INNER JOIN rooms r ON c.room_id = r.id
       WHERE c.tenant_id = ? AND c.status = 'active'`,
      [tenant.user_id]
    );

    const activeContract = contractInfo.length > 0 ? contractInfo[0] : null;

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

    const [notifStats] = await connection.query(
      'SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [tenantUserId]
    );

    return {
      profile: {
        id: tenant.user_id,
        full_name: tenant.full_name,
        phone: tenant.phone,
        address: tenant.address,
      },
      contract: activeContract ? {
        id: activeContract.id,
        room_number: activeContract.room_number,
        floor: activeContract.floor,
        area: activeContract.area,
        monthly_price: activeContract.monthly_rent,
        start_date: activeContract.start_date,
        end_date: activeContract.end_date,
      } : null,
      invoice: currentInvoice ? {
        id: currentInvoice.id,
        month: currentInvoice.month,
        year: currentInvoice.year,
        total: currentInvoice.final_amount,
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
