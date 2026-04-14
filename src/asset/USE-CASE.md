# Đặc tả Use Case

> **Dự án:** BCK Manager — Hệ thống Quản lý Chung Cư Mini

---

## Danh sách Use Case

| Mã UC | Tên Use Case | Tác nhân |
|-------|-------------|----------|
| UC-01 | Đăng nhập | Chủ nhà, Người thuê |
| UC-02 | Đăng xuất | Chủ nhà, Người thuê |
| UC-03 | Xem thông tin cá nhân | Chủ nhà, Người thuê |
| UC-04 | Cập nhật thông tin cá nhân | Chủ nhà, Người thuê |
| UC-05 | Tạo tài khoản người thuê | Chủ nhà |
| UC-06 | Tìm kiếm người thuê | Chủ nhà |
| UC-07 | Vô hiệu hóa / kích hoạt tài khoản | Chủ nhà |
| UC-08 | Tạo phòng mới | Chủ nhà |
| UC-09 | Tìm kiếm phòng | Chủ nhà |
| UC-10 | Cập nhật thông tin phòng | Chủ nhà |
| UC-11 | Xóa phòng | Chủ nhà |
| UC-12 | Xem phòng đang thuê | Người thuê |
| UC-13 | Tạo hợp đồng thuê | Chủ nhà |
| UC-14 | Tìm kiếm hợp đồng | Chủ nhà, Người thuê |
| UC-15 | Xem chi tiết hợp đồng | Chủ nhà, Người thuê |
| UC-16 | Kết thúc hợp đồng | Chủ nhà |
| UC-17 | Tạo dịch vụ | Chủ nhà |
| UC-18 | Cập nhật dịch vụ | Chủ nhà |
| UC-19 | Xóa dịch vụ | Chủ nhà |
| UC-20 | Gán dịch vụ vào phòng | Chủ nhà |
| UC-21 | Nhập chỉ số điện nước | Chủ nhà |
| UC-22 | Tìm kiếm lịch sử điện nước | Chủ nhà, Người thuê | --x
| UC-23 | Cấu hình đơn giá điện nước | Chủ nhà |
| UC-24 | Tạo hóa đơn tháng | Chủ nhà |
| UC-25 | Tìm kiếm hóa đơn | Chủ nhà, Người thuê |
| UC-26 | Xem chi tiết hóa đơn | Chủ nhà, Người thuê |
| UC-27 | Xác nhận thanh toán | Chủ nhà |
| UC-28 | Xuất hóa đơn | Chủ nhà, Người thuê |
| UC-29 | Xem Dashboard chủ nhà | Chủ nhà |
| UC-30 | Xem Dashboard người thuê | Người thuê |
| UC-31 | Xem thông báo | Người thuê |
| UC-32 | Xem chi tiết phòng | Chủ nhà, Người thuê |

---

## UC-01: Đăng nhập

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-01 |
| **Tên Use Case** | Đăng nhập |
| **Tác nhân** | Chủ nhà, Người thuê |
| **Mục tiêu** | Xác thực danh tính người dùng để truy cập hệ thống |
| **Mô tả** | Người dùng nhập tên đăng nhập và mật khẩu để đăng nhập. Hệ thống kiểm tra thông tin, nếu đúng sẽ cho phép truy cập. |
| **Điều kiện tiên quyết** | Người dùng đã có tài khoản trong hệ thống. |
| **Điều kiện kích hoạt** | Người dùng nhấn nút "Đăng nhập". |
| **Luồng sự kiện chính** | 1. Người dùng nhập tên đăng nhập và mật khẩu. 2. Hệ thống kiểm tra tên đăng nhập có tồn tại không. 3. Hệ thống kiểm tra mật khẩu có đúng không. 4. Nếu đúng, hệ thống cho phép đăng nhập và hiển thị trang chủ tương ứng với vai trò. |
| **Luồng thay thế** | Tên đăng nhập không tồn tại → thông báo "Tên đăng nhập không đúng". Mật khẩu sai → thông báo "Mật khẩu không đúng". Tài khoản bị khóa → thông báo "Tài khoản đã bị khóa". Chưa nhập đủ thông tin → thông báo yêu cầu nhập đầy đủ. |
| **Quy tắc nghiệp vụ** | Mỗi lần đăng nhập sai, hệ thống ghi nhận. Sau 5 lần sai liên tiếp, tài khoản bị khóa tạm thời 15 phút. Phiên đăng nhập có hiệu lực 7 ngày. |
| **Hậu điều kiện** | Thành công: người dùng truy cập được hệ thống. Thất bại: người dùng ở lại trang đăng nhập, có thể thử lại. |

---

## UC-02: Đăng xuất

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-02 |
| **Tên Use Case** | Đăng xuất |
| **Tác nhân** | Chủ nhà, Người thuê |
| **Mục tiêu** | Kết thúc phiên làm việc, thoát khỏi hệ thống |
| **Mô tả** | Người dùng chủ động đăng xuất để kết thúc phiên sử dụng. |
| **Điều kiện tiên quyết** | Người dùng đã đăng nhập. |
| **Điều kiện kích hoạt** | Người dùng nhấn nút "Đăng xuất". |
| **Luồng sự kiện chính** | 1. Người dùng nhấn "Đăng xuất". 2. Hệ thống kết thúc phiên. 3. Hệ thống chuyển người dùng về trang đăng nhập. |
| **Luồng thay thế** | Không có. |
| **Quy tắc nghiệp vụ** | Hệ thống không lưu phiên phía server. |
| **Hậu điều kiện** | Người dùng phải đăng nhập lại để truy cập hệ thống. |

---

