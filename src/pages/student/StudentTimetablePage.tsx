import React, { useState, useEffect } from 'react';
import { firestoreService } from '../../firebase/firestoreService';
import { TimetableEntry } from '../../types';
import { Clock, MapPin, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentTimetablePage: React.FC = () => {
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState<'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY'>('MONDAY');

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

  const currentEntries = timetable.filter((t) => t.day === selectedDay);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/student')}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors md:hidden"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Class Timetable</h1>
          <p className="text-xs text-gray-500 mt-0.5">B.Tech AIML — Division A Schedule</p>
        </div>
      </div>

      {/* Days Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedDay === day
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'bg-white border border-surface-border text-gray-600 hover:bg-gray-50'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Schedule list */}
      <div className="space-y-3">
        {currentEntries.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-400 bg-white rounded-3xl border border-surface-border">
            No lectures scheduled for {selectedDay}.
          </div>
        ) : (
          currentEntries.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-surface-border p-4 shadow-subtle flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-100 text-center font-mono">
                  <div className="text-xs font-extrabold text-brand-700">{item.startTime}</div>
                  <div className="text-[10px] text-brand-500">{item.endTime}</div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-gray-900">{item.subjectName}</h3>
                  <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                    <User className="w-3 h-3 text-gray-400" />
                    <span>{item.facultyName}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  {item.roomNumber}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
