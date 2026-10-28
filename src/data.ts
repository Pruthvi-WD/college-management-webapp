/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Student, Staff, TimetableSlot, Resource, Notice, StudyGroup, CertificateRequest, Invoice, Grievance } from './types';

// The current system date for birthday matching is 2026-06-27 (June 27)
export const CURRENT_DATE_STRING = '2026-06-27';
export const CURRENT_BIRTHDAY_KEY = '06-27';

export const MOCK_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Dr. Alice Vance',
    role: 'admin',
    email: 'principal.office@college.edu',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces',
    birthday: '06-27', // Birthday matches today!
    department: 'Administration',
    username: 'admin',
    password: 'password123'
  },
  // Faculty/Staff Users
  {
    id: 'usr-staff-1',
    name: 'Prashantini Ma\'am',
    role: 'staff',
    email: 'prashantini.maam@college.edu',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces',
    birthday: '09-12',
    department: 'Bachelor of Computer Application (BCA)',
    username: 'prashantini',
    password: 'password123'
  },
  {
    id: 'usr-staff-2',
    name: 'Roshan',
    role: 'staff',
    email: 'roshan@college.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces',
    birthday: '11-04',
    department: 'Bachelor of Computer Application (BCA)',
    username: 'roshan',
    password: 'password123'
  },
  {
    id: 'usr-staff-3',
    name: 'Jöhan',
    role: 'staff',
    email: 'johan@college.edu',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces',
    birthday: '01-22',
    department: 'Bachelor of Computer Application (BCA)',
    username: 'johan',
    password: 'password123'
  },
  {
    id: 'usr-staff-4',
    name: 'Dr. Sarah Jenkins',
    role: 'staff',
    email: 's.jenkins@college.edu',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces',
    birthday: '08-15',
    department: 'Electronics',
    username: 'sarah.jenkins',
    password: 'password123'
  },
  {
    id: 'usr-staff-5',
    name: 'Prof. Alan Turing',
    role: 'staff',
    email: 'a.turing@college.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces',
    birthday: '06-23',
    department: 'Computer Science',
    username: 'alan.turing',
    password: 'password123'
  },
  // Student Users
  {
    id: 'usr-student-1',
    name: 'Liam Johnson',
    role: 'student',
    email: 'liam.j@student.edu',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=faces',
    birthday: '06-27', // Birthday matches today!
    studentId: 'std-1',
    department: 'Bachelor of Computer Application (BCA)',
    username: 'liam.johnson',
    password: 'password123'
  },
  {
    id: 'usr-student-2',
    name: 'Marcus Miller',
    role: 'student',
    email: 'marcus.m@student.edu',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces',
    birthday: '12-05',
    studentId: 'std-2',
    department: 'Bachelor of Computer Application (BCA)',
    username: 'marcus.miller',
    password: 'password123'
  },
  {
    id: 'usr-student-3',
    name: 'Sophia Patel',
    role: 'student',
    email: 'sophia.p@student.edu',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces',
    birthday: '03-14',
    studentId: 'std-3',
    department: 'Bachelor of Computer Application (BCA)',
    username: 'sophia.patel',
    password: 'password123'
  },
  {
    id: 'usr-student-4',
    name: 'Ethan Hunt',
    role: 'student',
    email: 'ethan.h@student.edu',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces',
    birthday: '10-31',
    studentId: 'std-4',
    department: 'Bachelor of Computer Application (BCA)',
    username: 'ethan.hunt',
    password: 'password123'
  },
  {
    id: 'usr-student-5',
    name: 'Ava Martinez',
    role: 'student',
    email: 'ava.m@student.edu',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces',
    birthday: '07-19',
    studentId: 'std-5',
    department: 'Bachelor of Computer Application (BCA)',
    username: 'ava.martinez',
    password: 'password123'
  },
  {
    id: 'usr-student-6',
    name: 'Chloe Watson',
    role: 'student',
    email: 'chloe.w@student.edu',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=faces',
    birthday: '02-28',
    studentId: 'std-6',
    department: 'Bachelor of Computer Application (BCA)',
    username: 'chloe.watson',
    password: 'password123'
  },
  {
    id: 'usr-student-7',
    name: 'Devon Patel',
    role: 'student',
    email: 'devon.p@student.edu',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=faces',
    birthday: '05-11',
    studentId: 'std-7',
    department: 'Bachelor of Computer Application (BCA)',
    username: 'devon.patel',
    password: 'password123'
  },
  // Parent Users
  {
    id: 'usr-parent-1',
    name: 'Sarah Johnson',
    role: 'parent',
    email: 'sarah.j@parent.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces',
    birthday: '04-05',
    studentId: 'std-1', // Linked to Liam
    username: 'sarah.johnson',
    password: 'password123'
  },
  {
    id: 'usr-parent-2',
    name: 'Mark Miller',
    role: 'parent',
    email: 'mark.m@parent.com',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=faces',
    birthday: '08-09',
    studentId: 'std-2', // Linked to Marcus
    username: 'mark.miller',
    password: 'password123'
  },
  {
    id: 'usr-parent-3',
    name: 'Asha Patel',
    role: 'parent',
    email: 'asha.p@parent.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces',
    birthday: '12-15',
    studentId: 'std-3', // Linked to Sophia
    username: 'asha.patel',
    password: 'password123'
  }
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: 'std-1',
    name: 'Liam Johnson',
    rollNo: 'BCA-2023-042',
    department: 'Bachelor of Computer Application (BCA)',
    year: 3,
    semester: 5,
    email: 'liam.j@student.edu',
    attendancePercent: 88,
    internalMarks: 44, // Out of 50
    finalMarks: 89, // Out of 100
    gpa: 3.8,
    cgpa: 3.72,
    grade: 'A',
    atRisk: false,
    assignmentsCompleted: 9,
    totalAssignments: 10,
    badges: ['Perfect Attendance', 'Hackathon Champ', 'Top Coder'],
    attendanceTrend: [
      { date: 'Mon', value: 95 },
      { date: 'Tue', value: 92 },
      { date: 'Wed', value: 90 },
      { date: 'Thu', value: 89 },
      { date: 'Fri', value: 88 }
    ],
    performanceHistory: [
      { term: 'Term 1', score: 82, classAverage: 75 },
      { term: 'Term 2', score: 85, classAverage: 76 },
      { term: 'Term 3', score: 89, classAverage: 77 },
      { term: 'Term 4', score: 94, classAverage: 78 }
    ]
  },
  {
    id: 'std-2',
    name: 'Marcus Miller',
    rollNo: 'BCA-2023-081',
    department: 'Bachelor of Computer Application (BCA)',
    year: 3,
    semester: 5,
    email: 'marcus.m@student.edu',
    attendancePercent: 71, // < 75% -> At Risk!
    internalMarks: 22, // < 25 -> At Risk!
    finalMarks: 58,
    gpa: 2.1,
    cgpa: 2.34,
    grade: 'C-',
    atRisk: true,
    assignmentsCompleted: 4,
    totalAssignments: 10,
    badges: ['Fast Learner'],
    attendanceTrend: [
      { date: 'Mon', value: 75 },
      { date: 'Tue', value: 74 },
      { date: 'Wed', value: 72 },
      { date: 'Thu', value: 71 },
      { date: 'Fri', value: 71 }
    ],
    performanceHistory: [
      { term: 'Term 1', score: 70, classAverage: 75 },
      { term: 'Term 2', score: 68, classAverage: 76 },
      { term: 'Term 3', score: 62, classAverage: 77 },
      { term: 'Term 4', score: 58, classAverage: 78 }
    ]
  },
  {
    id: 'std-3',
    name: 'Sophia Patel',
    rollNo: 'BCA-2024-015',
    department: 'Bachelor of Computer Application (BCA)',
    year: 2,
    semester: 3,
    email: 'sophia.p@student.edu',
    attendancePercent: 96,
    internalMarks: 48,
    finalMarks: 95,
    gpa: 4.0,
    cgpa: 3.94,
    grade: 'O', // Outstanding
    atRisk: false,
    assignmentsCompleted: 10,
    totalAssignments: 10,
    badges: ['Dean\'s List', 'Math Whiz', 'Research Scholar'],
    attendanceTrend: [
      { date: 'Mon', value: 98 },
      { date: 'Tue', value: 98 },
      { date: 'Wed', value: 97 },
      { date: 'Thu', value: 96 },
      { date: 'Fri', value: 96 }
    ],
    performanceHistory: [
      { term: 'Term 1', score: 92, classAverage: 78 },
      { term: 'Term 2', score: 95, classAverage: 79 },
      { term: 'Term 3', score: 97, classAverage: 80 },
      { term: 'Term 4', score: 98, classAverage: 81 }
    ]
  },
  {
    id: 'std-4',
    name: 'Ethan Hunt',
    rollNo: 'BCA-2023-004',
    department: 'Bachelor of Computer Application (BCA)',
    year: 3,
    semester: 6,
    email: 'ethan.h@student.edu',
    attendancePercent: 64, // At Risk!
    internalMarks: 31,
    finalMarks: 72,
    gpa: 2.8,
    cgpa: 2.91,
    grade: 'B-',
    atRisk: true,
    assignmentsCompleted: 6,
    totalAssignments: 10,
    badges: ['Lab Assistant'],
    attendanceTrend: [
      { date: 'Mon', value: 68 },
      { date: 'Tue', value: 67 },
      { date: 'Wed', value: 65 },
      { date: 'Thu', value: 64 },
      { date: 'Fri', value: 64 }
    ],
    performanceHistory: [
      { term: 'Term 1', score: 72, classAverage: 73 },
      { term: 'Term 2', score: 75, classAverage: 74 },
      { term: 'Term 3', score: 71, classAverage: 75 },
      { term: 'Term 4', score: 68, classAverage: 75 }
    ]
  },
  {
    id: 'std-5',
    name: 'Ava Martinez',
    rollNo: 'BCA-2023-011',
    department: 'Bachelor of Computer Application (BCA)',
    year: 3,
    semester: 5,
    email: 'ava.m@student.edu',
    attendancePercent: 82,
    internalMarks: 24, // < 25 -> At Risk!
    finalMarks: 65,
    gpa: 2.5,
    cgpa: 2.61,
    grade: 'C+',
    atRisk: true,
    assignmentsCompleted: 7,
    totalAssignments: 10,
    badges: ['Design Master'],
    attendanceTrend: [
      { date: 'Mon', value: 85 },
      { date: 'Tue', value: 84 },
      { date: 'Wed', value: 83 },
      { date: 'Thu', value: 82 },
      { date: 'Fri', value: 82 }
    ],
    performanceHistory: [
      { term: 'Term 1', score: 66, classAverage: 71 },
      { term: 'Term 2', score: 70, classAverage: 72 },
      { term: 'Term 3', score: 68, classAverage: 72 },
      { term: 'Term 4', score: 65, classAverage: 73 }
    ]
  },
  {
    id: 'std-6',
    name: 'Chloe Watson',
    rollNo: 'BCA-2025-001',
    department: 'Bachelor of Computer Application (BCA)',
    year: 1,
    semester: 1,
    email: 'chloe.w@student.edu',
    attendancePercent: 91,
    internalMarks: 40,
    finalMarks: 82,
    gpa: 3.4,
    cgpa: 3.45,
    grade: 'B+',
    atRisk: false,
    assignmentsCompleted: 8,
    totalAssignments: 10,
    badges: ['Class Rep', 'Rising Star'],
    attendanceTrend: [
      { date: 'Mon', value: 90 },
      { date: 'Tue', value: 91 },
      { date: 'Wed', value: 91 },
      { date: 'Thu', value: 91 },
      { date: 'Fri', value: 91 }
    ],
    performanceHistory: [
      { term: 'Term 1', score: 79, classAverage: 74 },
      { term: 'Term 2', score: 81, classAverage: 74 },
      { term: 'Term 3', score: 83, classAverage: 75 },
      { term: 'Term 4', score: 85, classAverage: 76 }
    ]
  },
  {
    id: 'std-7',
    name: 'Devon Patel',
    rollNo: 'BCA-2024-019',
    department: 'Bachelor of Computer Application (BCA)',
    year: 2,
    semester: 3,
    email: 'devon.p@student.edu',
    attendancePercent: 78,
    internalMarks: 18, // < 25 -> At Risk!
    finalMarks: 50,
    gpa: 1.8,
    cgpa: 2.05,
    grade: 'D',
    atRisk: true,
    assignmentsCompleted: 5,
    totalAssignments: 10,
    badges: [],
    attendanceTrend: [
      { date: 'Mon', value: 80 },
      { date: 'Tue', value: 79 },
      { date: 'Wed', value: 78 },
      { date: 'Thu', value: 78 },
      { date: 'Fri', value: 78 }
    ],
    performanceHistory: [
      { term: 'Term 1', score: 55, classAverage: 75 },
      { term: 'Term 2', score: 58, classAverage: 76 },
      { term: 'Term 3', score: 54, classAverage: 77 },
      { term: 'Term 4', score: 50, classAverage: 78 }
    ]
  }
];

