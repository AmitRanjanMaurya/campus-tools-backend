"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Plus, Bell, ArrowLeft, CalendarPlus, BookOpen, FileText, Briefcase } from "lucide-react";
// Helper to generate Google Calendar event link
function getGoogleCalendarUrl(dl: Deadline) {
  const start = dl.dueDate + 'T09:00:00';
  const end = dl.dueDate + 'T10:00:00';
  const details = [dl.title, dl.notes].filter(Boolean).join('%0A');
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(dl.title)}&dates=${start.replace(/[-:]/g, '')}Z/${end.replace(/[-:]/g, '')}Z&details=${encodeURIComponent(details)}&trp=false`;
}
import "react-calendar/dist/Calendar.css";
const Calendar = dynamic(() => import("react-calendar"), { ssr: false });

interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  type: "Assignment" | "Test" | "Project";
  notes?: string;
  reminder: boolean;
}

const initialDeadlines: Deadline[] = [];

export default function DeadlineTracker() {
  const [deadlines, setDeadlines] = useState<Deadline[]>(initialDeadlines);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Deadline>>({ type: "Assignment", reminder: true });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleAdd = () => {
    if (!form.title || !form.dueDate || !form.type) return;
    setDeadlines([
      ...deadlines,
      {
        id: Date.now().toString(),
        title: form.title,
        dueDate: form.dueDate,
        type: form.type as "Assignment" | "Test" | "Project",
        notes: form.notes || "",
        reminder: !!form.reminder,
      },
    ]);
    setForm({ type: "Assignment", reminder: true });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <Link href="/tools" className="flex items-center text-secondary-600 hover:text-primary-600 mr-4">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Tools
          </Link>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary-800 mb-4 flex items-center justify-center gap-2 drop-shadow-sm">
            <CalendarDays className="h-7 w-7 text-primary-600 animate-pulse" />
            Assignment Deadline Tracker
          </h1>
          <p className="text-lg text-secondary-600">
            Track assignments, tests, and projects. Get reminders and see all deadlines in a calendar view.
          </p>
        </div>
        <div className="card mb-8 shadow-lg border-2 border-primary-100 bg-white/80">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary-700 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary-400" /> Upcoming Deadlines
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white rounded-lg shadow transition-all duration-200 font-semibold gap-2"
            >
              <Plus className="h-4 w-4" /> Add Deadline
            </button>
          </div>
          {showForm && (
            <div className="mb-6 bg-gradient-to-br from-blue-100 to-purple-100 p-6 rounded-xl border border-primary-200 shadow-inner animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={form.title || ""}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-primary-200 rounded-lg focus:border-primary-500 focus:outline-none bg-white/80"
                />
                <input
                  type="date"
                  value={form.dueDate || ""}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-primary-200 rounded-lg focus:border-primary-500 focus:outline-none bg-white/80"
                />
                <select
                  value={form.type || "Assignment"}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                  className="w-full px-4 py-2 border-2 border-primary-200 rounded-lg focus:border-primary-500 focus:outline-none bg-white/80"
                >
                  <option value="Assignment">Assignment</option>
                  <option value="Test">Test</option>
                  <option value="Project">Project</option>
                </select>
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={form.notes || ""}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-primary-200 rounded-lg focus:border-primary-500 focus:outline-none bg-white/80"
                />
                <label className="flex items-center col-span-2">
                  <input
                    type="checkbox"
                    checked={!!form.reminder}
                    onChange={e => setForm(f => ({ ...f, reminder: e.target.checked }))}
                    className="mr-2 accent-primary-500"
                  />
                  <span className="text-primary-700">Enable Reminder</span>
                </label>
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
                >Cancel</button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white rounded-lg font-semibold shadow"
                >Add</button>
              </div>
            </div>
          )}
          {deadlines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-secondary-500">
              <Image src="/empty-calendar.svg" alt="No deadlines" width={128} height={128} className="mb-4 opacity-80" />
              <div className="text-lg font-medium">No deadlines yet. Add your first one!</div>
            </div>
          ) : (
            <ul className="divide-y divide-primary-100">
              {deadlines.map(dl => (
                <li key={dl.id} className="py-4 flex items-center justify-between group hover:bg-primary-50/60 rounded-lg transition-all">
                  <div>
                    <div className="font-semibold text-primary-900 flex items-center gap-2">
                      {dl.type === "Assignment" && <FileText className="h-4 w-4 text-blue-500" />}
                      {dl.type === "Test" && <BookOpen className="h-4 w-4 text-purple-500" />}
                      {dl.type === "Project" && <Briefcase className="h-4 w-4 text-green-500" />}
                      {dl.title}
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${dl.type === "Assignment" ? "bg-blue-100 text-blue-700" : dl.type === "Test" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}>{dl.type}</span>
                    </div>
                    <div className="text-sm text-secondary-600 mt-1">Due: <span className="font-medium text-primary-700">{dl.dueDate}</span></div>
                    {dl.notes && <div className="text-xs text-secondary-500 mt-1 italic">{dl.notes}</div>}
                  </div>
                  <div className="flex items-center gap-3">
                    {dl.reminder && <Bell className="h-5 w-5 text-primary-500 animate-bounce" />}
                    <a
                      href={getGoogleCalendarUrl(dl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors text-xs font-semibold shadow-sm"
                      title="Add to Google Calendar"
                    >
                      <CalendarPlus className="h-4 w-4" /> Add to Calendar
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Calendar View */}
        <div className="card shadow-lg border-2 border-primary-100 bg-white/80">
          <h2 className="text-xl font-bold text-primary-700 mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary-600" /> Calendar View
          </h2>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
            <Calendar
              value={selectedDate}
              onChange={date => setSelectedDate(date as Date)}
              tileClassName={({ date }) => {
                const hasDeadline = deadlines.some(dl => dl.dueDate === date.toISOString().slice(0, 10));
                return hasDeadline ? "!bg-primary-400 !text-white font-bold rounded-full border-2 border-primary-600 shadow" : undefined;
              }}
            />
            <div className="mt-6">
              <h3 className="text-lg font-bold text-primary-800 mb-2 flex items-center gap-2">
                Deadlines for {selectedDate ? selectedDate.toISOString().slice(0, 10) : "(select a date)"}
              </h3>
              <ul className="divide-y divide-primary-100">
                {deadlines.filter(dl => selectedDate && dl.dueDate === selectedDate.toISOString().slice(0, 10)).length === 0 ? (
                  <li className="text-secondary-500 py-4 flex flex-col items-center">
                    <Image src="/empty-calendar.svg" alt="No deadlines" width={80} height={80} className="mb-2 opacity-80" />
                    <span>No deadlines for this date.</span>
                  </li>
                ) : (
                  deadlines
                    .filter(dl => selectedDate && dl.dueDate === selectedDate.toISOString().slice(0, 10))
                    .map(dl => (
                      <li key={dl.id} className="py-2 flex items-center justify-between group hover:bg-primary-50/60 rounded-lg transition-all">
                        <div>
                          <div className="font-semibold text-primary-900 flex items-center gap-2">
                            {dl.type === "Assignment" && <FileText className="h-4 w-4 text-blue-500" />}
                            {dl.type === "Test" && <BookOpen className="h-4 w-4 text-purple-500" />}
                            {dl.type === "Project" && <Briefcase className="h-4 w-4 text-green-500" />}
                            {dl.title}
                            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${dl.type === "Assignment" ? "bg-blue-100 text-blue-700" : dl.type === "Test" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}>{dl.type}</span>
                          </div>
                          <div className="text-sm text-secondary-600 mt-1">{dl.type} | <span className="font-medium text-primary-700">{dl.dueDate}</span></div>
                          {dl.notes && <div className="text-xs text-secondary-500 mt-1 italic">{dl.notes}</div>}
                        </div>
                        <div className="flex items-center gap-3">
                          {dl.reminder && <Bell className="h-5 w-5 text-primary-500 animate-bounce" />}
                          <a
                            href={getGoogleCalendarUrl(dl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors text-xs font-semibold shadow-sm"
                            title="Add to Google Calendar"
                          >
                            <CalendarPlus className="h-4 w-4" /> Add to Calendar
                          </a>
                        </div>
                      </li>
                    ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
