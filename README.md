# Webboard API


## สถาปัตยกรรมของแอปพลิเคชัน

โปรเจคนี้ใช้สถาปัตยกรรมแบบ Modular โดยแบ่งเป็นส่วนหลักๆ ดังนี้:

- **Controllers**: จัดการ HTTP requests และ responses
- **Services**: จัดการ business logic
- **Entities**: โมเดลข้อมูลสำหรับฐานข้อมูล
- **DTOs**: Data Transfer Objects สำหรับการรับ-ส่งข้อมูล
- **Guards**: ระบบรักษาความปลอดภัยและการยืนยันตัวตน
- **Pipes**: การตรวจสอบและแปลงข้อมูล
- **Database**: PostgreSQL สำหรับเก็บข้อมูล

## การติดตั้งและการใช้งาน

### ความต้องการเบื้องต้น
- Node.js (version 18 หรือสูงกว่า)
- Docker และ Docker Compose
- Yarn หรือ npm

### ขั้นตอนการติดตั้ง

1. Clone repository:
```bash
git clone [repository-url]
cd [project-name]
```

2. ติดตั้ง dependencies:
```bash
yarn install
```

3. สร้างไฟล์ .env หรือ copy .env.example และกำหนดค่าต่างๆ:
```env
NODE_ENV=development
PORT=5002

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=webboard

JWT_ACCESS_SECRET=secret_key
JWT_ACCESS_EXPIRED_IN=60m
```

4. รัน Docker containers สำหรับ PostgreSQL
```bash
docker-compose up -d
```

5. รัน database migrations และ seeds:
```bash
yarn seed:refresh
```

6. รันแอปพลิเคชัน:
```bash
# development mode
yarn start:dev

# production mode
yarn start:prod
```

## ไลบรารีและแพ็คเกจที่ใช้

### หลัก
- **@nestjs/common, @nestjs/core**: Framework หลักสำหรับการพัฒนา
- **@nestjs/typeorm, typeorm**: ORM สำหรับจัดการฐานข้อมูล
- **@nestjs/jwt, passport-jwt**: ระบบยืนยันตัวตนด้วย JWT
- **@nestjs/cache-manager**: ระบบ caching
- **class-validator, class-transformer**: การตรวจสอบและแปลงข้อมูล

### การพัฒนา
- **@faker-js/faker**: สร้างข้อมูลจำลองสำหรับ seeding
- **jest**: ระบบทดสอบ
- **typescript**: ภาษาที่ใช้ในการพัฒนา
- **prettier, eslint**: เครื่องมือจัดรูปแบบโค้ด

## การทดสอบ

### Unit Tests
รันการทดสอบ:
```bash
# รันทดสอบทั้งหมด
yarn test

```

## API Endpoints

### Authentication
- `POST /auth/register`: ลงทะเบียนผู้ใช้ใหม่
- `POST /auth/login`: เข้าสู่ระบบ
- `GET /auth/me`: ดูข้อมูลผู้ใช้ปัจจุบัน

### Communities
- `GET /communities`: ดูรายการชุมชนทั้งหมด
- `GET /communities/:id`: ดูข้อมูลชุมชน
- `POST /communities`: สร้างชุมชนใหม่

### Posts
- `GET /posts`: ดูรายการโพสต์ทั้งหมด
- `GET /posts/:id`: ดูข้อมูลโพสต์
- `POST /posts`: สร้างโพสต์ใหม่
- `PUT /posts/:id`: แก้ไขโพสต์
- `DELETE /posts/:id`: ลบโพสต์

### Posts Comment
- `POST /posts/:postId/comments` เพิ่ม comment ไปยัง post
- `GET  /posts/:postId/comments` get comment ทั้งหมดใน post
- `PUT  /posts/:postId/comments/commentId` แก้ไข comment
- `DELETE /posts/:postId/comments/commentId` ลบ comment

### Users
- `GET /users`: ดูรายการผู้ใช้ทั้งหมด
- `POST /users`: สร้างผู้ใช้ใหม่


### สิ่งที่ imprement เพิ่ม
- ทำ seed data ข้อมูล post comment user

### โปร Feedback การส่งงานของผมด้วยครับ