export const MOCK_STAFF: Staff[] = [
  {
    id: 'usr-staff-1',
    name: 'Prashantini Ma\'am',
    email: 'prashantini.maam@college.edu',
    department: 'Bachelor of Computer Application (BCA)',
    hoursTaughtWeekly: 18,
    subjects: ['C Programming', 'DSA', 'Data Science']
  },
  {
    id: 'usr-staff-2',
    name: 'Roshan',
    email: 'roshan@college.edu',
    department: 'Bachelor of Computer Application (BCA)',
    hoursTaughtWeekly: 16,
    subjects: ['Internet Programming', 'Java', 'Cyber Security']
  },
  {
    id: 'usr-staff-3',
    name: 'Jöhan',
    email: 'johan@college.edu',
    department: 'Bachelor of Computer Application (BCA)',
    hoursTaughtWeekly: 14,
    subjects: ['Python', 'AI', 'Deep Learning']
  }
];

export const INITIAL_TIMETABLE: TimetableSlot[] = [
  // Semester 1 (BCA Year 1)
  {
    id: 'tt-1',
    day: 'Monday',
    time: '09:00 AM - 10:30 AM',
    subject: 'C Programming',
    classroom: 'Lab Room 101',
    professorId: 'usr-staff-1',
    professorName: 'Prashantini Ma\'am',
    department: 'Bachelor of Computer Application (BCA)',
    year: 1,
    semester: 1
  },
  {
    id: 'tt-2',
    day: 'Wednesday',
    time: '11:00 AM - 12:30 PM',
    subject: 'Python',
    classroom: 'Lab Room 102',
    professorId: 'usr-staff-3',
    professorName: 'Jöhan',
    department: 'Bachelor of Computer Application (BCA)',
    year: 1,
    semester: 1
  },
  // Semester 3 (BCA Year 2)
  {
    id: 'tt-3',
    day: 'Tuesday',
    time: '09:00 AM - 10:30 AM',
    subject: 'DSA',
    classroom: 'Lab Room 201',
    professorId: 'usr-staff-1',
    professorName: 'Prashantini Ma\'am',
    department: 'Bachelor of Computer Application (BCA)',
    year: 2,
    semester: 3
  },
  {
    id: 'tt-4',
    day: 'Thursday',
    time: '01:30 PM - 03:00 PM',
    subject: 'Internet Programming',
    classroom: 'Seminar Hall A',
    professorId: 'usr-staff-2',
    professorName: 'Roshan',
    department: 'Bachelor of Computer Application (BCA)',
    year: 2,
    semester: 3
  },
  // Semester 5 (BCA Year 3)
  {
    id: 'tt-5',
    day: 'Monday',
    time: '11:00 AM - 12:30 PM',
    subject: 'Data Science',
    classroom: 'Advanced Computing Lab',
    professorId: 'usr-staff-1',
    professorName: 'Prashantini Ma\'am',
    department: 'Bachelor of Computer Application (BCA)',
    year: 3,
    semester: 5
  },
  {
    id: 'tt-6',
    day: 'Wednesday',
    time: '01:30 PM - 03:00 PM',
    subject: 'AI',
    classroom: 'AI Lab Room 303',
    professorId: 'usr-staff-3',
    professorName: 'Jöhan',
    department: 'Bachelor of Computer Application (BCA)',
    year: 3,
    semester: 5
  },
  {
    id: 'tt-7',
    day: 'Friday',
    time: '09:00 AM - 10:30 AM',
    subject: 'Cyber Security',
    classroom: 'AV Room 2',
    professorId: 'usr-staff-2',
    professorName: 'Roshan',
    department: 'Bachelor of Computer Application (BCA)',
    year: 3,
    semester: 5
  },
  // Semester 6 (BCA Year 3)
  {
    id: 'tt-8',
    day: 'Tuesday',
    time: '11:00 AM - 12:30 PM',
    subject: 'Deep Learning',
    classroom: 'Neural Network Center',
    professorId: 'usr-staff-3',
    professorName: 'Jöhan',
    department: 'Bachelor of Computer Application (BCA)',
    year: 3,
    semester: 6
  },
  {
    id: 'tt-9',
    day: 'Thursday',
    time: '09:00 AM - 10:30 AM',
    subject: 'Java',
    classroom: 'Lab Room 204',
    professorId: 'usr-staff-2',
    professorName: 'Roshan',
    department: 'Bachelor of Computer Application (BCA)',
    year: 3,
    semester: 6
  }
];

