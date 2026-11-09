# AdaptiLearn

AdaptiLearn is a Spring Boot REST API with a React/Vite workspace for managing the entities in the project class diagram.

## Requirements

- JDK 17 or newer (the Maven project targets Java 17)
- Node.js 20.19+ or 22.12+
- MySQL is optional for local development; H2 is used by default

## Run locally

1. Start the backend from the repository root:

   ```powershell
   $env:JAVA_HOME = "C:\path\to\your\jdk-17-or-newer"
   $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
   .\mvnw.cmd spring-boot:run
   ```

   Replace the example path with the installed JDK directory (the system `java` command must use Java 17 or newer). The API starts at `http://localhost:8080`. The default H2 file database is created at `data/adaptilearn`; no database server is needed.

2. In another terminal, start the frontend:

   ```powershell
   cd adaptilearn-frontend
   npm install
   npm run dev
   ```

   Open `http://localhost:5173`. Vite forwards `/api` requests to the backend.

3. Optional frontend checks:

   ```powershell
   npm run lint
   npm run build
   ```

## Use MySQL instead

Set these environment variables before starting Spring Boot:

```powershell
$env:DATABASE_URL = "jdbc:mysql://localhost:3306/adaptilearn?createDatabaseIfNotExist=true"
$env:DATABASE_USERNAME = "root"
$env:DATABASE_PASSWORD = "<your-local-mysql-password>"
.\mvnw.cmd spring-boot:run
```

The schema is managed with Hibernate `ddl-auto=update`; use migrations before production deployment.

## API resources

Each resource supports list, get-by-ID, update, and delete routes. Create resources with `POST /api/{resource}`, except users, which are created with `POST /api/users/register` so passwords are hashed:

- `users` (registration and login are also available at `/api/users/register` and `/api/users/login`)
- `classrooms`
- `lessons`
- `quizzes`
- `adaptive-rules`
- `questions`
- `progress`
- `attempts`
- `notifications`

Classrooms accept `studentIds` to enroll students. Lessons require `teacherId` and `classroomId`; quizzes require `lessonId`; adaptive rules require `quizId`; questions require `quizId`; progress requires `userId` and `lessonId`; attempts require `studentId`, `quizId`, difficulty, and an answers map; notifications require `userId`.

Questions may be filtered with `quizId` and `difficulty`; lessons, quizzes, progress, attempts, and notifications support their corresponding owner/parent query parameters.
