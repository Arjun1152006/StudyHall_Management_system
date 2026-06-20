import React from 'react';
import { Edit2, Trash2, LogOut, UserPlus, ArrowUp, ArrowDown } from 'lucide-react';

const StudentTable = ({ 
  students, 
  onEdit, 
  onDelete, 
  onMarkLeft, 
  onReactivate, 
  sortField, 
  sortOrder, 
  onSort,
  isRecentMode = false 
}) => {
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  const getStatusBadge = (student) => {
    // Calculate status based on leftDate, feeDue
    const status = student.leftDate 
      ? 'Left' 
      : (student.feeDue <= 0 ? 'Paid' : 'Pending');

    switch (status) {
      case 'Left':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
            Left
          </span>
        );
      case 'Paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Paid
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse-subtle">
            Pending
          </span>
        );
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' 
      ? <ArrowUp className="inline h-4 w-4 ml-1 text-gray-700" />
      : <ArrowDown className="inline h-4 w-4 ml-1 text-gray-700" />;
  };

  const Th = ({ field, children }) => {
    if (isRecentMode || !onSort) {
      return <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{children}</th>;
    }
    return (
      <th 
        className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 select-none group"
        onClick={() => onSort(field)}
      >
        <span className="flex items-center">
          {children}
          {renderSortIcon(field) || <ArrowUp className="inline h-4 w-4 ml-1 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </span>
      </th>
    );
  };

  return (
    <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <Th field="name">Name</Th>
            <Th field="cabin">Cabin</Th>
            <Th field="hall">Study Hall</Th>
            {!isRecentMode && <Th field="phone">Phone</Th>}
            <Th field="joinDate">Join Date</Th>
            <Th field="monthlyFee">Monthly Fee</Th>
            {!isRecentMode && <Th field="feePaid">Fee Paid</Th>}
            {!isRecentMode && <Th field="feeDue">Fee Due</Th>}
            <Th field="status">Status</Th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-150">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{student.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.cabin}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-lg text-xs font-semibold">{student.hall}</span>
              </td>
              {!isRecentMode && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.phone}</td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(student.joinDate)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹ {student.monthlyFee || 0}</td>
              {!isRecentMode && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium">₹ {student.feePaid}</td>
              )}
              {!isRecentMode && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600 font-medium">₹ {student.feeDue}</td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(student)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1.5">
                <button
                  onClick={() => onEdit(student)}
                  title="Edit Student"
                  className="inline-flex p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Edit2 className="h-4.5 w-4.5" />
                </button>
                {!isRecentMode && onMarkLeft && onReactivate && (
                  !student.leftDate ? (
                    <button
                      onClick={() => onMarkLeft(student)}
                      title="Mark Left"
                      className="inline-flex p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      <LogOut className="h-4.5 w-4.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onReactivate(student)}
                      title="Reactivate"
                      className="inline-flex p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                    >
                      <UserPlus className="h-4.5 w-4.5" />
                    </button>
                  )
                )}
                <button
                  onClick={() => onDelete(student.id)}
                  title="Delete Student"
                  className="inline-flex p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
