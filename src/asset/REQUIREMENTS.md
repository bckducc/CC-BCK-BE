# Yêu cầu Hệ thống

> **Dự án:** BCK Manager — Hệ thống Quản lý Chung Cư Mini

---

## Yêu cầu chức năng

| ID | Tên |
|----|-----|
| FR-001 | Đăng nhập |
| FR-002 | Đăng xuất |
| FR-003 | Xem thông tin cá nhân |
| FR-004 | Cập nhật thông tin cá nhân |
| FR-005 | Tạo tài khoản người thuê |
| FR-006 | Tìm kiếm người thuê |
| FR-007 | Vô hiệu hóa / kích hoạt tài khoản |
| FR-008 | Tạo phòng mới |
| FR-009 | Tìm kiếm phòng |
| FR-010 | Cập nhật thông tin phòng |
| FR-011 | Xóa phòng |
| FR-012 | Xem phòng đang thuê |
| FR-013 | Tạo hợp đồng thuê |
| FR-014 | Tìm kiếm hợp đồng |
| FR-015 | Xem chi tiết hợp đồng |
| FR-016 | Kết thúc hợp đồng |
| FR-017 | Tạo dịch vụ |
| FR-018 | Tìm kiếm dịch vụ |
| FR-019 | Cập nhật dịch vụ |
| FR-020 | Xóa dịch vụ |
| FR-021 | Gán dịch vụ vào phòng |
| FR-022 | Nhập chỉ số điện nước |
| FR-023 | Tìm kiếm lịch sử điện nước | --x
| FR-024 | Cấu hình đơn giá điện nước |
| FR-025 | Tạo hóa đơn tháng |
| FR-026 | Tìm kiếm hóa đơn |
| FR-027 | Xem chi tiết hóa đơn |
| FR-028 | Xác nhận thanh toán |
| FR-029 | Xuất hóa đơn |
| FR-030 | Xem Dashboard chủ nhà |
| FR-031 | Xem Dashboard người thuê |
---

## Yêu cầu phi chức năng

| ID | Lĩnh vực | Tên |
|----|---------|-----|
| NFR-001 | Hiệu năng | Thời gian phản hồi API ≤ 500ms |
| NFR-002 | Hiệu năng | Hỗ trợ ≥ 50 người dùng đồng thời |
| NFR-003 | Hiệu năng | Tối ưu sử dụng tài nguyên hệ thống |
| NFR-004 | Bảo mật | Mật khẩu hash bcrypt (salt ≥ 10) |
| NFR-005 | Bảo mật | JWT token có hiệu lực 7 ngày |
| NFR-006 | Bảo mật | Giới hạn truy cập ≥ 100 yêu cầu/phút/mỗi người dùng |
| NFR-007 | Bảo mật | Kiểm tra dữ liệu đầu vào đầy đủ |
| NFR-008 | Bảo mật | Sử dụng câu truy vấn tham số (chống SQL injection) |
| NFR-009 | Tính khả dụng | Thời gian hoạt động ≥ 99.5% |
| NFR-010 | Độ tin cậy | Tỷ lệ lỗi ≤ 0.1% |
| NFR-011 | Tính khả dụng cho người dùng | API có phiên bản (`/api/v1/...`) |
| NFR-012 | Tính khả dụng cho người dùng | Phản hồi JSON có cấu trúc nhất quán |
| NFR-013 | Tính khả dụng cho người dùng | Phân trang trên tất cả danh sách |
| NFR-014 | Khả năng bảo trì | Độ phủ kiểm thử đơn vị ≥ 70% |
| NFR-015 | Tính tương thích | Node.js v16+, MySQL 5.7+ |
| NFR-016 | Quy định và tuân thủ | Sao lưu dữ liệu hàng ngày, giữ 30 ngày |