export const INITIAL_RESOURCES: Resource[] = [
  {
    id: 'res-1',
    name: 'Main Seminar Hall',
    type: 'Seminar Hall',
    status: 'functional',
    bookedSlots: [
      { date: '2026-06-27', time: '02:00 PM - 04:00 PM', bookedBy: 'Prof. Robert Chang' }
    ]
  },
  {
    id: 'res-2',
    name: 'AV Auditorium',
    type: 'AV Room',
    status: 'functional',
    bookedSlots: []
  },
  {
    id: 'res-3',
    name: 'IoT Advanced Lab',
    type: 'Lab Asset',
    status: 'functional',
    bookedSlots: [
      { date: '2026-06-28', time: '10:00 AM - 01:00 PM', bookedBy: 'Dr. Sarah Jenkins' }
    ]
  },
  {
    id: 'res-4',
    name: 'Mechanical Robotics Bay',
    type: 'Lab Asset',
    status: 'under maintenance',
    bookedSlots: []
  },
  {
    id: 'res-5',
    name: 'Virtual Reality Suite',
    type: 'AV Room',
    status: 'functional',
    bookedSlots: []
  }
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'not-1',
    title: 'Google Placement Drive 2026',
    content: 'Google India will be hosting an on-campus placement drive for 3rd and 4th year Computer Science & IT students on July 10th. Registered students must submit their updated resume in the portal by next Monday. Ensure your CGPA matches the 7.5+ cutoff requirement.',
    category: 'Placements',
    date: '2026-06-25',
    tags: ['#Placements', '#Google', '#CS', '#IT'],
    attachmentName: 'google_placement_guide.pdf'
  },
  {
    id: 'not-2',
    title: 'Final Term End Exams Timetable',
    content: 'The official timetable for the upcoming Final Term Theory Exams starting July 20th has been published. Hall tickets will be downloadable from July 5th. No student with attendance below 75% will be allowed to sit for examinations without special permission.',
    category: 'Exams',
    date: '2026-06-24',
    tags: ['#Exams', '#Timetable', '#Notice'],
    attachmentName: 'exam_schedule_july_2026.pdf'
  },
  {
    id: 'not-3',
    title: 'Renaissance Annual Cultural Fest',
    content: 'Get ready for the biggest event of the year! Renaissance 2026 kicks off on July 15th with 30+ events, live concert nights, and hackathons. Register your teams for dance, music, theater, and gaming tournaments at the student center.',
    category: 'CulturalFest',
    date: '2026-06-22',
    tags: ['#CulturalFest', '#Events', '#Renaissance'],
    attachmentName: 'renaissance_brochure_2026.pdf'
  }
];

