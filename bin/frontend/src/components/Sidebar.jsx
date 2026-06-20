import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Building2, 
  BarChart3, 
  CalendarDays, 
  UserPlus, 
  PlusSquare,
  GraduationCap,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Study Halls', path: '/study-halls', icon: Building2 },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Upcoming Fees', path: '/upcoming-fees', icon: CalendarDays },
    { name: 'Add Student', path: '/students/new', icon: UserPlus },
    { name: 'Add Hall', path: '/study-halls/new', icon: PlusSquare },
  ];

  const activeClassName = "flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 transition-all duration-200";
  const inactiveClassName = "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200";

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-0 -left-64 lg:left-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <GraduationCap className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">Study Hall Mgr</span>
          </div>
          {/* Close button on mobile */}
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  isActive ? activeClassName : inactiveClassName
                }
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                end={item.path === '/'}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-100 text-center">
          <p className="text-xs font-medium text-gray-400">© 2026 Study Hall System</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
