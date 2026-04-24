import {
  getNotificationsByUser,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from './notification.service.js';

export const listNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { is_read, type, limit = 50 } = req.query;

    const notifications = await getNotificationsByUser(userId, { is_read, type, limit });

    return res.status(200).json({
      success: true,
      data: notifications,
      total: notifications.length,
    });
  } catch (error) {
    console.error('List notifications error:', {
      type: 'LIST_NOTIFICATIONS_ERROR',
      userId: req.user?.id,
      filters: req.query,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Không tải được danh sách thông báo',
    });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await markAsRead(id, userId);

    return res.status(200).json({
      success: true,
      message: 'Đánh dấu đã đọc thành công',
      data: result,
    });
  } catch (error) {
    console.error('Mark read error:', {
      type: 'MARK_READ_ERROR',
      notificationId: req.params.id,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Đánh dấu thất bại',
    });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await markAllAsRead(userId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Mark all read error:', {
      type: 'MARK_ALL_READ_ERROR',
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      message: 'Đánh dấu tất cả thất bại',
    });
  }
};

export const removeNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await deleteNotification(id, userId);

    return res.status(200).json({
      success: true,
      message: 'Xóa thông báo thành công',
    });
  } catch (error) {
    console.error('Delete notification error:', {
      type: 'DELETE_NOTIFICATION_ERROR',
      notificationId: req.params.id,
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Xóa thất bại',
    });
  }
};
