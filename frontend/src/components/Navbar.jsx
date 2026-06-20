import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Wifi, WifiOff } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const location = useLocation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/students') return 'Student Management';
    if (path === '/students/new') return 'Add Student';
    if (path.startsWith('/students/edit/')) return 'Edit Student';
    if (path === '/study-halls') return 'Study Hall Management';
    if (path === '/study-halls/new') return 'Add Study Hall';
    if (path.startsWith('/study-halls/edit/')) return 'Edit Study Hall';
    if (path === '/reports') return 'Reports & Analytics';
    if (path === '/upcoming-fees') return 'Upcoming Fees';
    return 'Study Hall Manager';
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      {/* Left side: Hamburger (mobile) & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">{getPageTitle()}</h1>
      </div>

      {/* Right side: Offline Indicator / System Status */}
      <div className="flex items-center gap-4">
        {!isOnline ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100 animate-pulse">
            <WifiOff className="h-3.5 w-3.5" />
            <span>You are currently offline</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Wifi className="h-3.5 w-3.5" />
            <span>Connected</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
