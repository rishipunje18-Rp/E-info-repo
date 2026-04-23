/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  Sparkles, 
  Image as ImageIcon, 
  LogOut, 
  CheckCircle, 
  Clock,
  ChevronRight,
  LayoutDashboard,
  BookOpen,
  Upload,
  FileText,
  X,
  Activity,
  UserCheck,
  ShieldAlert,
  Eye,
  Maximize2
} from 'lucide-react';
import { User, Event, Registration, Media } from './types';
import { generateEventDescription, generateEventPoster } from './services/geminiService';
import ReactMarkdown from 'react-markdown';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'login' | 'dashboard' | 'events' | 'registrations' | 'students' | 'event-details'>('login');
  const [events, setEvents] = useState<Event[]>([]); // All events
  const [myEvents, setMyEvents] = useState<Event[]>([]); // Registered events for student
  const [allRegistrations, setAllRegistrations] = useState<(Registration & { event_title: string, user_email: string })[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedFilterEvent, setSelectedFilterEvent] = useState<string>('all');
  const [lastView, setLastView] = useState<'dashboard' | 'events' | 'registrations' | 'students'>('dashboard');

  const navigateTo = (newView: typeof view) => {
    if (newView !== 'event-details') {
      setLastView(newView as any);
    }
    setView(newView);
    setSelectedEvent(null);
  };

  // Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('einfo_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setView('dashboard');
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchGlobalData();
    }
  }, [user, view]);

  const fetchGlobalData = async () => {
    setLoading(true);
    try {
      // Always fetch all events for background usage
      const evRes = await fetch('/api/events');
      const evData = await evRes.json();
      setEvents(evData);

      if (user?.role === 'student') {
        const regRes = await fetch(`/api/registrations/user/${user.id}`);
        const regData = await regRes.json();
        setMyEvents(regData);
      }

      if (user?.role === 'admin' && view === 'students') {
        const allRegRes = await fetch('/api/registrations/all');
        const allRegData = await allRegRes.json();
        setAllRegistrations(allRegData);
      }
    } catch (err) {
      console.error('Data sync failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('einfo_user', JSON.stringify(data.user));
        setView('dashboard');
      } else {
        setAuthError(data.error || 'Login failed');
      }
    } catch (err) {
      setAuthError('Server error');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('einfo_user');
    setView('login');
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center academic-gradient p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl mb-4">
              <BookOpen size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">E-Info</h1>
            <p className="text-slate-500">Event Management System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                placeholder="abc@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Admin Credentials</p>
            <p className="text-sm text-slate-600 mt-1">admin@einfo.com / admin123</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-teal-600 text-white rounded-lg flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight">E-Info</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => navigateTo('dashboard')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all font-black text-sm tracking-tight ${view === 'dashboard' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={22} />
            Dashboard
          </button>
          <button 
            onClick={() => navigateTo('events')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all font-black text-sm tracking-tight ${view === 'events' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <BookOpen size={22} />
            Event Index
          </button>
          {user?.role === 'student' ? (
            <button 
              onClick={() => navigateTo('registrations')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all font-black text-sm tracking-tight ${view === 'registrations' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <CheckCircle size={22} />
              My Roster
            </button>
          ) : (
            <button 
              onClick={() => navigateTo('students')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all font-black text-sm tracking-tight ${view === 'students' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Users size={22} />
              Attendees
            </button>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs">
              {user?.email[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.email}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Main Terminal</h2>
                  <p className="text-slate-500 font-bold">Standard authentication verified. System ready.</p>
                </div>
                <div className="flex bg-white px-6 py-3 rounded-3xl border border-slate-200 shadow-sm items-center gap-4 group relative cursor-help">
                  <div className="w-10 h-10 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                    <Activity size={20} />
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">System Status</p>
                    <p className="font-black text-slate-900">Synchronized</p>
                  </div>
                  <div className="absolute top-full mt-2 right-0 bg-slate-900 text-white text-[10px] p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 w-48 font-bold">
                    App is actively connected to the E-Info database and synchronized with local storage.
                  </div>
                </div>
              </div>

              {user?.role === 'student' ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                   <div className="md:col-span-8 bg-white p-10 md:p-14 rounded-[3rem] border border-slate-200 shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 -mr-32 -mt-32 rounded-full transition-transform group-hover:scale-110"></div>
                     <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start md:items-center">
                        <div className="w-32 h-32 bg-slate-900 text-white rounded-5xl flex items-center justify-center text-4xl shadow-3xl shadow-slate-900/20">
                          {user?.email[0].toUpperCase()}
                        </div>
                        <div className="space-y-4">
                           <h3 className="text-3xl font-black text-slate-900">Scholar Profile</h3>
                           <div className="flex flex-wrap gap-6 text-sm">
                              <div className="space-y-1">
                                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">IDENTIFIER</p>
                                 <p className="font-black text-slate-700">{user?.email}</p>
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">CLEARANCE</p>
                                 <p className="font-black text-teal-600 uppercase italic">Student Level</p>
                              </div>
                           </div>
                        </div>
                     </div>
                   </div>
                   <div className="md:col-span-4 bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col justify-between shadow-3xl">
                      <div className="space-y-2">
                        <h4 className="text-6xl font-black">{myEvents.length}</h4>
                        <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Academic Registrations</p>
                      </div>
                      <button 
                        onClick={() => setView('registrations')}
                        className="mt-8 bg-white/10 hover:bg-white/20 px-8 py-4 rounded-full font-black text-sm transition-all border border-white/5"
                      >
                        MY SCHEDULE
                      </button>
                   </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shrink-0 shadow-inner">
                      <Calendar size={32} />
                    </div>
                    <div>
                      <h4 className="text-3xl font-black text-slate-900">{events.length}</h4>
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Active Events</p>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-6">
                    <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center shrink-0 shadow-inner">
                      <Users size={32} />
                    </div>
                    <div>
                      <h4 className="text-3xl font-black text-slate-900">{allRegistrations.length}</h4>
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Total Attendees</p>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex items-center gap-6 shadow-3xl shadow-slate-900/10">
                    <div className="w-16 h-16 bg-white/10 text-white rounded-3xl flex items-center justify-center shrink-0 backdrop-blur-md">
                      <ShieldAlert size={32} />
                    </div>
                    <div>
                      <h4 className="text-3xl font-black uppercase text-teal-400 tracking-tight">Admin</h4>
                      <p className="text-white/40 font-bold uppercase text-[10px] tracking-widest">Privileged Node</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-black text-slate-900">Featured Opportunities</h3>
                  <button onClick={() => setView('events')} className="bg-slate-100 hover:bg-slate-200 px-6 py-2.5 rounded-full text-sm font-black text-slate-900 transition-all">DISCOVER MISSION</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {events.slice(0, 3).map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onClick={() => { setSelectedEvent(event); setView('event-details'); }}
                    />
                  ))}
                  {events.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-5xl border border-dotted border-slate-200">
                       <Sparkles className="mx-auto text-slate-200 mb-4" size={48} />
                       <p className="text-slate-400 font-bold text-lg italic">Terminal empty. Awaiting mission publication.</p>
                    </div>
                   )}
                </div>
              </div>
            </motion.div>
          )}

          {view === 'events' && (
            <motion.div 
              key="events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Event Index</h2>
                  <p className="text-slate-500 font-bold text-lg">Central hub for academic and social intelligence.</p>
                </div>
                {user?.role === 'admin' && (
                  <button 
                    onClick={() => { setSelectedEvent(null); setView('event-details'); }}
                    className="flex items-center gap-4 bg-teal-600 text-white px-10 py-5 rounded-[2rem] font-black text-lg hover:bg-teal-700 transition-all shadow-3xl shadow-teal-500/20 hover:-translate-y-1"
                  >
                    <Plus size={24} />
                    Create Event
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {events.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onClick={() => { setSelectedEvent(event); setView('event-details'); }}
                  />
                ))}
                {events.length === 0 && <p className="col-span-full py-32 text-center text-slate-400 text-2xl font-black italic opacity-30">ARCHIVE EMPTY</p>}
              </div>
            </motion.div>
          )}

          {view === 'registrations' && user?.role === 'student' && (
            <motion.div 
              key="registrations"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-12"
            >
              <div className="space-y-2">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">My Active Roster</h2>
                <p className="text-slate-500 font-bold text-lg">Current authorized event participations.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {myEvents.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onClick={() => { setSelectedEvent(event); setView('event-details'); }}
                  />
                ))}
                {myEvents.length === 0 && (
                   <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
                     <CheckCircle className="text-slate-100 mb-8" size={100} />
                     <p className="text-slate-400 font-black text-2xl tracking-tight max-w-sm">You haven't initiated any event participations yet.</p>
                     <button onClick={() => setView('events')} className="mt-8 bg-teal-600 text-white px-10 py-4 rounded-full font-black shadow-2xl shadow-teal-500/10 hover:bg-teal-700 transition-all">EXPLORE EVENTS</button>
                   </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'students' && user?.role === 'admin' && (
            <motion.div 
              key="students"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Attendee Database</h2>
                  <p className="text-slate-500 font-bold text-lg">Comprehensive registry of all scholar participations.</p>
                </div>
                <div className="w-full md:w-80 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Filter by Mission</label>
                  <select 
                    value={selectedFilterEvent}
                    onChange={(e) => setSelectedFilterEvent(e.target.value)}
                    className="w-full bg-white border border-slate-200 px-6 py-4 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-teal-500/10 transition-all"
                  >
                    <option value="all">Display All Participants</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="bg-white rounded-[3rem] border border-slate-200 shadow-3xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-10 py-6 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Scholar Name</th>
                        <th className="px-10 py-6 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Institutional ID</th>
                        <th className="px-10 py-6 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Target Mission</th>
                        <th className="px-10 py-6 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Classification</th>
                        <th className="px-10 py-6 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Registry Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                      {allRegistrations
                        .filter(reg => selectedFilterEvent === 'all' || reg.event_id === parseInt(selectedFilterEvent))
                        .map((reg, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-10 py-7">
                            <p className="text-lg font-black text-slate-900">{reg.name}</p>
                            <p className="text-xs text-slate-400 mt-1">{reg.user_email}</p>
                          </td>
                          <td className="px-10 py-7">
                             <div className="bg-slate-100 px-4 py-2 rounded-2xl inline-block text-sm font-black text-slate-600">ID: {reg.roll}</div>
                          </td>
                          <td className="px-10 py-7">
                            <span className="text-teal-700 font-black tracking-tight">{reg.event_title}</span>
                          </td>
                          <td className="px-10 py-7">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-black uppercase text-slate-400">{reg.department}</span>
                              <span className="text-[10px] font-black uppercase text-teal-600">Year {reg.year}</span>
                            </div>
                          </td>
                          <td className="px-10 py-7 text-xs text-slate-400 font-black">{new Date(reg.registered_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {allRegistrations.filter(reg => selectedFilterEvent === 'all' || reg.event_id === parseInt(selectedFilterEvent)).length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-10 py-32 text-center text-slate-400 text-xl font-black italic opacity-30 tracking-widest">DATABASE_EMPTY</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'event-details' && (
            <EventDetails 
              user={user!} 
              event={selectedEvent} 
              onBack={() => navigateTo(lastView)}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function EventCard({ event, onClick }: { event: Event, onClick: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer group transition-all hover:shadow-xl"
    >
      <div className="h-48 bg-slate-100 relative overflow-hidden">
        {event.poster_url ? (
          <img src={event.poster_url} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={event.title} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ImageIcon size={48} />
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-teal-700 shadow-sm">
          {event.status}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">{event.title}</h3>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Calendar size={16} className="text-teal-600" />
            {event.date}
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <MapPin size={16} className="text-teal-600" />
            {event.venue}
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <span className="text-xs font-medium text-slate-400">Target: {event.target_audience}</span>
          <ChevronRight size={18} className="text-slate-300 group-hover:text-teal-600 transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}

function EventDetails({ user, event, onBack }: { user: User, event: Event | null, onBack: () => void }) {
  const [formData, setFormData] = useState<Partial<Event>>(event || {
    title: '',
    date: '',
    venue: '',
    purpose: '',
    target_audience: '',
    description: '',
    poster_url: '',
    status: 'upcoming',
    show_resources: 0
  });
  const [loading, setLoading] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  
  // Registration Form State
  const [showRegForm, setShowRegForm] = useState(false);
  const [regData, setRegData] = useState({
    name: '',
    department: '',
    year: '',
    roll: '',
    email: user.email
  });

  useEffect(() => {
    if (event) {
      fetchRegistrations();
      fetchMedia();
      if (user.role === 'student') {
        checkRegistration();
      }
    }
  }, [event]);

  const fetchRegistrations = async () => {
    if (!event) return;
    const res = await fetch(`/api/registrations/event/${event.id}`);
    const data = await res.json();
    setRegistrations(data);
  };

  const fetchMedia = async () => {
    if (!event) return;
    const res = await fetch(`/api/media/${event.id}`);
    const data = await res.json();
    setMedia(data);
  };

  const checkRegistration = async () => {
    if (!event) return;
    const res = await fetch(`/api/registrations/user/${user.id}`);
    const data = await res.json();
    setIsRegistered(data.some((e: Event) => e.id === event.id));
  };

  const handleSave = async () => {
    setLoading(true);
    const method = event ? 'PUT' : 'POST';
    const url = event ? `/api/events/${event.id}` : '/api/events';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setLoading(false);
    onBack();
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event?.id}`, { method: 'DELETE' });
      if (res.ok) {
        onBack();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete event');
      }
    } catch (err) {
      alert('Network error while deleting event');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user_id: user.id, 
        event_id: event?.id,
        ...regData
      }),
    });
    if (res.ok) {
      setIsRegistered(true);
      setShowRegForm(false);
      fetchRegistrations();
    } else {
      const data = await res.json();
      alert(data.error || 'Registration failed');
    }
    setLoading(false);
  };

  const generateDescription = async () => {
    setLoading(true);
    try {
      const desc = await generateEventDescription({
        title: formData.title || '',
        date: formData.date || '',
        venue: formData.venue || '',
        purpose: formData.purpose || '',
        targetAudience: formData.target_audience || '',
      });
      setFormData({ ...formData, description: desc });
    } catch (err) {
      alert('Failed to generate description');
    }
    setLoading(false);
  };

  const generatePoster = async () => {
    setLoading(true);
    try {
      const poster = await generateEventPoster({
        title: formData.title || '',
        date: formData.date || '',
        venue: formData.venue || ''
      });
      if (poster) setFormData({ ...formData, poster_url: poster });
    } catch (err) {
      alert('Failed to generate poster');
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: 'gallery' | 'document' | 'internal') => {
    const file = e.target.files?.[0];
    if (!file || !event) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          file_path: base64,
          file_type: file.type,
          category
        }),
      });
      fetchMedia();
    };
    reader.readAsDataURL(file);
  };

  const isAdmin = user.role === 'admin';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto pb-20"
    >
      {/* Lightbox for both posters and gallery photos */}
      <AnimatePresence>
        {lightbox && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={lightbox} 
              className="max-w-full max-h-full rounded-2xl shadow-2xl transition-all" 
              alt="Preview" 
            />
            <button className="absolute top-8 right-8 text-white p-2 hover:bg-white/10 rounded-full transition-all">
              <X size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold group">
          <ChevronRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
          Dashboard Overview
        </button>
        {isAdmin && event && (
          <button onClick={handleDelete} className="text-red-500 hover:text-red-700 flex items-center gap-2 font-bold px-6 py-2.5 hover:bg-red-50 rounded-2xl transition-all">
            <Trash2 size={20} />
            Immediate Delete
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* RIGHT COLUMN (POSTER AND ACTIONS) - STICKY-ISH */}
        <div className="lg:col-span-4 space-y-8 order-1 lg:order-2">
          {/* Detailed Image Card */}
          <section className="bg-white p-6 rounded-5xl border border-slate-200 shadow-2xl overflow-hidden relative group">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-900 tracking-tight text-xl">Official Poster</h3>
              {isAdmin && (
                <button 
                  onClick={generatePoster}
                  disabled={loading}
                  className="text-[10px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-700 flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-full transition-all"
                >
                  <Sparkles size={14} />
                  AI RENDER
                </button>
              )}
            </div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              onClick={() => formData.poster_url && setLightbox(formData.poster_url)}
              className="aspect-[3/4] bg-slate-50 rounded-4xl overflow-hidden border border-slate-100 flex items-center justify-center relative cursor-pointer shadow-inner"
            >
              {formData.poster_url ? (
                <>
                  <img src={formData.poster_url} className="w-full h-full object-cover" alt="Poster" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px]">
                    <Plus size={48} className="drop-shadow-2xl" />
                  </div>
                </>
              ) : (
                <div className="text-center p-8">
                  <ImageIcon size={72} className="text-slate-200 mx-auto mb-6" />
                  <p className="text-sm font-bold text-slate-400">Targeting Academic Visuals...</p>
                </div>
              )}
            </motion.div>
          </section>

          {/* Action Button */}
          {!isAdmin ? (
            <button 
              onClick={() => !isRegistered && setShowRegForm(true)}
              disabled={loading || isRegistered}
              className={`w-full py-6 rounded-4xl font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-4 ${
                isRegistered 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                : 'bg-teal-600 text-white shadow-teal-500/20 hover:bg-teal-700 hover:-translate-y-1'
              }`}
            >
              {isRegistered ? <CheckCircle size={28} /> : <Users size={28} />}
              {isRegistered ? 'Participation Confirmed' : 'Register for Event'}
            </button>
          ) : (
            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-6 rounded-4xl font-black text-xl shadow-2xl shadow-slate-900/10 hover:bg-teal-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-4"
            >
              {loading ? <Clock className="animate-spin" size={28} /> : <CheckCircle size={28} />}
              {event ? 'Update & Sync' : 'Finalize & Publish'}
            </button>
          )}

          {/* Attendees List for Admin */}
          {isAdmin && registrations.length > 0 && (
            <section className="bg-white p-8 rounded-5xl border border-slate-200 shadow-sm overflow-hidden">
              <h3 className="font-black text-slate-900 mb-6 flex items-center gap-3 text-lg">
                <Users size={24} className="text-teal-600" />
                Attendee List ({registrations.length})
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-3 custom-scrollbar">
                {registrations.map((reg, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-3xl border border-slate-100 hover:border-teal-200 transition-colors">
                    <p className="text-base font-black text-slate-800">{reg.name}</p>
                    <p className="text-xs text-slate-400 font-bold mt-1 truncate">{reg.email}</p>
                    <div className="flex gap-2 mt-2">
                       <span className="text-[10px] font-black uppercase text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">{reg.department}</span>
                       <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">Y-{reg.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* LEFT COLUMN: INFORMATION/EDITING */}
        <div className="lg:col-span-8 space-y-10 order-2 lg:order-1">
          {/* Header Info */}
          <div className="space-y-6">
            {isAdmin ? (
              <input 
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="text-4xl md:text-5xl font-black text-slate-900 bg-transparent border-none focus:ring-0 w-full p-0 placeholder-slate-200 outline-none leading-tight"
                placeholder="Unique Event Title..."
              />
            ) : (
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[1.1]">{formData.title}</h1>
            )}
            <div className="flex flex-wrap gap-4 text-slate-600 font-bold">
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-slate-100 shadow-sm">
                <Calendar className="text-teal-600 transition-transform group-hover:scale-110" size={20} />
                {isAdmin ? (
                  <input 
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="bg-transparent border-none focus:ring-0 p-0 text-sm outline-none font-bold"
                  />
                ) : (
                  <span className="text-sm">{formData.date}</span>
                )}
              </div>
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-slate-100 shadow-sm">
                <MapPin className="text-teal-600 transition-transform group-hover:scale-110" size={20} />
                {isAdmin ? (
                  <input 
                    value={formData.venue}
                    onChange={e => setFormData({ ...formData, venue: e.target.value })}
                    className="bg-transparent border-none focus:ring-0 p-0 text-sm outline-none font-bold"
                    placeholder="Physical or Digital Venue..."
                  />
                ) : (
                  <span className="text-sm">{formData.venue}</span>
                )}
              </div>
            </div>
          </div>

          <section className="bg-white p-8 md:p-14 rounded-5xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10">
              <div className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.2em] border shadow-sm ${
                formData.status === 'published' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'
              }`}>
                {formData.status}
              </div>
            </div>

            <div className="flex items-center justify-between mb-12">
              <h3 className="text-3xl font-black flex items-center gap-4">
                <Sparkles className="text-teal-600" size={32} />
                Strategic Overview
              </h3>
              {isAdmin && (
                <button 
                  onClick={generateDescription}
                  disabled={loading}
                  className="text-xs font-black uppercase tracking-widest text-teal-600 hover:text-teal-700 flex items-center gap-3 bg-teal-50 px-6 py-3 rounded-full transition-all hover:bg-teal-100"
                >
                  <Sparkles size={18} />
                  GENERATE WITH GEMINI
                </button>
              )}
            </div>

            {isAdmin ? (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Target Scholars</label>
                    <input 
                      value={formData.target_audience}
                      onChange={e => setFormData({ ...formData, target_audience: e.target.value })}
                      className="w-full px-8 py-4 rounded-3xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none font-bold transition-all"
                      placeholder="e.g. Science Undergraduates"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Mission Purpose</label>
                    <input 
                      value={formData.purpose}
                      onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                      className="w-full px-8 py-4 rounded-3xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none font-bold transition-all"
                      placeholder="e.g. Academic Research Exchange"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                   <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Academic Narrative (Markdown)</label>
                   <textarea 
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full h-[500px] px-8 py-6 rounded-4xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none font-mono text-sm leading-8"
                    placeholder="Draft the complete mission brief here..."
                  />
                </div>
                <div className="space-y-3">
                   <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Release Protocol</label>
                   <select 
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-8 py-4 rounded-3xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none font-black text-lg transition-all"
                  >
                    <option value="upcoming">Plan as Upcoming</option>
                    <option value="published">Sync as Published</option>
                    <option value="draft">Save as Draft</option>
                  </select>
                </div>
                <div className="space-y-3">
                   <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Archive Visibility</label>
                   <div className="flex bg-slate-50 p-2 rounded-3xl border border-slate-200">
                     <button 
                       onClick={() => setFormData({...formData, show_resources: 1})}
                       className={`flex-1 py-3 px-6 rounded-2xl font-black text-sm transition-all ${formData.show_resources === 1 ? 'bg-white shadow-md text-teal-600' : 'text-slate-400'}`}
                     >
                       OPEN ACCESS
                     </button>
                     <button 
                       onClick={() => setFormData({...formData, show_resources: 0})}
                       className={`flex-1 py-3 px-6 rounded-2xl font-black text-sm transition-all ${formData.show_resources === 0 ? 'bg-white shadow-md text-slate-900' : 'text-slate-400'}`}
                     >
                       RESTRICTED
                     </button>
                   </div>
                   <p className="text-[10px] text-slate-400 font-bold ml-4 italic">Controls if "Resource Access" terminal is viewable by students.</p>
                 </div>
               </div>
            ) : (
              <div className="space-y-12">
                <div className="flex flex-wrap gap-16">
                   <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-0.5">TARGET AUDIENCE</p>
                     <p className="font-black text-2xl text-slate-800 tracking-tight">{formData.target_audience}</p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-0.5">SCHOLARLY PURPOSE</p>
                     <p className="font-extrabold text-2xl text-slate-800 tracking-tight">{formData.purpose}</p>
                   </div>
                </div>
                <div className="markdown-body prose prose-slate max-w-none prose-teal leading-relaxed text-slate-600 text-lg">
                  <ReactMarkdown>{formData.description || 'Detailed narrative formulation in progress.'}</ReactMarkdown>
                </div>
              </div>
            )}
          </section>

          {/* Unified Media Hub */}
          {event && (
            <div className="space-y-20 pt-10">
              {/* Image Gallery */}
              <section>
                <div className="flex items-center justify-between mb-10">
                  <div className="space-y-1">
                    <h3 className="text-4xl font-black flex items-center gap-4">
                      <ImageIcon className="text-teal-600" size={40} />
                      Event Gallery
                    </h3>
                    <p className="text-slate-400 font-bold ml-1">Visual documentation of academic milestones.</p>
                  </div>
                  {isAdmin && (
                    <label className="cursor-pointer bg-slate-900 text-white px-8 py-4 rounded-full text-sm font-black hover:bg-teal-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-3">
                      <Upload size={20} />
                      INGEST MEDIA
                      <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'gallery')} />
                    </label>
                  )}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  {media.filter(m => m.category === 'gallery').map((m) => (
                    <motion.div 
                      key={m.id} 
                      whileHover={{ y: -8, scale: 1.05 }}
                      onClick={() => setLightbox(m.file_path)}
                      className="aspect-square rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-200 group relative cursor-pointer shadow-xl transition-all"
                    >
                      <img src={m.file_path} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Event media" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[1px]">
                        <Plus size={40} />
                      </div>
                    </motion.div>
                  ))}
                  {media.filter(m => m.category === 'gallery').length === 0 && (
                    <div className="col-span-full py-28 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 shadow-inner">
                      <ImageIcon className="mx-auto text-slate-100 mb-6" size={80} />
                      <p className="text-slate-400 font-black text-xl tracking-tight">Gallery sync pending event conclusion.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Resource Access (Public Documents) */}
              {(isAdmin || formData.show_resources === 1) && (
                <section className="bg-slate-900 text-white p-10 md:p-16 rounded-[3.5rem] shadow-3xl relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 blur-[120px] -ml-48 -mb-48 rounded-full"></div>
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                      <div className="space-y-2">
                         <h3 className="text-4xl font-black flex items-center gap-4">
                          <FileText className="text-teal-400" size={40} />
                          Resource Access
                        </h3>
                        <p className="text-white/40 font-bold ml-1">Secure distribution of academic assets and research.</p>
                        {!isAdmin && <p className="text-[10px] text-teal-400 font-black uppercase tracking-widest mt-2">• SECURE READ-ONLY ACCESS GRANTED</p>}
                      </div>
                      {isAdmin && (
                        <label className="cursor-pointer bg-white/10 text-white px-8 py-4 rounded-full text-sm font-black hover:bg-teal-500 transition-all flex items-center gap-3 border border-white/10 backdrop-blur-md self-start md:self-center">
                          <Plus size={20} />
                          UPLOAD ASSET
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'document')} />
                        </label>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {media.filter(m => m.category === 'document').map((m) => (
                        <div key={m.id} className="flex items-center gap-6 p-8 bg-white/5 rounded-[2.5rem] border border-white/10 group hover:bg-white/10 transition-all hover:scale-[1.02]">
                          <div className="w-16 h-16 bg-teal-500 text-white rounded-3xl flex items-center justify-center shrink-0 shadow-2xl shadow-teal-500/30">
                            <FileText size={32} />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-lg font-black truncate">Asset Reference #{m.id}</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black mt-1">SECURE ENCRYPTED VIEW</p>
                          </div>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => setLightbox(m.file_path)}
                              className="bg-white/5 p-4 rounded-2xl hover:bg-teal-500 transition-all text-white/60 hover:text-white"
                              title="Instant Peek"
                            >
                              <Eye size={24} />
                            </button>
                            {isAdmin && (
                              <a href={m.file_path} download className="bg-white/5 p-4 rounded-2xl hover:bg-teal-500 transition-all text-white/60 hover:text-white">
                                 <Upload size={24} className="rotate-180" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                      {media.filter(m => m.category === 'document').length === 0 && (
                        <p className="col-span-full text-center text-white/10 py-16 text-lg italic font-bold">Secure terminal awaiting academic resource synchronization.</p>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Internal Assets (Admin Only) */}
              {isAdmin && (
                <section className="bg-slate-50/50 p-10 md:p-14 rounded-5xl border-2 border-slate-200/50">
                  <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                      <h3 className="text-4xl font-black flex items-center gap-4 text-slate-900">
                        <ShieldAlert className="text-orange-500" size={40} />
                        Internal Assets
                      </h3>
                      <p className="text-slate-400 font-bold ml-1">Private administrative documentation. Access restricted to authorized personnel.</p>
                    </div>
                    <label className="cursor-pointer bg-slate-900 text-white px-8 py-4 rounded-full text-sm font-black hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-3">
                      <Upload size={20} />
                      ARCHIVE PRIVATELY
                      <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'internal')} />
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {media.filter(m => m.category === 'internal').map((doc) => (
                      <div key={doc.id} className="bg-white p-6 rounded-4xl border-2 border-orange-100 flex items-center justify-between shadow-sm hover:shadow-orange-200 transition-all">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center font-black text-xs">
                             SEC
                           </div>
                           <div>
                              <p className="font-black text-slate-900">Secret Node #{doc.id}</p>
                              <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">PRIVATE ASSET</p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => setLightbox(doc.file_path)}
                             className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-orange-50 hover:text-orange-600 transition-all"
                           >
                             <Maximize2 size={24} />
                           </button>
                           <a 
                             href={doc.file_path} 
                             download={`internal-${doc.id}`}
                             className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-orange-50 hover:text-orange-600 transition-all"
                           >
                             <Upload className="rotate-180" size={24} />
                           </a>
                        </div>
                      </div>
                    ))}
                    {media.filter(m => m.category === 'internal').length === 0 && (
                       <p className="col-span-full py-10 text-center text-slate-300 font-black italic tracking-widest uppercase text-xs">Awaiting Private Directives</p>
                    )}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal Overlay */}
      <AnimatePresence>
        {showRegForm && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-2xl flex items-center justify-center z-[200] p-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 40 }}
              className="bg-white w-full max-w-2xl rounded-[4rem] p-12 md:p-20 shadow-3xl overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50 -mr-24 -mt-24 rounded-full"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-14">
                  <div className="space-y-2">
                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Confirm</h3>
                    <p className="text-slate-400 font-bold text-lg">Verify your institutional credentials.</p>
                  </div>
                  <button onClick={() => setShowRegForm(false)} className="text-slate-200 hover:text-slate-900 transition-all p-4 hover:bg-slate-50 rounded-full">
                    <X size={40} />
                  </button>
                </div>
                <form onSubmit={handleRegister} className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-[0.4em] text-slate-300 ml-2">ACADEMIC FULL NAME</label>
                    <input 
                      required
                      placeholder="Enter exactly as per records..."
                      value={regData.name}
                      onChange={e => setRegData({...regData, name: e.target.value})}
                      className="w-full px-10 py-6 rounded-4xl border-2 border-slate-100 focus:border-teal-500 outline-none bg-slate-50 font-black transition-all text-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-[0.4em] text-slate-300 ml-2">DEPARTMENT</label>
                      <input 
                        required
                        placeholder="CS, IT, ME..."
                        value={regData.department}
                        onChange={e => setRegData({...regData, department: e.target.value})}
                        className="w-full px-10 py-6 rounded-4xl border-2 border-slate-100 focus:border-teal-500 outline-none bg-slate-50 font-black transition-all text-xl"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-[0.4em] text-slate-300 ml-2">BATCH YEAR</label>
                      <input 
                        required
                        placeholder="1st, 2nd, 3rd..."
                        value={regData.year}
                        onChange={e => setRegData({...regData, year: e.target.value})}
                        className="w-full px-10 py-6 rounded-4xl border-2 border-slate-100 focus:border-teal-500 outline-none bg-slate-50 font-black transition-all text-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-[0.4em] text-slate-300 ml-2">INSTITUTIONAL ROLL ID</label>
                    <input 
                      required
                      placeholder="Your unique ID..."
                      value={regData.roll}
                      onChange={e => setRegData({...regData, roll: e.target.value})}
                      className="w-full px-10 py-6 rounded-4xl border-2 border-slate-100 focus:border-teal-500 outline-none bg-slate-50 font-black transition-all text-xl"
                    />
                  </div>
                  <button 
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-8 rounded-4xl font-black text-3xl hover:bg-teal-600 transition-all shadow-3xl shadow-slate-900/20 flex items-center justify-center gap-6 hover:-translate-y-2"
                  >
                    {loading ? <Clock className="animate-spin" size={32} /> : <CheckCircle size={32} />}
                    SYNC REGISTRATION
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
