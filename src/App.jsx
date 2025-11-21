import React, { useState, useEffect } from 'react';

export default function RaumPlanApp() {
  const [bookings, setBookings] = useState([
    {
      id: 1,
      roomName: "VIDI",
      location: "factory300",
      startDate: "14. Nov. 2025",
      startTime: "14:00",
      endDate: "14. Nov. 2025",
      endTime: "19:00",
      status: "confirmed"
    },
    {
      id: 2,
      roomName: "Startrampe - Nature Room",
      location: "Startrampe",
      startDate: "21. Nov. 2025",
      startTime: "14:00",
      endDate: "21. Nov. 2025",
      endTime: "19:00",
      status: "cancelled"
    },
    {
      id: 3,
      roomName: "the stage",
      location: "Strada del Startup",
      startDate: "21. Nov. 2025",
      startTime: "14:00",
      endDate: "21. Nov. 2025",
      endTime: "19:00",
      status: "confirmed"
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [formData, setFormData] = useState({
    roomName: '',
    location: '',
    startDate: '',
    startTime: '14:00',
    endDate: '',
    endTime: '19:00',
    status: 'confirmed'
  });

  // Calendar Helper Functions
  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // PWA Install Handler
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }

    setDeferredPrompt(null);
  };

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('raumplan-bookings');
    if (saved) {
      try {
        setBookings(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading bookings:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (bookings.length > 0) {
      localStorage.setItem('raumplan-bookings', JSON.stringify(bookings));
    }
  }, [bookings]);

  const openModal = (booking = null) => {
    if (booking) {
      setEditingId(booking.id);
      setFormData(booking);
    } else {
      setEditingId(null);
      setFormData({
        roomName: '',
        location: '',
        startDate: '',
        startTime: '14:00',
        endDate: '',
        endTime: '19:00',
        status: 'confirmed'
      });
    }
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    document.body.style.overflow = 'auto';
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      setBookings(bookings.map(b =>
        b.id === editingId ? { ...formData, id: editingId } : b
      ));
    } else {
      const newBooking = {
        ...formData,
        id: Date.now()
      };
      setBookings([...bookings, newBooking]);
    }

    closeModal();
  };

  const deleteBooking = (id) => {
    if (window.confirm('Möchten Sie diese Buchung wirklich löschen?')) {
      setBookings(bookings.filter(b => b.id !== id));
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 pb-24">
      {/* PWA Install Banner */}
      {showInstallPrompt && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-teal-500 to-green-500 text-white p-3 sm:p-4 shadow-lg z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
              <span className="text-xl sm:text-2xl">📱</span>
              <div className="flex-1">
                <div className="font-bold text-sm sm:text-base">App installieren</div>
                <div className="text-xs sm:text-sm opacity-90 hidden sm:block">RaumPlan direkt auf Ihrem Gerät nutzen</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="bg-white text-teal-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm hover:bg-teal-50 transition-colors whitespace-nowrap"
              >
                Installieren
              </button>
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="text-white px-2 sm:px-3 py-1.5 sm:py-2 text-lg sm:text-xl hover:bg-white/20 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-teal-500 via-teal-400 to-green-400 sticky top-0 z-40 shadow-xl">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-5 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="#14b8a6" strokeWidth="2"/>
                <path d="M3 9h18" stroke="#14b8a6" strokeWidth="2"/>
                <rect x="7" y="12" width="3" height="3" rx="0.5" fill="#14b8a6"/>
                <rect x="14" y="12" width="3" height="3" rx="0.5" fill="#14b8a6"/>
              </svg>
            </div>
            <div>
              <div className="text-white font-black text-xl sm:text-2xl md:text-3xl tracking-tight">
                RAUMPLAN
              </div>
              <div className="text-xs sm:text-sm text-teal-100 font-semibold">AcademySeZa Kids</div>
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-colors touch-manipulation">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-colors relative touch-manipulation">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">

        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5 bg-white rounded-2xl p-4 shadow-md border-l-4 border-teal-500">
          <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
            📅 Ihre bevorstehenden Buchungen
          </h2>
          <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg shadow-lg transition-all hover:scale-105 touch-manipulation whitespace-nowrap">
            Alle ({bookings.length})
          </button>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-xl border-4 border-teal-200">
            <div className="text-6xl sm:text-7xl mb-6 animate-bounce filter drop-shadow-2xl">📅</div>
            <h3 className="text-2xl sm:text-3xl font-black mb-3 bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
              Keine Buchungen
            </h3>
            <p className="text-base sm:text-lg text-gray-600 mb-8 font-medium">
              Erstellen Sie Ihre erste Raumbuchung!
            </p>
            <button
              onClick={() => openModal()}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl transition-all hover:scale-105 shadow-2xl hover:shadow-3xl touch-manipulation"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">➕</span>
                Neue Buchung
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-teal-100"
              >
                <div className="flex">
                  {/* Left Border - Gradient */}
                  <div className="w-2 sm:w-2.5 bg-gradient-to-b from-blue-500 via-teal-500 to-green-500 rounded-l-2xl"></div>

                  {/* Content */}
                  <div className="flex-1 p-4 sm:p-5">
                    {/* Header with Actions */}
                    <div className="flex items-start justify-between mb-3 sm:mb-4 gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent mb-2 truncate">
                          {booking.roomName}
                        </h3>
                        <span className="inline-block bg-gradient-to-r from-blue-100 to-teal-100 border-2 border-teal-300 text-teal-700 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm">
                          📍 {booking.location}
                        </span>
                      </div>

                      {/* Action Buttons - More Colorful */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => openModal(booking)}
                          className="p-2 sm:p-2.5 bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 touch-manipulation"
                          title="Bearbeiten"
                          aria-label="Bearbeiten"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteBooking(booking.id)}
                          className="p-2 sm:p-2.5 bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 touch-manipulation"
                          title="Löschen"
                          aria-label="Löschen"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Time Section - Colorful Background */}
                    <div className="bg-gradient-to-r from-blue-50 via-teal-50 to-green-50 border-2 border-teal-200 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 shadow-inner">
                      <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-sm sm:text-base">
                        <div className="flex-1 min-w-[120px]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">🟢</span>
                            <div className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase">Start</div>
                          </div>
                          <div className="font-black text-gray-900">{booking.startDate}</div>
                          <div className="text-lg sm:text-xl font-black text-blue-600">{booking.startTime}</div>
                        </div>

                        <div className="hidden sm:flex items-center justify-center">
                          <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>

                        <div className="flex-1 min-w-[120px]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">🔴</span>
                            <div className="text-[10px] sm:text-xs font-bold text-green-600 uppercase">Ende</div>
                          </div>
                          <div className="font-black text-gray-900">{booking.endDate}</div>
                          <div className="text-lg sm:text-xl font-black text-green-600">{booking.endTime}</div>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge - Gradient */}
                    <div className="flex justify-end">
                      {booking.status === 'confirmed' ? (
                        <span className="inline-flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Bestätigt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 bg-gradient-to-r from-red-400 to-rose-500 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Abgesagt
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button - Colorful Gradient */}
      <button
        onClick={() => openModal()}
        className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all active:scale-95 hover:scale-110 hover:rotate-90 flex items-center justify-center text-2xl sm:text-3xl font-black z-30 touch-manipulation border-4 border-white"
        aria-label="Neue Buchung hinzufügen"
      >
        +
      </button>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 max-w-lg w-full shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-5 sm:mb-6 pb-4 border-b-4 border-gradient-to-r from-teal-200 to-green-200">
              <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
                {editingId ? '✏️ Buchung bearbeiten' : '➕ Neue Buchung'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-red-400 hover:to-red-600 text-2xl sm:text-3xl leading-none w-10 h-10 flex items-center justify-center rounded-xl transition-all touch-manipulation shadow-lg"
                aria-label="Schließen"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Raumname
                </label>
                <input
                  type="text"
                  name="roomName"
                  value={formData.roomName}
                  onChange={handleInputChange}
                  required
                  placeholder="z.B. VIDI"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent touch-manipulation"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Standort
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="z.B. factory300"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent touch-manipulation"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Startdatum
                  </label>
                  <input
                    type="text"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    placeholder="14. Nov. 2025"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent touch-manipulation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Startzeit
                  </label>
                  <input
                    type="text"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    placeholder="14:00"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent touch-manipulation"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enddatum
                  </label>
                  <input
                    type="text"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    placeholder="14. Nov. 2025"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent touch-manipulation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Endzeit
                  </label>
                  <input
                    type="text"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                    placeholder="19:00"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent touch-manipulation"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent touch-manipulation"
                >
                  <option value="confirmed">Bestätigt</option>
                  <option value="cancelled">Abgesagt</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 via-green-500 to-emerald-500 hover:from-teal-600 hover:via-green-600 hover:to-emerald-600 active:scale-98 text-white font-black py-4 text-lg rounded-xl transition-all mt-6 touch-manipulation shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                {editingId ? '💾 Speichern' : '➕ Hinzufügen'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendar && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={() => setShowCalendar(false)}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                📅 Kalender
              </h2>
              <button
                onClick={() => setShowCalendar(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl sm:text-3xl leading-none w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                aria-label="Schließen"
              >
                ×
              </button>
            </div>

            {/* Month/Year Navigation */}
            <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-blue-50 to-teal-50 p-3 rounded-xl">
              <button
                onClick={previousMonth}
                className="p-2 bg-white hover:bg-blue-50 rounded-lg transition-colors touch-manipulation shadow-md"
                aria-label="Vorheriger Monat"
              >
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="text-center">
                <div className="text-lg sm:text-xl font-black text-gray-900">
                  {monthNames[currentDate.getMonth()]}
                </div>
                <div className="text-sm font-semibold text-gray-600">
                  {currentDate.getFullYear()}
                </div>
              </div>

              <button
                onClick={nextMonth}
                className="p-2 bg-white hover:bg-teal-50 rounded-lg transition-colors touch-manipulation shadow-md"
                aria-label="Nächster Monat"
              >
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs sm:text-sm font-bold text-teal-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map((day, index) => (
                <div
                  key={index}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg text-sm sm:text-base font-semibold
                    ${!day ? '' : 'hover:bg-blue-50 cursor-pointer transition-colors'}
                    ${isToday(day) ? 'bg-gradient-to-br from-blue-500 to-teal-500 text-white hover:from-blue-600 hover:to-teal-600 shadow-lg font-black scale-110' : 'text-gray-700 hover:scale-105'}
                  `}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Today Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setCurrentDate(new Date())}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 touch-manipulation"
              >
                🎯 Heute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation - Enhanced Colorful Icons */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t-2 border-teal-200 z-40 safe-area-inset-bottom shadow-2xl">
        <div className="max-w-6xl mx-auto flex justify-around items-center py-2 sm:py-3 px-2">
          {/* Home - Orange/Active */}
          <button className="flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-2 sm:py-2.5 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl shadow-xl active:scale-95 transition-all touch-manipulation min-w-[60px] sm:min-w-[70px] hover:scale-110">
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span className="text-[10px] sm:text-xs font-black">Home</span>
          </button>

          {/* Kalender - Blue */}
          <button
            onClick={() => setShowCalendar(true)}
            className="flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-2 sm:py-2.5 text-blue-600 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 rounded-2xl active:scale-95 transition-all touch-manipulation min-w-[60px] sm:min-w-[70px] hover:scale-105 hover:shadow-lg"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] sm:text-xs font-bold">Kalender</span>
          </button>

          {/* Shop - Green */}
          <button className="flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-2 sm:py-2.5 text-green-600 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 rounded-2xl active:scale-95 transition-all touch-manipulation min-w-[60px] sm:min-w-[70px] hover:scale-105 hover:shadow-lg">
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-[10px] sm:text-xs font-bold">Shop</span>
          </button>

          {/* Profil - Purple */}
          <button className="flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-2 sm:py-2.5 text-purple-600 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 rounded-2xl active:scale-95 transition-all touch-manipulation min-w-[60px] sm:min-w-[70px] hover:scale-105 hover:shadow-lg">
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] sm:text-xs font-bold">Profil</span>
          </button>

          {/* Mehr - Pink */}
          <button className="flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-2 sm:py-2.5 text-pink-600 hover:bg-gradient-to-br hover:from-pink-50 hover:to-pink-100 rounded-2xl active:scale-95 transition-all touch-manipulation min-w-[60px] sm:min-w-[70px] hover:scale-105 hover:shadow-lg">
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
            <span className="text-[10px] sm:text-xs font-bold">Mehr</span>
          </button>
        </div>
      </nav>

      {/* iOS Safe Area & Zoom Prevention */}
      <style jsx>{`
        @supports (padding: max(0px)) {
          .safe-area-inset-bottom {
            padding-bottom: max(env(safe-area-inset-bottom), 0.5rem);
          }
        }

        @media (max-width: 640px) {
          input, select, textarea {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
