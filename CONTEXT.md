# CONTEXT.md - LINE OA Webchat Integration

## Domain Vocabulary & Concepts

- **LINE Official Account (LINE OA):** บัญชีทางการของ LINE ที่ส่งและรับข้อความกับผู้ใช้งานผ่าน LINE Messaging API
- **LINE Messaging API:** API สำหรับการจัดการข้อความ (Push, Reply, Webhook Events)
- **Webhook Event:** HTTP POST request ที่ส่งจาก LINE Platform เข้ามายังระบบ Webchat เมื่อมีเหตุการณ์เกิดขึ้น
- **LINE Signature (`x-line-signature`):** HMAC-SHA256 signature ที่ LINE ใช้ในการส่ง Header เพื่อยืนยันความถูกต้อง
- **Push Message:** การส่งข้อความจากระบบ Webchat เข้าหา LINE User โดยใช้ `userId`
- **Rich Message Content:** ข้อความประเภทสื่อผสม ประกอบด้วย Text, Clickable Links, LINE Stickers (`packageId`, `stickerId`), และ Images (`LINE Content API`)
- **Secure Image Proxy:** Proxy API (`/api/line/image/[messageId]`) สำหรับดึงภาพไบนารีจาก LINE Data Content API ผ่าน `LINE_CHANNEL_ACCESS_TOKEN`
- **Serverless Persistence (Vercel KV / Upstash Redis):** ฐานข้อมูลคีย์-แวลูความเร็วสูงสำหรับซิงค์ประวัติแชทข้าม Serverless Function Instances บน Vercel
- **Live vs Demo Mode:** โหมดการทำงานอัตโนมัติ (Live: เชื่อมต่อ LINE API จริง / Demo: โหมดจำลองสำหรับทดสอบ UI)

## Core Requirements & Rules

1. ระบบต้องรองรับการรับข้อความสองทางจาก LINE OA ผ่าน Webhook Endpoint (`/api/line/webhook` และ `/line/webhook`)
2. ระบบต้องแสดงรายชื่อผู้ใช้ คัดแยกตามบุคคล แสดงข้อความล่าสุด พร้อมช่องพิมพ์ตอบกลับแบบ Real-time
3. ระบบต้องพัฒนาด้วยสถาปัตยกรรม Full-stack Monorepo (Next.js + TypeScript) พร้อมซิงค์ข้อมูลบน Vercel และเปิดเป็น Public GitHub Repository
