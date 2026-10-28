/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CreditCard, Calendar, TrendingUp, Download, ShieldAlert, CheckCircle2, Award, Printer,
  Sparkles, DollarSign, ArrowRight, FileText, FileCheck, Landmark, School
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Student, Invoice, Notice } from '../types';
import BiheCollegeBuilding from './BiheCollegeBuilding';

interface ParentPanelProps {
  childStudent: Student;
  invoice: Invoice;
  examsNotice: Notice | undefined;
}

export default function ParentPanel({
  childStudent,
  invoice,
  examsNotice
}: ParentPanelProps) {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Fee calculation balances
  const totalInvoiced = invoice.tuitionFee + invoice.labFee + invoice.libraryFee;
  const outstandingBalance = totalInvoiced - invoice.paidAmount;
  const isFullyPaid = invoice.paymentStatus === 'Paid';

  return (
    <div className="space-y-6" id="parent-panel-root">
      {/* Title bar header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#D3E1ED] dark:border-[#0D1C29] pb-5">
        <div>
          <span className="text-[9px] font-bold tracking-[0.2em] text-[#0F5B8F] dark:text-[#38BDF8] uppercase block mb-1">GUARDIAN ACADEMIC AUDIT</span>
          <h2 className="font-serif font-light text-3xl text-[#1E2022] dark:text-[#F4F8FA] tracking-tight">
            Ward Performance & Accounts
          </h2>
        </div>

        {/* Highlight who the child is */}
        <div className="flex items-center gap-3 py-2 px-3 border border-[#CADBE8] dark:border-[#0D1C29] bg-[#F4F8FA] dark:bg-[#05111D] rounded-none">
          <div className="w-6 h-6 rounded-none bg-[#1E2022] dark:bg-white text-white dark:text-[#0D0E11] font-extrabold flex items-center justify-center text-xs">
            {childStudent.name[0]}
          </div>
          <div>
            <span className="text-[8px] text-[#0F5B8F] dark:text-[#38BDF8] block uppercase font-bold tracking-widest">Scholar ward</span>
            <span className="text-xs font-serif font-semibold text-[#1E2022] dark:text-white">{childStudent.name}</span>
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
          Explore modern computer labs, seminar halls, and student centers at Bapuji Institute of Hi-Tech Education. Hover over sections of the campus layout below.
        </p>
        <BiheCollegeBuilding />
      </div>

      {/* Main Row layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 parts): Attendance trend and exams schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Trend Chart */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-sky-500" />
                  Ward Attendance Trend Analytics
                </h4>
                <p className="text-xs text-slate-400">Past week classroom logging frequency records.</p>
              </div>

              <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2.5 py-0.5 rounded-full font-mono">
                Overall: {childStudent.attendancePercent}%
              </span>
            </div>

            {/* Recharts trend */}
            <div className="h-56 md:h-64 w-full" id="parent-attendance-trend-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={childStudent.attendanceTrend}>
                  <defs>
                    <linearGradient id="attendanceColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" style={{ fontSize: '10px' }} />
                  <YAxis domain={[50, 100]} style={{ fontSize: '10px' }} />
                  <Tooltip contentStyle={{ fontSize: '11px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    name="Daily Attendance Rate" 
                    stroke="#38bdf8" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#attendanceColor)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Exam Schedules notice */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1 text-sm flex items-center gap-1.5">
              <Calendar className="w-4.5 h-4.5 text-indigo-500" />
              Upcoming Final Exam Timetable Notices
            </h4>
            <p className="text-xs text-slate-400 mb-4">Official schedule compiled from dean academic boards.</p>

            {examsNotice ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center justify-between">
                  <span>{examsNotice.title}</span>
                  <span className="text-[10px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                    Official Announcement
                  </span>
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {examsNotice.content}
                </p>
                <div className="mt-4 flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-200/50 dark:border-slate-800 pt-2.5">
                  <span>Category: #Exams</span>
                  <span className="font-semibold text-indigo-500 hover:underline cursor-pointer" onClick={() => alert(`Downloading exams agenda roster...`)}>
                    Download Schedule PDF
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No exams schedules notices found.</p>
            )}
          </div>
        </div>

        {/* Right Column: Fee Management and digital invoices */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between h-full">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1 flex items-center gap-1.5">
                <Landmark className="w-4.5 h-4.5 text-indigo-500" />
                Fee Management Ledger
              </h4>
              <p className="text-xs text-slate-400 mb-4">View child tuition, laboratory, and library balances.</p>

              {/* Status Badge */}
              <div className="mb-5">
                {isFullyPaid ? (
                  <div className="p-3 bg-emerald-500/5 text-emerald-500 border border-emerald-500/15 rounded-lg text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    <span className="font-bold">Semester Fee Status: Fully Paid</span>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-500/5 text-rose-500 border border-rose-500/15 rounded-lg text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
                    <div>
                      <span className="font-bold block">Balance Outstanding</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Please pay remaining dues before Semester final examinations.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Fee Breakdown List */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Tuition Fee</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">${invoice.tuitionFee}</span>
                </div>

                <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Laboratory & Equipment Fee</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">${invoice.labFee}</span>
                </div>

                <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500">Central Library Roster</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">${invoice.libraryFee}</span>
                </div>

                <div className="flex justify-between items-center text-xs py-2 font-bold text-slate-800 dark:text-slate-100">
                  <span>Grand Total Fees</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                    ${totalInvoiced}
                  </span>
                </div>

                {/* Amount Paid vs Outstanding */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/40">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Amount Paid</span>
                    <span className="text-xs font-extrabold text-emerald-500 block mt-1">${invoice.paidAmount}</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/40">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Remaining Due</span>
                    <span className={`text-xs font-extrabold block mt-1 ${isFullyPaid ? 'text-slate-400' : 'text-rose-500'}`}>
                      ${outstandingBalance}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Invoice modal button */}
            <div className="mt-6">
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                id="generate-invoice-button"
              >
                <Printer className="w-4 h-4" /> Generate Digital Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ULTRA-PREMIUM PRINT-READY INVOICE TEMPLATE MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showInvoiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" id="invoice-modal">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInvoiceModal(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white text-slate-900 rounded-xl shadow-2xl p-6 md:p-8 border-4 border-double border-indigo-900 z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Header inside the printable document */}
              <div className="text-center pb-6 border-b-2 border-indigo-900">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-900">
                  Official Financial Document
                </span>
                <h3 className="text-xl md:text-2xl font-serif font-black text-indigo-950 uppercase mt-1">
                  National University Institute of Engineering
                </h3>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  Accounts & Finance Office • ACC-ST-2026 • Billing Cycle June-July 2026
                </p>
              </div>

              {/* Student info matrix block */}
              <div className="grid grid-cols-2 gap-4 py-5 text-xs border-b border-indigo-900">
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Ward Student Name</span>
                  <span className="font-extrabold text-indigo-950 text-sm">{childStudent.name}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Roster Roll No</span>
                  <span className="font-mono font-bold text-slate-800">{childStudent.rollNo}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Due Date</span>
                  <span className="font-semibold text-slate-700">{invoice.dueDate}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Document ID</span>
                  <span className="font-mono text-indigo-950 font-bold">INV-091-2026</span>
                </div>
              </div>

              {/* Invoice Fee breakdown */}
              <div className="py-6">
                <h4 className="text-[11px] font-extrabold text-indigo-900 uppercase tracking-widest mb-3">
                  Tuition & Lab Fee Breakdown Receipts
                </h4>
                <div className="border border-indigo-900 rounded-sm overflow-hidden text-xs">
                  <div className="bg-slate-50 p-2 font-bold text-indigo-950 border-b border-indigo-900 grid grid-cols-3">
                    <span>Charge Description</span>
                    <span className="text-center">Billing Cycle</span>
                    <span className="text-right">Charged Amount</span>
                  </div>

                  <div className="p-2.5 grid grid-cols-3 border-b border-indigo-900/40">
                    <span className="font-bold text-slate-800">Academic Tuition Semester Fees</span>
                    <span className="text-center text-slate-500">Term-III Regular</span>
                    <span className="text-right font-mono font-semibold">${invoice.tuitionFee}</span>
                  </div>

                  <div className="p-2.5 grid grid-cols-3 border-b border-indigo-900/40">
                    <span className="font-bold text-slate-800">Advanced Laboratory & Equipment Use</span>
                    <span className="text-center text-slate-500">Regular Session</span>
                    <span className="text-right font-mono font-semibold">${invoice.labFee}</span>
                  </div>

                  <div className="p-2.5 grid grid-cols-3">
                    <span className="font-bold text-slate-800">Library Book Circulation Pass</span>
                    <span className="text-center text-slate-500">Yearly Circulation</span>
                    <span className="text-right font-mono font-semibold">${invoice.libraryFee}</span>
                  </div>
                </div>
              </div>

              {/* Summaries matrix */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 border border-indigo-900 rounded-lg text-center text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grand Total Billing</span>
                  <span className="text-sm font-extrabold text-indigo-950 mt-1 block">${totalInvoiced}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Amount Paid</span>
                  <span className="text-sm font-extrabold text-emerald-600 mt-1 block">${invoice.paidAmount}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding Due</span>
                  <span className={`text-sm font-extrabold mt-1 block ${isFullyPaid ? 'text-slate-400' : 'text-rose-600'}`}>
                    ${outstandingBalance}
                  </span>
                </div>
              </div>

              {/* Status stamp banner */}
              <div className="mt-6 flex justify-between items-center">
                <div>
                  {isFullyPaid ? (
                    <div className="border-4 border-emerald-600/50 text-emerald-600 font-black rounded-lg px-4 py-1 uppercase text-lg transform rotate-[-6deg] backdrop-blur-xs font-mono select-none">
                      PAID STAMP
                    </div>
                  ) : (
                    <div className="border-4 border-rose-600/50 text-rose-600 font-black rounded-lg px-4 py-1 uppercase text-lg transform rotate-[-6deg] backdrop-blur-xs font-mono select-none">
                      DUE WARNING
                    </div>
                  )}
                </div>

                <div className="text-right text-xs text-slate-500">
                  <div className="font-serif font-bold text-slate-800">Accounts Department Audit</div>
                  <div className="text-[10px] font-mono mt-0.5">Approved via Central Gateway</div>
                </div>
              </div>

              {/* Print controls */}
              <div className="mt-8 flex justify-end gap-3 no-print">
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print Receipt / Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
