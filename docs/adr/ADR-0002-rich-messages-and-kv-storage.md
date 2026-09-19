# ADR-0002: Upstash Redis KV Persistence & Rich Message Types Support

- **Status:** Accepted
- **Context:** ต้องการเพิ่มประสิทธิภาพและความสามารถของระบบให้รองรับข้อความประเภท Rich Content (รูปภาพ, สติกเกอร์, ลิงก์) และการซิงค์ข้อมูลบน Vercel Serverless Architecture ข้ามหลาย Container

## Decision

1. **Persistence Storage Architecture (Vercel KV / Upstash Redis):**
   - ใช้ **Upstash Redis / Vercel KV REST API** ใน `lib/store.ts` เพื่อเก็บข้อมูลแชทและประวัติผู้ใช้งานข้าม Serverless Functions
   - รองรับทุก Prefix Key บน Vercel (`KV_REST_API_...`, `UPSTASH_REDIS_REST_...`, `STORAGE_...`)
   - มีระบบ In-Memory Fallback อัตโนมัติสำหรับการรัน Local Development โดยไม่ต้องพึ่งฐานข้อมูลภายนอก

2. **Rich Message Types Handling:**
   - **Stickers:** ดึงและแสดงผลรูปภาพสติกเกอร์จริงจาก LINE CDN (`https://stickershop.line-scdn.net/stickershop/v1/sticker/{stickerId}/android/sticker.png`)
   - **Images:** สร้าง Secure Proxy API Endpoint (`/api/line/image/[messageId]`) เพื่อดึงภาพไบนารีจาก LINE Content API (`https://api-data.line.me/v2/bot/message/{messageId}/content`) ด้วย `LINE_CHANNEL_ACCESS_TOKEN` มาแสดงใน UI
   - **Links / URLs:** มีระบบ Auto-URL Parser ใน `ChatBox` เพื่อเปลี่ยนลิงก์ธรรมดาให้กลายเป็น Clickable Anchor Links พร้อม External Link Icon

3. **Dual Webhook Route Mapping:**
   - แมป URL สองรูปแบบทั้ง `/api/line/webhook` และ `/line/webhook` ผ่าน Next.js Rewrites และ Route Handlers เพื่อรองรับการตั้งค่า Webhook ใน LINE Developers Console ทุกรูปแบบ

4. **Dynamic Live vs Demo Mode Controls:**
   - ตรวจจับค่า Credentials ใน `.env` ผ่าน `/api/config`
   - ใน **Live Mode**: ซ่อนปุ่มสร้าง User สมมติ และซ่อนปุ่มจำลองส่งแชท เพื่อป้องกันสับสนกับการใช้งานจริง

## Consequences

- **Positive:** ข้อมูลแชทซิงค์กัน 100% บน Vercel Serverless, รองรับสื่อผสมหลากหลายรูปแบบ, มีความมั่นคงและยืดหยุ่นสูง
- **Negative:** หากใช้โหมดรับรูปภาพ ปริมาณ Request ไปยัง LINE Content API จะเพิ่มขึ้นตามจำนวนรูปที่ถูกโหลด
