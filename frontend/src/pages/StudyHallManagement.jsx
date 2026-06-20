import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusSquare, Loader2, Building2 } from 'lucide-react';
import { StudyHallService, StudentService } from '../services/api';
import StudyHallTable from '../components/StudyHallTable';
import SearchBar from '../components/SearchBar';
import { useNotification } from '../components/NotificationContext';

const StudyHallManagement = () => {
  const [studyHalls, setStudyHalls] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch both study halls and students to compute active occupancy counts
      const [hallsData, studentsData] = await Promise.all([
        StudyHallService.getAll(),
        StudentService.getAll()
      ]);
      setStudyHalls(hallsData);
      setStudents(studentsData);
    } catch (err) {
      showNotification(err.message || 'Failed to load study hall data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteHall = async (id) => {
    const hallToDelete = studyHalls.find(h => h.id === id);
    if (!hallToDelete) return;

    // Frontend pre-check: verify if any active student is assigned to this hall name
    const assignedStudents = students.filter(
      st => st.hall === hallToDelete.name && !st.leftDate
    );

    if (assignedStudents.length > 0) {
      showNotification(
        `Cannot delete study hall "${hallToDelete.name}" because it has ${assignedStudents.length} active students assigned to it.`,
        'error'
      );
      return;
    }

    if (window.confirm(`Are you sure you want to delete the study hall "${hallToDelete.name}"?`)) {
      try {
        await StudyHallService.delete(id);
        showNotification('Study hall deleted successfully!');
        fetchData();
      } catch (err) {
        if (err.message.includes('Cannot delete study hall with students')) {
          showNotification('Cannot delete study hall with students assigned to it', 'error');
        } else {
          showNotification(err.message || 'Failed to delete study hall', 'error');
        }
      }
    }
  };

  // Compute active student count for each hall name
  const studentCounts = useMemo(() => {
    const counts = {};
    students.forEach((st) => {
      // Only count active students (who have not left)
      if (!st.leftDate) {
        counts[st.hall] = (counts[st.hall] || 0) + 1;
      }
    });
    return counts;
  }, [students]);

  // Filter halls based on search query
  const filteredHalls = useMemo(() => {
    return studyHalls.filter((hall) => {
      const q = searchQuery.toLowerCase();
      return (
        (hall.name || '').toLowerCase().includes(q) ||
        (hall.location || '').toLowerCase().includes(q) ||
        (hall.description || '').toLowerCase().includes(q)
      );
    });
  }, [studyHalls, searchQuery]);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Study Halls</h2>
          <p className="text-sm font-medium text-gray-500 font-sans">Manage physical study locations and seat allocations</p>
        </div>
        <button
          onClick={() => navigate('/study-halls/new')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/10 active:scale-95 transition-all"
        >
          <PlusSquare className="h-4.5 w-4.5" />
          <span>Add New Hall</span>
        </button>
      </div>

      {/* Search Filter */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search study halls by name, location, or details..."
      />

      {/* Data content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filteredHalls.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-gray-100 rounded-2xl text-center space-y-3">
          <div className="p-4 bg-gray-50 rounded-full">
            <Building2 className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-base font-bold text-gray-800">No Study Halls Found</h4>
          <p className="text-sm font-medium text-gray-400">
            {searchQuery ? 'Adjust your search queries' : 'Start by adding your first study hall'}
          </p>
        </div>
      ) : (
        <StudyHallTable
          studyHalls={filteredHalls}
          studentCounts={studentCounts}
          onEdit={(hall) => navigate(`/study-halls/edit/${hall.id}`)}
          onDelete={handleDeleteHall}
        />
      )}
    </div>
  );
};

export default StudyHallManagement;
