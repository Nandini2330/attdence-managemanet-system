import React from 'react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const TREND_DATA = [
  { day: 'Mon', attendance: 88, target: 75 },
  { day: 'Tue', attendance: 92, target: 75 },
  { day: 'Wed', attendance: 85, target: 75 },
  { day: 'Thu', attendance: 91, target: 75 },
  { day: 'Fri', attendance: 84, target: 75 },
  { day: 'Sat', attendance: 79, target: 75 },
];

const DEPT_PROGRESS_DATA = [
  { name: 'AIML', fullName: 'Artificial Intelligence & ML', rate: 92, students: 120, color: 'bg-blue-600' },
  { name: 'Computer Engineering', fullName: 'Computer Engineering', rate: 87, students: 240, color: 'bg-emerald-600' },
  { name: 'Information Technology', fullName: 'Information Technology', rate: 81, students: 180, color: 'bg-indigo-600' },
  { name: 'Electronics & Telecom', fullName: 'Electronics & Telecom', rate: 76, students: 150, color: 'bg-amber-600' },
];

const SUBJECT_PERF_DATA = [
  { code: 'CS-601', name: 'Machine Learning & Neural Nets', rate: 92, faculty: 'Prof. Vikram', target: 75 },
  { code: 'CS-602', name: 'Advanced Data Science', rate: 84, faculty: 'Dr. Sarah', target: 75 },
  { code: 'CS-603', name: 'Applied Python Programming', rate: 95, faculty: 'Prof. Ananya', target: 75 },
  { code: 'CS-604', name: 'Cloud Computing & Web Tech', rate: 78, faculty: 'Prof. Vikram', target: 75 },
];

const PRESENT_ABSENT_DATA = [
  { name: 'Present', value: 84, count: 42, color: '#10b981' },
  { name: 'Absent', value: 11, count: 5, color: '#f43f5e' },
  { name: 'Late', value: 5, count: 3, color: '#f59e0b' },
];

export const AttendanceCharts: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Row: Attendance Trend (7 cols) & Present vs Absent Ratio (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Attendance Trend Chart (Section 7) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">Attendance Trend</h3>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Current Week
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Daily campus-wide verified attendance vs 75% target</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
              Avg 86.5%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 11, fill: '#94A3B8' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  domain={[60, 100]} 
                  tick={{ fontSize: 11, fill: '#94A3B8' }} 
                  axisLine={false} 
                  tickLine={false} 
                  ticks={[60, 75, 85, 100]}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
                          <div className="font-semibold">{label}</div>
                          <div className="text-blue-300 mt-0.5">Attendance: {payload[0].value}%</div>
                          <div className="text-slate-400 text-[10px]">Benchmark Target: 75%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#2563EB" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#trendAreaFill)" 
                  name="Attendance %" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Present vs Absent Ratio (Section 8) - Balanced Donut with Side Legend */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Present vs Absent</h3>
            <p className="text-xs text-slate-500 mt-0.5">Today's live attendance breakdown</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-auto py-2">
            {/* Donut Chart */}
            <div className="w-40 h-40 relative flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PRESENT_ABSENT_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {PRESENT_ABSENT_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg">
                            <span className="font-semibold">{payload[0].name}: </span>
                            <span>{payload[0].value}%</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Metric */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-900">84%</span>
                <span className="text-[10px] text-slate-400 font-medium">Present</span>
              </div>
            </div>

            {/* Clear Side Legend with percentages & counts */}
            <div className="flex-1 w-full space-y-2.5">
              {PRESENT_ABSENT_DATA.map((item) => (
                <div 
                  key={item.name} 
                  className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-slate-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-900">{item.value}%</span>
                    <span className="text-slate-400 text-[11px]">({item.count})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Total Verified Students</span>
            <span className="font-semibold text-slate-700 font-mono">50 Active</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Attendance by Department (Section 9) & Subject Performance Index */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Attendance by Department (Section 9) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                Attendance by Department
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Campus benchmark comparison across active departments</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              4 Departments
            </span>
          </div>

          <div className="space-y-4">
            {DEPT_PROGRESS_DATA.map((dept) => (
              <div key={dept.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">{dept.name}</span>
                    <span className="text-slate-400 text-[11px] ml-2 font-mono">({dept.students} students)</span>
                  </div>
                  <span className={`font-bold font-mono ${dept.rate >= 85 ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {dept.rate}%
                  </span>
                </div>
                {/* Horizontal Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${dept.color}`}
                    style={{ width: `${dept.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Performance Index */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                Subject Performance Index
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Semester VI lecture participation ratings</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Semester VI
            </span>
          </div>

          <div className="space-y-3">
            {SUBJECT_PERF_DATA.map((subj) => (
              <div 
                key={subj.code} 
                className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-1 rounded">
                      {subj.code}
                    </span>
                    <span className="font-semibold text-slate-800">{subj.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Faculty: <strong className="font-medium text-slate-600">{subj.faculty}</strong>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <span className={`font-bold font-mono text-sm ${subj.rate >= 85 ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {subj.rate}%
                  </span>
                  <div className="text-[10px] text-slate-400">Target 75%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
