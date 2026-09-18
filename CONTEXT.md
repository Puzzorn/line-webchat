# CONTEXT.md - LINE OA Webchat Integration

## Domain Vocabulary & Concepts

- **LINE Official Account (LINE OA):** บัญชีทางการของ LINE ที่ส่งและรับข้อความกับผู้ใช้งานผ่าน LINE Messaging API
- **LINE Messaging API:** API สำหรับการจัดการข้อความ (Push, Reply, Webhook Events)
- **Webhook Event:** HTTP POST request ที่ส่งจาก LINE Platform เข้ามายังระบบ Webchat เมื่อมีเหตุการณ์เกิดขึ้น (เช่น ผู้ใช้ส่งข้อความ)
- **LINE Signature (`x-line-signature`):** HMAC-SHA256 signature ที่ LINE ใช้ในการส่ง Header เพื่อยืนยันว่า Request มาจาก LINE จริง
- **Push Message:** การส่งข้อความจากระบบ Webchat เข้าหา LINE User โดยใช้ `userId`
- **Reply Message:** การตอบกลับข้อความผู้ใช้ทันทีโดยใช้ `replyToken`
- **Webchat Frontend:** อินเทอร์เฟซผู้ใช้ฝั่งเว็บสำหรับเลือกดูประวัติแชทและพิมพ์ตอบกลับผู้ใช้งาน LINE
- **User Profile:** ข้อมูลผู้ใช้ LINE ประกอบด้วย `userId`, `displayName`, `pictureUrl`, `statusMessage`

## Core Requirements & Rules

1. ระบบต้องรองรับการรับข้อความจาก LINE OA ผ่าน Webhook Endpoint (`/api/line/webhook`)
2. ระบบต้องแสดงรายชื่อผู้ใช้ที่ส่งข้อความเข้ามาทั้งหมด ให้สามารถเลือกผู้ใช้เพื่อดูประวัติแชทและส่งข้อความตอบกลับได้
3. ระบบต้องพัฒนาด้วย Next.js (TypeScript) พร้อมรองรับการ Host บน Vercel และ GitHub Public Repository
