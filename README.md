# LINE OA Webchat Integration (Next.js + TypeScript)

เว็บแชทสำหรับส่งและรับข้อความกับ LINE Official Account (LINE OA) แบบสองทาง (Two-Way Messaging) พัฒนาด้วยสถาปัตยกรรม **Full-stack Monorepo / Modular Layered Architecture** ด้วย **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS** และ **Upstash Redis / Vercel KV** พร้อมรองรับการ Deploy บน **Vercel** และ Publish บน **GitHub**

---

## 🌟 คุณสมบัติระบบ (Features)

- ✅ **ส่ง-รับข้อความกับ LINE OA สองทาง (Two-Way Messaging):** ส่ง Push Message ไปยัง LINE User และรับข้อความจาก LINE Webhook แบบ Real-time
- ✅ **รองรับระบบตอบกลับข้อความ (Native Quoted Reply & Jump to Message):**
  * 💬 **LINE Native `quoteToken` Support:** บันทึกและส่ง `quoteToken` ร่วมกับ LINE Push API ทำให้แอป LINE บนมือถือผู้ใช้และ LINE OA Manager แสดงผลกล่อง Quote อ้างอิงอย่างเป็นทางการ
  * 🎯 **Smooth Scroll & Soft Highlight:** คลิกที่การ์ด Quote ข้อความเพื่อเลื่อน (Smooth Scroll) ไปยังข้อความต้นทาง พร้อมเอฟเฟกต์ไฮไลต์สีเหลืองอำพันนุ่มนวลจางๆ ไร้ขอบ อัตโนมัติ
  * 🔘 **3-Dot Context Menu:** เมนูตัวเลือก 3 จุด (`...`) ข้างกล่องแชทสำหรับ ตอบกลับ, คัดลอกข้อความ, ลองส่งใหม่ หรือ ลบข้อความ
- ✅ **ระบบโหลดประวัติแชทแบ่งหน้าและ Infinite Scroll อัตโนมัติ (Paginated History & Auto Infinite Scroll):**
  * ⚡ **Paginated History API (`/api/messages?userId=X&limit=25&beforeTimestamp=Y`):** โหลดประวัติแชทเริ่มต้น 25 ข้อความล่าสุดเพื่อเพิ่มประสิทธิภาพและลดภาระการโหลดข้อมูล
  * 📜 **Automatic Infinite Scroll:** เมื่อเลื่อนขึ้นใกล้บนสุด (`scrollTop < 120px`) ระบบจะดึงประวัติข้อความเก่ากว่าให้อัตโนมัติ พร้อมแสดงแถบสปินเนอร์ Loading สวยงาม
  * 📌 **Scroll Offset Preservation & Bottom Pinning:** คำนวณความสูงและล็อคตำแหน่งการมองเห็นของผู้ใช้ไว้ที่เดิมไม่ให้กระตุกหรือเด้งกลับล่างสุดขณะโหลดประวัติเก่า พร้อมระบบ Multi-pass Image Load & ResizeObserver ล็อคหน้าจอให้อยู่ล่างสุดเมื่อเปิดห้องแชทครั้งแรก
- ✅ **จัดกลุ่มประวัติแชทตามวันที่ (Date Grouping Divider):** แสดงป้ายบอกวันที่ ("วันนี้", "เมื่อวานนี้", "19 ก.ย. 2569") แบ่งกลุ่มข้อความอัตโนมัติ
- ✅ **โปรไฟล์ผู้ใช้งานและหน้าต่างรายละเอียด (User Profile Modal):** คลิกที่รูปหรือชื่อผู้ใช้เพื่อดูข้อมูลโปรไฟล์ (Display Name, User ID, Status Message, เวลาข้อความล่าสุด)
- ✅ **คลังสติกเกอร์ LINE แบบ Dynamic API (Dynamic LINE Sticker Shop Metadata):**
  * 🎨 **Dynamic Metadata API (`/api/stickers`):** ดึงข้อมูล Sticker Package Metadata (Title, Package ID, Sticker IDs) แบบ Dynamic สดจาก LINE CDN Direct อัตโนมัติ พร้อมระบบ Fallback และ Loading Indicator
- ✅ **รองรับข้อความประเภท Rich Content:**
  * 📝 **Text & Clickable Links:** แปลงลิงก์ URL ในข้อความให้กลายเป็นปุ่มกดเปิดลิงก์อัตโนมัติ
  * 🖼️ **Images & File Attachments:** แสดงพรีวิวรูปภาพที่ส่งมาจาก LINE ผ่าน Secure Image Proxy API (`/api/line/image/[messageId]`) และแนบไฟล์เอกสาร
- ✅ **ระบบแจ้งเตือนข้อความเข้า Real-Time & เสียงแจ้งเตือน (Real-Time SSE Stream & Web Audio Chime):**
  * ⚡ **Server-Sent Events (SSE - `/api/events`):** กระจายข้อความใหม่แบบ Real-Time เข้าสู่หน้าจอแชททันทีโดยไม่ต้องกด Refresh หรือทำ Polling
  * 🔔 **Web Audio API Sound Notification:** เสียงปิ๊ปสังเคราะห์แจ้งเตือน (Chime sound) อัตโนมัติเมื่อมีข้อความใหม่จากลูกค้าเข้ามา
  * 🔴 **Unread Badge Count:** ป้ายปุ่มสีแดงแสดงจำนวนข้อความที่ยังไม่ได้อ่านแยกตามรายชื่อผู้ใช้ และรีเซ็ตอัตโนมัติเมื่อกดเปิดดู
- ✅ **รองรับระบบทำเครื่องหมายอ่านแล้ว (LINE Official Mark as Read API):**
  * 👁️ **`markAsReadToken` Integration:** สกัดและบันทึก `markAsReadToken` จากข้อความเข้าทาง Webhook และส่งยิง `POST /v2/bot/chat/markAsRead` ไปยัง LINE API อัตโนมัติเมื่อแอดมินเปิดอ่านแชทบน Webchat
- ✅ **ซิงค์ข้อมูลบน Serverless (Vercel KV / Upstash Redis HTTP POST):** อัปเกรดระบบจัดเก็บข้อมูล KV REST API ใช้ HTTP POST เพื่อรองรับ Payload ขนาดใหญ่ (Base64/Data URI) ข้ามทุก Vercel Serverless Function Instance
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
│   │   ├── events/route.ts       # Server-Sent Events (SSE) Real-Time Stream API
│   │   ├── line/
│   │   │   ├── image/[messageId]/# Secure Proxy API for LINE Image Content
│   │   │   ├── mark-as-read/     # Official LINE Mark as Read API Route
│   │   │   ├── send/route.ts     # Push API to send message to LINE User
│   │   │   └── webhook/route.ts  # Webhook Endpoint receiving LINE Events
│   │   ├── messages/route.ts     # Fetch chat history per User ID
│   │   ├── stickers/route.ts     # Dynamic LINE Sticker Metadata API
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
│       ├── ADR-0002-rich-messages-and-kv-storage.md
│       └── ADR-0003-line-native-quote-token-and-chatbox-features.md
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