## UC-03: Xem thông tin cá nhân

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-03 |
| **Tên Use Case** | Xem thông tin cá nhân |
| **Tác nhân** | Chủ nhà, Người thuê |
| **Mục tiêu** | Xem thông tin cá nhân của tài khoản đang đăng nhập |
| **Mô tả** | Người dùng xem thông tin cá nhân của mình như họ tên, số điện thoại, vai trò trong hệ thống. |
| **Điều kiện tiên quyết** | Người dùng đã đăng nhập. |
| **Điều kiện kích hoạt** | Người dùng chọn mục "Thông tin cá nhân" trên menu. |
| **Luồng sự kiện chính** | 1. Người dùng chọn xem thông tin cá nhân. 2. Hệ thống hiển thị thông tin của tài khoản đang đăng nhập. |
| **Luồng thay thế** | Không có. |
| **Quy tắc nghiệp vụ** | Người dùng chỉ xem được thông tin của chính mình. |
| **Hậu điều kiện** | Thông tin cá nhân được hiển thị đầy đủ. |

---

## UC-04: Cập nhật thông tin cá nhân

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-04 |
| **Tên Use Case** | Cập nhật thông tin cá nhân |
| **Tác nhân** | Chủ nhà, Người thuê |
| **Mục tiêu** | Sửa thông tin cá nhân của tài khoản đang đăng nhập |
| **Mô tả** | Người dùng cập nhật các thông tin cá nhân như họ tên, số điện thoại, địa chỉ, số CCCD, ngày sinh. |
| **Điều kiện tiên quyết** | Người dùng đã đăng nhập. |
| **Điều kiện kích hoạt** | Người dùng nhấn "Sửa" trên trang thông tin cá nhân. |
| **Luồng sự kiện chính** | 1. Người dùng nhấn sửa thông tin. 2. Người dùng thay đổi các thông tin mong muốn. 3. Người dùng nhấn "Lưu". 4. Hệ thống cập nhật thông tin mới. 5. Hệ thống thông báo lưu thành công. |
| **Luồng thay thế** | Dữ liệu không hợp lệ → thông báo yêu cầu nhập đúng định dạng. Người dùng nhấn "Hủy" → quay lại trang xem thông tin, không lưu gì. |
| **Quy tắc nghiệp vụ** | Người dùng chỉ sửa được thông tin của chính mình. Một số trường bắt buộc phải có giá trị (họ tên). |
| **Hậu điều kiện** | Thông tin cá nhân được cập nhật mới. |

---

## UC-05: Tạo tài khoản người thuê

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-05 |
| **Tên Use Case** | Tạo tài khoản người thuê |
| **Tác nhân** | Chủ nhà |
| **Mục tiêu** | Tạo tài khoản mới cho người thuê trong hệ thống |
| **Mô tả** | Chủ nhà nhập thông tin để tạo tài khoản cho người thuê mới. Người thuê sau đó có thể đăng nhập và sử dụng hệ thống. |
| **Điều kiện tiên quyết** | Chủ nhà đã đăng nhập. |
| **Điều kiện kích hoạt** | Chủ nhà nhấn "Thêm người thuê". |
| **Luồng sự kiện chính** | 1. Chủ nhà nhấn "Thêm người thuê". 2. Chủ nhà nhập thông tin: tên đăng nhập, mật khẩu, họ tên, số điện thoại, số CCCD, ngày sinh, giới tính, địa chỉ. 3. Chủ nhà nhấn "Tạo". 4. Hệ thống tạo tài khoản mới. 5. Hệ thống thông báo tạo thành công kèm thông tin đăng nhập. |
| **Luồng thay thế** | Tên đăng nhập đã tồn tại → thông báo "Tên đăng nhập đã có người sử dụng". Thông tin chưa đầy đủ → thông báo yêu cầu nhập thêm. Chủ nhà chưa đăng nhập → chuyển về trang đăng nhập. |
| **Quy tắc nghiệp vụ** | Tên đăng nhập phải duy nhất trong hệ thống. Mật khẩu phải có ít nhất 6 ký tự. Tài khoản mới được kích hoạt ngay lập tức. |
| **Hậu điều kiện** | Tài khoản người thuê được tạo, có thể gán vào phòng. |

---

## UC-06: Tìm kiếm người thuê

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-06 |
| **Tên Use Case** | Tìm kiếm người thuê |
| **Tác nhân** | Chủ nhà |
| **Mục tiêu** | Tìm nhanh người thuê trong danh sách |
| **Mô tả** | Chủ nhà tìm kiếm người thuê theo tên, số điện thoại, số CCCD hoặc trạng thái tài khoản. |
| **Điều kiện tiên quyết** | Chủ nhà đã đăng nhập. |
| **Điều kiện kích hoạt** | Chủ nhà nhập từ khóa vào thanh tìm kiếm trên trang danh sách người thuê. |
| **Luồng sự kiện chính** | 1. Chủ nhà nhập từ khóa tìm kiếm (tên, số điện thoại, CCCD). 2. Hệ thống lọc danh sách người thuê theo từ khóa. 3. Hệ thống hiển thị kết quả phù hợp. |
| **Luồng thay thế** | Không có kết quả phù hợp → hiển thị thông báo "Không tìm thấy người thuê nào". |
| **Quy tắc nghiệp vụ** | Tìm kiếm không phân biệt hoa thường. Hệ thống hỗ trợ lọc theo trạng thái (đang thuê, chưa có phòng, đã khóa). |
| **Hậu điều kiện** | Danh sách người thuê được hiển thị theo kết quả tìm kiếm. |

---

## UC-07: Vô hiệu hóa / kích hoạt tài khoản

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-07 |
| **Tên Use Case** | Vô hiệu hóa / kích hoạt tài khoản |
| **Tác nhân** | Chủ nhà |
| **Mục tiêu** | Khóa hoặc mở khóa tài khoản người thuê |
| **Mô tả** | Chủ nhà có thể khóa tài khoản người thuê (không cho đăng nhập) hoặc mở khóa tài khoản đã bị khóa. |
| **Điều kiện tiên quyết** | Chủ nhà đã đăng nhập. |
| **Điều kiện kích hoạt** | Chủ nhà chọn người thuê → nhấn "Khóa" hoặc "Mở khóa". |
| **Luồng sự kiện chính** | 1. Chủ nhà chọn người thuê từ danh sách. 2. Chủ nhà nhấn "Khóa tài khoản" hoặc "Mở khóa". 3. Hệ thống thay đổi trạng thái tài khoản. 4. Hệ thống thông báo kết quả. |
| **Luồng thay thế** | Không có. |
| **Quy tắc nghiệp vụ** | Tài khoản bị khóa sẽ không thể đăng nhập. Hợp đồng của người thuê bị khóa vẫn còn hiệu lực. |
| **Hậu điều kiện** | Trạng thái tài khoản được cập nhật. |

