import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const startRange = (currentPage - 1) * itemsPerPage + 1;
  const endRange = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      
      if (currentPage <= 3) {
        end = maxVisiblePages;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - maxVisiblePages + 1;
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm mt-4">
      {/* Range Status */}
      <div className="text-sm font-medium text-gray-500">
        Showing <span className="text-gray-800 font-bold">{startRange}</span> to{' '}
        <span className="text-gray-800 font-bold">{endRange}</span> of{' '}
        <span className="text-gray-800 font-bold">{totalItems}</span> results
      </div>

      {/* Page Selector Buttons */}
      <nav className="flex items-center gap-1.5 self-end sm:self-auto">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center justify-center p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`inline-flex items-center justify-center h-9 w-9 text-sm font-semibold rounded-xl transition-all ${
              currentPage === page
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center justify-center p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight className="h-4.5 w-4.5" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
