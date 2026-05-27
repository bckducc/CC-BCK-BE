# BCK Manager - Hệ Thống Quản Lý Chung Cư Mini

Backend API cho hệ thống quản lý cho thuê phòng trọ/chung cư mini. Xây dựng với Node.js + Express + MySQL.

## ⚡ Quick Start

```bash
# 1. Clone repository
git clone <repository-url>
cd bck-manager

# 2. Cài đặt dependencies
npm install

# 3. Cấu hình .env
cp .env.example .env
# Chỉnh sửa DB_HOST, DB_USER, DB_PASSWORD, JWT_SECRET

# 4. Chạy server (database tự động khởi tạo!)
npm start
```

**Đó là tất cả!** 🎉 Database sẽ tự động được tạo và khởi tạo schema khi server start lần đầu.

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: v16 trở lên
- **MySQL**: 5.7 trở lên
- **npm** hoặc **yarn**

## 🔧 Cấu Hình

### File .env

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bck_manager

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=*
```

## 🚀 Chạy Ứng Dụng

### Development Mode (với auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## 📚 Tài Liệu

- **[SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md)** - Tổng quan hệ thống, cấu trúc database, API
- **[STATUS.md](./STATUS.md)** - Trạng thái dự án, checklist hoàn thành
- **[src/asset/REQUIREMENTS.md](./src/asset/REQUIREMENTS.md)** - Yêu cầu chức năng chi tiết
- **[src/asset/USE-CASE.md](./src/asset/USE-CASE.md)** - Đặc tả use case
- **[scheme.txt](./scheme.txt)** - Database schema diagram

## 🔒 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/logout` - Đăng xuất
- `GET /api/v1/auth/profile` - Xem thông tin cá nhân
- `PUT /api/v1/auth/profile` - Cập nhật thông tin cá nhân

### Quản Lý Người Thuê
- `POST /api/v1/tenants` - Tạo tài khoản người thuê
- `GET /api/v1/tenants` - Danh sách người thuê
- `GET /api/v1/tenants/:id` - Chi tiết người thuê
- `PUT /api/v1/tenants/:id` - Cập nhật người thuê
- `PUT /api/v1/tenants/:id/toggle-status` - Khóa/Mở khóa tài khoản

### Quản Lý Phòng
- `POST /api/v1/rooms` - Tạo phòng mới
- `GET /api/v1/rooms` - Danh sách phòng
- `GET /api/v1/rooms/:id` - Chi tiết phòng
- `PUT /api/v1/rooms/:id` - Cập nhật phòng
- `DELETE /api/v1/rooms/:id` - Xóa phòng
- `GET /api/v1/rooms/my-room` - Xem phòng đang thuê (tenant)

### Quản Lý Hợp Đồng
- `POST /api/v1/contracts` - Tạo hợp đồng
- `GET /api/v1/contracts` - Danh sách hợp đồng
- `GET /api/v1/contracts/:id` - Chi tiết hợp đồng
- `PUT /api/v1/contracts/:id/terminate` - Kết thúc hợp đồng

### Quản Lý Dịch Vụ
- `POST /api/v1/services` - Tạo dịch vụ
- `GET /api/v1/services` - Danh sách dịch vụ
- `PUT /api/v1/services/:id` - Cập nhật dịch vụ
- `DELETE /api/v1/services/:id` - Xóa dịch vụ
- `POST /api/v1/services/assign` - Gán dịch vụ vào phòng

### Quản Lý Điện Nước
- `POST /api/v1/utilities` - Nhập chỉ số điện nước
- `GET /api/v1/utilities` - Lịch sử điện nước
- `PUT /api/v1/utilities/config` - Cấu hình đơn giá

### Quản Lý Hóa Đơn
- `POST /api/v1/invoices/generate` - Tạo hóa đơn tháng
- `GET /api/v1/invoices` - Danh sách hóa đơn
- `GET /api/v1/invoices/:id` - Chi tiết hóa đơn
- `PUT /api/v1/invoices/:id/confirm-payment` - Xác nhận thanh toán
- `GET /api/v1/invoices/:id/export` - Xuất hóa đơn PDF

### Dashboard
- `GET /api/v1/dashboard/landlord` - Dashboard chủ nhà
- `GET /api/v1/dashboard/tenant` - Dashboard người thuê

### Thông Báo
- `GET /api/v1/notifications` - Danh sách thông báo
- `PUT /api/v1/notifications/:id/read` - Đánh dấu đã đọc

## 🔐 Authentication

Hệ thống sử dụng JWT (JSON Web Token) cho authentication:

1. **Login**: Gửi username + password → Nhận JWT token
2. **Use Token**: Gửi token trong header cho mỗi request:
   ```
   Authorization: Bearer <your_token>
   ```
3. **Token Expiry**: Token có hiệu lực 7 ngày

## 📁 Cấu Trúc Project

```
bck-manager/
├── src/
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   ├── controllers/             # Request handlers
│   ├── services/                # Business logic
│   ├── routes/                  # API routes
│   ├── middleware/              # Auth, validation
│   ├── database/
│   │   ├── schema/              # SQL schema files
│   │   └── init-database.js     # Auto database setup
│   └── server.js                # Express app
├── .env                         # Environment variables
├── package.json
├── SYSTEM_OVERVIEW.md           # System documentation
├── STATUS.md                    # Project status
└── README.md                    # This file
```

## 🎯 Tính Năng Chính

✅ **31 Functional Requirements** đã hoàn thành:
- Authentication & Authorization
- Quản lý người dùng (landlord, tenant)
- Quản lý phòng
- Quản lý hợp đồng
- Quản lý dịch vụ
- Quản lý điện nước
- Quản lý hóa đơn & thanh toán
- Dashboard & thống kê
- Thông báo

✅ **Non-Functional Requirements**:
- API response time ≤ 500ms
- JWT token 7 ngày
- bcrypt password hashing (salt ≥ 10)
- Parameterized queries (SQL injection prevention)
- Pagination support
- Vietnamese error messages

## 🧪 Testing

### Test với cURL

```bash
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get rooms (cần token)
curl http://localhost:5000/api/v1/rooms \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test với Postman

Import collection từ file `BCK_Manager_API.postman_collection.json`

## 🛠️ Database

### Tự Động Khởi Tạo

Database sẽ **tự động được tạo** khi chạy server lần đầu. Script sẽ:
1. Kiểm tra database có tồn tại chưa
2. Tạo database nếu chưa có
3. Chạy tất cả schema files theo đúng thứ tự
4. Khởi động server

### Thủ Công (Nếu Cần)

```bash
mysql -u root -p
CREATE DATABASE bck_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bck_manager;
SOURCE src/database/schema/01-users.sql;
SOURCE src/database/schema/00-rooms.sql;
SOURCE src/database/schema/02-contracts.sql;
SOURCE src/database/schema/03-services.sql;
SOURCE src/database/schema/04-utilities.sql;
SOURCE src/database/schema/05-invoices.sql;
SOURCE src/database/schema/06-notifications.sql;
```

## 🔒 Security

- ✅ Password hashing với bcrypt (salt ≥ 10)
- ✅ JWT authentication
- ✅ Parameterized queries (SQL injection prevention)
- ✅ Input validation
- ✅ Role-based access control
- ✅ Error handling

## 📊 Tech Stack

- **Runtime**: Node.js v16+
- **Framework**: Express.js
- **Database**: MySQL 5.7+
- **Authentication**: JWT
- **Password Hashing**: bcrypt
- **PDF Generation**: pdfkit

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Contact

Nếu có vấn đề, vui lòng liên hệ team phát triển.

---

**Made with ❤️ by BCK Team**
