# Dynamic Survey Management System

A comprehensive backend system for managing dynamic surveys with role-based access control.

## Overview

This system implements a complete survey management solution where:

- **Admins** can create, update, and manage surveys with dynamic fields
- **Officers** can view and submit responses to surveys
- Admins can view all submissions for their surveys

## Tech Stack

### Core Technologies

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI

### Architecture Pattern

- **Repository Pattern**: Separation of data access logic
- **Service Layer**: Business logic encapsulation
- **Controller Layer**: Request/response handling
- **Middleware**: Authentication, validation, rate limiting

## Database Schema

### User Roles

```prisma
enum UserRole {
  HQ
  ARCHROMA
  MILL
  ADMIN     // Can manage surveys
  OFFICER   // Can submit surveys
}
```

### Survey Tables

#### Survey

- `id`: UUID (Primary Key)
- `title`: String (required)
- `description`: String (optional)
- `isActive`: Boolean (default: true)
- `createdById`: UUID (Foreign Key to User)
- `createdAt`: DateTime
- `updatedAt`: DateTime

#### SurveyField

- `id`: UUID (Primary Key)
- `surveyId`: UUID (Foreign Key to Survey)
- `label`: String
- `fieldType`: Enum (TEXT, CHECKBOX, RADIO, SELECT)
- `isRequired`: Boolean
- `options`: String[] (for CHECKBOX, RADIO, SELECT)
- `orderIndex`: Integer (for field ordering)

#### SurveySubmission

- `id`: UUID (Primary Key)
- `surveyId`: UUID (Foreign Key to Survey)
- `submittedById`: UUID (Foreign Key to User)
- `submittedAt`: DateTime

#### SubmissionAnswer

- `id`: UUID (Primary Key)
- `submissionId`: UUID (Foreign Key to SurveySubmission)
- `fieldId`: UUID (Foreign Key to SurveyField)
- `answer`: String[] (supports multiple values for checkboxes)

## API Endpoints

### Base URL

```
/api/v1/survey
```

### Admin Endpoints

#### 1. Create Survey

```http
POST /api/v1/survey
Authorization: Bearer <admin_token>

Request Body:
{
  "title": "Customer Satisfaction Survey",
  "description": "Rate your experience",
  "fields": [
    {
      "label": "Your Name",
      "fieldType": "TEXT",
      "isRequired": true,
      "orderIndex": 0
    },
    {
      "label": "How satisfied are you?",
      "fieldType": "RADIO",
      "isRequired": true,
      "options": ["Very Satisfied", "Satisfied", "Neutral", "Unsatisfied"],
      "orderIndex": 1
    },
    {
      "label": "Which features do you like?",
      "fieldType": "CHECKBOX",
      "isRequired": false,
      "options": ["Feature A", "Feature B", "Feature C"],
      "orderIndex": 2
    }
  ]
}

Response (201):
{
  "success": true,
  "message": "Survey created successfully",
  "data": {
    "id": "uuid",
    "title": "Customer Satisfaction Survey",
    "fields": [...]
  }
}
```

#### 2. Get All Surveys

```http
GET /api/v1/survey?page=1&limit=10&searchTerm=customer&isActive=true
Authorization: Bearer <admin_or_officer_token>

Response (200):
{
  "success": true,
  "message": "Surveys retrieved successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5
  },
  "data": [...]
}
```

#### 3. Get Survey by ID

```http
GET /api/v1/survey/:surveyId
Authorization: Bearer <admin_or_officer_token>

Response (200):
{
  "success": true,
  "message": "Survey retrieved successfully",
  "data": {
    "id": "uuid",
    "title": "...",
    "fields": [...]
  }
}
```

#### 4. Update Survey

```http
PATCH /api/v1/survey/:surveyId
Authorization: Bearer <admin_token>

Request Body:
{
  "title": "Updated Title",
  "isActive": false,
  "fields": [...]  // Optional: replaces all fields
}

Response (200):
{
  "success": true,
  "message": "Survey updated successfully",
  "data": {...}
}
```

#### 5. Delete Survey

```http
DELETE /api/v1/survey/:surveyId
Authorization: Bearer <admin_token>

Response (200):
{
  "success": true,
  "message": "Survey deleted successfully"
}
```

#### 6. Get Survey Submissions

```http
GET /api/v1/survey/:surveyId/submissions
Authorization: Bearer <admin_token>

Response (200):
{
  "success": true,
  "message": "Survey submissions retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "submittedAt": "2026-01-31T...",
      "submittedBy": {
        "id": "uuid",
        "email": "officer@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "answers": [
        {
          "field": {
            "label": "Your Name",
            "fieldType": "TEXT"
          },
          "answer": ["John Doe"]
        },
        {
          "field": {
            "label": "How satisfied are you?",
            "fieldType": "RADIO"
          },
          "answer": ["Very Satisfied"]
        }
      ]
    }
  ]
}
```

### Officer Endpoints

#### Submit Survey