---

## UC-08: Tạo phòng mới

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-08 |
| **Tên Use Case** | Tạo phòng mới |
| **Tác nhân** | Chủ nhà |
| **Mục tiêu** | Thêm phòng cho thuê vào hệ thống |
| **Mô tả** | Chủ nhà nhập thông tin để tạo một phòng mới trong danh sách phòng cho thuê. |
| **Điều kiện tiên quyết** | Chủ nhà đã đăng nhập. |
| **Điều kiện kích hoạt** | Chủ nhà nhấn "Thêm phòng". |
| **Luồng sự kiện chính** | 1. Chủ nhà nhấn "Thêm phòng". 2. Chủ nhà nhập thông tin: số phòng, tầng, diện tích, giá thuê tháng, tiền cọc, mô tả. 3. Chủ nhà nhấn "Tạo". 4. Hệ thống tạo phòng mới. 5. Hệ thống thông báo tạo thành công. |
| **Luồng thay thế** | Số phòng đã tồn tại → thông báo "Số phòng này đã có". Thông tin chưa đầy đủ → thông báo yêu cầu nhập thêm. Giá thuê hoặc tiền cọc là số âm → thông báo "Giá trị không hợp lệ". |
| **Quy tắc nghiệp vụ** | Số phòng phải duy nhất trong toàn hệ thống. Phòng mới tạo có trạng thái mặc định là "trống". |
| **Hậu điều kiện** | Phòng mới xuất hiện trong danh sách phòng với trạng thái "trống". |

---

## UC-09: Tìm kiếm phòng

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-09 |
| **Tên Use Case** | Tìm kiếm phòng |
| **Tác nhân** | Chủ nhà |
| **Mục tiêu** | Tìm nhanh phòng trong danh sách |
| **Mô tả** | Chủ nhà tìm kiếm phòng theo số phòng, tầng, khoảng giá hoặc trạng thái (trống, đang thuê, bảo trì). |
| **Điều kiện tiên quyết** | Chủ nhà đã đăng nhập. |
| **Điều kiện kích hoạt** | Chủ nhà nhập từ khóa hoặc chọn bộ lọc trên trang danh sách phòng. |
| **Luồng sự kiện chính** | 1. Chủ nhà nhập từ khóa hoặc chọn bộ lọc (trạng thái, tầng, khoảng giá). 2. Hệ thống lọc danh sách phòng theo điều kiện. 3. Hệ thống hiển thị kết quả phù hợp. |
| **Luồng thay thế** | Không có kết quả phù hợp → hiển thị thông báo "Không tìm thấy phòng nào". |
| **Quy tắc nghiệp vụ** | Có thể kết hợp nhiều điều kiện lọc cùng lúc. Kết quả tìm kiếm được phân trang nếu nhiều. |
| **Hậu điều kiện** | Danh sách phòng được hiển thị theo kết quả tìm kiếm. |

---

## UC-10: Cập nhật thông tin phòng

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-10 |
| **Tên Use Case** | Cập nhật thông tin phòng |
| **Tác nhân** | Chủ nhà |
| **Mục tiêu** | Sửa thông tin của phòng đã có |
| **Mô tả** | Chủ nhà thay đổi các thông tin như giá thuê, tiền cọc, mô tả, trạng thái của phòng. |
| **Điều kiện tiên quyết** | Chủ nhà đã đăng nhập. Phòng đã tồn tại trong hệ thống. |
| **Điều kiện kích hoạt** | Chủ nhà chọn phòng → nhấn "Sửa". |
| **Luồng sự kiện chính** | 1. Chủ nhà chọn phòng từ danh sách. 2. Chủ nhà nhấn "Sửa". 3. Chủ nhà thay đổi thông tin mong muốn. 4. Chủ nhà nhấn "Lưu". 5. Hệ thống cập nhật thông tin phòng. |
| **Luồng thay thế** | Giá thuê hoặc tiền cọc là số âm → thông báo "Giá trị không hợp lệ". |
| **Quy tắc nghiệp vụ** | Không được sửa số phòng nếu phòng đang có người thuê. |
| **Hậu điều kiện** | Thông tin phòng được cập nhật. Hóa đơn cũ không bị ảnh hưởng. |

---

## UC-11: Xóa phòng

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-11 |
| **Tên Use Case** | Xóa phòng |
| **Tác nhân** | Chủ nhà |
| **Mục tiêu** | Xóa phòng khỏi hệ thống |
| **Mô tả** | Chủ nhà xóa phòng không còn sử dụng khỏi hệ thống. |
| **Điều kiện tiên quyết** | Chủ nhà đã đăng nhập. Phòng đang ở trạng thái "trống" hoặc "bảo trì". |
| **Điều kiện kích hoạt** | Chủ nhà chọn phòng → nhấn "Xóa". |
| **Luồng sự kiện chính** | 1. Chủ nhà chọn phòng. 2. Chủ nhà nhấn "Xóa". 3. Hệ thống hiển thị hộp xác nhận. 4. Chủ nhà xác nhận xóa. 5. Hệ thống xóa phòng. |
| **Luồng thay thế** | Phòng đang có người thuê → thông báo "Phòng đang có người thuê, không thể xóa". Chủ nhà không xác nhận xóa → quay lại danh sách, không xóa. |
| **Quy tắc nghiệp vụ** | Chỉ phòng không có hợp đồng active mới được xóa. |
| **Hậu điều kiện** | Phòng không còn trong danh sách. |

