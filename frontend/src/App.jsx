import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import StudentsManagement from './pages/StudentsManagement';
import StudentForm from './pages/StudentForm';
import StudyHallManagement from './pages/StudyHallManagement';
import StudyHallForm from './pages/StudyHallForm';
import Reports from './pages/Reports';
import UpcomingFees from './pages/UpcomingFees';
import { NotificationProvider } from './components/NotificationContext';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <NotificationProvider>
      <Router>
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
          
          {/* Collapsible/Drawer Sidebar Component */}
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

          {/* Main Content Area Wrapper */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            
            {/* Navbar Component */}
            <Navbar toggleSidebar={toggleSidebar} />

            {/* Scrollable Main View Container */}
            <main className="flex-1 overflow-y-auto bg-gray-50 focus:outline-none">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                
                {/* Students Routes */}
                <Route path="/students" element={<StudentsManagement />} />
                <Route path="/students/new" element={<StudentForm />} />
                <Route path="/students/edit/:id" element={<StudentForm />} />

                {/* Study Hall Routes */}
                <Route path="/study-halls" element={<StudyHallManagement />} />
                <Route path="/study-halls/new" element={<StudyHallForm />} />
                <Route path="/study-halls/edit/:id" element={<StudyHallForm />} />

                {/* Reports & Upcoming Fees */}
                <Route path="/reports" element={<Reports />} />
                <Route path="/upcoming-fees" element={<UpcomingFees />} />

                {/* Wildcard redirect fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;