export const INITIAL_STUDY_GROUPS: StudyGroup[] = [
  {
    id: 'sg-1',
    topic: 'Algorithms Review: Dynamic Programming',
    time: 'Monday, 04:00 PM',
    location: 'Central Library, Table No. 8',
    hostName: 'Liam Johnson',
    memberCount: 3,
    maxMembers: 6,
    members: ['Liam Johnson', 'Chloe Watson', 'Sophia Patel']
  },
  {
    id: 'sg-2',
    topic: 'Database Query Optimization & Indexing',
    time: 'Wednesday, 03:30 PM',
    location: 'CS Lab 3',
    hostName: 'Marcus Miller',
    memberCount: 1,
    maxMembers: 4,
    members: ['Marcus Miller']
  }
];

export const INITIAL_CERTIFICATES: CertificateRequest[] = [
  {
    id: 'cert-1',
    studentId: 'std-1',
    studentName: 'Liam Johnson',
    type: 'Bonafide',
    status: 'Pending',
    requestDate: '2026-06-26'
  },
  {
    id: 'cert-2',
    studentId: 'std-3',
    studentName: 'Sophia Patel',
    type: 'No-Objection Certificates (NOC)',
    status: 'Approved',
    requestDate: '2026-06-24',
    signedPdfUrl: '#download-noc'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    studentId: 'std-1',
    studentName: 'Liam Johnson',
    tuitionFee: 2500,
    labFee: 450,
    libraryFee: 150,
    paidAmount: 3100, // Fully Paid
    paymentStatus: 'Paid',
    dueDate: '2026-07-15'
  },
  {
    id: 'inv-2',
    studentId: 'std-2',
    studentName: 'Marcus Miller',
    tuitionFee: 2500,
    labFee: 450,
    libraryFee: 150,
    paidAmount: 1200, // Partially paid, outstanding balance is 1900
    paymentStatus: 'Outstanding',
    dueDate: '2026-07-15'
  }
];

