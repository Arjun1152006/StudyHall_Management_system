import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Loader2, Edit2, LogOut, UserPlus } from 'lucide-react';
import { FeeService, StudentService } from '../services/api';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import { useNotification } from '../components/NotificationContext';

const UpcomingFees = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states for actions
  const [leftStudent, setLeftStudent] = useState(null);
  const [leftDate, setLeftDate] = useState(new Date().toISOString().split('T')[0]);
  const [reactivateStudent, setReactivateStudent] = useState(null);

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const fetchUpcomingFees = async () => {
    try {
      setLoading(true);
      // Calls upcoming fees endpoint (which gets all students)
      const data = await FeeService.getUpcoming();
      setStudents(data);
    } catch (err) {
      showNotification(err.message || 'Failed to load upcoming fees list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingFees();
  }, []);

  const handleMarkLeft = async () => {
    if (!leftStudent) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      if (leftDate === todayStr || !leftDate) {
        await StudentService.markLeft(leftStudent.id);
      } else {
        const updated = {
          ...leftStudent,
          leftDate: leftDate,
          status: 'Left'
        };
        await StudentService.update(leftStudent.id, updated);
      }
      showNotification('Student marked as left successfully');
      setLeftStudent(null);
      fetchUpcomingFees();
    } catch (err) {
      showNotification(err.message || 'Failed to mark student as left', 'error');
    }
  };

  const handleReactivate = async () => {
    if (!reactivateStudent) return;
    try {
      await StudentService.reactivate(reactivateStudent.id);
      showNotification('Student reactivated successfully');
      setReactivateStudent(null);
      fetchUpcomingFees();
    } catch (err) {
      showNotification(err.message || 'Failed to reactivate student', 'error');
    }
  };

  const calculateNextFeeDate = (joinDateStr) => {
    if (!joinDateStr) return 'N/A';
    try {
      const joinDate = new Date(joinDateStr);
      if (isNaN(joinDate.getTime())) return 'N/A';
      
      const today = new Date();
      // Set to same day of next month
      let nextDate = new Date(joinDate.getFullYear(), joinDate.getMonth() + 1, joinDate.getDate());
      
      // If calculated next date is in the past, increment until it is in the future
      while (nextDate < today) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      return nextDate.toLocaleDateString('en-IN');
    } catch (e) {
      return 'N/A';
    }
  };

  const getStatusBadge = (student) => {
    const isPaid = student.status === 'Paid' || student.feeDue <= 0;
    if (student.leftDate) {
      return (
        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-250">
          Left
        </span>
      );
    }
    return isPaid ? (
      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-250">
        Paid
      </span>
    ) : (
      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-250">
        Pending
      </span>
    );
  };

  // Filter students showing only active ones (not left) or pending fee ones
  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        (st.name || '').toLowerCase().includes(q) ||
        (st.hall || '').toLowerCase().includes(q);
      
      return matchesSearch;
    });
  }, [students, searchQuery]);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Upcoming Fees Due</h2>
          <p className="text-sm font-medium text-gray-500">Track deadlines, pending dues, and next payment cycles</p>
        </div>
      </div>

      {/* Filter search bar */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Filter by name or study hall..."
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-gray-100 rounded-2xl text-center space-y-2">
          <CalendarDays className="h-8 w-8 text-gray-300" />
          <h4 className="text-base font-bold text-gray-700">No Upcoming Fees</h4>
          <p className="text-sm font-medium text-gray-400">All student accounts are currently up to date</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Study Hall</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Monthly Fee</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Current Due</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Next Fee Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-150">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-55/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-650 font-medium">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-lg text-xs font-semibold">{student.hall}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹ {student.monthlyFee || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600 font-bold">₹ {student.feeDue || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {student.leftDate ? 'N/A' : calculateNextFeeDate(student.joinDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(student)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1.5">
                    <button
                      onClick={() => navigate(`/students/edit/${student.id}`)}
                      title="Edit Student"
                      className="inline-flex p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Edit2 className="h-4.5 w-4.5" />
                    </button>
                    {!student.leftDate ? (
                      <button
                        onClick={() => {
                          setLeftStudent(student);
                          setLeftDate(new Date().toISOString().split('T')[0]);
                        }}
                        title="Mark Left"
                        className="inline-flex p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <LogOut className="h-4.5 w-4.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setReactivateStudent(student)}
                        title="Reactivate"
                        className="inline-flex p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <UserPlus className="h-4.5 w-4.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Mark Left */}
      <Modal
        isOpen={!!leftStudent}
        onClose={() => setLeftStudent(null)}
        title="Mark Student as Left"
        footerActions={
          <>
            <button
              onClick={() => setLeftStudent(null)}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleMarkLeft}
              className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-all"
            >
              Confirm Leave
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700 font-semibold">
            Are you sure you want to mark <span className="text-gray-900 font-bold">{leftStudent?.name}</span> as left?
          </p>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Left Date</label>
            <input
              type="date"
              value={leftDate}
              onChange={(e) => setLeftDate(e.target.value)}
              className="block w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Reactivate */}
      <Modal
        isOpen={!!reactivateStudent}
        onClose={() => setReactivateStudent(null)}
        title="Reactivate Student"
        footerActions={
          <>
            <button
              onClick={() => setReactivateStudent(null)}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleReactivate}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all"
            >
              Reactivate
            </button>
          </>
        }
      >
        <p className="text-gray-700 font-semibold">
          Are you sure you want to reactivate <span className="text-gray-900 font-bold">{reactivateStudent?.name}</span>?
        </p>
      </Modal>
    </div>
  );
};

export default UpcomingFees;
