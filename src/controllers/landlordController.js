import { updateLandlordProfile } from '../services/landlordService.js';

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const landlordData = req.body;

    const updatedLandlord = await updateLandlordProfile(userId, landlordData);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin cá nhân thành công',
      data: updatedLandlord,
    });
  } catch (error) {
    console.error('Error in updateLandlordProfile controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật thông tin cá nhân',
    });
  }
};
