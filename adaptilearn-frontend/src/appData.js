export const resources = [
  {
    key: 'users',
    label: 'Users',
    singular: 'User',
    description: 'Manage student and teacher accounts.',
    endpoint: '/users',
    createEndpoint: '/users/register',
    columns: [
      { key: 'fullName', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      { key: 'rewardPoints', label: 'Points' },
    ],
    fields: [
      { key: 'fullName', label: 'Full name', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'password', label: 'Password', type: 'password', requiredOnCreate: true, help: 'Leave blank when editing to keep the current password.' },
      { key: 'role', label: 'Role', type: 'select', options: ['STUDENT', 'TEACHER'], required: true },
      { key: 'rewardPoints', label: 'Reward points', type: 'number', min: 0, required: true },
    ],
    title: (row) => row.fullName,
  },
  {
    key: 'classrooms',
    label: 'Classrooms',
    singular: 'Classroom',
    description: 'Organize learners into subject-based classrooms.',
    endpoint: '/classrooms',
    columns: [
      { key: 'name', label: 'Classroom' },
      { key: 'subject', label: 'Subject' },
      { key: 'joinCode', label: 'Join code' },
    ],
    fields: [
      { key: 'name', label: 'Classroom name', required: true },
      { key: 'subject', label: 'Subject', required: true },
      { key: 'joinCode', label: 'Join code', required: true },
      { key: 'studentIds', label: 'Enrolled students', type: 'multiRelation', source: 'users', filter: (user) => user.role === 'STUDENT', help: 'Hold Ctrl or Command to select more than one student.' },
    ],
    title: (row) => row.name,
  },
  {
    key: 'lessons',
    label: 'Lessons',
    singular: 'Lesson',
    description: 'Create and update learning materials.',
    endpoint: '/lessons',
    columns: [
      { key: 'title', label: 'Lesson' },
      { key: 'teacher.fullName', label: 'Teacher' },
      { key: 'description', label: 'Description' },
    ],
    fields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'description', label: 'Short description', type: 'textarea' },
      { key: 'content', label: 'Lesson content', type: 'textarea', rows: 5 },
      { key: 'teacherId', label: 'Teacher', type: 'relation', source: 'users', filter: (user) => user.role === 'TEACHER', required: true },
      { key: 'classroomId', label: 'Classroom', type: 'relation', source: 'classrooms', required: true },
    ],
    title: (row) => row.title,
  },
  {
    key: 'quizzes',
    label: 'Quizzes',
    singular: 'Quiz',
    description: 'Connect quizzes to lessons.',
    endpoint: '/quizzes',
    columns: [
      { key: 'title', label: 'Quiz' },
      { key: 'lesson.title', label: 'Lesson' },
      { key: 'createdAt', label: 'Created' },
    ],
    fields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'lessonId', label: 'Lesson', type: 'relation', source: 'lessons', required: true },
    ],
    title: (row) => row.title,
  },
  {
    key: 'adaptiveRules',
    label: 'Adaptive rules',
    singular: 'Adaptive rule',
    description: 'Set the skill and score thresholds used to adapt quizzes.',
    endpoint: '/adaptive-rules',
    columns: [
      { key: 'quiz.title', label: 'Quiz' },
      { key: 'minSkillLevel', label: 'Minimum skill (%)' },
      { key: 'thresholdScore', label: 'Score threshold (%)' },
    ],
    fields: [
      { key: 'quizId', label: 'Quiz', type: 'relation', source: 'quizzes', required: true },
      { key: 'minSkillLevel', label: 'Minimum skill level (%)', type: 'number', min: 0, max: 100, required: true },
      { key: 'thresholdScore', label: 'Score threshold (%)', type: 'number', min: 0, max: 100, required: true },
    ],
    title: (row) => row.quiz?.title ?? 'Adaptive rule',
  },
  {
    key: 'questions',
    label: 'Questions',
    singular: 'Question',
    description: 'Write multiple-choice questions and set their difficulty.',
    endpoint: '/questions',
    columns: [
      { key: 'text', label: 'Question' },
      { key: 'quiz.title', label: 'Quiz' },
      { key: 'difficulty', label: 'Difficulty' },
    ],
    fields: [
      { key: 'text', label: 'Question', type: 'textarea', rows: 3, required: true },
      { key: 'options', label: 'Answer options', type: 'options', help: 'Enter one option per line.' },
      { key: 'correctAnswer', label: 'Correct answer', type: 'answer-option', required: true },
      { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['EASY', 'MEDIUM', 'HARD'], required: true },
      { key: 'quizId', label: 'Quiz', type: 'relation', source: 'quizzes', required: true },
    ],
    title: (row) => row.text,
  },
  {
    key: 'progress',
    label: 'Progress',
    singular: 'Progress record',
    description: 'Review learner progress by lesson.',
    endpoint: '/progress',
    columns: [
      { key: 'user.fullName', label: 'Learner' },
      { key: 'lesson.title', label: 'Lesson' },
      { key: 'status', label: 'Status' },
      { key: 'skillLevel', label: 'Skill level' },
    ],
    fields: [
      { key: 'userId', label: 'Learner', type: 'relation', source: 'users', filter: (user) => user.role === 'STUDENT', required: true },
      { key: 'lessonId', label: 'Lesson', type: 'relation', source: 'lessons', required: true },
      { key: 'status', label: 'Status', required: true },
      { key: 'skillLevel', label: 'Skill level (%)', type: 'number', min: 0, max: 100, required: true },
      { key: 'completionTime', label: 'Time spent (seconds)', type: 'number', min: 0, required: true },
    ],
    title: (row) => `${row.user?.fullName ?? 'Learner'} - ${row.lesson?.title ?? 'Lesson'}`,
  },
  {
    key: 'attempts',
    label: 'Quiz attempts',
    singular: 'Quiz attempt',
    description: 'Review quiz submissions and recorded results.',
    endpoint: '/attempts',
    columns: [
      { key: 'student.fullName', label: 'Learner' },
      { key: 'quiz.title', label: 'Quiz' },
      { key: 'difficulty', label: 'Difficulty' },
      { key: 'scorePercent', label: 'Score' },
      { key: 'submittedAt', label: 'Submitted' },
    ],
    fields: [
      { key: 'studentId', label: 'Learner', type: 'relation', source: 'users', filter: (user) => user.role === 'STUDENT', required: true },
      { key: 'quizId', label: 'Quiz', type: 'relation', source: 'quizzes', required: true },
      { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['EASY', 'MEDIUM', 'HARD'], required: true },
      { key: 'completionTimeSeconds', label: 'Time taken (seconds)', type: 'number', min: 0, required: true },
      { key: 'answers', label: 'Answers', type: 'answers', help: 'Choose an answer for each question at the selected difficulty.' },
    ],
    title: (row) => row.quiz?.title ?? 'Quiz attempt',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    singular: 'Notification',
    description: 'Manage messages sent to learners and teachers.',
    endpoint: '/notifications',
    columns: [
      { key: 'user.fullName', label: 'Recipient' },
      { key: 'message', label: 'Message' },
      { key: 'type', label: 'Type' },
      { key: 'isRead', label: 'Read' },
      { key: 'createdAt', label: 'Created' },
    ],
    fields: [
      { key: 'userId', label: 'Recipient', type: 'relation', source: 'users', required: true },
      { key: 'message', label: 'Message', type: 'textarea', required: true },
      { key: 'type', label: 'Type', required: true },
      { key: 'isRead', label: 'Already read', type: 'checkbox' },
    ],
    title: (row) => row.message,
  },
]

export const EMPTY_RECORDS = []

export const initialFormValue = (field) => {
  if (field.type === 'checkbox') return false
  if (field.type === 'number') return 0
  if (field.type === 'options') return ''
  if (field.type === 'multiRelation') return []
  if (field.type === 'answers') return {}
  return ''
}

export function valueAtPath(object, path) {
  return path.split('.').reduce((value, part) => value?.[part], object)
}

export function displayValue(value, column) {
  if (value == null || value === '') return '-'
  if (column.key === 'isRead') return value ? 'Yes' : 'No'
  if (column.key === 'scorePercent' || column.key === 'skillLevel') return `${value}%`
  if (column.key.endsWith('At')) return new Date(value).toLocaleString()
  return String(value)
}
