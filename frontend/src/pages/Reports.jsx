import React, { useState, useEffect } from 'react';
import { Download, Loader2, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import { DashboardService, ReportService } from '../services/api';
import { useNotification } from '../components/NotificationContext';

const Reports = () => {
  const [stats, setStats] = useState({});
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showNotification } = useNotification();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [statsData, collectionData] = await Promise.all([
        DashboardService.getStats(),
        ReportService.getFeeCollection()
      ]);
      setStats(statsData);
      setReportData(collectionData);
    } catch (err) {
      showNotification(err.message || 'Failed to load report data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const calculateCollectionRate = (collected, pending) => {
    const total = collected + pending;
    if (total === 0) return '0.0%';
    return `${((collected / total) * 100).toFixed(1)}%`;
  };

  const handleExportCSV = () => {
    try {
      if (reportData.length === 0) {
        showNotification('No data available to export', 'error');
        return;
      }

      let csv = 'Study Hall,Total Students,Fees Collected (₹),Fees Pending (₹),Collection Rate\n';
      
      reportData.forEach((row) => {
        const rate = calculateCollectionRate(row.feesCollected, row.feesPending);
        csv += `"${row.hall || 'N/A'}",${row.totalStudents || 0},${row.feesCollected || 0},${row.feesPending || 0},"${rate}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `fee_collection_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification('Report exported successfully to CSV');
    } catch (err) {
      showNotification('Failed to export CSV: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h2>
          <p className="text-sm font-medium text-gray-500">Analyze collections and check efficiency statistics</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={loading || reportData.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/10 active:scale-95 transition-all disabled:opacity-50"
        >
          <Download className="h-4.5 w-4.5" />
          <span>Export Report</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <>
          {/* Stats Cards Section */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Students */}
            <div className="p-5 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Students</span>
                <h4 className="text-2xl font-bold text-gray-900">{stats.totalStudents ?? 0}</h4>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            {/* Total Halls */}
            <div className="p-5 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Study Halls</span>
                <h4 className="text-2xl font-bold text-gray-900">{stats.totalHalls ?? 0}</h4>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>

            {/* Total Fees Collected */}
            <div className="p-5 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fees Collected</span>
                <h4 className="text-2xl font-bold text-emerald-600">₹ {(stats.totalFees ?? 0).toLocaleString('en-IN')}</h4>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-650 rounded-xl">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            {/* Pending Fees */}
            <div className="p-5 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Fees</span>
                <h4 className="text-2xl font-bold text-amber-600">₹ {(stats.pendingFees ?? 0).toLocaleString('en-IN')}</h4>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 tracking-tight">Fee Collection Status by Hall</h3>
            
            {reportData.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white border border-gray-100 rounded-2xl text-center space-y-2">
                <BarChart3 className="h-8 w-8 text-gray-300" />
                <h4 className="text-base font-bold text-gray-700">No Data Available</h4>
                <p className="text-sm font-medium text-gray-400">Add students and assign halls to populate records</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Study Hall</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Students</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fees Collected</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fees Pending</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Collection Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-150">
                    {reportData.map((row, index) => {
                      const rateStr = calculateCollectionRate(row.feesCollected, row.feesPending);
                      const rateVal = parseFloat(rateStr);
                      
                      let badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-100';
                      if (rateVal < 50) badgeColor = 'bg-red-50 text-red-800 border-red-100';
                      else if (rateVal < 80) badgeColor = 'bg-amber-50 text-amber-800 border-amber-100';

                      return (
                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{row.hall || 'Unassigned'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-650 font-medium">{row.totalStudents} students</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-bold">₹ {row.feesCollected.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600 font-bold">₹ {row.feesPending.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}>
                              {rateStr}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