---

## UC-12: Xem phòng đang thuê

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-12 |
| **Tên Use Case** | Xem phòng đang thuê |
| **Tác nhân** | Người thuê |
| **Mục tiêu** | Xem thông tin phòng mình đang thuê |
| **Mô tả** | Người thuê xem chi tiết phòng mình đang thuê như số phòng, tầng, diện tích, giá thuê. |
| **Điều kiện tiên quyết** | Người thuê đã đăng nhập và có hợp đồng đang hoạt động. |
| **Điều kiện kích hoạt** | Người thuê chọn "Phòng của tôi". |
| **Luồng sự kiện chính** | 1. Người thuê chọn xem phòng đang thuê. 2. Hệ thống tìm phòng liên kết với hợp đồng đang hoạt động. 3. Hệ thống hiển thị thông tin phòng. |
| **Luồng thay thế** | Người thuê chưa có hợp đồng nào → thông báo "Bạn chưa thuê phòng nào". |
| **Quy tắc nghiệp vụ** | Chỉ hiển thị thông tin phòng đang thuê. Không hiển thị thông tin phòng đã kết thúc thuê. |
| **Hậu điều kiện** | Thông tin phòng đang thuê được hiển thị. |

---

## UC-13: Tạo hợp đồng thuê

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-13 |
| **Tên Use Case** | Tạo hợp đồng thuê |
| **Tác nhân** | Chủ nhà |
| **Mục tiêu** | Gán người thuê vào phòng để bắt đầu cho thuê |
| **Mô tả** | Chủ nhà tạo hợp đồng thuê để gán một người thuê vào một phòng trống. Hợp đồng ghi nhận thời gian thuê, giá thuê và các điều khoản thanh toán. |
| **Điều kiện tiên quyết** | Chủ nhà đã đăng nhập. Đã có tài khoản người thuê và phòng trống. |
| **Điều kiện kích hoạt** | Chủ nhà nhấn "Tạo hợp đồng". |
| **Luồng sự kiện chính** | 1. Chủ nhà chọn người thuê từ danh sách. 2. Chủ nhà chọn phòng trống. 3. Chủ nhà nhập thông tin: ngày bắt đầu, ngày kết thúc, số tiền thuê tháng, tiền cọc, chu kỳ thanh toán. 4. Chủ nhà nhấn "Tạo". 5. Hệ thống tạo hợp đồng và cập nhật trạng thái phòng thành "đang thuê". 6. Hệ thống thông báo tạo thành công. |
| **Luồng thay thế** | Người thuê đã có hợp đồng đang hoạt động → thông báo "Người thuê này đã có phòng". Phòng không trống → thông báo "Phòng đã có người thuê". Ngày kết thúc trước ngày bắt đầu → thông báo "Ngày không hợp lệ". |
| **Quy tắc nghiệp vụ** | Mỗi người thuê chỉ thuê được tối đa một phòng tại một thời điểm. Mỗi phòng chỉ có một người thuê tại một thời điểm. |
| **Hậu điều kiện** | Hợp đồng được tạo, phòng chuyển sang trạng thái "đang thuê". |

---

## UC-14: Tìm kiếm hợp đồng

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-14 |
| **Tên Use Case** | Tìm kiếm hợp đồng |
| **Tác nhân** | Chủ nhà, Người thuê |
| **Mục tiêu** | Tìm nhanh hợp đồng trong danh sách |
| **Mô tả** | Người dùng tìm kiếm hợp đồng theo tên người thuê, số phòng, trạng thái (đang hoạt động, đã kết thúc). |
| **Điều kiện tiên quyết** | Người dùng đã đăng nhập. |
| **Điều kiện kích hoạt** | Người dùng nhập từ khóa hoặc chọn bộ lọc trên trang danh sách hợp đồng. |
| **Luồng sự kiện chính** | 1. Người dùng nhập từ khóa hoặc chọn bộ lọc. 2. Hệ thống lọc danh sách hợp đồng. 3. Hệ thống hiển thị kết quả. |
| **Luồng thay thế** | Không có kết quả phù hợp → thông báo "Không tìm thấy hợp đồng nào". Người thuê tìm kiếm → chỉ hiển thị hợp đồng của mình. |
| **Quy tắc nghiệp vụ** | Chủ nhà tìm được mọi hợp đồng. Người thuê chỉ tìm được hợp đồng của mình. |
| **Hậu điều kiện** | Danh sách hợp đồng được hiển thị theo kết quả tìm kiếm. |

---

## UC-15: Xem chi tiết hợp đồng

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-15 |
| **Tên Use Case** | Xem chi tiết hợp đồng |
| **Tác nhân** | Chủ nhà, Người thuê |
| **Mục tiêu** | Xem đầy đủ thông tin của một hợp đồng |
| **Mô tả** | Người dùng xem toàn bộ thông tin hợp đồng như thông tin người thuê, phòng, thời hạn, giá thuê, tiền cọc. |
| **Điều kiện tiên quyết** | Người dùng đã đăng nhập. Hợp đồng tồn tại. |
| **Điều kiện kích hoạt** | Người dùng chọn một hợp đồng từ danh sách. |
| **Luồng sự kiện chính** | 1. Người dùng chọn hợp đồng. 2. Hệ thống hiển thị chi tiết hợp đồng. |
| **Luồng thay thế** | Người thuê cố xem hợp đồng của người khác → không hiển thị, thông báo "Bạn không có quyền xem hợp đồng này". |
| **Quy tắc nghiệp vụ** | Người thuê chỉ xem được hợp đồng của mình. Chủ nhà xem được mọi hợp đồng. |
| **Hậu điều kiện** | Chi tiết hợp đồng được hiển thị đầy đủ. |

---

