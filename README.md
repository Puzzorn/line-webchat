# LINE OA Webchat Integration (Next.js + TypeScript)

เว็บแชทสำหรับส่งและรับข้อความกับ LINE Official Account (LINE OA) แบบสองทาง (Two-Way Messaging) พัฒนาด้วย **Next.js (App Router)** และ **TypeScript** พร้อมรองรับการ Deploy บน **Vercel** และ Publish บน **GitHub**

---

## 🌟 คุณสมบัติระบบ (Features)

- ✅ **ส่งข้อความผ่าน Webchat ไปหา LINE OA:** พิมพ์ข้อความตอบกลับไปยัง LINE User รายบุคคลผ่าน LINE Messaging API Push Message
- ✅ **รับข้อความส่งมาจาก LINE OA:** ระบบเปิดรับ Webhook Endpoint (`/api/line/webhook`) รับข้อความแบบ Real-time พร้อมตรวจสอบ HMAC Signature (`x-line-signature`)
- ✅ **คัดแยกรายชื่อ User:** แสดงรูปโปรไฟล์ ชื่อผู้ใช้ และ User ID แยกตามบุคคล พร้อมสามารถคลิกเลือกเพื่อตอบกลับได้ทันที
- ✅ **จำลองการทดสอบในตัว (Demo Mode):** สามารถกดปุ่มบวกเพื่อสร้าง Mock User และพิมพ์จำลองข้อความฝั่ง LINE User เข้ามาทดสอบระบบได้ทันทีโดยไม่ต้องเชื่อมต่อ LINE OA จริงในตอนเริ่มต้น
- ✅ **Deploy Ready:** พร้อม Deploy ขึ้น Vercel ทันที

---

## 🏗️ โครงสร้างระบบ (Project Structure)

```
line-webchat/
├── app/
│   ├── api/
│   │   ├── line/
│   │   │   ├── webhook/route.ts  # Webhook Endpoint รับข้อความจาก LINE OA
│   │   │   └── send/route.ts     # Push API ส่งข้อความจาก Webchat หา LINE User
│   │   ├── messages/route.ts     # API ดึงประวัติแชทตาม UserId
│   │   └── users/route.ts        # API ดึงรายชื่อผู้ใช้ LINE ทั้งหมด
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Webchat UI หลัก (Sidebar + Chat Area)
├── components/
│   ├── chat-box.tsx              # คอมโพเนนต์แสดงแชทและช่องพิมพ์ตอบกลับ
│   └── user-list.tsx             # คอมโพเนนต์แสดงรายชื่อและค้นหาผู้ใช้
├── lib/
│   ├── store.ts                  # Data store จัดการเก็บข้อมูลผู้ใช้และแชท
│   └── types.ts                  # TypeScript Interfaces (LineUserProfile, ChatMessage)
├── CONTEXT.md                    # โดเมนคำศัพท์และข้อกำหนดระบบ
├── docs/adr/                     # Architecture Decision Records
│   └── ADR-0001-line-webchat-architecture.md
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🚀 ขั้นตอนการติดตั้งและรัน Local Development

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. กำหนดค่า Environment Variables (`.env.local`)
คัดลอกไฟล์ `.env.example` เป็น `.env.local` แล้วใส่ค่าจาก LINE Developers Console:
```env
LINE_CHANNEL_SECRET=your_actual_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_actual_channel_access_token
```
*(หากยังไม่ได้ใส่ค่า ระบบจะทำงานใน Demo Mode ให้ทดสอบ UI ได้อย่างสมบูรณ์)*

### 3. รันโปรเจกต์
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่: `http://localhost:3000`

---

## 📲 วิธีการเชื่อมต่อกับ LINE Developers Console (LINE OA Real Testing)

1. เข้าไปที่ [LINE Developers Console](https://developers.line.biz/)
2. สร้าง **Provider** และ **Messaging API Channel**
3. คัดลอก **Channel Secret** นำมาใส่ใน `LINE_CHANNEL_SECRET`
4. ไปที่แท็บ **Messaging API** -> กด **Issue** สร้าง **Channel Access Token** นำมาใส่ใน `LINE_CHANNEL_ACCESS_TOKEN`
5. นำ URL ที่ได้จากการ Deploy ขึ้น Vercel ไปตั้งค่าในช่อง **Webhook URL**:
   ```text
   https://<your-vercel-app-name>.vercel.app/api/line/webhook
   ```
6. กดเปิดสวิตช์ **Use webhook** เป็น `ON`

---

## 📤 การนำส่งผลงาน (Submission Checklist)

เมื่อพร้อมส่งงานตาม requirement:

- **1. URL LINE OA ที่ใช้ในการทดสอบ:** ลิงก์เพิ่มเพื่อน LINE OA หรือ QR Code
- **2. URL เข้าใช้งาน webchat:** ลิงก์ที่ Deploy บน Vercel (เช่น `https://line-webchat.vercel.app`)
- **3. Url Github repository:** ลิงก์ Public Github Repo ของโปรเจกต์นี้

---

## 🧪 การตรวจสอบคุณภาพโค้ด (Verification)

- **Type Check:** `npx tsc --noEmit`
- **Production Build:** `npx next build`
