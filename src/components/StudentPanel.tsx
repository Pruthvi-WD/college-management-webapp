/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Award, Calendar, Users, ShieldAlert, CheckCircle2, Bookmark, Download, FileCode,
  Sliders, MessageSquare, Send, Upload, FileText, Trash2, FolderOpen, Heart, TrendingUp, AlertCircle,
  Search, Filter, Clock, BookOpen, Check, X, AlertTriangle, CheckCircle, ShieldCheck, RefreshCw, School
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, TimetableSlot, Notice, StudyGroup, Grievance } from '../types';
import BiheCollegeBuilding from './BiheCollegeBuilding';

interface StudentPanelProps {
  student: Student;
  allStudents: Student[];
  timetable: TimetableSlot[];
  notices: Notice[];
  studyGroups: StudyGroup[];
  onAddGrievance: (grievance: Grievance) => void;
  onUpdateStudyGroups: (groups: StudyGroup[]) => void;
}

export default function StudentPanel({
  student,
  allStudents,
  timetable,
  notices,
  studyGroups,
  onAddGrievance,
  onUpdateStudyGroups
}: StudentPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'groups' | 'noticeboard' | 'locker'>('dashboard');
  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');

  // Attendance detailed filter states
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceSubjectFilter, setAttendanceSubjectFilter] = useState('All');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<'All' | 'Present' | 'Absent'>('All');

  // Grievance State
  const [grivTitle, setGrivTitle] = useState('');
  const [grivDesc, setGrivDesc] = useState('');
  const [grivCategory, setGrivCategory] = useState('Infrastructure');
  const [grivSuccess, setGrivSuccess] = useState(false);

  // Notice Board Tags state
  const [selectedTag, setSelectedTag] = useState<'All' | 'Placements' | 'Exams' | 'CulturalFest'>('All');

  // Study group creator Form State
  const [groupTopic, setGroupTopic] = useState('');
  const [groupTime, setGroupTime] = useState('');
  const [groupLocation, setGroupLocation] = useState('');

  // Document Locker state
  const [lockerFiles, setLockerFiles] = useState<{ id: string; name: string; size: string; date: string }[]>([
    { id: 'doc-1', name: 'National_ID_Card.pdf', size: '1.2 MB', date: '2026-06-15' },
    { id: 'doc-2', name: 'High_School_Transcript.pdf', size: '3.4 MB', date: '2026-06-16' },
    { id: 'doc-3', name: 'Enrollment_Certificate.pdf', size: '840 KB', date: '2026-06-20' }
  ]);
  const [newFileName, setNewFileName] = useState('');

  // 1. Attendance color coding
  const attendanceColor = student.attendancePercent >= 75 ? 'text-emerald-500' : 'text-rose-500';
  const attendanceBg = student.attendancePercent >= 75 ? 'bg-emerald-500/10' : 'bg-rose-500/10';

  // 2. Study group Join function
  const handleJoinGroup = (groupId: string) => {
    const updated = studyGroups.map(group => {
      if (group.id === groupId) {
        // If student is already in group, don't re-add
        if (group.members.includes(student.name)) {
          alert('You are already a member of this study group!');
          return group;
        }
        if (group.memberCount >= group.maxMembers) {
          alert('This study group has reached its maximum capacity.');
          return group;
        }
        return {
          ...group,
          memberCount: group.memberCount + 1,
          members: [...group.members, student.name]
        };
      }
      return group;
    });
    onUpdateStudyGroups(updated);
  };

  // 3. Post a new study session
  const handlePostStudySession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupTopic || !groupTime || !groupLocation) {
      alert('Please fill in all study session fields.');
      return;
    }

    const newGroup: StudyGroup = {
      id: `sg-${Date.now()}`,
      topic: groupTopic,
      time: groupTime,
      location: groupLocation,
      hostName: student.name,
      memberCount: 1,
      maxMembers: 5,
      members: [student.name]
    };

    onUpdateStudyGroups([...studyGroups, newGroup]);
    setGroupTopic('');
    setGroupTime('');
    setGroupLocation('');
    alert('Study session posted successfully!');
  };

  // 4. Anonymous Grievance submission (ID omitted entirely from payload)
  const handleSubmitGrievance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grivTitle || !grivDesc) {
      alert('Please enter both title and description.');
      return;
    }

    const grievancePayload: Grievance = {
      id: `griv-${Date.now()}`,
      title: grivTitle,
      description: grivDesc,
      category: grivCategory,
      timestamp: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
      // Critical Security: Notice studentID/userID is completely omitted from payload!
    };

    onAddGrievance(grievancePayload);
    setGrivTitle('');
    setGrivDesc('');
    setGrivSuccess(true);
    setTimeout(() => setGrivSuccess(false), 5000);
  };

  // 5. Document Locker file uploads
  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName) {
      alert('Please enter a document name.');
      return;
    }

    const newFile = {
      id: `doc-${Date.now()}`,
      name: newFileName.endsWith('.pdf') ? newFileName : `${newFileName}.pdf`,
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      date: new Date().toISOString().split('T')[0]
    };

    setLockerFiles([...lockerFiles, newFile]);
    setNewFileName('');
  };

  const handleDeleteFile = (id: string) => {
    setLockerFiles(lockerFiles.filter(f => f.id !== id));
  };

  const getWeekdayFromDate = (dateStr: string): string => {
    const dayMap: { [key: string]: string } = {
      '06-15': 'Monday',
      '06-16': 'Tuesday',
      '06-17': 'Wednesday',
      '06-18': 'Thursday',
      '06-19': 'Friday',
      '06-22': 'Monday',
      '06-23': 'Tuesday',
      '06-24': 'Wednesday',
      '06-25': 'Thursday',
      '06-26': 'Friday',
    };
    return dayMap[dateStr] || 'Monday';
  };

  const getSubjectTimingForDate = (subjectName: string, dateStr: string): string => {
    const day = getWeekdayFromDate(dateStr);
    const slot = timetable.find(s => s.subject.toLowerCase() === subjectName.toLowerCase() && s.day === day);
    if (slot) return slot.time;
    
    // Fallback lookup by subject name only
    const anySlot = timetable.find(s => s.subject.toLowerCase() === subjectName.toLowerCase());
    if (anySlot) return anySlot.time;

    // Static fallback by subject hash
    const commonTimes = ['09:00 AM - 10:30 AM', '11:00 AM - 12:30 PM', '01:30 PM - 03:00 PM', '03:30 PM - 05:00 PM'];
    let hash = 0;
    for (let i = 0; i < subjectName.length; i++) {
      hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % commonTimes.length;
    return commonTimes[index];
  };

  const getSubjectClassroom = (subjectName: string): string => {
    const slot = timetable.find(s => s.subject.toLowerCase() === subjectName.toLowerCase());
    return slot ? slot.classroom : 'Lecture Hall 101';
  };

  const getRecentUpdates = () => {
    const recentUpdates: { subject: string; professorName: string; date: string; status: 'Present' | 'Absent' }[] = [];
    (student.subjectAttendance || []).forEach(sub => {
      sub.sessions.forEach(sess => {
        if (sess.date === '06-27' || sess.date === '06-26') {
          recentUpdates.push({
            subject: sub.subject,
            professorName: sub.professorName,
            date: sess.date,
            status: sess.status
          });
        }
      });
    });
    return recentUpdates;
  };

  const getAttendanceStats = () => {
    let totalClasses = 0;
    let presentClasses = 0;
    let absentClasses = 0;

    (student.subjectAttendance || []).forEach(sub => {
      sub.sessions.forEach(sess => {
        totalClasses++;
        if (sess.status === 'Present') {
          presentClasses++;
        } else {
          absentClasses++;
        }
      });
    });

    const percent = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100;

    // Consecutive classes to attend to reach 75%
    let sessionsNeededFor75 = 0;
    if (percent < 75 && totalClasses > 0) {
      sessionsNeededFor75 = Math.ceil((0.75 * totalClasses - presentClasses) / 0.25);
      if (sessionsNeededFor75 < 0) sessionsNeededFor75 = 0;
    }

    // Consecutive classes to attend to reach 85%
    let sessionsNeededFor85 = 0;
    if (percent < 85 && totalClasses > 0) {
      sessionsNeededFor85 = Math.ceil((0.85 * totalClasses - presentClasses) / 0.15);
      if (sessionsNeededFor85 < 0) sessionsNeededFor85 = 0;
    }

    // Sessions you can miss without falling below 75%
    let sessionsCanMissFor75 = 0;
    if (percent >= 75 && totalClasses > 0) {
      sessionsCanMissFor75 = Math.floor((presentClasses - 0.75 * totalClasses));
      if (sessionsCanMissFor75 < 0) sessionsCanMissFor75 = 0;
    }

    return {
      totalClasses,
      presentClasses,
      absentClasses,
      percent,
      sessionsNeededFor75,
      sessionsNeededFor85,
      sessionsCanMissFor75
    };
  };

  // Filtered Notices
  const filteredNotices = notices.filter(n => selectedTag === 'All' || n.category === selectedTag);

  // Sorting all students for leaderboard
  const leaderboard = [...allStudents].sort((a, b) => b.cgpa - a.cgpa);

  return (
    <div className="space-y-6" id="student-panel-root">
      {/* Title bar header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#D3E1ED] dark:border-[#0D1C29] pb-5">
        <div>
          <span className="text-[9px] font-bold tracking-[0.2em] text-[#0F5B8F] dark:text-[#38BDF8] uppercase block mb-1">REGISTERED SCHOLAR DESK</span>
          <h2 className="font-serif font-light text-3xl text-[#1E2022] dark:text-[#F4F8FA] tracking-tight">
            Scholastic Overview
          </h2>
        </div>

        {/* Section buttons - Styled like index chapters */}
        <div className="flex flex-wrap gap-2">
          {(['dashboard', 'attendance', 'groups', 'noticeboard', 'locker'] as const).map((t, idx) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3.5 py-2 text-[10px] tracking-wider uppercase transition-all cursor-pointer border font-mono ${
                activeTab === t
                  ? 'border-[#1E2022] bg-[#1E2022] text-white dark:border-[#F4F8FA] dark:bg-[#F4F8FA] dark:text-[#05111D] font-bold'
                  : 'border-[#CADBE8] dark:border-[#0D1C29] hover:border-[#0F5B8F] dark:hover:border-[#38BDF8] text-[#0F5B8F] dark:text-[#38BDF8] bg-transparent'
              }`}
              id={`tab-student-${t}`}
            >
              [{String(idx + 1).padStart(2, '0')}] {t === 'groups' ? 'Study Finder' : t === 'noticeboard' ? 'Notice Board' : t === 'attendance' ? 'Attendance' : t}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: DASHBOARD METRICS, LEADERBOARD, GRIEVANCE */}
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Recent Attendance Updates Section */}
            {(() => {
              const recents = getRecentUpdates();
              if (recents.length === 0) return null;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-indigo-600/5 dark:bg-indigo-500/5 border-2 border-indigo-500 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-500 text-white rounded-lg shrink-0 mt-0.5">
                      <Clock className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-400">
                          🔔 Recent Attendance Activity Detected
                        </h4>
                        <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                          New Update
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Professors have recently marked or updated your attendance register (edited today or yesterday). Please verify your status below:
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                        {recents.map((item, idx) => {
                          const isToday = item.date === '06-27';
                          const isPresent = item.status === 'Present';
                          return (
                            <div 
                              key={idx} 
                              className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 p-3 rounded-lg shadow-2xs flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex justify-between items-center mb-1.5">
                                  <span className={`text-[9px] font-extrabold font-mono px-2 py-0.5 rounded-full ${
                                    isToday 
                                      ? 'bg-amber-500/10 text-amber-600' 
                                      : 'bg-indigo-100 text-indigo-800 dark:bg-slate-800 dark:text-indigo-300'
                                  }`}>
                                    {isToday ? 'Today (06-27)' : 'Yesterday (06-26)'}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-mono">{item.date}</span>
                                </div>
                                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                  {item.subject}
                                </h5>
                                <p className="text-[10px] text-slate-400">
                                  Prof: {item.professorName}
                                </p>
                              </div>
                              
                              <div className="mt-2.5 flex justify-between items-center border-t border-slate-50 dark:border-slate-800 pt-2">
                                <span className="text-[10px] text-slate-400 font-medium">Status Marked:</span>
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border font-mono flex items-center gap-1 ${
                                  isPresent 
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                }`}>
                                  {isPresent ? 'Present' : 'Absent'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* Real-time Campus Building Showcase */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                <School className="w-4 h-4 text-amber-500" />
                BIHE Campus Interactive Navigator
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 leading-relaxed">
                Explore departments, laboratory terminals, and central halls at Bapuji Institute of Hi-Tech Education. Hover over sections of the interactive campus facade below.
              </p>
              <BiheCollegeBuilding />
            </div>

            {/* Quick stats and Attendance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Attendance (Color coded) */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Campus Attendance Audit
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className={`text-4xl font-black ${attendanceColor}`}>
                      {student.attendancePercent}%
                    </span>
                    <span className="text-xs text-slate-400">Overall Rating</span>
                  </div>
                </div>

                <div className={`mt-4 p-3 ${attendanceBg} border border-slate-200/10 rounded-lg text-xs`}>
                  {student.attendancePercent >= 75 ? (
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Attendance looks excellent! You meet the institutional threshold requirement of 75%.
                    </p>
                  ) : (
                    <p className="text-rose-600 dark:text-rose-400 font-medium">
                      Critical Notice: Attendance has dropped below 75%. Remediate immediately to bypass registration holds.
                    </p>
                  )}
                </div>
              </div>

              {/* Personal Timetable for today */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs md:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-sm">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    Your Timetable Agenda ({selectedDay})
                  </h4>
                  
                  {/* Day selector pills */}
                  <div className="flex flex-wrap gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-200/40 dark:border-slate-800/40 w-fit">
                    {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                          selectedDay === day
                            ? 'bg-white dark:bg-slate-900 text-indigo-500 shadow-xs border border-slate-200/30'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {(() => {
                    const studentSlots = timetable
                      .filter(slot => slot.day === selectedDay)
                      .filter(slot => {
                        // Check if the slot is explicitly assigned to this student or fits class/year fallback
                        if (slot.assignedStudentIds && slot.assignedStudentIds.length > 0) {
                          return slot.assignedStudentIds.includes(student.id);
                        }
                        // Fallback matches: matching student's year and department
                        return slot.year === student.year && slot.department.toLowerCase() === student.department.toLowerCase();
                      });

                    if (studentSlots.length === 0) {
                      return (
                        <div className="text-center py-6 text-[11px] text-slate-400">
                          No classes scheduled for {selectedDay}. Enjoy your break!
                        </div>
                      );
                    }

                    return studentSlots.map((slot) => (
                      <div key={slot.id} className="text-xs p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/20 flex justify-between items-center hover:border-indigo-500/20 transition-all">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{slot.subject}</span>
                            <span className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-1 rounded font-medium">
                              {slot.semester ? `Sem ${slot.semester}` : `Year ${slot.year}`}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Prof: {slot.professorName} • <strong className="text-indigo-500 font-medium">{slot.classroom}</strong>
                          </span>
                        </div>
                        <span className="font-semibold text-indigo-500 font-mono text-[10px] bg-indigo-500/5 px-2 py-1 rounded-md">{slot.time}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            {/* Attendance Quick Link banner */}
            <div className="bg-gradient-to-r from-indigo-500/10 via-sky-500/5 to-transparent p-5 rounded-xl border border-indigo-500/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                  <Clock className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
                  Institutional Attendance Register & Logs
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  You are currently in <strong className={student.attendancePercent >= 75 ? 'text-emerald-500' : 'text-rose-500'}>{student.attendancePercent >= 75 ? 'Good standing' : 'Academic Standing Warning'}</strong>. View detailed class schedule timings, professor logs, and dates of your presence.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('attendance')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
              >
                Launch Attendance Hub →
              </button>
            </div>

            {/* GAMIFIED LEADERBOARD & BADGES */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Leaderboard */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs lg:col-span-7">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1 flex items-center gap-1.5">
                  <TrendingUp className="w-4.5 h-4.5 text-indigo-500" />
                  Campus Academic Leaderboard
                </h4>
                <p className="text-xs text-slate-400 mb-4">Top-performing students ranked by active semester cumulative CGPA.</p>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {leaderboard.map((item, idx) => {
                    const isSelf = item.id === student.id;
                    return (
                      <div 
                        key={item.id} 
                        className={`flex items-center justify-between p-2.5 rounded-lg text-xs ${
                          isSelf 
                            ? 'bg-indigo-500/10 dark:bg-indigo-500/5 border border-indigo-500/20' 
                            : 'bg-slate-50 dark:bg-slate-950/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-5 h-5 flex items-center justify-center font-bold rounded-full ${
                            idx === 0 ? 'bg-amber-500 text-white' : 
                            idx === 1 ? 'bg-slate-300 text-slate-700' : 
                            idx === 2 ? 'bg-amber-700 text-white' : 'text-slate-400'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {item.name} {isSelf && <span className="text-[9px] text-indigo-500 font-bold bg-indigo-500/10 px-1 py-0.5 rounded ml-1">YOU</span>}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{item.department}</span>
                          </div>
                        </div>

                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                          CGPA: {item.cgpa.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Skills and Badges display case */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs lg:col-span-5 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1 flex items-center gap-1.5">
                    <Award className="w-4.5 h-4.5 text-indigo-500" />
                    Your Digital Badge Locker
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">Earned certificates and gamified milestones.</p>

                  <div className="grid grid-cols-2 gap-3" id="skills-badge-locker">
                    {student.badges.map((badge, idx) => (
                      <div key={idx} className="p-3 bg-linear-to-b from-slate-50 to-indigo-50/20 dark:from-slate-950 dark:to-indigo-950/10 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                        <Award className="w-7 h-7 text-amber-500 mx-auto mb-1 animate-bounce" />
                        <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 block mt-1">{badge}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Verified Merit</span>
                      </div>
                    ))}
                    {student.badges.length === 0 && (
                      <div className="text-center py-6 text-xs text-slate-400 col-span-2">
                        Complete courses with high internals to unlock merit achievements.
                      </div>
                    )}
                  </div>
                </div>

                {/* Badge target goals */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                  <strong>Next Challenge:</strong> Reach 95%+ overall attendance to unlock the <strong>"Campus Centurion Badge"</strong>.
                </div>
              </div>
            </div>

            {/* ANONYMOUS GRIEVANCE BOX (NO USER ID STORED IN DB) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    Secured Anonymous Grievance Box
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Submit concerns directly to Dr. Alice Vance (Super Admin). Your user session profile, IP, and personal parameters are completely omitted from the database record payload.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitGrievance} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Brief Grievance Subject
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Broken bench on Lecture Room 302..."
                      value={grivTitle}
                      onChange={(e) => setGrivTitle(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Concern Category
                    </label>
                    <select
                      value={grivCategory}
                      onChange={(e) => setGrivCategory(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 focus:border-indigo-500"
                    >
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Canteen">Canteen & Dining</option>
                      <option value="Syllabus">Syllabus pacing</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Describe Concern Details
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide description. Do not write your personal name or registration roll numbers to preserve total privacy."
                    value={grivDesc}
                    onChange={(e) => setGrivDesc(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Payload Sanitized: Zero tracking parameters active.
                  </span>

                  <button
                    type="submit"
                    className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Anonymously
                  </button>
                </div>
              </form>

              {/* Grievance Success Banner */}
              <AnimatePresence>
                {grivSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-4 p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-xs flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    <span>Anonymous grievance logged successfully with Super Admin! Thank you for helping improve the campus.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* TAB: DETAILED ATTENDANCE LEDGER & HUB */}
        {activeTab === 'attendance' && (
          <motion.div
            key="attendance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
            id="student-attendance-tab"
          >
            {/* Recent Attendance Updates Notice */}
            {(() => {
              const recents = getRecentUpdates();
              if (recents.length === 0) return null;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-indigo-600/5 dark:bg-indigo-500/5 border-2 border-indigo-500 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-500 text-white rounded-lg shrink-0 mt-0.5">
                      <Clock className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-400">
                          🔔 Recent Attendance Activity Detected
                        </h4>
                        <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                          New Update
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Professors have recently marked or updated your attendance register (edited today or yesterday). Please verify your status below:
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                        {recents.map((item, idx) => {
                          const isToday = item.date === '06-27';
                          const isPresent = item.status === 'Present';
                          return (
                            <div 
                              key={idx} 
                              className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 p-3 rounded-lg shadow-2xs flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex justify-between items-center mb-1.5">
                                  <span className={`text-[9px] font-extrabold font-mono px-2 py-0.5 rounded-full ${
                                    isToday 
                                      ? 'bg-amber-500/10 text-amber-600' 
                                      : 'bg-indigo-100 text-indigo-800 dark:bg-slate-800 dark:text-indigo-300'
                                  }`}>
                                    {isToday ? 'Today (06-27)' : 'Yesterday (06-26)'}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-mono">{item.date}</span>
                                </div>
                                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                  {item.subject}
                                </h5>
                                <p className="text-[10px] text-slate-400">
                                  Prof: {item.professorName}
                                </p>
                              </div>
                              
                              <div className="mt-2.5 flex justify-between items-center border-t border-slate-50 dark:border-slate-800 pt-2">
                                <span className="text-[10px] text-slate-400 font-medium">Status Marked:</span>
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border font-mono flex items-center gap-1 ${
                                  isPresent 
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                }`}>
                                  {isPresent ? 'Present' : 'Absent'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* Attendance Analytics Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="attendance-metrics-grid">
              {/* Overall Progress Gauge */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between" id="metric-gauge">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Institutional Attendance Standing
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className={`text-4xl font-black ${
                      student.attendancePercent >= 85 ? 'text-emerald-500' : student.attendancePercent >= 75 ? 'text-amber-500' : 'text-rose-500'
                    }`} id="metric-gauge-percentage">
                      {student.attendancePercent}%
                    </span>
                    <span className="text-xs text-slate-400">Total Registry</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                    <span>Course Min Requirements (75%)</span>
                    <span className="font-bold">{student.attendancePercent >= 75 ? '✓ Meets Criteria' : '✗ Violates Criteria'}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        student.attendancePercent >= 85 ? 'bg-emerald-500' : student.attendancePercent >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${student.attendancePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Aggregated Logs summary card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between" id="metric-summary">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Conducted Classroom Log Summary
                  </span>
                  <div className="grid grid-cols-3 gap-2 mt-3.5">
                    <div className="p-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg text-center border border-slate-100 dark:border-slate-800/60">
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 block">
                        {getAttendanceStats().totalClasses}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">Conducted</span>
                    </div>
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-center border border-emerald-500/20">
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                        {getAttendanceStats().presentClasses}
                      </span>
                      <span className="text-[9px] text-emerald-500 font-medium">Present</span>
                    </div>
                    <div className="p-2 bg-rose-500/10 rounded-lg text-center border border-rose-500/20">
                      <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 block">
                        {getAttendanceStats().absentClasses}
                      </span>
                      <span className="text-[9px] text-rose-500 font-medium">Absent</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Official biometric & roll attendance registry logs
                </div>
              </div>

              {/* Dynamic Attendance Math safe limits card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between" id="metric-math-guide">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Safe Margin Standing & Math Guide
                  </span>
                  <div className="mt-2">
                    {student.attendancePercent < 75 ? (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg space-y-1">
                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Academic Warning
                        </span>
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium leading-relaxed">
                          You need to attend <strong>{getAttendanceStats().sessionsNeededFor75}</strong> more consecutive classes without absence to clear the examination block-list!
                        </p>
                      </div>
                    ) : student.attendancePercent < 85 ? (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg space-y-1">
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Caution Warning
                        </span>
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium leading-relaxed">
                          Attend <strong>{getAttendanceStats().sessionsNeededFor85}</strong> more consecutive classes to secure warning-free standing (85% safe standard).
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg space-y-1">
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Excellent Standing
                        </span>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium leading-relaxed">
                          Outstanding presence! You can safely miss up to <strong>{getAttendanceStats().sessionsCanMissFor75}</strong> classes without dropping below the critical 75% limit.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[9px] text-slate-400 mt-2 block font-mono">
                  Calculated dynamically on schedule total of {getAttendanceStats().totalClasses} classes
                </div>
              </div>
            </div>

            {/* Subject-Wise Overview cards */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs" id="subject-overview-card">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-3 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <BookOpen className="w-4.5 h-4.5 text-indigo-500" />
                Course-wise Attendance Breakdown
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="subject-breakdown-grid">
                {(student.subjectAttendance || []).map((sub, idx) => {
                  const total = sub.sessions.length;
                  const present = sub.sessions.filter(s => s.status === 'Present').length;
                  const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

                  return (
                    <div 
                      key={idx} 
                      className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/60"
                      id={`course-card-${idx}`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 leading-tight">
                            {sub.subject}
                          </h5>
                          <span className="text-[9px] text-slate-400 block mt-0.5">Prof: {sub.professorName}</span>
                        </div>
                        <span className={`text-sm font-mono font-black ${
                          percentage >= 85 ? 'text-emerald-500' : percentage >= 75 ? 'text-amber-500' : 'text-rose-500'
                        }`}>
                          {percentage}%
                        </span>
                      </div>

                      {/* Course progress bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden mb-2.5">
                        <div 
                          className={`h-full ${
                            percentage >= 85 ? 'bg-emerald-500' : percentage >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                          }`} 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>Conducted: <strong className="text-slate-700 dark:text-slate-300 font-mono">{total}</strong></span>
                        <span className="flex gap-2">
                          <span className="text-emerald-500">Present: <strong className="font-mono">{present}</strong></span>
                          <span className="text-rose-500">Absent: <strong className="font-mono">{total - present}</strong></span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comprehensive Interactive Session Registry Ledger */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs" id="attendance-ledger-card">
              <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                    <Clock className="w-4.5 h-4.5 text-indigo-500" />
                    Interactive Class-wise Presence Register Ledger
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Audit of every singular scheduled lecture, precise time, classroom details, and biometric registration status.
                  </p>
                </div>

                {/* Filter and search controls */}
                <div className="flex flex-wrap items-center gap-2" id="attendance-ledger-filters">
                  {/* Search query inputs */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search date or course..."
                      value={attendanceSearch}
                      onChange={(e) => setAttendanceSearch(e.target.value)}
                      className="text-xs pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 w-44 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      id="search-input-ledger"
                    />
                  </div>

                  {/* Subject selector */}
                  <div className="flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={attendanceSubjectFilter}
                      onChange={(e) => setAttendanceSubjectFilter(e.target.value)}
                      className="text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 px-2 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      id="subject-select-ledger"
                    >
                      <option value="All">All Subjects</option>
                      {(student.subjectAttendance || []).map((sub, i) => (
                        <option key={i} value={sub.subject}>{sub.subject}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status selector */}
                  <select
                    value={attendanceStatusFilter}
                    onChange={(e) => setAttendanceStatusFilter(e.target.value as 'All' | 'Present' | 'Absent')}
                    className="text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    id="status-select-ledger"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Present">Present Only</option>
                    <option value="Absent">Absent Only</option>
                  </select>

                  {/* Reset filters button */}
                  {(attendanceSearch || attendanceSubjectFilter !== 'All' || attendanceStatusFilter !== 'All') && (
                    <button
                      onClick={() => {
                        setAttendanceSearch('');
                        setAttendanceSubjectFilter('All');
                        setAttendanceStatusFilter('All');
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-850 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Clear All Filters"
                      id="reset-ledger-filters"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* The detailed list/table */}
              <div className="overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse" id="ledger-desktop-table">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-3.5">Session Date & Day</th>
                        <th className="p-3.5">Subject & Professor</th>
                        <th className="p-3.5">Scheduled Timing</th>
                        <th className="p-3.5">Classroom</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Verification / Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                      {(student.subjectAttendance || []).flatMap(sub => 
                        sub.sessions.map(sess => {
                          const weekday = getWeekdayFromDate(sess.date);
                          const time = getSubjectTimingForDate(sub.subject, sess.date);
                          const classroom = getSubjectClassroom(sub.subject);
                          return {
                            id: sess.id,
                            subjectName: sub.subject,
                            professorName: sub.professorName,
                            date: sess.date,
                            weekday,
                            time,
                            classroom,
                            status: sess.status,
                            remarks: sess.status === 'Present' ? 'Regular Lecture Attended' : 'Absence Logged - No Leave Slip'
                          };
                        })
                      )
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .filter(sess => {
                        if (attendanceSubjectFilter !== 'All' && sess.subjectName !== attendanceSubjectFilter) return false;
                        if (attendanceStatusFilter !== 'All' && sess.status !== attendanceStatusFilter) return false;
                        if (attendanceSearch) {
                          const query = attendanceSearch.toLowerCase();
                          const matchSubject = sess.subjectName.toLowerCase().includes(query);
                          const matchProf = sess.professorName.toLowerCase().includes(query);
                          const matchDate = sess.date.includes(query);
                          if (!matchSubject && !matchProf && !matchDate) return false;
                        }
                        return true;
                      })
                      .map((sess, idx) => {
                        const isPresent = sess.status === 'Present';
                        const isRecent = sess.date === '06-27' || sess.date === '06-26';
                        return (
                          <tr 
                            key={sess.id || idx}
                            className={`${
                              isRecent 
                                ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-l-2 border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/35' 
                                : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/30'
                            } transition-colors`}
                            id={`row-ledger-${sess.id || idx}`}
                          >
                            <td className="p-3.5">
                              <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{sess.date}</span>
                                <span className="text-[10px] font-normal text-slate-400">({sess.weekday})</span>
                                {isRecent && (
                                  <span className="text-[8px] uppercase tracking-wider font-extrabold bg-indigo-500 text-white px-1.5 py-0.5 rounded-sm animate-pulse">
                                    Recent
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">{sess.subjectName}</span>
                                <span className="text-[10px] text-slate-400 block">Prof. {sess.professorName}</span>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                {sess.time}
                              </div>
                            </td>
                            <td className="p-3.5">
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold rounded-md text-slate-500 dark:text-slate-400 font-mono">
                                {sess.classroom}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border font-mono ${
                                isPresent 
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                              }`}>
                                {isPresent ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                {sess.status}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span className={`text-[11px] font-medium ${isPresent ? 'text-slate-400' : 'text-rose-400 font-semibold'}`}>
                                {sess.remarks}
                              </span>
                            </td>
                          </tr>
                        );
                      })}

                      {(student.subjectAttendance || []).flatMap(sub => sub.sessions).length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">
                            No biometric attendance registers are available for this student account.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View responsive logs stack */}
                <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800" id="ledger-mobile-container">
                  {(student.subjectAttendance || []).flatMap(sub => 
                    sub.sessions.map(sess => {
                      const weekday = getWeekdayFromDate(sess.date);
                      const time = getSubjectTimingForDate(sub.subject, sess.date);
                      const classroom = getSubjectClassroom(sub.subject);
                      return {
                        id: sess.id,
                        subjectName: sub.subject,
                        professorName: sub.professorName,
                        date: sess.date,
                        weekday,
                        time,
                        classroom,
                        status: sess.status,
                        remarks: sess.status === 'Present' ? 'Regular Lecture Attended' : 'Absence Logged - No Leave Slip'
                      };
                    })
                  )
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .filter(sess => {
                    if (attendanceSubjectFilter !== 'All' && sess.subjectName !== attendanceSubjectFilter) return false;
                    if (attendanceStatusFilter !== 'All' && sess.status !== attendanceStatusFilter) return false;
                    if (attendanceSearch) {
                      const query = attendanceSearch.toLowerCase();
                      const matchSubject = sess.subjectName.toLowerCase().includes(query);
                      const matchProf = sess.professorName.toLowerCase().includes(query);
                      const matchDate = sess.date.includes(query);
                      if (!matchSubject && !matchProf && !matchDate) return false;
                    }
                    return true;
                  })
                  .map((sess, idx) => {
                    const isPresent = sess.status === 'Present';
                    const isRecent = sess.date === '06-27' || sess.date === '06-26';
                    return (
                      <div 
                        key={sess.id || idx} 
                        className={`p-4 flex flex-col gap-2.5 border-l-4 ${
                          isRecent 
                            ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-500' 
                            : 'bg-white dark:bg-slate-900 border-transparent'
                        }`} 
                        id={`mobile-ledger-item-${idx}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-400 block">{sess.date} ({sess.weekday})</span>
                              {isRecent && (
                                <span className="text-[8px] uppercase tracking-wider font-black bg-indigo-500 text-white px-1 rounded-xs animate-pulse">
                                  Recent
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">{sess.subjectName}</span>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border font-mono ${
                            isPresent 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          }`}>
                            {isPresent ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                            {sess.status}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-50 dark:border-slate-800/60 pt-2 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {sess.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {sess.classroom} • Prof. {sess.professorName}
                          </span>
                        </div>

                        {!isPresent && (
                          <div className="text-[10px] bg-rose-500/5 text-rose-500/80 border border-rose-500/10 rounded-lg p-2 font-semibold">
                            {sess.remarks}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: PEER STUDY GROUP FINDER */}
        {activeTab === 'groups' && (
          <motion.div
            key="groups"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Creator Form */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs h-fit">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-1.5 text-sm">
                  <Users className="w-4.5 h-4.5 text-indigo-500" />
                  Post a Peer Study Session
                </h4>

                <form onSubmit={handlePostStudySession} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Topic of Discussion
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Neural Networks Backpropagation"
                      value={groupTopic}
                      onChange={(e) => setGroupTopic(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Time & Day
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tuesday, 04:00 PM"
                      value={groupTime}
                      onChange={(e) => setGroupTime(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Meeting Table or Room
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Library Table No. 4"
                      value={groupLocation}
                      onChange={(e) => setGroupLocation(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Post Group Session
                  </button>
                </form>
              </div>

              {/* Active list to join */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs lg:col-span-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-1.5 text-sm">
                  Active Peer Study Circles
                </h4>

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1" id="study-circles-grid">
                  {studyGroups.map((group) => {
                    const isMember = group.members.includes(student.name);
                    const isFull = group.memberCount >= group.maxMembers;

                    return (
                      <div
                        key={group.id}
                        className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/40 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-indigo-500/20 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                              Host: {group.hostName}
                            </span>
                            <span className="text-[9px] text-slate-400">•</span>
                            <span className="text-[10px] text-indigo-500 font-semibold">{group.location}</span>
                          </div>
                          <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-1.5">
                            {group.topic}
                          </h5>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">{group.time}</p>
                          
                          {/* Members lists */}
                          <div className="mt-2.5 flex flex-wrap gap-1 items-center">
                            <span className="text-[9px] text-slate-400 font-medium mr-1">Members:</span>
                            {group.members.map((m, idx) => (
                              <span key={idx} className="bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded text-[8px] font-bold">
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <button
                            onClick={() => handleJoinGroup(group.id)}
                            disabled={isMember || isFull}
                            className={`w-full sm:w-auto px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isMember
                                ? 'bg-emerald-500/10 text-emerald-500 cursor-not-allowed border border-emerald-500/20'
                                : isFull
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                            }`}
                          >
                            {isMember ? 'Joined' : isFull ? 'Full' : `Join (${group.memberCount}/${group.maxMembers})`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: NOTICE BOARD */}
        {activeTab === 'noticeboard' && (
          <motion.div
            key="noticeboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Tag filtering menu */}
            <div className="flex flex-wrap gap-2 pb-2">
              {(['All', 'Placements', 'Exams', 'CulturalFest'] as const).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-indigo-600 border-indigo-600 text-white font-bold'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {tag === 'All' ? 'All Notices' : `#${tag}`}
                </button>
              ))}
            </div>

            {/* Pinterest bento style Notice cards */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4" id="noticeboard-cards-container">
              {filteredNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="break-inside-avoid bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                        notice.category === 'Placements' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                        notice.category === 'Exams' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                      }`}>
                        #{notice.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{notice.date}</span>
                    </div>

                    <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-2 leading-snug">
                      {notice.title}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                      {notice.content}
                    </p>

                    {/* Notice Hashtags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {notice.tags.map((ht, idx) => (
                        <span key={idx} className="text-[10px] font-semibold text-slate-400">
                          {ht}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Attachment triggers */}
                  {notice.attachmentName && (
                    <button
                      onClick={() => alert(`Initiating secure campus directory download for ${notice.attachmentName}`)}
                      className="w-full py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-slate-400" /> Download {notice.attachmentName}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 4: SECURE DOCUMENT LOCKER */}
        {activeTab === 'locker' && (
          <motion.div
            key="locker"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Document Locker Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* File adding trigger form */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs h-fit">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-1.5 text-sm">
                  <Upload className="w-4.5 h-4.5 text-indigo-500" />
                  Add Certified Copy to Locker
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Keep structured copies of transcripts and government files encrypted under local device storage.
                </p>

                <form onSubmit={handleAddDocument} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Document Label / Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Driver_License"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Certified File Source
                    </label>
                    <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-5 text-center bg-slate-50 dark:bg-slate-950/20">
                      <FileText className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                      <span className="text-[10px] text-slate-400 block font-medium">Click to select PDF upload</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all cursor-pointer"
                  >
                    Add Document to Case
                  </button>
                </form>
              </div>

              {/* File list rendering */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs lg:col-span-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-1.5 text-sm">
                  <FolderOpen className="w-4.5 h-4.5 text-indigo-500" />
                  Encrypted Digital Locker Roster
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Access digital credentials offline directly via device cache.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="document-locker-grid">
                  {lockerFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-start group hover:border-indigo-500/20 transition-all"
                    >
                      <div className="flex gap-2.5">
                        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg h-fit shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate max-w-[140px]" title={file.name}>
                            {file.name}
                          </h5>
                          <span className="text-[9px] text-slate-400 block mt-0.5">{file.size} • Uploaded {file.date}</span>
                        </div>
                      </div>

                      <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => alert(`Opening secure sandbox file: ${file.name}`)}
                          className="p-1 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/5 rounded-full transition-colors cursor-pointer"
                          title="View secure copy"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 rounded-full transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {lockerFiles.length === 0 && (
                    <div className="text-center py-10 text-xs text-slate-400 col-span-2">
                      Locker is empty. Add transcripts or proof of registration copies above.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
