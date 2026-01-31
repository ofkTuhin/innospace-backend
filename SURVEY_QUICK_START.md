# Survey System Quick Start Guide

## Step 1: Setup Database and Run Server

```bash
# Install dependencies
yarn install

# Run database migration
npx prisma migrate dev

# Start development server
yarn dev
```

Server will run on: `http://localhost:5000`

## Step 2: Create Test Users

### Create Admin User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }'
```

### Create Officer User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "officer@test.com",
    "password": "Officer123!",
    "firstName": "Officer",
    "lastName": "User",
    "role": "OFFICER"
  }'
```

## Step 3: Login and Get Tokens

### Login as Admin

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin123!"
  }'
```

Save the `accessToken` from response: `ADMIN_TOKEN`

### Login as Officer

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "officer@test.com",
    "password": "Officer123!"
  }'
```

Save the `accessToken` from response: `OFFICER_TOKEN`

## Step 4: Admin Creates Survey

```bash
curl -X POST http://localhost:5000/api/v1/survey \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Employee Satisfaction Survey 2026",
    "description": "Help us improve our workplace",
    "fields": [
      {
        "label": "What is your name?",
        "fieldType": "TEXT",
        "isRequired": true,
        "orderIndex": 0
      },
      {
        "label": "How satisfied are you with your job?",
        "fieldType": "RADIO",
        "isRequired": true,
        "options": [
          "Very Satisfied",
          "Satisfied",
          "Neutral",
          "Unsatisfied",
          "Very Unsatisfied"
        ],
        "orderIndex": 1
      },
      {
        "label": "What benefits are most important to you?",
        "fieldType": "CHECKBOX",
        "isRequired": false,
        "options": [
          "Health Insurance",
          "Retirement Plan",
          "Flexible Hours",
          "Remote Work",
          "Professional Development"
        ],
        "orderIndex": 2
      },
      {
        "label": "Which department do you work in?",
        "fieldType": "SELECT",
        "isRequired": true,
        "options": [
          "Engineering",
          "Sales",
          "Marketing",
          "HR",
          "Operations"
        ],
        "orderIndex": 3
      }
    ]
  }'
```

Save the survey `id` from response: `SURVEY_ID`

## Step 5: Officer Views Available Surveys

```bash
curl -X GET "http://localhost:5000/api/v1/survey?page=1&limit=10" \
  -H "Authorization: Bearer <OFFICER_TOKEN>"
```

## Step 6: Officer Views Survey Details

```bash
curl -X GET "http://localhost:5000/api/v1/survey/<SURVEY_ID>" \
  -H "Authorization: Bearer <OFFICER_TOKEN>"
```

Note down the `field IDs` for submission.

## Step 7: Officer Submits Survey

```bash
curl -X POST "http://localhost:5000/api/v1/survey/<SURVEY_ID>/submit" \
  -H "Authorization: Bearer <OFFICER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {
        "fieldId": "<FIELD_1_ID>",
        "answer": ["John Doe"]
      },
      {
        "fieldId": "<FIELD_2_ID>",
        "answer": ["Very Satisfied"]
      },
      {
        "fieldId": "<FIELD_3_ID>",
        "answer": ["Health Insurance", "Flexible Hours", "Remote Work"]
      },
      {
        "fieldId": "<FIELD_4_ID>",
        "answer": ["Engineering"]
      }
    ]
  }'
```

## Step 8: Admin Views Survey Submissions

```bash
curl -X GET "http://localhost:5000/api/v1/survey/<SURVEY_ID>/submissions" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

## Step 9: Admin Updates Survey (Optional)

```bash
curl -X PATCH "http://localhost:5000/api/v1/survey/<SURVEY_ID>" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Survey Title",
    "isActive": true
  }'
```

## Step 10: Admin Deactivates Survey (Optional)

```bash
curl -X PATCH "http://localhost:5000/api/v1/survey/<SURVEY_ID>" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

## Testing Edge Cases

### Test 1: Officer tries to submit twice (should fail)

```bash
# Try to submit again with the same officer token
curl -X POST "http://localhost:5000/api/v1/survey/<SURVEY_ID>/submit" \
  -H "Authorization: Bearer <OFFICER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [...]
  }'

# Expected: 400 Bad Request - "You have already submitted this survey"
```

### Test 2: Officer tries to create survey (should fail)

```bash
curl -X POST http://localhost:5000/api/v1/survey \
  -H "Authorization: Bearer <OFFICER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Unauthorized Survey",
    "fields": [...]
  }'

# Expected: 403 Forbidden - "Only admins can create surveys"
```

### Test 3: Officer tries to view submissions (should fail)

```bash
curl -X GET "http://localhost:5000/api/v1/survey/<SURVEY_ID>/submissions" \
  -H "Authorization: Bearer <OFFICER_TOKEN>"

# Expected: 403 Forbidden - "Only admins can view survey submissions"
```

### Test 4: Submit with missing required field (should fail)

```bash
curl -X POST "http://localhost:5000/api/v1/survey/<SURVEY_ID>/submit" \
  -H "Authorization: Bearer <NEW_OFFICER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {
        "fieldId": "<FIELD_1_ID>",
        "answer": ["John Doe"]
      }
    ]
  }'

# Expected: 400 Bad Request - "Required field 'X' is missing"
```

### Test 5: Submit invalid option for RADIO field (should fail)

```bash
curl -X POST "http://localhost:5000/api/v1/survey/<SURVEY_ID>/submit" \
  -H "Authorization: Bearer <NEW_OFFICER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {
        "fieldId": "<RADIO_FIELD_ID>",
        "answer": ["Invalid Option"]
      }
    ]
  }'

# Expected: 400 Bad Request - "Invalid options for field 'X'"
```

## Using Postman

1. Import the Swagger/OpenAPI spec from:

   ```
   http://localhost:5000/api-docs
   ```

2. Create an environment with variables:
   - `baseUrl`: `http://localhost:5000/api/v1`
   - `adminToken`: `<ADMIN_TOKEN>`
   - `officerToken`: `<OFFICER_TOKEN>`
   - `surveyId`: `<SURVEY_ID>`

3. Use `{{baseUrl}}/survey` format in requests

## Using Swagger UI

Visit: `http://localhost:5000/api-docs`

1. Click "Authorize" button
2. Enter: `Bearer <TOKEN>`
3. Test all endpoints interactively

## Database Inspection

```bash
# Open Prisma Studio
npx prisma studio
```

This opens a GUI at `http://localhost:5555` to view all database records.

## Troubleshooting

### Issue: "User not found" during login

**Solution**: Ensure user was created with correct role. Check database.

### Issue: "Invalid token"

**Solution**: Token may have expired. Re-login to get new token.

### Issue: "Survey not found"

**Solution**: Verify survey ID is correct. Use GET /survey to list all surveys.

### Issue: Database connection error

**Solution**: Check DATABASE_URL in .env file and ensure PostgreSQL is running.

## Clean Up

### Delete all submissions for a survey

```sql
-- Connect to database
DELETE FROM submission_answers WHERE submission_id IN (
  SELECT id FROM survey_submissions WHERE survey_id = '<SURVEY_ID>'
);
DELETE FROM survey_submissions WHERE survey_id = '<SURVEY_ID>';
```

### Delete a survey

```bash
curl -X DELETE "http://localhost:5000/api/v1/survey/<SURVEY_ID>" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

This will cascade delete all fields and submissions.
