import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function Dashboard() {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/reports');
        setReports(response.data || []);
        calculateStats(response.data || []);
      } catch (error) {
        console.error("Error fetching reports:", error);
        setError(t('failedToLoadReports'));
        // Provide mock data for demo purposes when API is not available
        const mockData = [
          { type: 'harassment', status: 'pending' },
          { type: 'discrimination', status: 'approved' },
          { type: 'safety', status: 'pending' },
          { type: 'harassment', status: 'rejected' },
          { type: 'other', status: 'approved' }
        ];
        setReports(mockData);
        calculateStats(mockData);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [t]);

  const calculateStats = (data) => {
    const total = data.length;
    const pending = data.filter(r => r.status === 'pending').length;
    const approved = data.filter(r => r.status === 'approved').length;
    const rejected = data.filter(r => r.status === 'rejected').length;
    setStats({ total, pending, approved, rejected });
  };

  const reportsByType = reports.reduce((acc, report) => {
    const type = report.type || 'Uncategorized';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const barChartData = Object.keys(reportsByType).map(type => ({
    name: type,
    count: reportsByType[type],
  }));

  const pieChartData = [
    { name: t('pendingReports'), value: stats.pending },
    { name: t('approvedReports'), value: stats.approved },
    { name: t('rejectedReports'), value: stats.rejected },
  ].filter(item => item.value > 0);

  const COLORS = ['#FBBF24', '#34D399', '#F87171'];

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('dashboardTitle')}</h1>
          </div>
        </header>
        <main className="py-8">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-64" role="status" aria-live="polite">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600" aria-hidden="true"></div>
              <span className="sr-only">{t('loadingDashboard')}</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900" id="dashboard-title">{t('dashboardTitle')}</h1>
        </div>
      </header>
      <main className="py-8" role="main" aria-labelledby="dashboard-title">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded" role="alert" aria-live="polite">
              <strong className="font-bold">{t('error')}: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {/* Stats Cards */}
          <section aria-labelledby="stats-heading" className="mb-8">
            <h2 id="stats-heading" className="sr-only">{t('reportStatistics')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg" role="region" aria-labelledby="total-reports-label">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-file-alt text-2xl text-gray-400" aria-hidden="true"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt id="total-reports-label" className="text-sm font-medium text-gray-500 truncate">{t('totalReports')}</dt>
                        <dd className="text-3xl font-semibold text-gray-900" aria-describedby="total-reports-label">{stats.total}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg" role="region" aria-labelledby="pending-reports-label">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-clock text-2xl text-yellow-400" aria-hidden="true"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt id="pending-reports-label" className="text-sm font-medium text-gray-500 truncate">{t('pendingReports')}</dt>
                        <dd className="text-3xl font-semibold text-gray-900" aria-describedby="pending-reports-label">{stats.pending}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg" role="region" aria-labelledby="approved-reports-label">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-check-circle text-2xl text-green-400" aria-hidden="true"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt id="approved-reports-label" className="text-sm font-medium text-gray-500 truncate">{t('approvedReports')}</dt>
                        <dd className="text-3xl font-semibold text-gray-900" aria-describedby="approved-reports-label">{stats.approved}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg" role="region" aria-labelledby="rejected-reports-label">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-times-circle text-2xl text-red-400" aria-hidden="true"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt id="rejected-reports-label" className="text-sm font-medium text-gray-500 truncate">{t('rejectedReports')}</dt>
                        <dd className="text-3xl font-semibold text-gray-900" aria-describedby="rejected-reports-label">{stats.rejected}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Charts */}
          <section aria-labelledby="charts-heading">
            <h2 id="charts-heading" className="sr-only">{t('reportCharts')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md" role="region" aria-labelledby="bar-chart-title">
                <h3 id="bar-chart-title" className="text-xl font-semibold text-gray-700 mb-4">{t('reportsByType')}</h3>
                {barChartData.length > 0 ? (
                  <div role="img" aria-labelledby="bar-chart-title" aria-describedby="bar-chart-desc">
                    <p id="bar-chart-desc" className="sr-only">
                      {t('barChartDescription', { count: barChartData.length })}
                    </p>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#4F46E5" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">{t('noDataAvailable')}</p>
                )}
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md" role="region" aria-labelledby="pie-chart-title">
                <h3 id="pie-chart-title" className="text-xl font-semibold text-gray-700 mb-4">{t('reportStatus')}</h3>
                {pieChartData.length > 0 ? (
                  <div role="img" aria-labelledby="pie-chart-title" aria-describedby="pie-chart-desc">
                    <p id="pie-chart-desc" className="sr-only">
                      {t('pieChartDescription', { 
                        pending: stats.pending, 
                        approved: stats.approved, 
                        rejected: stats.rejected 
                      })}
                    </p>
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">{t('noDataAvailable')}</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
