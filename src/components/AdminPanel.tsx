/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, UserCheck, School, CreditCard, Calendar, Clock, Sparkles, AlertCircle, CheckCircle2,
  Upload, Download, Hammer, Lock, Unlock, ArrowRight, ShieldCheck, Plus, Trash2, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Student, Staff, TimetableSlot, Resource, User as UserType } from '../types';
import BiheCollegeBuilding from './BiheCollegeBuilding';

interface AdminPanelProps {
  students: Student[];
  staff: Staff[];
  timetable: TimetableSlot[];
  resources: Resource[];
  onUpdateTimetable: (slots: TimetableSlot[]) => void;
  onUpdateResources: (resources: Resource[]) => void;
  onAddStudentBulk: (newStudents: Student[]) => void;
  onUpdateStudents: (students: Student[]) => void;
  onUpdateStaff: (staff: Staff[]) => void;
  onUpdateUsers: (users: UserType[]) => void;
  users: UserType[];
}

export default function AdminPanel({
  students,
  staff,
  timetable,
  resources,
  onUpdateTimetable,
  onUpdateResources,
  onAddStudentBulk,
  onUpdateStudents,
  onUpdateStaff,
  onUpdateUsers,
  users
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'metrics' | 'timetable' | 'workload' | 'bulk' | 'resources'>('metrics');

  // Timetable Generator Form State
  const [day, setDay] = useState<TimetableSlot['day']>('Monday');
  const [time, setTime] = useState('09:00 AM - 10:30 AM');
  const [subject, setSubject] = useState('');
  const [classroom, setClassroom] = useState('Seminar Hall A');
  const [professorId, setProfessorId] = useState('');
  const [semester, setSemester] = useState<number>(1);
  const [className, setClassName] = useState<string>('Computer Science');
  const [assignmentMode, setAssignmentMode] = useState<'class' | 'specific'>('class');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [timetableError, setTimetableError] = useState<string | null>(null);
  const [timetableSuccess, setTimetableSuccess] = useState<string | null>(null);

  // Bulk CSV States
  const [dragActive, setDragActive] = useState(false);
  const [bulkUploadedCount, setBulkUploadedCount] = useState<number | null>(null);
  const [uploadedRecords, setUploadedRecords] = useState<{ name: string; rollNo: string; dept: string }[]>([]);

  // Add Professor Form States
  const [newProfName, setNewProfName] = useState('');
  const [newProfEmail, setNewProfEmail] = useState('');
  const [newProfDepartment, setNewProfDepartment] = useState('Bachelor of Computer Application (BCA)');
  const [newProfSubjects, setNewProfSubjects] = useState<string[]>([]);
  const [newProfCustomSubject, setNewProfCustomSubject] = useState('');
  const [newProfEnableInitialTimetable, setNewProfEnableInitialTimetable] = useState(false);
  const [newProfTimetableDay, setNewProfTimetableDay] = useState<TimetableSlot['day']>('Monday');
  const [newProfTimetableTime, setNewProfTimetableTime] = useState('09:00 AM - 10:30 AM');
  const [newProfTimetableClassroom, setNewProfTimetableClassroom] = useState('Lab Room 104');
  const [newProfTimetableSemester, setNewProfTimetableSemester] = useState<number>(1);
  const [newProfAutoCreateAccount, setNewProfAutoCreateAccount] = useState(true);
  const [newProfGeneratedCredentials, setNewProfGeneratedCredentials] = useState<{ username: string; password: string } | null>(null);
  const [newProfError, setNewProfError] = useState<string | null>(null);
  const [newProfSuccess, setNewProfSuccess] = useState<string | null>(null);

  // Fee calculation metrics
  const totalInvoicedFee = 2000 * 3100; // 2000 students * avg fee of 3100
  const collectedFee = 1680 * 3100 + 320 * 1200; // 84% fully paid, some partially paid
  const collectedPercent = Math.round((collectedFee / totalInvoicedFee) * 100);

  // Recharts colors
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

  // Handle adding timetable slot (prevent double booking algorithmically)
  const handleAddTimetable = (e: React.FormEvent) => {
    e.preventDefault();
    setTimetableError(null);
    setTimetableSuccess(null);

    if (!subject || !professorId) {
      setTimetableError('Please fill in all fields (subject and professor).');
      return;
    }

    const selectedProf = staff.find(s => s.id === professorId);
    if (!selectedProf) {
      setTimetableError('Selected staff member not found.');
      return;
    }

    // Double Booking Collision Detection Algorithm
    // 1. Check if classroom is already booked at that day & time
    const classroomConflict = timetable.find(
      slot => slot.day === day && slot.time === time && slot.classroom === classroom
    );
    if (classroomConflict) {
      setTimetableError(`Collision Warning: "${classroom}" is already booked for "${classroomConflict.subject}" with ${classroomConflict.professorName} at this time.`);
      return;
    }

    // 2. Check if professor is already scheduled at that day & time
    const professorConflict = timetable.find(
      slot => slot.day === day && slot.time === time && slot.professorId === professorId
    );
    if (professorConflict) {
      setTimetableError(`Conflict Warning: ${selectedProf.name} is already scheduled to teach "${professorConflict.subject}" in "${professorConflict.classroom}" during this slot.`);
      return;
    }

    const calculatedYear = Math.ceil(semester / 2);
    let finalAssignedStudentIds: string[] = [];

    if (assignmentMode === 'class') {
      const matchingStudents = students.filter(s => 
        s.year === calculatedYear && 
        s.department.toLowerCase() === className.toLowerCase()
      );
      finalAssignedStudentIds = matchingStudents.map(s => s.id);
    } else {
      finalAssignedStudentIds = [...selectedStudentIds];
    }

    if (finalAssignedStudentIds.length === 0) {
      setTimetableError(`No students found to assign. In 'class' mode, verify if there are any students in Year ${calculatedYear} (${className}). Or check 'specific' students.`);
      return;
    }

    // Safe! Add to timetable
    const newSlot: TimetableSlot = {
      id: `tt-${Date.now()}`,
      day,
      time,
      subject,
      classroom,
      professorId,
      professorName: selectedProf.name,
      department: className,
      year: calculatedYear,
      semester,
      assignedStudentIds: finalAssignedStudentIds,
      className
    };

    // Safely update students to have the subject in their attendance register
    const updatedStudentsList = students.map((std) => {
      if (finalAssignedStudentIds.includes(std.id)) {
        const currAttendance = std.subjectAttendance || [];
        const hasSub = currAttendance.some(a => a.subject.toLowerCase() === subject.toLowerCase());
        if (!hasSub) {
          const newAtt = {
            subject: subject,
            professorName: selectedProf.name,
            sessions: [
              { id: `sess-${Date.now()}-1`, date: '06-22', status: 'Present' as const },
              { id: `sess-${Date.now()}-2`, date: '06-23', status: 'Present' as const },
              { id: `sess-${Date.now()}-3`, date: '06-25', status: 'Present' as const },
              { id: `sess-${Date.now()}-4`, date: '06-26', status: 'Present' as const },
              { id: `sess-${Date.now()}-5`, date: '06-27', status: 'Present' as const }
            ]
          };
          return {
            ...std,
            subjectAttendance: [...currAttendance, newAtt]
          };
        }
      }
      return std;
    });

    onUpdateStudents(updatedStudentsList);
    onUpdateTimetable([...timetable, newSlot]);
    setTimetableSuccess(`Success! Scheduled "${subject}" in "${classroom}" under ${selectedProf.name} for ${finalAssignedStudentIds.length} assigned students.`);
    setSubject('');
    setSelectedStudentIds([]);
  };

  const handleDeleteSlot = (id: string) => {
    onUpdateTimetable(timetable.filter(slot => slot.id !== id));
  };

  // Handle adding a new professor
  const handleAddProfessor = (e: React.FormEvent) => {
    e.preventDefault();
    setNewProfError(null);
    setNewProfSuccess(null);
    setNewProfGeneratedCredentials(null);

    if (!newProfName.trim()) {
      setNewProfError('Professor name is required.');
      return;
    }
    if (!newProfEmail.trim()) {
      setNewProfError('Professor institutional email is required.');
      return;
    }

    // Determine subjects list (include custom if specified)
    let subjects = [...newProfSubjects];
    if (newProfCustomSubject.trim() && !subjects.includes(newProfCustomSubject.trim())) {
      subjects.push(newProfCustomSubject.trim());
    }

    if (subjects.length === 0) {
      setNewProfError('Please select or specify at least one subject they teach.');
      return;
    }

    // Generate a secure unique ID for the new staff member
    const newStaffId = `staff-${Date.now()}`;

    // Calculate hours taught (based on initial timetable block if enabled, otherwise 0)
    const initialHours = newProfEnableInitialTimetable ? 3 : 0;

    // 1. Create Staff object
    const newStaffMember: Staff = {
      id: newStaffId,
      name: newProfName.trim(),
      email: newProfEmail.trim(),
      department: newProfDepartment,
      hoursTaughtWeekly: initialHours,
      subjects: subjects,
    };

    // 2. Schedule Initial Timetable Slot if enabled (Conflict checking!)
    let updatedSlots = [...timetable];
    if (newProfEnableInitialTimetable) {
      // Conflict checking for Day, Time and Classroom OR Professor
      const conflict = timetable.find(
        (slot) =>
          slot.day === newProfTimetableDay &&
          slot.time === newProfTimetableTime &&
          (slot.classroom === newProfTimetableClassroom || slot.professorId === newStaffId)
      );

      if (conflict) {
        setNewProfError(
          `Timetable Conflict: ${conflict.classroom} is already booked on ${newProfTimetableDay} at ${newProfTimetableTime} for "${conflict.subject}" (taught by ${conflict.professorName}).`
        );
        return;
      }

      // Automatically determine class name & year
      const year = newProfTimetableSemester <= 2 ? 1 : newProfTimetableSemester <= 4 ? 2 : 3;
      const computedClassName = `BCA Year ${year} (Sem ${newProfTimetableSemester})`;

      // Pick the first subject from their list
      const scheduledSubject = subjects[0];

      // Get matching student IDs to pre-fill slot
      const matchingStudents = students.filter(s => 
        s.year === year && 
        s.department.toLowerCase() === 'bachelor of computer application (bca)'
      );
      const studentIds = matchingStudents.map(s => s.id);

      const newSlot: TimetableSlot = {
        id: `slot-${Date.now()}`,
        day: newProfTimetableDay,
        time: newProfTimetableTime,
        subject: scheduledSubject,
        classroom: newProfTimetableClassroom,
        professorId: newStaffId,
        professorName: newProfName.trim(),
        department: 'Bachelor of Computer Application (BCA)',
        year: year,
        semester: newProfTimetableSemester,
        className: computedClassName,
        assignedStudentIds: studentIds.length > 0 ? studentIds : students.slice(0, 5).map(s => s.id),
      };

      updatedSlots.push(newSlot);

      // Pre-fill subject attendance for matching students
      const updatedStudentsList = students.map((std) => {
        if (std.semester === newProfTimetableSemester || std.year === year) {
          const currAttendance = std.subjectAttendance || [];
          const hasSub = currAttendance.some(a => a.subject.toLowerCase() === scheduledSubject.toLowerCase());
          if (!hasSub) {
            const newAtt = {
              subject: scheduledSubject,
              professorName: newProfName.trim(),
              sessions: [
                { id: `sess-${Date.now()}-1`, date: '06-22', status: 'Present' as const },
                { id: `sess-${Date.now()}-2`, date: '06-23', status: 'Present' as const },
                { id: `sess-${Date.now()}-3`, date: '06-25', status: 'Present' as const },
                { id: `sess-${Date.now()}-4`, date: '06-26', status: 'Present' as const },
                { id: `sess-${Date.now()}-5`, date: '06-27', status: 'Present' as const }
              ]
            };
            return {
              ...std,
              subjectAttendance: [...currAttendance, newAtt]
            };
          }
        }
        return std;
      });
      onUpdateStudents(updatedStudentsList);
    }

    // 3. Auto-Create Account for portal login if checked
    if (newProfAutoCreateAccount) {
      let generatedUsername = newProfName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      const generatedPassword = 'password123';

      const usernameExists = users.some(u => u.username === generatedUsername);
      if (usernameExists) {
        generatedUsername = `${generatedUsername}${Math.floor(Math.random() * 90) + 10}`;
      }

      const newUser: UserType = {
        id: `usr-${newStaffId}`,
        name: newProfName.trim(),
        role: 'staff',
        email: newProfEmail.trim(),
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces',
        birthday: '01-01',
        department: newProfDepartment,
        username: generatedUsername,
        password: generatedPassword,
      };

      onUpdateUsers([...users, newUser]);
      setNewProfGeneratedCredentials({ username: generatedUsername, password: generatedPassword });
    }

    // 4. Update Staff & Timetable lists
    onUpdateStaff([...staff, newStaffMember]);
    if (newProfEnableInitialTimetable) {
      onUpdateTimetable(updatedSlots);
    }

    setNewProfSuccess(`Successfully onboarded Professor ${newProfName.trim()}!`);
    setNewProfName('');
    setNewProfEmail('');
    setNewProfSubjects([]);
    setNewProfCustomSubject('');
    setNewProfEnableInitialTimetable(false);
  };

  // Handle removing an existing professor
  const handleRemoveProfessor = (profId: string, profName: string) => {
    // 1. Remove from staff list
    onUpdateStaff(staff.filter((s) => s.id !== profId));

    // 2. Remove matching user accounts
    onUpdateUsers(users.filter((u) => u.id !== `usr-${profId}` && u.name !== profName));

    // 3. Remove/unassign timetable slots
    onUpdateTimetable(timetable.filter((slot) => slot.professorId !== profId));

    setNewProfSuccess(`Successfully removed Professor ${profName} and cleared their active timetable allocations.`);
    setNewProfError(null);
  };

  // Toggle Resource maintenance status
  const handleToggleResourceStatus = (id: string) => {
    const updated = resources.map(res => {
      if (res.id === id) {
        return {
          ...res,
          status: res.status === 'functional' ? ('under maintenance' as const) : ('functional' as const)
        };
      }
      return res;
    });
    onUpdateResources(updated);
  };

  // Drag and drop CSV logic
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processMockCSV(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processMockCSV(e.target.files[0]);
    }
  };

  const processMockCSV = (file: File) => {
    // Generate mock imports from CSV upload
    const mockImports = [
      { name: 'Diana Prince', rollNo: 'CS-2023-112', dept: 'Computer Science' },
      { name: 'Clark Kent', rollNo: 'CS-2023-113', dept: 'Computer Science' },
      { name: 'Bruce Wayne', rollNo: 'EE-2023-088', dept: 'Electronics' },
      { name: 'Barry Allen', rollNo: 'IT-2023-014', dept: 'Information Technology' }
    ];

    setUploadedRecords(mockImports);
    setBulkUploadedCount(mockImports.length);

    // Turn these into standard student records and add them to parent state
    const newStudents: Student[] = mockImports.map((imp, idx) => ({
      id: `std-bulk-${Date.now()}-${idx}`,
      name: imp.name,
      rollNo: imp.rollNo,
      department: imp.dept,
      year: 3,
      email: `${imp.name.toLowerCase().replace(' ', '.')}@student.edu`,
      attendancePercent: 85 + idx,
      internalMarks: 38 + idx,
      finalMarks: 78 + idx,
      gpa: 3.2 + idx * 0.1,
      cgpa: 3.3,
      grade: 'B+',
      atRisk: false,
      assignmentsCompleted: 8,
      totalAssignments: 10,
      badges: ['Bulk Enrolled'],
      attendanceTrend: [
        { date: 'Mon', value: 85 },
        { date: 'Tue', value: 86 },
        { date: 'Wed', value: 85 }
      ],
      performanceHistory: [
        { term: 'Term 1', score: 75, classAverage: 75 },
        { term: 'Term 4', score: 80, classAverage: 78 }
      ]
    }));

    onAddStudentBulk(newStudents);
  };

  const triggerCSVDownload = () => {
    // Create actual downloadable CSV
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Roll No,Full Name,Department,Year,Email,CGPA,Attendance\n';
    students.forEach((s) => {
      csvContent += `${s.rollNo},"${s.name}",${s.department},${s.year},${s.email},${s.cgpa},${s.attendancePercent}%\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'College_Student_Directory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format staff workload for Pie Chart
  const pieData = staff.map(s => ({
    name: s.name.split(' ')[1] || s.name,
    value: s.hoursTaughtWeekly
  }));

  return (
    <div className="space-y-6" id="admin-panel-root">
      {/* Tab bar header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#D3E1ED] dark:border-[#0D1C29] pb-5">
        <div>
          <span className="text-[9px] font-bold tracking-[0.2em] text-[#0F5B8F] dark:text-[#38BDF8] uppercase block mb-1">CENTRAL SYSTEM CONSOLE</span>
          <h2 className="font-serif font-light text-3xl text-[#1E2022] dark:text-[#F4F8FA] tracking-tight">
            Administrator Ledger
          </h2>
        </div>

        {/* Buttons for section switcher */}
        <div className="flex flex-wrap gap-2">
          {(['metrics', 'timetable', 'workload', 'bulk', 'resources'] as const).map((t, idx) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3.5 py-2 text-[10px] tracking-wider uppercase transition-all cursor-pointer border font-mono ${
                activeTab === t
                  ? 'border-[#1E2022] bg-[#1E2022] text-white dark:border-[#F4F8FA] dark:bg-[#F4F8FA] dark:text-[#05111D] font-bold'
                  : 'border-[#CADBE8] dark:border-[#0D1C29] hover:border-[#0F5B8F] dark:hover:border-[#38BDF8] text-[#0F5B8F] dark:text-[#38BDF8] bg-transparent'
              }`}
              id={`tab-admin-${t}`}
            >
              [{String(idx + 1).padStart(2, '0')}] {t === 'bulk' ? 'Bulk Import/Export' : t}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: METRICS */}
        {activeTab === 'metrics' && (
          <motion.div
            key="metrics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Bento statistics grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Enrolled Students</p>
                    <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">2,000</h3>
                  </div>
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-500">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-xs text-emerald-500 mt-3 flex items-center gap-1 font-medium">
                  <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded">+100% capacity</span>
                  <span>vs Last Term</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Staff / Faculty</p>
                    <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">50</h3>
                  </div>
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-500">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-xs text-slate-400 mt-3 flex items-center gap-1 font-medium">
                  <span>100% attendance rate today</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Campus Capacity</p>
                    <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">2,500 Seats</h3>
                  </div>
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-500">
                    <School className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-xs text-indigo-500 mt-3 flex items-center gap-1 font-medium">
                  <span className="bg-indigo-500/10 px-1.5 py-0.5 rounded">80% occupied</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Infrastructure Status</p>
                    <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">94.2%</h3>
                  </div>
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-rose-500">
                    <Hammer className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-xs text-rose-500 mt-3 flex items-center gap-1 font-medium">
                  <span>1 resource under repair</span>
                </div>
              </div>
            </div>

            {/* Real-time Campus Building Showcase */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                <School className="w-4 h-4 text-amber-500" />
                BIHE Campus Interactive Navigator
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 leading-relaxed">
                Supervise administrative registers, advanced laboratory terminals, and central halls at Bapuji Institute of Hi-Tech Education. Hover over sections of the interactive campus facade below.
              </p>
              <BiheCollegeBuilding />
            </div>

            {/* Dynamic Fee Collection Panel */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-500" />
                    Institutional Fee Collection Progress
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time aggregated tuition, laboratory, and library revenue metrics.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    ${collectedFee.toLocaleString()} Collected
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    of ${totalInvoicedFee.toLocaleString()} Total Invoiced
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between text-xs">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">Annual Target Collection</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{collectedPercent}% Received</span>
                </div>
                <div className="overflow-hidden h-3.5 text-xs flex rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${collectedPercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-linear-to-r from-indigo-500 to-violet-600"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                  <span>Semester I: 100% complete</span>
                  <span>Semester II: {collectedPercent - 50}% collected</span>
                  <span>Invoices Pending: {100 - collectedPercent}%</span>
                </div>
              </div>
            </div>

            {/* Role quick navigation guide card */}
            <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl" />
              <div className="relative z-10 max-w-xl">
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 rounded-full text-[10px] font-bold tracking-wider uppercase">
                  Omni System Notice
                </span>
                <h4 className="font-bold text-base md:text-lg mt-2 flex items-center gap-1.5">
                  Universal Command Controller Active <Sparkles className="w-4 h-4 text-amber-300" />
                </h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  To experience this portal as other user profiles (Professor, Student, or Parent), click the quick role selector dropdown in the side rail, or trigger the instant Command Menu using <kbd className="bg-slate-800 px-1 border border-slate-700 rounded text-amber-400">Ctrl + K</kbd>.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: AUTOMATED TIMETABLE GENERATOR */}
        {activeTab === 'timetable' && (
          <motion.div
            key="timetable"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Scheduler Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Creator Form */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs h-fit">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Prevent Collision Scheduler
                </h4>

                <form onSubmit={handleAddTimetable} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Day of the Week
                    </label>
                    <select
                      value={day}
                      onChange={(e) => setDay(e.target.value as TimetableSlot['day'])}
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 focus:border-indigo-500"
                    >
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Time Block
                    </label>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 focus:border-indigo-500"
                    >
                      <option value="09:00 AM - 10:30 AM">09:00 AM - 10:30 AM</option>
                      <option value="11:00 AM - 12:30 PM">11:00 AM - 12:30 PM</option>
                      <option value="01:30 PM - 03:00 PM">01:30 PM - 03:00 PM</option>
                      <option value="03:30 PM - 05:00 PM">03:30 PM - 05:00 PM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Course Subject Name
                    </label>
                    <input
                      type="text"
                      list="admin-timetable-subjects"
                      placeholder="e.g. Distributed Computing"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 focus:border-indigo-500"
                      id="input-timetable-subject"
                    />
                    <datalist id="admin-timetable-subjects">
                      {Array.from(new Set([
                        ...(professorId ? (staff.find(p => p.id === professorId)?.subjects || []) : []),
                        ...staff.flatMap(p => p.subjects || []),
                        'C Programming', 'Python', 'DSA', 'Internet Programming', 'Data Science', 'AI', 'Cyber Security', 'Deep Learning', 'Java'
                      ])).map((subj) => (
                        <option key={subj} value={subj} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Classroom Allocation
                    </label>
                    <select
                      value={classroom}
                      onChange={(e) => setClassroom(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 focus:border-indigo-500"
                    >
                      <option value="Seminar Hall A">Seminar Hall A</option>
                      <option value="Seminar Hall B">Seminar Hall B</option>
                      <option value="AV Room 1">AV Room 1</option>
                      <option value="AV Room 2">AV Room 2</option>
                      <option value="Lab Room 104">Lab Room 104</option>
                      <option value="Lab Room 202">Lab Room 202</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Assign Professor
                    </label>
                    <select
                      value={professorId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        setProfessorId(selectedId);
                        const prof = staff.find(p => p.id === selectedId);
                        if (prof && prof.subjects && prof.subjects.length > 0) {
                          setSubject(prof.subjects[0]);
                        }
                      }}
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 focus:border-indigo-500"
                    >
                      <option value="">-- Choose Staff --</option>
                      {staff.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.name} ({prof.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Semester Assignment (College 6-Semesters)
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => {
                        setSemester(parseInt(e.target.value));
                        setSelectedStudentIds([]);
                      }}
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 focus:border-indigo-500"
                    >
                      <option value="1">Semester 1 (Year I)</option>
                      <option value="2">Semester 2 (Year I)</option>
                      <option value="3">Semester 3 (Year II)</option>
                      <option value="4">Semester 4 (Year II)</option>
                      <option value="5">Semester 5 (Year III)</option>
                      <option value="6">Semester 6 (Year III)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Target Class / Department
                    </label>
                    <select
                      value={className}
                      onChange={(e) => {
                        setClassName(e.target.value);
                        setSelectedStudentIds([]);
                      }}
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 focus:border-indigo-500"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Assign Scope Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                      <button
                        type="button"
                        onClick={() => setAssignmentMode('class')}
                        className={`py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                          assignmentMode === 'class'
                            ? 'bg-white dark:bg-slate-900 text-indigo-500 shadow-xs border border-slate-200/30 dark:border-slate-800/30'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        Entire Class
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssignmentMode('specific')}
                        className={`py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                          assignmentMode === 'specific'
                            ? 'bg-white dark:bg-slate-900 text-indigo-500 shadow-xs border border-slate-200/30 dark:border-slate-800/30'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        Specific Students
                      </button>
                    </div>
                  </div>

                  {assignmentMode === 'specific' && (
                    <div className="space-y-2 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950/20">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Select Individual Students
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const calculatedYear = Math.ceil(semester / 2);
                            const matchingIds = students
                              .filter(s => s.year === calculatedYear && s.department.toLowerCase() === className.toLowerCase())
                              .map(s => s.id);
                            
                            if (selectedStudentIds.length === matchingIds.length) {
                              setSelectedStudentIds([]);
                            } else {
                              setSelectedStudentIds(matchingIds);
                            }
                          }}
                          className="text-[9px] text-indigo-500 font-bold hover:underline cursor-pointer"
                        >
                          Toggle All
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Filter students..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full text-[11px] p-2 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:border-indigo-500"
                      />

                      <div className="max-h-[150px] overflow-y-auto space-y-1.5 pr-1">
                        {(() => {
                          const calculatedYear = Math.ceil(semester / 2);
                          const filtered = students.filter(s => {
                            const matchesClassAndYear = s.year === calculatedYear && s.department.toLowerCase() === className.toLowerCase();
                            const matchesQuery = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.rollNo.toLowerCase().includes(studentSearch.toLowerCase());
                            return matchesClassAndYear && matchesQuery;
                          });

                          if (filtered.length === 0) {
                            return (
                              <div className="text-[10px] text-center text-slate-400 py-3">
                                No students match in Year {calculatedYear} ({className})
                              </div>
                            );
                          }

                          return filtered.map(s => {
                            const isChecked = selectedStudentIds.includes(s.id);
                            return (
                              <label
                                key={s.id}
                                className={`flex items-center justify-between p-2 rounded-lg border text-[11px] cursor-pointer transition-all ${
                                  isChecked
                                    ? 'bg-indigo-500/5 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-medium'
                                    : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setSelectedStudentIds(selectedStudentIds.filter(id => id !== s.id));
                                      } else {
                                        setSelectedStudentIds([...selectedStudentIds, s.id]);
                                      }
                                    }}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span>{s.name}</span>
                                </div>
                                <span className="text-[9px] text-slate-400 font-mono">{s.rollNo}</span>
                              </label>
                            );
                          });
                        })()}
                      </div>
                      <div className="text-[10px] text-slate-400 text-right mt-1">
                        Selected: <strong className="text-slate-700 dark:text-slate-300 font-bold">{selectedStudentIds.length}</strong> students
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Save & Assign Timetable Slot
                  </button>
                </form>

                {/* Algorithmic Errors / Success flags */}
                <div className="mt-4">
                  {timetableError && (
                    <div className="p-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg text-xs flex items-start gap-2 animate-shake">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{timetableError}</span>
                    </div>
                  )}

                  {timetableSuccess && (
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-xs flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{timetableSuccess}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Table Render list */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs lg:col-span-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between mb-4">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    Active Scheduled Timetable Slots
                  </span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                    Total: {timetable.length} slots
                  </span>
                </h4>

                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                  {timetable.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800/40 hover:border-indigo-500/20 transition-all group"
                    >
                      <div className="flex gap-3">
                        <div className="px-2 py-1.5 bg-indigo-500/10 text-indigo-500 text-center rounded-lg min-w-[70px] h-fit">
                          <span className="block text-[10px] font-bold uppercase">{slot.day.slice(0, 3)}</span>
                          <span className="block text-[8px] font-semibold text-indigo-400 mt-0.5">
                            {slot.semester ? `Sem ${slot.semester}` : `Year ${slot.year}`}
                          </span>
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100">{slot.subject}</h5>
                          <p className="text-[10px] text-slate-400 flex flex-wrap items-center gap-1.5 mt-1">
                            <span>Prof: {slot.professorName}</span>
                            <span>•</span>
                            <span className="text-indigo-500 font-medium">{slot.classroom}</span>
                            <span>•</span>
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded text-[8px] font-medium">
                              {slot.className || slot.department}
                            </span>
                            {slot.assignedStudentIds && (
                              <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded text-[8px] font-bold">
                                {slot.assignedStudentIds.length} Assigned Students
                              </span>
                            )}
                          </p>
                          <p className="text-[9px] text-slate-400/80 mt-0.5 font-mono">{slot.time}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 rounded-full transition-colors cursor-pointer"
                        title="Remove scheduled slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {timetable.length === 0 && (
                    <div className="text-center py-10 text-xs text-slate-400">
                      No scheduled blocks found. Fill the form to schedule classes safely.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: STAFF WORKLOAD BALANCING */}
        {activeTab === 'workload' && (
          <motion.div
            key="workload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pie/Donut Chart representation */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs md:col-span-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  Staff Weekly Lecture Workload Audits (Hours)
                </h4>
                <div className="h-64 md:h-80 w-full" id="workload-pie-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          border: 'none', 
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '11px'
                        }} 
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right lists and details */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-1.5 text-sm">
                  Balancing Audit Checklist
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                  The recommended staff load limit is <strong>16-18 hours</strong> per week to maintain optimal lecturing quality and grading speed.
                </p>

                <div className="space-y-3">
                  {staff.map((prof, idx) => {
                    const percentage = Math.round((prof.hoursTaughtWeekly / 20) * 100);
                    const isOverloaded = prof.hoursTaughtWeekly > 18;
                    const isUnderloaded = prof.hoursTaughtWeekly < 14;

                    return (
                      <div key={prof.id} className="text-xs p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg">
                        <div className="flex justify-between items-center font-semibold text-slate-700 dark:text-slate-300">
                          <span>{prof.name}</span>
                          <span className={`${isOverloaded ? 'text-rose-500' : isUnderloaded ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {prof.hoursTaughtWeekly} hrs/wk
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{prof.department} Department</div>
                        <div className="mt-2 w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isOverloaded ? 'bg-rose-500' : isUnderloaded ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400/80 mt-1">
                          <span>Load status</span>
                          <span>{isOverloaded ? 'Overloaded' : isUnderloaded ? 'Underloaded' : 'Optimal'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dynamic Professor management and registry console */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 border-t border-slate-200/50 dark:border-slate-800/50 pt-6" id="professor-management-console">
              {/* Left Column: Register & Active Lists (7/12 span) */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-sm uppercase tracking-wide">
                      <Users className="w-4 h-4 text-indigo-500" />
                      Academic Professor Registry
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Oversee active university lecturers, manage subjects, and de-allocate staff roles.
                    </p>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-full">
                    {staff.length} Active
                  </span>
                </div>

                {/* Toast message boxes for feedback within management view */}
                {newProfSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-lg flex items-center gap-2" id="prof-success-toast">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{newProfSuccess}</span>
                  </div>
                )}

                {/* Credentials Card Display (If newly created) */}
                {newProfGeneratedCredentials && (
                  <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/30 text-slate-800 dark:text-slate-200 text-xs rounded-xl space-y-2 relative overflow-hidden" id="prof-credentials-card">
                    <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px] uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" /> Generated Portal Access
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Credentials successfully mapped under institution guidelines. Securely share this signature with the onboarded faculty:
                    </p>
                    <div className="grid grid-cols-2 gap-3 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/80 font-mono text-[11px]">
                      <div>
                        <span className="text-[9px] text-slate-400 block">LDAP Username</span>
                        <strong className="text-slate-800 dark:text-slate-100">{newProfGeneratedCredentials.username}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">Default Password</span>
                        <strong className="text-slate-800 dark:text-slate-100">{newProfGeneratedCredentials.password}</strong>
                      </div>
                    </div>
                    <span className="text-[8px] text-amber-500 font-semibold block mt-1">
                      ⚠️ Note: Faculty can login instantly in the login drawer after logging out.
                    </span>
                  </div>
                )}

                {/* List of professors */}
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {staff.map((prof) => {
                    const linkedUser = users.find(u => u.name === prof.name || u.email === prof.email);
                    const assignedLessons = timetable.filter(slot => slot.professorId === prof.id);

                    return (
                      <div 
                        key={prof.id} 
                        className="p-3.5 bg-slate-50/70 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-950/65"
                        id={`prof-card-${prof.id}`}
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100">{prof.name}</span>
                            <span className="text-[9px] font-mono font-bold bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                              {prof.id}
                            </span>
                          </div>
                          
                          <div className="text-[10px] text-slate-400 space-y-0.5">
                            <div className="truncate">Email: <span className="font-mono text-slate-600 dark:text-slate-300">{prof.email}</span></div>
                            <div>Dept: <span className="font-semibold text-slate-600 dark:text-slate-300">{prof.department}</span></div>
                            {linkedUser && (
                              <div className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1 text-[9px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Linked Login ID: <span className="font-mono font-black">{linkedUser.username}</span>
                              </div>
                            )}
                          </div>

                          {/* Subjects Pill Box */}
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {prof.subjects.map((subj) => (
                              <span 
                                key={subj} 
                                className="text-[9px] bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-950/50 px-2 py-0.5 rounded-md font-medium"
                              >
                                {subj}
                              </span>
                            ))}
                          </div>

                          {/* Lectures scheduled list */}
                          {assignedLessons.length > 0 ? (
                            <div className="mt-2.5 pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                                Assigned Lectures ({assignedLessons.length})
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {assignedLessons.map((l) => (
                                  <span 
                                    key={l.id} 
                                    className="text-[9px] bg-slate-200/50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono"
                                    title={`${l.time} at ${l.classroom}`}
                                  >
                                    {l.day}: {l.subject} ({l.classroom.replace('Room', 'R')})
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-[9px] text-slate-400 italic mt-1.5">No lectures scheduled in active calendar.</div>
                          )}
                        </div>

                        {/* Action column */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          <div className="text-right hidden md:block">
                            <span className="text-[10px] text-slate-400 block">Weekly load</span>
                            <span className="text-xs font-mono font-extrabold text-slate-700 dark:text-slate-300">
                              {prof.hoursTaughtWeekly} hrs/wk
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove Professor ${prof.name}?\nThis will clear their login account and revoke all of their timetable slots.`)) {
                                handleRemoveProfessor(prof.id, prof.name);
                              }
                            }}
                            className="p-2 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-500/25"
                            title={`Remove Professor ${prof.name}`}
                            id={`btn-remove-prof-${prof.id}`}
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Onboarding Form (5/12 span) */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs h-fit">
                <div className="pb-2 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-sm uppercase tracking-wide">
                    <Plus className="w-4.5 h-4.5 text-indigo-500" />
                    Onboard Faculty Member
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Register a new professor and allocate their initial calendar and credentials instantly.
                  </p>
                </div>

                {newProfError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs rounded-lg flex items-center gap-2 mb-4" id="prof-error-toast">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{newProfError}</span>
                  </div>
                )}

                <form onSubmit={handleAddProfessor} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Professor Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Roshan Kumar"
                      value={newProfName}
                      onChange={(e) => {
                        setNewProfName(e.target.value);
                        // Auto-fill institutional email suggestions
                        if (e.target.value.trim() && !newProfEmail) {
                          const normalized = e.target.value.trim().toLowerCase().replace(/[^a-z]/g, '');
                          if (normalized) {
                            setNewProfEmail(`${normalized}@college.edu`);
                          }
                        }
                      }}
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 focus:border-indigo-500 font-semibold"
                      id="input-new-prof-name"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Institutional Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. roshankumar@college.edu"
                      value={newProfEmail}
                      onChange={(e) => setNewProfEmail(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 focus:border-indigo-500 font-semibold"
                      id="input-new-prof-email"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Primary Faculty Department
                    </label>
                    <select
                      value={newProfDepartment}
                      onChange={(e) => setNewProfDepartment(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 focus:border-indigo-500"
                      id="select-new-prof-dept"
                    >
                      <option value="Bachelor of Computer Application (BCA)">Bachelor of Computer Application (BCA)</option>
                      <option value="Department of Information Technology">Department of Information Technology</option>
                      <option value="Advanced Computer Science & AI">Advanced Computer Science & AI</option>
                    </select>
                  </div>

                  {/* Course selection pill box */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Course Subjects Taught
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/50 dark:border-slate-850">
                      {[
                        'C Programming',
                        'Python',
                        'DSA',
                        'Internet Programming',
                        'Data Science',
                        'AI',
                        'Cyber Security',
                        'Deep Learning',
                        'Java'
                      ].map((sub) => {
                        const isChecked = newProfSubjects.includes(sub);
                        return (
                          <label 
                            key={sub} 
                            className={`flex items-center gap-1.5 text-[11px] p-1 rounded-md transition-colors cursor-pointer ${
                              isChecked 
                                ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-500/5' 
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setNewProfSubjects(newProfSubjects.filter(s => s !== sub));
                                } else {
                                  setNewProfSubjects([...newProfSubjects, sub]);
                                }
                              }}
                              className="accent-indigo-600"
                            />
                            <span>{sub}</span>
                          </label>
                        );
                      })}
                    </div>
                    
                    {/* Optional Custom Subject field */}
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Or specify another custom subject..."
                        value={newProfCustomSubject}
                        onChange={(e) => setNewProfCustomSubject(e.target.value)}
                        className="w-full text-[11px] rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2 focus:border-indigo-500"
                        id="input-new-prof-custom-sub"
                      />
                    </div>
                  </div>

                  {/* Toggle setup for optional timetable slot scheduling */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 font-semibold">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newProfEnableInitialTimetable}
                        onChange={(e) => setNewProfEnableInitialTimetable(e.target.checked)}
                        className="accent-indigo-600 w-4 h-4 rounded"
                        id="checkbox-enable-timetable"
                      />
                      <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                        Schedule Initial Timetable Lecture
                      </span>
                    </label>
                    <p className="text-[9px] text-slate-400 ml-6 leading-normal">
                      Optionally book their first lecture session now. Room collision checking will run automatically.
                    </p>
                  </div>

                  {newProfEnableInitialTimetable && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800/60 ml-6"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Lecture Day
                          </label>
                          <select
                            value={newProfTimetableDay}
                            onChange={(e) => setNewProfTimetableDay(e.target.value as TimetableSlot['day'])}
                            className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2 focus:border-indigo-500 font-medium"
                          >
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Lecture Time Block
                          </label>
                          <select
                            value={newProfTimetableTime}
                            onChange={(e) => setNewProfTimetableTime(e.target.value)}
                            className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2 focus:border-indigo-500 font-medium"
                          >
                            <option value="09:00 AM - 10:30 AM">09:00 AM - 10:30 AM</option>
                            <option value="11:00 AM - 12:30 PM">11:00 AM - 12:30 PM</option>
                            <option value="01:30 PM - 03:00 PM">01:30 PM - 03:00 PM</option>
                            <option value="03:30 PM - 05:00 PM">03:30 PM - 05:00 PM</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Classroom Code
                          </label>
                          <select
                            value={newProfTimetableClassroom}
                            onChange={(e) => setNewProfTimetableClassroom(e.target.value)}
                            className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2 focus:border-indigo-500 font-medium"
                          >
                            <option value="Lab Room 104">Lab Room 104</option>
                            <option value="Lab Room 202">Lab Room 202</option>
                            <option value="Seminar Hall A">Seminar Hall A</option>
                            <option value="Seminar Hall B">Seminar Hall B</option>
                            <option value="AV Room 1">AV Room 1</option>
                            <option value="AV Room 2">AV Room 2</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Target Semester
                          </label>
                          <select
                            value={newProfTimetableSemester}
                            onChange={(e) => setNewProfTimetableSemester(parseInt(e.target.value))}
                            className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2 focus:border-indigo-500 font-medium"
                          >
                            <option value="1">Semester 1 (Year I)</option>
                            <option value="2">Semester 2 (Year I)</option>
                            <option value="3">Semester 3 (Year II)</option>
                            <option value="4">Semester 4 (Year II)</option>
                            <option value="5">Semester 5 (Year III)</option>
                            <option value="6">Semester 6 (Year III)</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Auto-generate credentials option */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 font-semibold">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newProfAutoCreateAccount}
                        onChange={(e) => setNewProfAutoCreateAccount(e.target.checked)}
                        className="accent-indigo-600 w-4 h-4 rounded"
                        id="checkbox-generate-credentials"
                      />
                      <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                        Auto-Create LDAP Security Account
                      </span>
                    </label>
                    <p className="text-[9px] text-slate-400 ml-6 leading-normal">
                      Assigns secure credentials linked to the single sign-on registry instantly upon onboarding.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                    id="btn-submit-new-prof"
                  >
                    <Plus className="w-4 h-4" />
                    Onboard Faculty Member
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: BULK CSV ENGINE */}
        {activeTab === 'bulk' && (
          <motion.div
            key="bulk"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CSV Upload / Drag-and-drop */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-2">
                  <Upload className="w-4 h-4 text-indigo-500" />
                  Drag-and-Drop Bulk CSV Upload
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Streamline administration by dropping a roster of multiple students or professors directly into the schema compiler.
                </p>

                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center transition-all min-h-[220px] ${
                    dragActive
                      ? 'border-indigo-500 bg-indigo-500/5'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                  id="csv-drag-container"
                >
                  <Upload className={`w-10 h-10 mb-3 ${dragActive ? 'text-indigo-500 animate-bounce' : 'text-slate-400'}`} />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Drag and drop your roster.csv here, or
                  </p>
                  <label className="mt-2.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer">
                    Browse File Directory
                    <input
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-400 mt-2">
                    Accepts standard RFC-4180 CSV spreadsheet templates.
                  </span>
                </div>

                {bulkUploadedCount !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-xs flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    <span>Successfully processed <strong>{bulkUploadedCount}</strong> student records from CSV!</span>
                  </motion.div>
                )}
              </div>

              {/* CSV Export & Verification */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-2">
                    <Download className="w-4 h-4 text-indigo-500" />
                    Bulk Export College Directories
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    Download full rosters of active students, enrollment details, grades, and contact files in structured CSV sheets instantly.
                  </p>

                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg flex items-center justify-between border border-slate-100 dark:border-slate-800/40">
                      <div>
                        <h5 className="font-bold text-xs text-slate-700 dark:text-slate-300">Full Student Roster CSV</h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">Contains details for all 2,000 enrolled students.</p>
                      </div>
                      <button
                        onClick={triggerCSVDownload}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Export
                      </button>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg flex items-center justify-between border border-slate-100 dark:border-slate-800/40">
                      <div>
                        <h5 className="font-bold text-xs text-slate-700 dark:text-slate-300">Staff Workload and Directory Sheet</h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">Contains lectures assigned and weekly hours.</p>
                      </div>
                      <button
                        onClick={() => alert('Faculty roster CSV export completed.')}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Export
                      </button>
                    </div>
                  </div>
                </div>

                {uploadedRecords.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Imported Records Preview</h5>
                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-[10px]">
                      {uploadedRecords.map((r, i) => (
                        <div key={i} className="flex justify-between bg-slate-50 dark:bg-slate-950/40 p-1.5 rounded border border-slate-200/20">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{r.name}</span>
                          <span className="text-slate-400">{r.dept}</span>
                          <span className="text-indigo-500 font-mono">{r.rollNo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: RESOURCE BOOKING */}
        {activeTab === 'resources' && (
          <motion.div
            key="resources"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Hammer className="w-4 h-4 text-indigo-500" />
                    Interactive Facility and Resource Booking Controls
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Maintain, lock/unlock, or change status parameters for premium AV centers, labs, and halls.
                  </p>
                </div>
              </div>

              {/* Facilities Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="resource-management-grid">
                {resources.map((res) => {
                  const isMaintenance = res.status === 'under maintenance';
                  const hasBookings = res.bookedSlots.length > 0;

                  return (
                    <div
                      key={res.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        isMaintenance
                          ? 'bg-rose-500/[0.02] border-rose-500/20 hover:border-rose-500/40'
                          : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              {res.type}
                            </span>
                            <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 mt-0.5">
                              {res.name}
                            </h5>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              isMaintenance
                                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            }`}
                          >
                            {isMaintenance ? 'Under Maintenance' : 'Functional'}
                          </span>
                        </div>

                        {/* Booking slots details inside */}
                        <div className="mt-4 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Active Bookings:
                          </span>
                          {hasBookings ? (
                            res.bookedSlots.map((slot, idx) => (
                              <div
                                key={idx}
                                className="text-[10px] p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40 rounded flex items-center justify-between text-slate-600 dark:text-slate-400"
                              >
                                <span>{slot.bookedBy}</span>
                                <span className="font-semibold text-indigo-500">{slot.time}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400/80 italic block">
                              No active bookings. Available for scheduling.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Control Lock / Unlock maintenance button */}
                      <div className="mt-5 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex gap-2">
                        <button
                          onClick={() => handleToggleResourceStatus(res.id)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                            isMaintenance
                              ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20'
                          }`}
                        >
                          {isMaintenance ? (
                            <>
                              <Unlock className="w-3.5 h-3.5" /> Set Functional
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" /> Flag Maintenance
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
