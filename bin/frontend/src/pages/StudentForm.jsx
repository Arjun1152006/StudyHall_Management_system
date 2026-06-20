import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { StudentService, StudyHallService } from '../services/api';
import { useNotification } from '../components/NotificationContext';

const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const isEditMode = !!id;

  const [studyHalls, setStudyHalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    cabin: '',
    hall: '',
    phone: '',
    joinDate: new Date().toISOString().split('T')[0],
    leftDate: '',
    monthlyFee: 2000,
    feePaid: 0,
    feeDue: 0,
    status: 'Pending'
  });

  // Load study halls for drop-down selection
  const loadStudyHalls = async () => {
    try {
      const data = await StudyHallService.getAll();
      setStudyHalls(data);
    } catch (err) {
      showNotification(err.message || 'Failed to load study halls', 'error');
    }
  };

  // Load student details for editing
  const loadStudent = async () => {
    try {
      setLoading(true);
      const student = await StudentService.getById(id);
      if (student) {
        setFormData({
          name: student.name || '',
          cabin: student.cabin || '',
          hall: student.hall || '',
          phone: student.phone || '',
          joinDate: student.joinDate || '',
          leftDate: student.leftDate || '',
          monthlyFee: student.monthlyFee ?? 2000,
          feePaid: student.feePaid ?? 0,
          feeDue: student.feeDue ?? 0,
          status: student.status || 'Pending'
        });
      }
    } catch (err) {
      showNotification(err.message || 'Failed to load student details', 'error');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudyHalls();
    if (isEditMode) {
      loadStudent();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'monthlyFee' || name === 'feePaid' || name === 'feeDue'
        ? parseInt(value) || 0
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Clean up leftDate if empty string
      const submissionData = {
        ...formData,
        leftDate: formData.leftDate || null
      };

      if (isEditMode) {
        await StudentService.update(id, submissionData);
        showNotification('Student updated successfully!');
      } else {
        await StudentService.create(submissionData);
        showNotification('Student added successfully!');
      }
      navigate('/students');
    } catch (err) {
      showNotification(err.message || 'Failed to save student', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Form Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isEditMode ? 'Edit Student Details' : 'Add New Student'}
          </h2>
          <p className="text-sm font-medium text-gray-500">
            {isEditMode ? 'Modify properties of an existing student' : 'Create a new student enrollment record'}
          </p>
        </div>
        <button
          onClick={() => navigate('/students')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50 focus:bg-white"
            />
          </div>

          {/* Cabin Number */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Cabin Number</label>
            <input
              type="text"
              name="cabin"
              required
              value={formData.cabin}
              onChange={handleChange}
              placeholder="e.g. C-12"
              className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50 focus:bg-white"
            />
          </div>

          {/* Study Hall Dropdown */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Study Hall</label>
            <select
              name="hall"
              required
              value={formData.hall}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50 focus:bg-white font-medium text-gray-700"
            >
              <option value="">Select Study Hall</option>
              {studyHalls.map((hall) => (
                <option key={hall.id} value={hall.name}>
                  {hall.name}
                </option>
              ))}
            </select>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Phone Number</label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50 focus:bg-white"
            />
          </div>

          {/* Join Date */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Join Date</label>
            <input
              type="date"
              name="joinDate"
              required
              value={formData.joinDate}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50 focus:bg-white"
            />
          </div>

          {/* Monthly Fee */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Monthly Fee (₹)</label>
            <input
              type="number"
              name="monthlyFee"
              required
              value={formData.monthlyFee}
              onChange={handleChange}
              placeholder="2000"
              className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50 focus:bg-white font-semibold"
            />
          </div>

          {/* Fee Paid */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Fee Paid (₹)</label>
            <input
              type="number"
              name="feePaid"
              required
              value={formData.feePaid}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50 focus:bg-white font-semibold text-emerald-600"
            />
          </div>

          {/* Fee Due */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Fee Due (₹)</label>
            <input
              type="number"
              name="feeDue"
              required
              value={formData.feeDue}
              onChange={handleChange}
              className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50 focus:bg-white font-semibold text-amber-600"
            />
          </div>

          {/* Left Date (Only visible or editable in edit mode) */}
          {isEditMode && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Left Date (if applicable)</label>
              <input
                type="date"
                name="leftDate"
                value={formData.leftDate}
                onChange={handleChange}
                className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50 focus:bg-white"
              />
            </div>
          )}
        </div>

        {/* Form Action Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5 mt-4">
          <button
            type="button"
            onClick={() => navigate('/students')}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-150 hover:bg-gray-200 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/10 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <Save className="h-4.5 w-4.5" />
            )}
            <span>Save Student</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
