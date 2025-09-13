import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Reports = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: ''
  });
  const navigate = useNavigate();

  const handleDownload = async (reportType) => {
    setLoading({ ...loading, [reportType]: true });
    
    try {
      let url = `/api/reports/${reportType}`;
      let params = new URLSearchParams();
      
      if (reportType === 'work-order-summary') {
        if (filters.status) params.append('status', filters.status);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        url += `?${params}`;
      }

      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (error) {
      alert('Error generating report: ' + (error.response?.data?.message || error.message));
    }
    
    setLoading({ ...loading, [reportType]: false });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-blue-600 hover:text-blue-500"
              >
                ← Dashboard
              </button>
              <h1 className="text-xl font-semibold">Reports</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.name}</span>
              <button onClick={logout} className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Generate Reports</h2>
          <p className="mt-2 text-gray-600">Download PDF reports for equipment maintenance tracking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Equipment Status Report */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Equipment Status Report</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Complete overview of all equipment with their current status, maintenance dates, and details.
                </p>
              </div>
              <div className="ml-4">
                <button
                  onClick={() => handleDownload('equipment-status')}
                  disabled={loading['equipment-status']}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading['equipment-status'] ? 'Generating...' : 'Download PDF'}
                </button>
              </div>
            </div>
          </div>

          {/* Work Order Summary Report */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Work Order Summary</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Summary of work orders with filtering options by status and date range.
                </p>
                
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status Filter</label>
                    <select
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="date"
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <button
                  onClick={() => handleDownload('work-order-summary')}
                  disabled={loading['work-order-summary']}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading['work-order-summary'] ? 'Generating...' : 'Download PDF'}
                </button>
              </div>
            </div>
          </div>

          {/* Technician Workload Report */}
          <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Technician Workload Report</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Overview of active work orders assigned to each technician, showing current workload distribution.
                </p>
              </div>
              <div className="ml-4">
                <button
                  onClick={() => handleDownload('technician-workload')}
                  disabled={loading['technician-workload']}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading['technician-workload'] ? 'Generating...' : 'Download PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Report Features */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">PDF Format</h4>
              <p className="text-sm text-gray-600">Professional PDF reports with company branding</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Filtering Options</h4>
              <p className="text-sm text-gray-600">Filter data by status, date range, and technician</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Real-time Data</h4>
              <p className="text-sm text-gray-600">Reports generated with current system data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;