## UC-16: Kết thúc hợp đồng

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-16 |
| **Tên Use Case** | Kết thúc hợp đồng |
| **Tác nhân** | Chủ nhà |
| **Mục tiêu** | Chấm dứt hợp đồng thuê và giải phóng phòng |
| **Mô tả** | Chủ nhà đánh dấu kết thúc hợp đồng thuê. Hệ thống tự động giải phóng phòng để cho thuê tiếp. |
| **Điều kiện tiên quyết** | Chủ nhà đã đăng nhập. Hợp đồng đang ở trạng thái "đang hoạt động". |
| **Điều kiện kích hoạt** | Chủ nhà chọn hợp đồng → nhấn "Kết thúc hợp đồng". |
| **Luồng sự kiện chính** | 1. Chủ nhà chọn hợp đồng đang hoạt động. 2. Chủ nhà nhấn "Kết thúc". 3. Chủ nhà nhập ngày kết thúc thực tế và ghi chú (nếu có). 4. Chủ nhà nhấn "Xác nhận". 5. Hệ thống cập nhật hợp đồng thành "đã kết thúc". 6. Hệ thống giải phóng phòng, chuyển sang trạng thái "trống". 7. Hệ thống thông báo kết thúc thành công. |
| **Luồng thay thế** | Hợp đồng đã kết thúc rồi → thông báo "Hợp đồng này đã kết thúc". |
| **Quy tắc nghiệp vụ** | Phòng được tự động giải phóng sau khi kết thúc. |
| **Hậu điều kiện** | Hợp đồng có trạng thái "đã kết thúc", phòng trở về trạng thái "trống". |

---

## UC-17: Tạo dịch vụ

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-17 |
| **Tên Use Case** | Tạo dịch vụ |
| **Tác nhân** | Chủ nhà |
| **Mục tiêu** | Thêm dịch vụ kèm theo vào hệ thống |
| **Mô tả** | Chủ nhà tạo các dịch vụ đi kèm như internet, vệ sinh, gửi xe để gán cho phòng và tính vào hóa đơn. |
| **Điều kiện tiên quyết** | Chủ nhà đã đăng nhập. |
| **Điều kiện kích hoạt** | Chủ nhà nhấn "Thêm dịch vụ". |
| **Luồng sự kiện chính** | 1. Chủ nhà nhấn "Thêm dịch vụ". 2. Chủ nhà nhập thông tin: tên dịch vụ, mô tả, đơn giá, đơn vị (tháng, lần, xe). 3. Chủ nhà nhấn "Tạo". 4. Hệ thống tạo dịch vụ mới. |
| **Luồng thay thế** | Thông tin chưa đầy đủ → thông báo yêu cầu nhập thêm. Đơn giá là số âm → thông báo "Giá trị không hợp lệ". |
| **Quy tắc nghiệp vụ** | Dịch vụ mới được kích hoạt ngay khi tạo. |
| **Hậu điều kiện** | Dịch vụ mới xuất hiện trong danh sách dịch vụ. |

---

## UC-19: Cập nhật dịch vụ

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-19 |
| **Tên Use Case** | Cập nhật dịch vụ |
| **Tác nhân** | Chủ nhà |
| **Mục tiêu** | Sửa thông tin dịch vụ đã có |
| **Mô tả** | Chủ nhà thay đổi tên, mô tả, đơn giá của dịch vụ. |
| **Điều kiện tiên quyết** | Chủ nhà đã đăng nhập. Dịch vụ đã tồn tại. |
| **Điều kiện kích hoạt** | Chủ nhà chọn dịch vụ → nhấn "Sửa". |
| **Luồng sự kiện chính** | 1. Chủ nhà chọn dịch vụ. 2. Chủ nhà nhấn "Sửa". 3. Chủ nhà thay đổi thông tin. 4. Chủ nhà nhấn "Lưu". 5. Hệ thống cập nhật thông tin. |
| **Luồng thay thế** | Đơn giá là số âm → thông báo "Giá trị không hợp lệ". |
| **Quy tắc nghiệp vụ** | Thay đổi giá không ảnh hưởng hóa đơn đã tạo, chỉ ảnh hưởng hóa đơn mới. |
| **Hậu điều kiện** | Thông tin dịch vụ được cập nhật. |

---

## UC-20: Xóa dịch vụ

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-20 |
| **Tên Use Case** | Xóa dịch vụ |
| **Tác nhân** | Chủ nhà |
| **Mục tiêu** | Xóa dịch vụ không còn sử dụng |
| **Mô tả** | Chủ nhà xóa dịch vụ khỏi hệ thống. Các phòng đã gán dịch vụ này sẽ không còn bị tính phí dịch vụ đó từ tháng tiếp theo. |
| **Điều kiện tiên quyết** | Chủ nhà đã đăng nhập. |
| **Điều kiện kích hoạt** | Chủ nhà chọn dịch vụ → nhấn "Xóa". |
| **Luồng sự kiện chính** | 1. Chủ nhà chọn dịch vụ. 2. Chủ nhà nhấn "Xóa". 3. Hệ thống hiển thị hộp xác nhận. 4. Chủ nhà xác nhận. 5. Hệ thống xóa dịch vụ. |
| **Luồng thay thế** | Chủ nhà không xác nhận → quay lại, không xóa. |
| **Quy tắc nghiệp vụ** | Dịch vụ đang được gán cho phòng vẫn có thể xóa. Hóa đơn cũ không bị ảnh hưởng. |
| **Hậu điều kiện** | Dịch vụ không còn trong danh sách. |

---

