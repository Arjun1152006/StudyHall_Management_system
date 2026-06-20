import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, ListFilter, UserPlus, Loader2, ArrowRight } from 'lucide-react';
import { DashboardService, StudentService, FeeService } from '../services/api';
import DashboardCards from '../components/DashboardCards';
import StudentTable from '../components/StudentTable';
import { useNotification } from '../components/NotificationContext';
import Modal from '../components/Modal';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [recentStudents, setRecentStudents] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [calculatingFees, setCalculatingFees] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoadingStats(true);
      const data = await DashboardService.getStats();
      setStats(data);
    } catch (err) {
      showNotification(err.message || 'Failed to load dashboard metrics', 'error');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRecentStudents = async () => {
    try {
      setLoadingRecent(true);
      const data = await StudentService.getRecent();
      setRecentStudents(data);
    } catch (err) {
      showNotification(err.message || 'Failed to load recent students', 'error');
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchRecentStudents();
  }, []);

  const handleCalculateFees = async () => {
    try {
      setCalculatingFees(true);
      setShowConfirmModal(false);
      const result = await FeeService.calculateMonthly();
      showNotification(result.message || 'Monthly fees calculated successfully!');
      // Reload stats and recent tables
      await Promise.all([fetchDashboardData(), fetchRecentStudents()]);
    } catch (err) {
      showNotification(err.message || 'Failed to calculate monthly fees', 'error');
    } finally {
      setCalculatingFees(false);
    }
  };

  const handleDeleteRecentStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await StudentService.delete(id);
        showNotification('Student deleted successfully!');
        // Refresh tables
        await Promise.all([fetchDashboardData(), fetchRecentStudents()]);
      } catch (err) {
        showNotification(err.message || 'Failed to delete student', 'error');
      }
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h2>
          <p className="text-sm font-medium text-gray-500">Welcome to Study Hall Management System</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={calculatingFees}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/10 active:scale-95 transition-all disabled:opacity-50"
          >
            {calculatingFees ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <Calculator className="h-4.5 w-4.5" />
            )}
            <span>Calculate Fees</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      {loadingStats ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <DashboardCards stats={stats} />
      )}

      {/* Recent Students Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 tracking-tight">Recent Students</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/students')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {loadingRecent ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : recentStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-150 rounded-2xl text-center space-y-3">
            <div className="p-4 bg-gray-50 rounded-full">
              <UserPlus className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-base font-bold text-gray-800">No Students Added Yet</h4>
            <p className="text-sm font-medium text-gray-400">Add your first student to see them here</p>
            <button
              onClick={() => navigate('/students/new')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-750 rounded-xl"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Student</span>
            </button>
          </div>
        ) : (
          <StudentTable
            students={recentStudents}
            onEdit={(student) => navigate(`/students/edit/${student.id}`)}
            onDelete={handleDeleteRecentStudent}
            isRecentMode={true}
          />
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Calculate Monthly Fees"
        footerActions={
          <>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleCalculateFees}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all"
            >
              Calculate
            </button>
          </>
        }
      >
        <p className="font-semibold text-gray-700">
          Are you sure you want to calculate monthly fees for all active students?
        </p>
        <p className="text-xs font-medium text-gray-400 mt-2">
          This operation will add the monthly fee amount to the current "Fee Due" field of all students who have not left the study hall.
        </p>
      </Modal>
    </div>
  );
};

export default Dashboard;
