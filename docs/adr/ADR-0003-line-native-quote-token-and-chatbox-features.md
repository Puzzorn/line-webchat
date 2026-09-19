# ADR-0003: LINE Native QuoteToken Integration & Advanced ChatBox Features

- **Status:** Accepted
- **Context:** เพิ่มประสิทธิภาพความสามารถในการตอบกลับข้อความสองทางกับ LINE Platform ให้แสดงผลกล่อง Quoted Reply ตรงตามมาตรฐานอย่างเป็นทางการของ LINE (LINE Messaging API) พร้อมปรับปรุงประสบการณ์ผู้ใช้งาน (UX/UI) ในหน้ากล่องแชท Webchat

## Decision

1. **LINE Native QuoteToken Architecture:**
   - **Webhook Level:** สกัดและบันทึก `msg.quoteToken` และแมป `lineMessageId` จากเหตุการณ์ข้อความเข้าทาง LINE Webhook
   - **API Level (`/v2/bot/message/push`):** เมื่อส่งข้อความผ่าน LINE Push API ดึง `sentMessages[0].quoteToken` และ `sentMessages[0].id` ที่ LINE ส่งคืนมาบันทึกลง DB เสมอ
   - **Native Quoted Delivery:** เมื่อแอดมินส่งตอบกลับข้อความใด ระบบจะแนบ `"quoteToken": "..."` ส่งไปยัง LINE Push API ทำให้แอป LINE บนมือถือผู้รับและ LINE OA Manager แสดงผลกล่อง Quote สีเทาของ LINE อย่างเป็นทางการ (Native LINE Quote Box)

2. **Jump-to-Quoted-Message & Smooth Scroll:**
   - ใน Webchat UI เมื่อผู้ใช้คลิกที่การ์ด Quote ข้อความอ้างอิง ระบบจะค้นหาแมปข้อความด้วย `id` หรือ `lineMessageId` และสั่งงาน `element.scrollIntoView({ behavior: 'smooth', block: 'center' })` เลื่อนไปยังข้อความต้นทางให้อัตโนมัติ
   - เพิ่มเอฟเฟกต์ไฮไลต์สีเหลืองอำพันนุ่มนวล (`bg-amber-100/50`) ไร้ขอบ สว่างวาบ 2 วินาที สบายตา ไม่ฉูดฉาด

3. **Dynamic LINE Sticker Shop Metadata API:**
   - สร้าง API Route `/api/stickers` เพื่อดึงข้อมูล Sticker Package Metadata (Title, Package ID, Sticker IDs) แบบ Dynamic สดตรงจาก LINE CDN (`https://stickershop.line-scdn.net/stickershop/v1/product/{packageId}/iphone/productinfo.meta`)
   - ยกเลิกการ Hardcode Instance สติกเกอร์ พร้อมระบบ Fallback และ Loading Indicator เมื่อดึงข้อมูลจากภายนอก
   - แท็บเมนูสวิทช์เลือกตัวละครพร้อมแสดงพรีวิวภาพความละเอียดสูงจาก LINE CDN (`https://stickershop.line-scdn.net/stickershop/v1/sticker/{stickerId}/android/sticker.png`)

4. **Date Grouping Dividers & User Profile Modal:**
   - จัดกลุ่มประวัติแชทด้วยป้ายบอกวันที่ ("วันนี้", "เมื่อวานนี้", Localized Date)
   - เพิ่ม User Profile Modal แสดงรายละเอียดผู้ใช้ (Display Name, User ID, Status Message, เวลาข้อความล่าสุด) เมื่อคลิกที่ส่วนหัวของแชท

5. **KV REST API Payload Size Optimization:**
   - ปรับปรุง `kvFetch` ใน `lib/store.ts` ให้ส่งผ่าน HTTP `POST` ด้วย JSON Array Body (`["SET", key, value]`) เพื่อรองรับการบันทึกภาพ Base64/Data URI ขนาดใหญ่ ป้องกันปัญหา URI Size Limit (HTTP 414/413)

6. **LINE Mark as Read API Integration (`markAsReadToken`):**
   - **Webhook Extraction:** สกัด `msg.markAsReadToken` จาก LINE Message Webhook Event และจัดเก็บลงใน `ChatMessage`
   - **Mark as Read API Endpoint (`/api/line/mark-as-read`):** ยิง `POST https://api.line.me/v2/bot/chat/markAsRead` แนบ `markAsReadToken` เพื่อทำเครื่องหมายว่าแอดมินอ่านข้อความของผู้ใช้แล้วบนระบบ LINE OA Manager
   - **Auto Trigger:** สั่งงานยิง `markAsRead` อัตโนมัติเมื่อแอดมินเปิดแชทค้างไว้หรือกดสลับเลือกผู้ใช้นั้นๆ ใน Webchat UI

## Consequences

- **Positive:** รองรับการแสดงผล Quoted Reply ตรงตามมาตรฐาน LINE API 100% ทั้งฝั่ง Webchat และแอป LINE บนมือถือ, เพิ่มมิติความเสถียรและความสวยงามของ UI
- **Negative:** ต้องจัดเก็บฟิลด์ `quoteToken` และ `lineMessageId` เพิ่มเติมในประเภทข้อมูล `ChatMessage`