```http
POST /api/v1/survey/:surveyId/submit
Authorization: Bearer <officer_token>

Request Body:
{
  "answers": [
    {
      "fieldId": "field-uuid-1",
      "answer": ["John Doe"]
    },
    {
      "fieldId": "field-uuid-2",
      "answer": ["Very Satisfied"]
    },
    {
      "fieldId": "field-uuid-3",
      "answer": ["Feature A", "Feature C"]  // Multiple for checkbox
    }
  ]
}

Response (201):
{
  "success": true,
  "message": "Survey submitted successfully",
  "data": {
    "id": "submission-uuid",
    "surveyId": "survey-uuid",
    "submittedAt": "2026-01-31T..."
  }
}
```

## Validation Rules

### Survey Creation

- Title is required
- At least one field must be defined
- CHECKBOX, RADIO, and SELECT fields must have options
- Field labels are required
- Field type must be valid enum value

### Survey Submission

- User can only submit once per survey
- All required fields must be answered
- RADIO fields must have exactly one answer
- Answers must match field options (for CHECKBOX, RADIO, SELECT)
- Field IDs must exist in the survey

### Role-Based Access

- **ADMIN**: Full CRUD on surveys, view all submissions
- **OFFICER**: View active surveys, submit responses (once per survey)

## Setup Instructions

### Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Yarn

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd innospace-backend
```

2. **Install dependencies**

```bash
yarn install
```

3. **Configure environment**

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
```

4. **Run migrations**

```bash
npx prisma migrate dev
```

5. **Seed database (optional)**

```bash
npx prisma db seed
```

6. **Start development server**

```bash
yarn dev
```

### Production Build

```bash
yarn build
yarn start
```

## Project Structure

```
src/
├── app/
│   ├── middleware/
│   │   ├── checkAuth.ts           # JWT authentication
│   │   ├── zodValidationHandler.ts # Zod validation
│   │   └── rateLimiter.ts         # Rate limiting
│   ├── Modules/
│   │   ├── survey/
│   │   │   ├── survey.interface.ts
│   │   │   ├── survey.validation.ts
│   │   │   ├── survey.dto.ts
│   │   │   ├── survey.repository.ts
│   │   │   ├── survey.service.ts
│   │   │   ├── survey.controller.ts
│   │   │   └── survey.router.ts
│   │   ├── auth/                  # Authentication module
│   │   └── users/                 # User management
│   └── routes/
│       └── routes.ts              # Main router
├── config/
│   └── index.ts                   # Configuration
├── docs/
│   └── survey.swagger.yaml        # API documentation
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Database migrations
└── shared/
    ├── prisma.ts                  # Prisma client
    └── logger.ts                  # Winston logger
```

## Design Decisions

### 1. **Repository Pattern**

- Separates data access from business logic
- Makes the codebase testable and maintainable
- Allows easy swapping of data sources

### 2. **Dynamic Field Storage**

- Fields stored in separate table with JSON options
- Flexible schema supports any field type
- Easy to add new field types in the future

### 3. **Answer Storage**

- Answers stored as string arrays
- Supports both single (TEXT, RADIO, SELECT) and multiple (CHECKBOX) values
- Simplifies querying and data retrieval

### 4. **Role-Based Access Control**

- Implemented at middleware level
- Enforced in service layer for defense-in-depth
- User role attached to JWT payload

### 5. **One Submission Per User**

- Prevents duplicate submissions
- Checked at service layer before creation
- Can be modified for multiple submissions if needed

### 6. **Soft Delete Support**

- CASCADE delete for related records
- Survey deletion removes all fields and submissions
- Can implement soft delete if historical data needed

## Assumptions & Limitations

### Assumptions

1. Users must register/login before accessing the system
2. Admin role is manually assigned (not self-registerable)
3. Officers can only submit once per survey
4. Survey fields cannot be individually updated (replace all)
5. PostgreSQL is the database (uses UUID, arrays)

### Current Limitations

1. No file upload support in survey answers
2. No survey versioning (updates replace existing)
3. No draft submissions (submit or discard)
4. No answer editing after submission
5. No bulk submission export (can be added)

### Future Enhancements

- Survey templates
- Conditional fields (show based on previous answers)
- Survey analytics and reports
- CSV/PDF export of submissions
- Survey scheduling (publish/expire dates)
- Multi-language support
- Survey cloning
- Answer validation rules (regex, min/max length)

## API Testing

### Using Swagger UI

Access Swagger documentation:

```
http://localhost:5000/api-docs
```

### Using cURL

**Create Admin User:**

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!",
    "role": "ADMIN"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

**Create Survey:**

```bash
curl -X POST http://localhost:5000/api/v1/survey \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Survey",
    "fields": [
      {
        "label": "Name",
        "fieldType": "TEXT",
        "isRequired": true
      }
    ]
  }'
```

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- Input validation with Zod
- SQL injection protection (Prisma ORM)
- CORS configuration
- Environment variable protection

## Contributing

1. Follow the established patterns (Repository → Service → Controller)
2. Add validation schemas for new endpoints
3. Update Swagger documentation
4. Write unit tests for services
5. Run `yarn lint` before committing

## License

ISC

## Author

Omar Faruk

---

For questions or issues, please open a GitHub issue or contact the development team.