export const INITIAL_GRIEVANCES: Grievance[] = [
  {
    id: 'griv-1',
    title: 'AC Maintenance in Library',
    description: 'The air conditioning in the central library third floor is not working properly for the past three days. It gets very stuffy during study hours.',
    category: 'Infrastructure',
    timestamp: '2026-06-25 10:15 AM'
  },
  {
    id: 'griv-2',
    title: 'Canteen Menu Diversification',
    description: 'Please include more healthy and vegan friendly lunch options in the main dining area.',
    category: 'Canteen',
    timestamp: '2026-06-26 02:45 PM'
  }
];

// Syllabus Progress Initial Database
export const INITIAL_SYLLABUS_PROGRESS = [
  { id: 'syl-1', course: 'C Programming', progress: 90, code: 'BCA-101' },
  { id: 'syl-2', course: 'DSA', progress: 75, code: 'BCA-301' },
  { id: 'syl-3', course: 'Data Science', progress: 60, code: 'BCA-501' },
  { id: 'syl-4', course: 'Cyber Security', progress: 85, code: 'BCA-503' },
  { id: 'syl-5', course: 'AI', progress: 50, code: 'BCA-502' }
];

// Enrich MOCK_STUDENTS with real-time subject attendance history
MOCK_STUDENTS.forEach(student => {
  // Let's have a core list of 10 general historic dates
  const dates = ["06-15", "06-16", "06-17", "06-18", "06-19", "06-22", "06-23", "06-24", "06-25", "06-26"];
  let subjects: { name: string; prof: string }[] = [];

  if (student.department === 'Bachelor of Computer Application (BCA)') {
    if (student.year === 1) {
      // Semester 1
      subjects = [
        { name: 'C Programming', prof: 'Prashantini Ma\'am' },
        { name: 'Python', prof: 'Jöhan' }
      ];
    } else if (student.year === 2) {
      // Semester 3
      subjects = [
        { name: 'DSA', prof: 'Prashantini Ma\'am' },
        { name: 'Internet Programming', prof: 'Roshan' }
      ];
    } else {
      // Year 3 (Could be Semester 5 or 6)
      if (student.id === 'std-4') { // Ethan Hunt is Semester 6
        subjects = [
          { name: 'Deep Learning', prof: 'Jöhan' },
          { name: 'Java', prof: 'Roshan' }
        ];
      } else { // Liam, Marcus, Ava are Semester 5
        subjects = [
          { name: 'Data Science', prof: 'Prashantini Ma\'am' },
          { name: 'Cyber Security', prof: 'Roshan' },
          { name: 'AI', prof: 'Jöhan' }
        ];
      }
    }
  } else {
    // Fallback for other courses
    subjects = [
      { name: 'C Programming', prof: 'Prashantini Ma\'am' },
      { name: 'Cyber Security', prof: 'Roshan' },
      { name: 'AI', prof: 'Jöhan' }
    ];
  }

  student.subjectAttendance = subjects.map(sub => {
    const sessions = dates.map((date, idx) => {
      let status: 'Present' | 'Absent' = 'Present';
      if (student.id === 'std-2') { // Marcus: 71%
        if (idx === 2 || idx === 5 || idx === 8) status = 'Absent';
      } else if (student.id === 'std-4') { // Ethan: 64%
        if (idx === 1 || idx === 3 || idx === 6 || idx === 8) status = 'Absent';
      } else if (student.id === 'std-5') { // Ava: 82%
        if (idx === 4 || idx === 7) status = 'Absent';
      } else if (student.id === 'std-7') { // Devon: 78%
        if (idx === 0 || idx === 6) status = 'Absent';
      } else if (student.id === 'std-1') { // Liam: 88%
        if (idx === 3) status = 'Absent';
      } else {
        if (idx === 4 && student.id === 'std-6') status = 'Absent';
      }

      return {
        id: `${student.id}-${sub.name.replace(/\s+/g, '')}-${date}`,
        date,
        status
      };
    });

    return {
      subject: sub.name,
      professorName: sub.prof,
      sessions
    };
  });
});

