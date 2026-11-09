# Vườn thú ngón tay

Web game tiếng Việt cho trẻ mầm non 3–6 tuổi. Chạy tĩnh bằng HTML, CSS và JavaScript, không database, không API key, không cần cài thư viện.

## Đưa folder này lên GitHub và Vercel

Bạn dùng trực tiếp folder dự án này làm repository. Không cần file ZIP, không cần giải nén hay tạo thêm dự án khác.

1. Tạo repository trên GitHub rồi tải các file và thư mục trong folder này lên. Giữ nguyên cấu trúc: `index.html`, `app.js`, `art.js`, `game.js`, `styles.css`, `package.json`, `vercel.json`, `assets/`, `scripts/` và `tests/`.
2. Trên Vercel, chọn **Add New → Project** rồi import repository vừa tạo.
3. Chọn **Framework Preset: Other**, **Build Command: `npm run build`**, **Output Directory: `dist`**. File `vercel.json` đã có sẵn cấu hình này.
4. Chọn **Deploy**. Không cần biến môi trường hoặc database.

`dist/` là kết quả build tự tạo, không cần upload lên GitHub. Khi dùng Git, `.gitignore` tự bỏ qua thư mục này. Nếu upload qua trang GitHub, bỏ qua `dist/`. Không có file ZIP trong dự án.

Nếu repository chứa folder dự án bên trong một thư mục khác, chọn đúng **Root Directory** trên Vercel. Khi cập nhật code trên GitHub, Vercel sẽ triển khai lại.

## Chạy thử trên máy

Cần Node.js 20 trở lên. Mở terminal tại folder dự án và chạy:

```sh
npm run dev
```

Mở http://localhost:5173, nhấn `Ctrl+C` để dừng. Trên Windows PowerShell, nếu `npm` bị chặn, dùng `npm.cmd run dev`. Chạy bằng HTTP, không mở trực tiếp `index.html`, vì game dùng JavaScript modules.

## Chế độ vòng quay

- **Quay không trùng lặp:** mỗi con vật xuất hiện đúng một lần trong 5 lượt. Đủ 5 con vật, lượt quay tiếp theo tự bắt đầu vòng mới. Đây là mặc định cho trình duyệt chưa lưu cài đặt.
- **Ngẫu nhiên tự do:** mỗi lượt chọn một trong 5 con vật, có thể gặp lại bạn đã quay.
- Cả hai chế độ luôn giữ nguyên đủ 5 ô và 5 con vật trên vòng quay; không xóa hay làm mờ ô sau khi quay.
- Nhấn nút chế độ ngay dưới nút quay hoặc **Tùy chỉnh vòng quay** để cài đặt. Có thể chỉnh thời gian 3/5/7 giây và bật/tắt âm thanh.
- **Bắt đầu lượt 5 con vật mới** xóa danh sách con vật đã gặp trong vòng hiện tại, vẫn giữ lịch sử. **Chơi lại từ đầu** xóa cả lịch sử và vòng hiện tại.
- Lưu tùy chỉnh âm thanh hoặc thời gian không làm mất tiến độ vòng hiện tại. Chuyển chế độ quay sẽ bắt đầu vòng mới.

## Cách chơi

Muỗi: 1 ngón trỏ. Thỏ: 2 ngón trỏ và giữa. Mèo: 3 ngón trỏ, giữa, áp út. Cua: 4 ngón, gập ngón cái. Bướm: xòe 5 ngón.

Bấm nút, chạm vòng quay hoặc nhấn Space để quay. Kim dừng đúng con vật được chọn. Quan sát ảnh bàn tay và nhúc nhích theo hướng dẫn. Chạm thẻ con vật để học thử; việc xem thử không tính vào kết quả quay. Nhấn **Bé làm được rồi!** để xem hiệu ứng chúc mừng.

Nút loa điều khiển âm thanh vòng quay và tiếng chúc mừng. Đã bỏ tính năng đọc tên bằng giọng nói; tên và lời mô phỏng của con vật luôn hiển thị để cô và các bé cùng đọc.

Game hỗ trợ điện thoại, tablet, máy tính, bàn phím, chế độ giảm chuyển động và toàn màn hình nếu trình duyệt hỗ trợ. Lịch sử giữ tối đa 20 kết quả gần nhất trong phiên trang hiện tại. Tùy chỉnh lưu trong localStorage của thiết bị, không gửi lên máy chủ.

## Kiểm tra và build

```sh
npm test
npm run build
```

Trên Windows có thể dùng `npm.cmd test` và `npm.cmd run build`.

`game.js`: luật và dữ liệu con vật. `art.js`: vùng hiển thị độc lập của từng con vật và bàn tay, có clipping để không lộ ảnh bên cạnh ở mọi tỷ lệ khung. `app.js`: tương tác. `index.html`: bố cục. `styles.css`: giao diện.

## Hình ảnh

Ảnh nguồn được tạo riêng bằng Imagegen và lưu tại `assets/`. Mỗi hình được giới hạn riêng trong `art.js`, giữ hình bàn tay chân thực và con vật hoạt họa. Prompt gốc tại `assets/ARTWORK.md`. Font Google có font hệ thống dự phòng; ảnh không tải từ dịch vụ bên ngoài.