## UC-21: Gán dịch vụ vào phòng

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-21 |
| **Tên Use Case** | Gán dịch vụ vào phòng |
| **Tác nhân** | Chủ nhà |
| **Mục tiêu** | Liên kết dịch vụ với phòng để tính vào hóa đơn |
| **Mô tả** | Chủ nhà gán dịch vụ đã có vào một phòng cụ thể. Dịch vụ này sẽ tự động xuất hiện trong hóa đơn hàng tháng của phòng đó. |
| **Điều kiện tiên quyết** | Chủ nhà đã đăng nhập. Dịch vụ đã tồn tại. Phòng đã tồn tại. |
| **Điều kiện kích hoạt** | Chủ nhà chọn phòng → nhấn "Gán dịch vụ". |
| **Luồng sự kiện chính** | 1. Chủ nhà chọn phòng cần gán. 2. Chủ nhà chọn dịch vụ từ danh sách. 3. Chủ nhà có thể đặt giá tùy chỉnh cho dịch vụ tại phòng này (nếu khác giá mặc định). 4. Chủ nhà nhấn "Lưu". 5. Hệ thống liên kết dịch vụ với phòng. |
| **Luồng thay thế** | Dịch vụ đã được gán cho phòng này rồi → thông báo "Dịch vụ này đã được gán cho phòng". |
| **Quy tắc nghiệp vụ** | Mỗi phòng có thể gán nhiều dịch vụ. Mỗi dịch vụ chỉ được gán một lần cho một phòng. |
| **Hậu điều kiện** | Dịch vụ xuất hiện trong hóa đơn hàng tháng của phòng đó. |

---

## UC-22: Nhập chỉ số điện nước

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-22 |
| **Tên Use Case** | Nhập chỉ số điện nước |
| **Tác nhân** | Chủ nhà |
| **Mục tiêu** | Ghi nhận chỉ số đồng hồ điện và nước hàng tháng |
| **Mô tả** | Chủ nhà nhập chỉ số đồng hồ điện và nước hàng tháng cho từng phòng. Hệ thống tự động tính lượng tiêu thụ dựa trên chỉ số tháng trước. |
| **Điều kiện tiên quyết** | Chủ nhà đã đăng nhập. Phòng có hợp đồng đang hoạt động. |
| **Điều kiện kích hoạt** | Chủ nhà chọn phòng → nhấn "Nhập điện nước". |
| **Luồng sự kiện chính** | 1. Chủ nhà chọn phòng. 2. Chủ nhà chọn tháng/năm cần nhập. 3. Hệ thống hiển thị chỉ số cũ của tháng trước (nếu có). 4. Chủ nhà nhập chỉ số mới: số kWh điện, số m³ nước. 5. Chủ nhà nhấn "Lưu". 6. Hệ thống tính lượng tiêu thụ và lưu lại. 7. Hệ thống hiển thị lượng tiêu thụ và số tiền tạm tính. |
| **Luồng thay thế** | Chỉ số mới nhỏ hơn chỉ số cũ → thông báo "Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ". Dữ liệu tháng này đã có → thông báo "Dữ liệu tháng này đã tồn tại". |
| **Quy tắc nghiệp vụ** | Mỗi phòng mỗi tháng chỉ có một bản ghi chỉ số. Chỉ số mới luôn lớn hơn hoặc bằng chỉ số cũ. |
| **Hậu điều kiện** | Chỉ số được lưu, sẵn sàng để tạo hóa đơn. |

---

## UC-23: Tìm kiếm lịch sử điện nước

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-23 |
| **Tên Use Case** | Tìm kiếm lịch sử điện nước |
| **Tác nhân** | Chủ nhà, Người thuê |
| **Mục tiêu** | Xem lịch sử chỉ số điện nước theo phòng và khoảng thời gian |
| **Mô tả** | Người dùng tra cứu lịch sử chỉ số điện nước theo phòng và khoảng thời gian. |
| **Điều kiện tiên quyết** | Người dùng đã đăng nhập. |
| **Điều kiện kích hoạt** | Người dùng chọn phòng và khoảng thời gian cần xem. |
| **Luồng sự kiện chính** | 1. Người dùng chọn phòng. 2. Người dùng chọn khoảng thời gian (từ tháng — đến tháng). 3. Hệ thống hiển thị danh sách chỉ số theo tháng. |
| **Luồng thay thế** | Không có dữ liệu trong khoảng thời gian → thông báo "Không có dữ liệu". |
| **Quy tắc nghiệp vụ** | Người thuê chỉ xem được phòng của mình. Chủ nhà xem được mọi phòng. |
| **Hậu điều kiện** | Lịch sử chỉ số điện nước được hiển thị. |

---

## UC-24: Cấu hình đơn giá điện nước

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-24 |
| **Tên Use Case** | Cấu hình đơn giá điện nước |
| **Tác nhân** | Chủ nhà |
| **Mục tiêu** | Thiết lập và thay đổi giá điện, giá nước và thuế VAT |
| **Mô tả** | Chủ nhà cấu hình đơn giá điện (tiền mỗi kWh), đơn giá nước (tiền mỗi m³) và tỷ lệ thuế VAT. |
| **Điều kiện tiên quyết** | Chủ nhà đã đăng nhập. |
| **Điều kiện kích hoạt** | Chủ nhà chọn "Cấu hình giá". |
| **Luồng sự kiện chính** | 1. Chủ nhà mở trang cấu hình. 2. Hệ thống hiển thị giá hiện tại. 3. Chủ nhà nhập giá điện mới, giá nước mới, %VAT. 4. Chủ nhà nhấn "Lưu". 5. Hệ thống cập nhật cấu hình. |
| **Luồng thay thế** | Giá là số âm → thông báo "Giá trị không hợp lệ". VAT lớn hơn 100% → thông báo "VAT không hợp lệ". |
| **Quy tắc nghiệp vụ** | Giá mới chỉ áp dụng cho hóa đơn từ tháng tiếp theo. Hóa đơn đã tạo không bị ảnh hưởng. |
| **Hậu điều kiện** | Cấu hình mới được lưu và áp dụng cho các hóa đơn tiếp theo. |

---

