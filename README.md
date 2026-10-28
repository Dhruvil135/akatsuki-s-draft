# Akatsuki's Draft: AI-Enabled Content Sharing Platform (Backend)

A Node.js/Express backend for a content sharing platform where users can create, edit, and publish content with AI-powered improvement using Google Gemini.

## Features

- **User Authentication** — Register, login, JWT-based auth
- **Post Management** — Create, read, update, delete posts with image uploads
- **Admin Approval Workflow** — Posts go through pending → approved/rejected flow
- **AI Content Improvement** — Use Google Gemini to enhance writing while preserving the original draft

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **File Uploads**: Multer
- **AI**: Google Gemini API (`@google/genai`)

## Setup

1. **Clone and install**:
   ```bash
   cd akatsukis-draft-backend
   npm install
   ```

2. **Configure environment** — Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/akatsukis-draft
   JWT_SECRET=your_jwt_secret_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Start the server**:
   ```bash
   npm run dev   # development (with nodemon)
   npm start     # production
   ```

## API Endpoints

### Authentication
| Method | Endpoint         | Description                        | Access  |
|--------|------------------|------------------------------------|---------|
| POST   | `/auth/register` | Register a new user                | Public  |
| POST   | `/auth/login`    | Log in and receive a JWT token     | Public  |
| GET    | `/auth/me`       | Get logged-in user's details       | Private |

### User — Post Management
| Method | Endpoint          | Description                        | Access  |
|--------|-------------------|------------------------------------|---------|
| POST   | `/posts`          | Create a new post or draft         | Private |
| GET    | `/posts`          | View all approved posts            | Public  |
| GET    | `/posts/:id`      | View an approved post by ID        | Public  |
| GET    | `/posts/my-posts` | View your own posts and drafts     | Private |
| PATCH  | `/posts/:id`      | Update your own post               | Private |
| DELETE | `/posts/:id`      | Delete your own post               | Private |

### Admin — Post Approval
| Method | Endpoint                      | Description                  | Access        |
|--------|-------------------------------|------------------------------|---------------|
| GET    | `/admin/posts/pending`        | View posts awaiting approval | Private/Admin |
| PATCH  | `/admin/posts/approve/:id`    | Approve a post               | Private/Admin |
| PATCH  | `/admin/posts/reject/:id`     | Reject a post                | Private/Admin |

### AI Integration — Content Improvement
| Method | Endpoint                | Description                                    | Access  |
|--------|-------------------------|------------------------------------------------|---------|
| POST   | `/ai/improve/:postId`   | Improve content using AI, save as new draft    | Private |

## Schema Design

### User Schema
```json
{
  "name": "String (required)",
  "email": "String (required, unique)",
  "password": "String (required, hashed)",
  "role": "String (admin | user, default: user)"
}
```

### Post Schema
```json
{
  "title": "String (required)",
  "description": "String",
  "content": "String (required)",
  "image": "String (file path)",
  "category": "String (default: general)",
  "createdBy": "ObjectId (ref: User)",
  "status": "String (draft | pending | approved | rejected)"
}
```

## Project Structure

```
akatsukis-draft-backend/
├── src/
│   ├── config/
│   │   ├── db.js            # MongoDB connection
│   │   └── multer.js        # File upload config
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── aiController.js
│   │   ├── authController.js
│   │   └── postController.js
│   ├── middleware/
│   │   └── auth.js          # JWT & admin middleware
│   ├── models/
│   │   ├── Post.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── authRoutes.js
│   │   └── postRoutes.js
│   └── server.js            # Entry point
├── uploads/                  # Uploaded images (auto-created)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```
