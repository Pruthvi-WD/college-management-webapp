/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'staff' | 'student' | 'parent';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  birthday: string; // Format: "MM-DD" (e.g., "06-27" for today)
  studentId?: string; // Links Parent or Student to their profile
  department?: string;
  username?: string;
  password?: string;
}

export interface SessionAttendance {
  id: string;
  date: string;
  status: 'Present' | 'Absent';
}

export interface SubjectAttendance {
  subject: string;
  professorName: string;
  sessions: SessionAttendance[];
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  department: string;
  year: number; // 1, 2, 3, or 4
  email: string;
  attendancePercent: number;
  internalMarks: number; // Max 50
  finalMarks: number; // Max 100
  gpa: number;
  cgpa: number;
  grade: string; // Letter grade e.g. "A+", "B", "F"
  atRisk: boolean; // Computed: attendance < 75% or internalMarks < 25
  assignmentsCompleted: number;
  totalAssignments: number;
  badges: string[];
  attendanceTrend: { date: string; value: number }[]; // for parent trend chart
  performanceHistory: { term: string; score: number; classAverage: number }[]; // for grading analytics
  subjectAttendance?: SubjectAttendance[];
  semester?: number; // 1 to 6
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  department: string;
  hoursTaughtWeekly: number;
  subjects: string[];
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  time: string; // e.g. "09:00 AM - 10:00 AM"
  subject: string;
  classroom: string;
  professorId: string;
  professorName: string;
  department: string;
  year: number;
  semester?: number;
  assignedStudentIds?: string[];
  className?: string;
}

export interface Resource {
  id: string;
  name: string;
  type: 'Seminar Hall' | 'AV Room' | 'Lab Asset';
  status: 'functional' | 'under maintenance';
  bookedSlots: { date: string; time: string; bookedBy: string }[];
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'Placements' | 'Exams' | 'CulturalFest';
  date: string;
  tags: string[];
  attachmentName?: string;
}

export interface Grievance {
  id: string;
  title: string;
  description: string;
  category: string;
  timestamp: string;
}

export interface StudyGroup {
  id: string;
  topic: string;
  time: string;
  location: string;
  hostName: string;
  memberCount: number;
  maxMembers: number;
  members: string[]; // List of user names
}

export interface CertificateRequest {
  id: string;
  studentId: string;
  studentName: string;
  type: 'Bonafide' | 'Transfer (TC)' | 'No-Objection Certificates (NOC)';
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: string;
  signedPdfUrl?: string;
}

export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  tuitionFee: number;
  labFee: number;
  libraryFee: number;
  paidAmount: number;
  paymentStatus: 'Paid' | 'Outstanding';
  dueDate: string;
}