## UC-25: Tạo hóa đơn tháng

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-25 |
| **Tên Use Case** | Tạo hóa đơn tháng |
| **Tác nhân** | Chủ nhà |
| **Mục tiêu** | Tạo hóa đơn hàng tháng cho tất cả các phòng đang thuê |
| **Mô tả** | Hệ thống tự động tạo hóa đơn hàng tháng cho mỗi hợp đồng đang hoạt động. Hóa đơn bao gồm tiền phòng, tiền dịch vụ, tiền điện, tiền nước và thuế VAT. |
| **Điều kiện tiên quyết** | Chủ nhà đã đăng nhập. Đã nhập chỉ số điện nước cho tháng cần tạo. |
| **Điều kiện kích hoạt** | Chủ nhà nhấn "Tạo hóa đơn tháng". |
| **Luồng sự kiện chính** | 1. Chủ nhà chọn tháng/năm cần tạo hóa đơn. 2. Hệ thống lấy danh sách hợp đồng đang hoạt động. 3. Với mỗi hợp đồng, hệ thống tính: tiền phòng + tiền dịch vụ + tiền điện + tiền nước + VAT. 4. Hệ thống tạo hóa đơn cho từng hợp đồng. 5. Hệ thống thông báo số hóa đơn đã tạo. 6. Hệ thống gửi thông báo cho người thuê. |
| **Luồng thay thế** | Hóa đơn tháng này đã tồn tại → thông báo "Hóa đơn tháng này đã được tạo". Chưa nhập chỉ số điện nước → hệ thống tạo hóa đơn không có tiền điện nước và hiển thị cảnh báo. |
| **Quy tắc nghiệp vụ** | Mỗi hợp đồng mỗi tháng chỉ có một hóa đơn. Hạn thanh toán mặc định là ngày 5 hàng tháng. |
| **Hậu điều kiện** | Hóa đơn được tạo cho mỗi phòng đang thuê, có trạng thái "chưa thanh toán". |

---

## UC-26: Tìm kiếm hóa đơn

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-26 |
| **Tên Use Case** | Tìm kiếm hóa đơn |
| **Tác nhân** | Chủ nhà, Người thuê |
| **Mục tiêu** | Tìm nhanh hóa đơn theo tháng, trạng thái hoặc phòng |
| **Mô tả** | Người dùng tìm kiếm hóa đơn theo tháng/năm, trạng thái (đã thanh toán, chưa thanh toán, quá hạn) hoặc theo phòng. |
| **Điều kiện tiên quyết** | Người dùng đã đăng nhập. |
| **Điều kiện kích hoạt** | Người dùng nhập từ khóa hoặc chọn bộ lọc trên trang danh sách hóa đơn. |
| **Luồng sự kiện chính** | 1. Người dùng chọn bộ lọc (tháng, trạng thái, phòng). 2. Hệ thống hiển thị kết quả phù hợp. |
| **Luồng thay thế** | Không có kết quả phù hợp → thông báo "Không tìm thấy hóa đơn nào". |
| **Quy tắc nghiệp vụ** | Chủ nhà tìm được mọi hóa đơn. Người thuê chỉ tìm được hóa đơn của mình. |
| **Hậu điều kiện** | Danh sách hóa đơn được hiển thị theo kết quả tìm kiếm. |

---

## UC-27: Xem chi tiết hóa đơn

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-27 |
| **Tên Use Case** | Xem chi tiết hóa đơn |
| **Tác nhân** | Chủ nhà, Người thuê |
| **Mục tiêu** | Xem đầy đủ chi tiết một hóa đơn |
| **Mô tả** | Người dùng xem chi tiết hóa đơn bao gồm tiền phòng, tiền dịch vụ, tiền điện, tiền nước, VAT và tổng cộng. |
| **Điều kiện tiên quyết** | Người dùng đã đăng nhập. Hóa đơn tồn tại. |
| **Điều kiện kích hoạt** | Người dùng chọn một hóa đơn từ danh sách. |
| **Luồng sự kiện chính** | 1. Người dùng chọn hóa đơn. 2. Hệ thống hiển thị chi tiết hóa đơn: tháng, phòng, tiền phòng, tiền dịch vụ, tiền điện, tiền nước, VAT, tổng cộng, hạn thanh toán, trạng thái. |
| **Luồng thay thế** | Người thuê cố xem hóa đơn của người khác → không hiển thị, thông báo "Bạn không có quyền". |
| **Quy tắc nghiệp vụ** | Người thuê chỉ xem được hóa đơn của mình. |
| **Hậu điều kiện** | Chi tiết hóa đơn được hiển thị đầy đủ. |

---

## UC-28: Xác nhận thanh toán

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-28 |
| **Tên Use Case** | Xác nhận thanh toán |
| **Tác nhân** | Chủ nhà |
| **Mục tiêu** | Xác nhận đã nhận được thanh toán từ người thuê |
| **Mô tả** | Chủ nhà xác nhận một hóa đơn đã được thanh toán, ghi nhận ngày thanh toán thực tế và phương thức. |
| **Điều kiện tiên quyết** | Chủ nhà đã đăng nhập. Hóa đơn đang ở trạng thái "chưa thanh toán". |
| **Điều kiện kích hoạt** | Chủ nhà chọn hóa đơn → nhấn "Xác nhận thanh toán". |
| **Luồng sự kiện chính** | 1. Chủ nhà chọn hóa đơn. 2. Chủ nhà nhấn "Xác nhận thanh toán". 3. Chủ nhà nhập ngày thanh toán thực tế, phương thức (tiền mặt, chuyển khoản, khác), ghi chú (nếu có). 4. Chủ nhà nhấn "Xác nhận". 5. Hệ thống cập nhật hóa đơn thành "đã thanh toán". 6. Hệ thống gửi thông báo cho người thuê. |
| **Luồng thay thế** | Hóa đơn đã thanh toán → thông báo "Hóa đơn này đã được thanh toán". |
| **Quy tắc nghiệp vụ** | Mỗi hóa đơn chỉ xác nhận thanh toán một lần. |
| **Hậu điều kiện** | Hóa đơn có trạng thái "đã thanh toán", có đầy đủ thông tin thanh toán. |

---

