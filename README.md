
# LMS Course & Module Management System

A comprehensive Learning Management System (LMS) with course and module management capabilities, built with React frontend, Express backend, and MongoDB database.

## 🚀 Features

### For Instructors:
- ✅ **Course Creation**: Create courses with title, description, category, level, duration, and price
- ✅ **Module Management**: Add multiple modules per course with title, content, video URLs, and order
- ✅ **Module Reordering**: Drag and drop or manual reordering of modules
- ✅ **Course Editing**: Update course details and module information
- ✅ **Course Deletion**: Remove courses and associated modules
- ✅ **Progress Tracking**: View student progress and completion status
- ✅ **Assessment Management**: Create quizzes and grade student submissions

### For Students:
- ✅ **Course Enrollment**: Browse and enroll in available courses
- ✅ **Module Viewing**: View modules in correct order with progress tracking
- ✅ **Content Consumption**: Watch videos, read content, and access resources
- ✅ **Progress Tracking**: See completion status for each module and course
- ✅ **Assessment Taking**: Take quizzes and view results
- ✅ **Certificate Generation**: Earn certificates upon course completion

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
```
backend/
├── models/
│   ├── Course.js          # Course schema with module references
│   ├── Module.js          # Module schema with course relationship
│   └── User.js            # User authentication
├── routes/
│   └── courses.js         # Complete CRUD API for courses & modules
├── middleware/
│   ├── auth.js            # JWT authentication
│   └── instructorAuth.js  # Role-based authorization
└── server.js              # Express server setup
```

### Frontend (React)
```
frontend/src/components/
├── CourseManagement.js    # Instructor course management interface
├── EnrolledCourses.js     # Student course viewing interface
├── StudentDashboard.js    # Student dashboard with course integration
├── InstructorDashboard.js # Instructor dashboard with course management
└── AssessmentTab.js       # Quiz and assessment components
```

## 📊 Database Schema

### Course Model
```javascript
{
  title: String,           // Course title
  description: String,     // Course description
  category: String,        // Course category
  level: String,           // beginner/intermediate/advanced
  duration: Number,        // Total hours
  price: Number,           // Course price
  instructor: ObjectId,    // Reference to User
  modules: [ObjectId],     // Array of Module references
  isPublished: Boolean,    // Publication status
  enrollmentCount: Number, // Number of enrolled students
  rating: Number,          // Average rating
  totalRatings: Number     // Total number of ratings
}
```

### Module Model
```javascript
{
  title: String,           // Module title
  description: String,     // Module description
  content: String,         // Module content/text
  order: Number,           // Display order (auto-incremented)
  course: ObjectId,        // Reference to Course
  videoUrl: String,        // Optional video URL
  documentUrl: String,     // Optional document URL
  duration: Number,        // Module duration in minutes
  isPublished: Boolean,    // Publication status
  quiz: ObjectId,          // Reference to Quiz (optional)
  resources: [{            // Additional resources
    title: String,
    url: String,
    type: String
  }],
  learningObjectives: [String], // Learning objectives
  prerequisites: [ObjectId]     // Prerequisite modules
}
```

## 🔌 API Endpoints

### Course Management
```
GET    /courses                    # Get all courses (with filters)
GET    /courses/:id               # Get course by ID with modules
POST   /courses                   # Create new course (instructor only)
PUT    /courses/:id               # Update course (instructor only)
DELETE /courses/:id               # Delete course (instructor only)
```

### Module Management
```
GET    /courses/:courseId/modules           # Get modules for course
POST   /courses/:courseId/modules           # Add module to course
PUT    /courses/:courseId/modules/:moduleId # Update module
DELETE /courses/:courseId/modules/:moduleId # Delete module
PUT    /courses/:courseId/modules/reorder   # Reorder modules
```

### Student Management
```
GET    /courses/student/:studentId/enrollments # Get student enrollments
POST   /courses/:id/enroll                    # Enroll student in course
PUT    /courses/:courseId/progress            # Update module progress
```

## 🎯 Key Features Implementation

### 1. Course Creation with Modules
- Instructors can create courses with basic information
- Modules are created automatically when course is saved
- Proper order assignment and validation

### 2. Module Management
- **Order Management**: Auto-incrementing order with unique constraints
- **Content Types**: Support for text, video, documents, and resources
- **Prerequisites**: Module dependency system
- **Learning Objectives**: Structured learning goals

### 3. Student Experience
- **Progressive Learning**: Modules unlock based on completion
- **Progress Tracking**: Real-time progress updates
- **Content Consumption**: Video player, document viewer, and text content
- **Assessment Integration**: Quiz taking and result viewing

### 4. Database Relationships
- **One-to-Many**: Course → Modules
- **Many-to-One**: Modules → Course
- **Referential Integrity**: Proper foreign key relationships
- **Population**: Efficient data loading with populate()

## 🛠️ Setup Instructions

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=your-secret-key
PORT=5000
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Instructor and student role separation
- **Input Validation**: Comprehensive form validation
- **Error Handling**: Proper error responses and logging
- **Data Sanitization**: XSS and injection protection

## 📱 User Interface

### Instructor Dashboard
- Clean, modern interface with purple accent colors
- Modal-based forms for course and module creation
- Drag-and-drop module reordering
- Real-time progress tracking
- Assessment management tools

### Student Dashboard
- Card-based course display
- Progress bars and completion indicators
- Module unlocking system
- Video player integration
- Certificate generation

## 🚀 Future Enhancements

- [ ] **Real-time Collaboration**: Live chat and discussion forums
- [ ] **Advanced Analytics**: Detailed learning analytics and insights
- [ ] **Mobile App**: React Native mobile application
- [ ] **AI Integration**: Smart content recommendations
- [ ] **Gamification**: Points, badges, and leaderboards
- [ ] **Multi-language Support**: Internationalization
- [ ] **Offline Support**: Service worker for offline access
- [ ] **Advanced Assessment**: Multiple question types and auto-grading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository or contact the development team. 
>>>>>>> 2bb01968afe4321132296edcc90f50f1824245ea
