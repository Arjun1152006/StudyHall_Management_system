import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { StudyHallService } from '../services/api';
import { useNotification } from '../components/NotificationContext';

const StudyHallForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    location: '',
    description: ''
  });

  // Load study hall details for editing
  const loadStudyHall = async () => {
    try {
      setLoading(true);
      const hall = await StudyHallService.getById(id);
      if (hall) {
        setFormData({
          name: hall.name || '',
          capacity: hall.capacity || '',
          location: hall.location || '',
          description: hall.description || ''
        });
      }
    } catch (err) {
      showNotification(err.message || 'Failed to load study hall details', 'error');
      navigate('/study-halls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      loadStudyHall();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || '' : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditMode) {
        await StudyHallService.update(id, formData);
        showNotification('Study hall updated successfully!');
      } else {
        await StudyHallService.create(formData);
        showNotification('Study hall added successfully!');
      }
      navigate('/study-halls');
    } catch (err) {
      showNotification(err.message || 'Failed to save study hall', 'error');
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
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isEditMode ? 'Edit Study Hall' : 'Add Study Hall'}
          </h2>
          <p className="text-sm font-medium text-gray-500">
            {isEditMode ? 'Modify details of an existing study hall' : 'Set up a new study hall location and limit'}
          </p>
        </div>
        <button
          onClick={() => navigate('/study-halls')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="space-y-4">
          {/* Hall Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Hall Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Hall Alpha"
              className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Capacity */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Capacity (Seats)</label>
              <input
                type="number"
                name="capacity"
                required
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="e.g. 50"
                className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50 focus:bg-white font-semibold text-gray-700"
              />
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Location (Floor/Building)</label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. 1st Floor, Building A"
                className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50 focus:bg-white"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Description</label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Air-conditioned hall with individual plug points and silent cubicles"
              className="block w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50 focus:bg-white"
            />
          </div>
        </div>

        {/* Form Action Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5 mt-4">
          <button
            type="button"
            onClick={() => navigate('/study-halls')}
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
            <span>Save Hall</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudyHallForm;
