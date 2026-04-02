# Numerical Method Web App

เว็บแอปพลิเคชันตัวอย่างสำหรับวิชา Numerical Method โดยออกแบบเป็น full-stack project ที่มีครบทั้ง client, API server, database, Docker, Swagger และ CI/CD

## Technology Stack

- Frontend: React + Vite + TypeScript
- Backend: Express + TypeScript
- Database: PostgreSQL + Prisma ORM
- API Docs: Swagger UI
- Container: Docker + Docker Compose
- CI/CD: GitHub Actions

## Features

- เลือกวิธีคำนวณได้ 2 แบบ: `Bisection` และ `False Position`
- กรอกสมการ `f(x)` พร้อมช่วง `XL`, `XR`
- คำนวณ root และแสดง iteration table
- บันทึกผลการคำนวณลงฐานข้อมูล
- ดูประวัติการคำนวณล่าสุดจาก API
- เปิดเอกสาร Swagger ได้ที่ `/api/docs`

## Project Structure

```text
.
|-- apps
|   |-- api
|   `-- web
|-- prisma
|-- nginx
|-- scripts
`-- .github/workflows
```

## Local Development

1. คัดลอกไฟล์ environment

```bash
cp .env.example .env
```

2. ติดตั้ง dependency

```bash
npm install --prefix apps/api
npm install --prefix apps/web
```

3. สร้าง Prisma client และ migrate ฐานข้อมูล

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

4. รัน backend และ frontend คนละ terminal

```bash
npm --prefix apps/api run dev
npm --prefix apps/web run dev
```

## Docker

```bash
docker compose up --build
```

บริการที่ได้:

- Web: `http://localhost:8080`
- API: `http://localhost:4000`
- Swagger: `http://localhost:4000/api/docs`
- PostgreSQL: `localhost:5432`

## CI/CD

- `ci.yml` ใช้ build ทั้ง frontend และ backend ทุกครั้งที่ push / pull request
- `deploy.yml` ใช้ deploy ไปยัง Linux server ผ่าน SSH และสั่ง `docker compose up -d --build`

Secrets ที่ควรตั้งใน GitHub:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_PORT`
- `DEPLOY_PATH`
- `DEPLOY_SSH_KEY`

## Deployment Notes

- แก้ค่าจริงใน `.env`
- เปิดพอร์ต 80/8080 และ 4000 ตามการใช้งานจริง
- บน server ต้องติดตั้ง Docker และ Docker Compose แล้ว
- สามารถใช้ reverse proxy เพิ่มเติม เช่น Nginx หรือ Traefik หน้าระบบได้

