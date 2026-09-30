import React, { useState, useEffect } from 'react';
import { firestoreService } from '../../firebase/firestoreService';
import { TimetableEntry } from '../../types';
import { Clock, Calendar, MapPin, User, BookOpen } from 'lucide-react';

export const TimetableManagementPage: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [activeDay, setActiveDay] = useState<'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY'>('MONDAY');

  useEffect(() => {
    const unsub = firestoreService.subscribeTimetable(setTimetable);
    return () => unsub();
  }, []);

  const days: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY')[] = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
  ];

  const currentEntries = timetable.filter((t) => t.day === activeDay);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900">Campus Master Timetable</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Weekly institutional lecture schedule, assigned faculty, and room mappings
        </p>
      </div>

      {/* Days Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`h-9 px-4 rounded-lg text-xs font-semibold transition-all ${
              activeDay === day
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Entries List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentEntries.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200/80">
            No scheduled lectures configured for {activeDay}.
          </div>
        ) : (
          currentEntries.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-xs transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    <Clock className="w-3 h-3 text-blue-600" />
                    {item.startTime} - {item.endTime}
                  </span>
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {item.roomNumber}
                  </span>
                </div>

                <h3 className="font-semibold text-base text-slate-900 mt-3">{item.subjectName}</h3>
                <div className="text-xs text-blue-600 font-medium mt-0.5">{item.className}</div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.facultyName}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold uppercase text-slate-600">
                  Div {item.division}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
