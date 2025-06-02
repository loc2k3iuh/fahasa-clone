# Hướng dẫn sử dụng tính năng Chat trong Admin Frontend

## Tổng quan

Tính năng chat trong Admin Frontend được phát triển để kết nối trực tiếp với WebSockets, cho phép giao tiếp thời gian thực với người dùng. Hệ thống bao gồm:

1. WebSocketService: Dịch vụ kết nối WebSocket để gửi và nhận tin nhắn
2. WebSocketContext: Context React để quản lý kết nối WebSocket
3. Component Chat: UI để hiển thị và tương tác với các tin nhắn

## Cấu trúc

### WebSocketService

- Kết nối đến server WebSocket sử dụng @stomp/stompjs
- Xử lý tin nhắn và cập nhật trạng thái người dùng
- Xử lý lỗi và tự động kết nối lại
- Gửi tin nhắn và cập nhật trạng thái

### WebSocketContext

- Quản lý kết nối WebSocket trên toàn ứng dụng
- Theo dõi trạng thái kết nối
- Cung cấp danh sách người dùng đang online
- Xử lý lỗi kết nối

### Component Chat

- Hiển thị danh sách phòng chat
- Hiển thị tin nhắn cho phòng được chọn
- Hiển thị trạng thái online của người dùng
- Hỗ trợ gửi và nhận tin nhắn thời gian thực

## Cách sử dụng

1. Kết nối đến WebSocket xảy ra khi component Chat được mount
2. Admin có thể nhìn thấy danh sách phòng chat ở sidebar trái
3. Các chỉ báo trạng thái online hiển thị bên cạnh tên người dùng
4. Tin nhắn mới sẽ được cập nhật tự động
5. Danh sách phòng chat sẽ tự động cập nhật khi có tin nhắn mới

## Các API WebSocket đã sử dụng

1. `/app/online-status`: API để cập nhật trạng thái online
2. `/topic/admin.messages`: Subscribe để nhận tin nhắn cho admin
3. `/app/chat.admin.send`: Gửi tin nhắn từ admin
4. `/topic/online-users`: Subscribe để cập nhật trạng thái online của người dùng

## Xử lý lỗi

- Kết nối WebSocket tự động thử lại khi mất kết nối
- Sử dụng backoff algorithm để tránh quá tải server
- Hiển thị trạng thái kết nối trong UI
- Log lỗi để dễ dàng debug

## Cải tiến trong tương lai

- Thêm hỗ trợ gửi file/ảnh
- Thêm chỉ báo "đang nhập" 
- Tối ưu hóa hiệu suất cho lượng người dùng lớn
