import React from 'react';
import { Edit2, Trash2, ShieldCheck } from 'lucide-react';

const StudyHallTable = ({ studyHalls, studentCounts, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hall Name</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Capacity</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Occupancy Status</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-150">
          {studyHalls.map((hall) => {
            const count = studentCounts[hall.name] || 0;
            const occupancyPct = Math.min(Math.round((count / hall.capacity) * 100), 100);
            
            // Progress bar colors
            let progressColor = 'bg-emerald-500';
            if (occupancyPct >= 90) progressColor = 'bg-red-500';
            else if (occupancyPct >= 75) progressColor = 'bg-amber-500';

            return (
              <tr key={hall.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{hall.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{hall.capacity} seats</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div className="flex flex-col w-40 gap-1.5">
                    <div className="flex justify-between text-xs font-bold text-gray-500">
                      <span>{count} filled</span>
                      <span>{occupancyPct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${progressColor}`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{hall.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="h-3 w-3" /> Active
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1.5">
                  <button
                    onClick={() => onEdit(hall)}
                    title="Edit Hall"
                    className="inline-flex p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Edit2 className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={() => onDelete(hall.id)}
                    title="Delete Hall"
                    className="inline-flex p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StudyHallTable;
