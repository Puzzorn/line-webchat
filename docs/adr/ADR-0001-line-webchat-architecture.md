# ADR-0001: Webchat & LINE OA Architecture & Technology Stack

- **Status:** Accepted
- **Context:** ต้องการสร้างระบบ Webchat ที่เชื่อมต่อสองทาง (Two-way communication) กับ LINE Official Account (LINE OA) ตามแบบทดสอบ
- **Requirement Constraints:**
  - Next.js + TypeScript
  - Deploy บน Vercel
  - รองรับการรับ-ส่งข้อความและคัดแยก User ที่ติดต่อเข้ามา

## Decision

1. **Framework:** Next.js (App Router) ด้วย TypeScript
2. **LINE Integration:**
   - Webhook Handler at `POST /api/line/webhook` เพื่อรับข้อความจาก LINE OA และตรวจสอบ `x-line-signature` ด้วย HMAC-SHA256
   - Push Message Handler at `POST /api/line/send` เพื่อส่งข้อความจาก Webchat ไปยัง LINE User ผ่าน LINE Messaging API (`https://api.line.me/v2/bot/message/push`)
3. **Data Management & Persistence:**
   - ใช้ Prisma ORM + SQLite สำหรับ Local Development / Edge Storage (หรือ PostgreSQL / Supabase ในการ Production)
   - เก็บข้อมูล Table: `User` (userId, displayName, pictureUrl, updatedAt) และ `Message` (id, userId, senderType, content, createdAt)
4. **UI Design & UX:**
   - Split view Layout: Sidebar สำหรับแสดงรายการ User และ Main Window สำหรับแชท
   - Tailwind CSS สำหรับ Styling และ Lucide React Icons สำหรับ UI
   - Polling / SSE เพื่อดึงข้อมูลอัปเดตแชทแบบ Real-time บน Vercel Serverless

## Consequences

- **Positive:** สามารถ Deploy บน Vercel ได้ทันที ไม่ซับซ้อน โครงสร้างโค้ดเป็นระเบียบ อ่านง่ายและตรงตามข้อกำหนดทุกข้อ
- **Negative:** หากยังไม่ได้ใส่ LINE Channel Credentials จริงใน `.env` การทดสอบจริงต้องเปิดใช้งาน LINE Developers Console