## UC-29: Xuất hóa đơn

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-29 |
| **Tên Use Case** | Xuất hóa đơn |
| **Tác nhân** | Chủ nhà, Người thuê |
| **Mục tiêu** | In hoặc tải hóa đơn dưới dạng file |
| **Mô tả** | Người dùng xuất hóa đơn thành file để in hoặc gửi cho người khác. |
| **Điều kiện tiên quyết** | Người dùng đã đăng nhập. Hóa đơn tồn tại. |
| **Điều kiện kích hoạt** | Người dùng chọn hóa đơn → nhấn "Xuất hóa đơn". |
| **Luồng sự kiện chính** | 1. Người dùng chọn hóa đơn. 2. Người dùng nhấn "Xuất hóa đơn". 3. Hệ thống tạo file hóa đơn. 4. Trình duyệt mở hộp thoại tải file hoặc hiển thị bản in. |
| **Luồng thay thế** | Không có. |
| **Quy tắc nghiệp vụ** | File hóa đơn có đầy đủ thông tin người thuê, phòng, chi tiết các khoản, tổng cộng và thông tin chủ nhà. |
| **Hậu điều kiện** | File hóa đơn được tạo và người dùng có thể in hoặc tải về. |

---

## UC-30: Xem Dashboard chủ nhà

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-30 |
| **Tên Use Case** | Xem Dashboard chủ nhà |
| **Tác nhân** | Chủ nhà |
| **Mục tiêu** | Xem tổng quan tình trạng toàn bộ hệ thống |
| **Mô tả** | Chủ nhà xem bảng tổng quan gồm: tổng số phòng, số phòng trống, số phòng đang thuê, doanh thu tháng, số hóa đơn chưa thanh toán, số người thuê mới. |
| **Điều kiện tiên quyết** | Chủ nhà đã đăng nhập. |
| **Điều kiện kích hoạt** | Chủ nhà đăng nhập thành công hoặc nhấn "Tổng quan". |
| **Luồng sự kiện chính** | 1. Chủ nhà mở Dashboard. 2. Hệ thống tổng hợp dữ liệu: số phòng theo trạng thái, doanh thu, hóa đơn, người thuê. 3. Hệ thống hiển thị Dashboard. |
| **Luồng thay thế** | Không có. |
| **Quy tắc nghiệp vụ** | Dữ liệu Dashboard cập nhật theo thời gian thực. |
| **Hậu điều kiện** | Dashboard hiển thị đầy đủ thông tin tổng quan. |

---

## UC-31: Xem Dashboard người thuê

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-31 |
| **Tên Use Case** | Xem Dashboard người thuê |
| **Tác nhân** | Người thuê |
| **Mục tiêu** | Xem tổng quan tình trạng thuê của mình |
| **Mô tả** | Người thuê xem bảng tổng quan gồm: thông tin phòng đang thuê, hóa đơn tháng này, thông báo mới chưa đọc, thông tin hợp đồng. |
| **Điều kiện tiên quyết** | Người thuê đã đăng nhập. |
| **Điều kiện kích hoạt** | Người thuê đăng nhập thành công hoặc nhấn "Trang chủ". |
| **Luồng sự kiện chính** | 1. Người thuê mở Dashboard. 2. Hệ thống lấy thông tin: phòng đang thuê, hóa đơn tháng này, thông báo mới. 3. Hệ thống hiển thị Dashboard. |
| **Luồng thay thế** | Người thuê chưa có hợp đồng → hiển thị thông báo "Bạn chưa thuê phòng nào". |
| **Quy tắc nghiệp vụ** | Chỉ hiển thị dữ liệu liên quan đến người thuê đang đăng nhập. |
| **Hậu điều kiện** | Dashboard hiển thị đầy đủ thông tin tổng quan của người thuê. |

---

## UC-32: Xem thông báo

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-32 |
| **Tên Use Case** | Xem thông báo |
| **Tác nhân** | Người thuê |
| **Mục tiêu** | Xem danh sách thông báo nhắc thanh toán và thông báo khác |
| **Mô tả** | Người thuê xem danh sách thông báo từ hệ thống, bao gồm thông báo hóa đơn mới, nhắc thanh toán, thông báo hợp đồng. |
| **Điều kiện tiên quyết** | Người thuê đã đăng nhập. |
| **Điều kiện kích hoạt** | Người thuê nhấn biểu tượng thông báo hoặc chọn "Thông báo". |
| **Luồng sự kiện chính** | 1. Người thuê mở trang thông báo. 2. Hệ thống lấy danh sách thông báo của người thuê. 3. Hệ thống hiển thị danh sách, thông báo chưa đọc hiển thị ưu tiên phía trên. |
| **Luồng thay thế** | Không có thông báo nào → hiển thị thông báo "Bạn không có thông báo nào". |
| **Quy tắc nghiệp vụ** | Thông báo được sắp xếp theo thời gian mới nhất. |
| **Hậu điều kiện** | Danh sách thông báo được hiển thị. |

---

## UC-33: Đánh dấu đã đọc thông báo

| Trường | Nội dung |
|--------|----------|
| **Mã Use Case** | UC-33 |
| **Tên Use Case** | Đánh dấu đã đọc thông báo |
| **Tác nhân** | Người thuê |
| **Mục tiêu** | Đánh dấu thông báo đã được xem |
| **Mô tả** | Người thuê đánh dấu một thông báo cụ thể hoặc tất cả thông báo là đã đọc. |
| **Điều kiện tiên quyết** | Người thuê đã đăng nhập. Có thông báo chưa đọc. |
| **Điều kiện kích hoạt** | Người thuê nhấn "Đánh dấu đã đọc" trên một thông báo hoặc "Đánh dấu tất cả đã đọc". |
| **Luồng sự kiện chính** | 1. Người thuê chọn thông báo cần đánh dấu (hoặc chọn "Đánh dấu tất cả"). 2. Người thuê nhấn "Đã đọc". 3. Hệ thống cập nhật trạng thái thông báo. |
| **Luồng thay thế** | Thông báo đã đọc rồi → không có thay đổi. |
| **Quy tắc nghiệp vụ** | Thông báo đã đọc sẽ không hiển thị badge mới. |
| **Hậu điều kiện** | Thông báo được đánh dấu là đã đọc. |
