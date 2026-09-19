# LINE OA Webchat Integration (Next.js + TypeScript)

เว็บแชทสำหรับส่งและรับข้อความกับ LINE Official Account (LINE OA) แบบสองทาง (Two-Way Messaging) พัฒนาด้วยสถาปัตยกรรม **Full-stack Monorepo / Modular Layered Architecture** ด้วย **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS** และ **Upstash Redis / Vercel KV** พร้อมรองรับการ Deploy บน **Vercel** และ Publish บน **GitHub**

---

## 🌟 คุณสมบัติระบบ (Features)

- ✅ **ส่ง-รับข้อความกับ LINE OA สองทาง (Two-Way Messaging):** ส่ง Push Message ไปยัง LINE User และรับข้อความจาก LINE Webhook แบบ Real-time
- ✅ **รองรับข้อความประเภท Rich Content:**
  * 📝 **Text & Clickable Links:** แปลงลิงก์ URL ในข้อความให้กลายเป็นปุ่มกดเปิดลิงก์อัตโนมัติ
  * 🖼️ **Images:** แสดงพรีวิวรูปภาพที่ผู้ใช้ส่งมาจาก LINE ผ่าน Secure Image Proxy API (`/api/line/image/[messageId]`)
  * 🎨 **Stickers:** ดึงและแสดงผลสติกเกอร์ LINE จริงจาก LINE CDN
- ✅ **ซิงค์ข้อมูลบน Serverless (Vercel KV / Upstash Redis):** ข้อมูลผู้ใช้และประวัติแชทซิงค์ตรงกัน 100% ข้ามทุก Vercel Serverless Function Instance
- ✅ **ระบบตรวจจับโหมดอัตโนมัติ (Live vs Demo Mode):**
  * 🟢 **LIVE MODE:** แสดงสถานะเชื่อมต่อ LINE API เมื่อตั้งค่า `.env` ถูกต้อง ซ่อนปุ่มจำลองให้อัตโนมัติเพื่อป้องกันความสับสน
  * 🟡 **DEMO MODE:** โหมดจำลองสำหรับทดสอบ UI ได้ทันทีโดยไม่ต้องใส่ Credentials
- ✅ **Dual Webhook Route Support:** รองรับทั้ง URL `/api/line/webhook` และ `/line/webhook`

---

## 🏗️ สถาปัตยกรรมระบบ (Architecture Overview)

ระบบนี้พัฒนาในรูปแบบ **Full-stack Monorepo Layered Architecture** โดยรวม Frontend UI และ Backend APIไว้ใน Repository เดียวกัน:

```
line-webchat/
├── app/                          # Presentation & Routing Layer (Next.js App Router)
│   ├── api/
│   │   ├── config/route.ts       # Check System Mode (Live vs Demo)
│   │   ├── line/
│   │   │   ├── image/[messageId]/# Secure Proxy API for LINE Image Content
│   │   │   ├── send/route.ts     # Push API to send message to LINE User
│   │   │   └── webhook/route.ts  # Webhook Endpoint receiving LINE Events
│   │   ├── messages/route.ts     # Fetch chat history per User ID
│   │   └── users/route.ts        # Fetch all active LINE Users
│   ├── line/webhook/route.ts     # Route Alias for /line/webhook
│   ├── globals.css               # Global Tailwind CSS Styles
│   ├── layout.tsx                # App Root Layout
│   └── page.tsx                  # Webchat UI Main Dashboard
├── components/                   # UI Presentation Component Layer
│   ├── chat-box.tsx              # Active Chat Window & Rich Content Renderer
│   └── user-list.tsx             # Sidebar User List & Live Status Badge
├── lib/                          # Data Access & Domain Logic Layer
│   ├── store.ts                  # Repository Layer (Vercel KV / Upstash Redis & Fallback)
│   └── types.ts                  # Domain Models & DTO Definitions
├── docs/                         # Architecture Documentation & ADRs
│   └── adr/
│       ├── ADR-0001-line-webchat-architecture.md
│       └── ADR-0002-rich-messages-and-kv-storage.md
├── CONTEXT.md                    # Domain Vocabulary & Rules
├── next.config.mjs               # Next.js Config & URL Rewrites
├── package.json
└── README.md
```

---

## 🚀 ขั้นตอนการติดตั้งและรัน Local Development

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. กำหนดค่า Environment Variables (`.env.local`)
คัดลอกไฟล์ `.env.example` เป็น `.env.local`:
```env
LINE_CHANNEL_SECRET=your_actual_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_actual_channel_access_token

# (Optional) Upstash Redis / Vercel KV for Local Persistent Storage
KV_REST_API_URL=your_upstash_redis_rest_url
KV_REST_API_TOKEN=your_upstash_redis_rest_token
```

### 3. รันโปรเจกต์
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่: `http://localhost:3000`

---

## 📲 การตั้งค่าบน Vercel และ LINE Developers Console

1. **Deploy ขึ้น Vercel:** นำ GitHub Repository Import เข้าสู่อันดับแรก
2. **ผูก Vercel KV (Upstash Redis):**
   - ไปที่ Vercel Dashboard -> **Storage** -> **Connect Database** -> เลือก **Upstash / Vercel KV**
   - Vercel จะสร้างพารามิเตอร์ซิงค์ข้อมูลให้อัตโนมัติ
3. **ตั้งค่า Webhook ใน LINE Developers Console:**
   - Webhook URL: `https://<your-vercel-app>.vercel.app/line/webhook` (หรือ `/api/line/webhook`)
   - เปิดสวิตช์ **Use webhook** เป็น `ON`

---

## 🧪 การตรวจสอบคุณภาพโค้ด (Verification)

```bash
npx tsc --noEmit   # Type Check (0 Errors)
npm run build      # Production Build Verification
```
