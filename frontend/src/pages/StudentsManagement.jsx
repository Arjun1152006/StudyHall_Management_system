import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Loader2, Calendar } from 'lucide-react';
import { StudentService } from '../services/api';
import SearchBar from '../components/SearchBar';
import StudentTable from '../components/StudentTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { useNotification } from '../components/NotificationContext';

const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [leftStudent, setLeftStudent] = useState(null);
  const [leftDate, setLeftDate] = useState(new Date().toISOString().split('T')[0]);
  const [reactivateStudent, setReactivateStudent] = useState(null);

  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await StudentService.getAll();
      setStudents(data);
    } catch (err) {
      showNotification(err.message || 'Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await StudentService.delete(id);
        showNotification('Student deleted successfully!');
        fetchStudents();
      } catch (err) {
        showNotification(err.message || 'Failed to delete student', 'error');
      }
    }
  };

  const handleMarkLeft = async () => {
    if (!leftStudent) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      
      if (leftDate === todayStr || !leftDate) {
        // If today, use quick API endpoint
        await StudentService.markLeft(leftStudent.id);
      } else {
        // If custom date, use full student update endpoint to save the correct date
        const updated = {
          ...leftStudent,
          leftDate: leftDate,
          status: 'Left'
        };
        await StudentService.update(leftStudent.id, updated);
      }
      
      showNotification('Student marked as left successfully');
      setLeftStudent(null);
      fetchStudents();
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
      fetchStudents();
    } catch (err) {
      showNotification(err.message || 'Failed to reactivate student', 'error');
    }
  };

  // 1. Filter students
  const filteredStudents = useMemo(() => {
    setCurrentPage(1); // Reset page on filter change
    return students.filter((st) => {
      const q = searchQuery.toLowerCase();
      return (
        (st.name || '').toLowerCase().includes(q) ||
        (st.cabin || '').toLowerCase().includes(q) ||
        (st.hall || '').toLowerCase().includes(q) ||
        (st.phone || '').includes(q)
      );
    });
  }, [students, searchQuery]);

  // 2. Sort students
  const sortedStudents = useMemo(() => {
    const sorted = [...filteredStudents];
    sorted.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      // Handle specific fields
      if (sortBy === 'feepaid') {
        valA = a.feePaid ?? 0;
        valB = b.feePaid ?? 0;
      } else if (sortBy === 'feedue') {
        valA = a.feeDue ?? 0;
        valB = b.feeDue ?? 0;
      } else if (sortBy === 'joindate') {
        valA = new Date(a.joinDate || 0);
        valB = new Date(b.joinDate || 0);
      } else if (sortBy === 'status') {
        // Compute active status
        const statusA = a.leftDate ? 'Left' : (a.feeDue <= 0 ? 'Paid' : 'Pending');
        const statusB = b.leftDate ? 'Left' : (b.feeDue <= 0 ? 'Paid' : 'Pending');
        valA = statusA;
        valB = statusB;
      } else {
        // String fallback
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredStudents, sortBy, sortOrder]);

  // 3. Paginate students
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedStudents, currentPage]);

  const handleHeaderSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortOptions = [
    { value: 'name', label: 'Sort by Name' },
    { value: 'cabin', label: 'Sort by Cabin' },
    { value: 'hall', label: 'Sort by Study Hall' },
    { value: 'feepaid', label: 'Sort by Fee Paid' },
    { value: 'feedue', label: 'Sort by Fee Due' },
    { value: 'status', label: 'Sort by Status' },
    { value: 'joindate', label: 'Sort by Join Date' },
  ];

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Students</h2>
          <p className="text-sm font-medium text-gray-500">Manage, sort, filter, and track student records</p>
        </div>
        <button
          onClick={() => navigate('/students/new')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/10 active:scale-95 transition-all"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Search & Sort Controls */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search students by name, cabin, hall, or phone..."
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
        sortOptions={sortOptions}
      />

      {/* Table & Pagination */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : sortedStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-gray-100 rounded-2xl text-center space-y-3">
          <div className="p-4 bg-gray-50 rounded-full">
            <UserPlus className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-base font-bold text-gray-800">No Students Found</h4>
          <p className="text-sm font-medium text-gray-400">
            {searchQuery ? 'Adjust your search parameters' : 'Start by adding your first student'}
          </p>
        </div>
      ) : (
        <>
          <StudentTable
            students={paginatedStudents}
            onEdit={(student) => navigate(`/students/edit/${student.id}`)}
            onDelete={handleDelete}
            onMarkLeft={(student) => {
              setLeftStudent(student);
              setLeftDate(new Date().toISOString().split('T')[0]);
            }}
            onReactivate={(student) => setReactivateStudent(student)}
            sortField={sortBy}
            sortOrder={sortOrder}
            onSort={handleHeaderSort}
          />
          <Pagination
            currentPage={currentPage}
            totalItems={sortedStudents.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
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
            <div className="relative">
              <input
                type="date"
                value={leftDate}
                onChange={(e) => setLeftDate(e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
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
        <p className="text-xs font-medium text-gray-400 mt-2">
          This will reset their Left Date and status, reactivating their subscription record.
        </p>
      </Modal>
    </div>
  );
};

export default StudentsManagement;
