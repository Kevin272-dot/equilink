import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

function AnalyticsDashboard() {
  const { t } = useTranslation();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [summaryStats, setSummaryStats] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch comprehensive analytics
      const [statsResponse, summaryResponse, trendsResponse] = await Promise.all([
        axios.get('/reports/analytics/stats'),
        axios.get('/reports/analytics/summary'),
        axios.get(`/reports/analytics/trends?days=${selectedPeriod}`)
      ]);
      
      setAnalyticsData(statsResponse.data);
      setSummaryStats(summaryResponse.data);
      setTrendsData(trendsResponse.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-2 text-gray-600">Advanced statistics and insights from incident reports</p>
          </div>
        </header>
        <main className="py-8">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          </div>
        </header>
        <main className="py-8">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong className="font-bold">Error: </strong>
              <span>{error}</span>
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">Advanced statistics and insights from incident reports using pandas, matplotlib, and numpy</p>
        </div>
      </header>
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Summary Statistics Cards */}
          {summaryStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-chart-bar text-blue-600 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Reports</dt>
                        <dd className="text-lg font-medium text-gray-900">{summaryStats.total_reports}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-tags text-green-600 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Categories</dt>
                        <dd className="text-lg font-medium text-gray-900">{summaryStats.unique_categories}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-clock text-yellow-600 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                        <dd className="text-lg font-medium text-gray-900">{summaryStats.pending_reports}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-check-circle text-purple-600 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Finalized</dt>
                        <dd className="text-lg font-medium text-gray-900">{summaryStats.finalized_reports}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Period Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Analysis Period</label>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>

          {/* Category Statistics */}
          {analyticsData && analyticsData.category_stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Category Distribution Chart */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  <i className="fas fa-chart-pie mr-2"></i>
                  Report Categories Distribution
                </h3>
                {analyticsData.category_chart ? (
                  <img 
                    src={`data:image/png;base64,${analyticsData.category_chart}`} 
                    alt="Category Distribution Chart"
                    className="w-full h-auto rounded"
                  />
                ) : (
                  <p className="text-gray-500 text-center py-8">No data available for chart</p>
                )}
              </div>
              
              {/* Category Statistics Table */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  <i className="fas fa-table mr-2"></i>
                  Category Statistics
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(analyticsData.category_stats.category_counts || {}).map(([category, count]) => (
                        <tr key={category}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {t(category) || category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{count}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {analyticsData.category_stats.category_percentages[category]}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Trends Charts */}
          {trendsData && (
            <div className="grid grid-cols-1 gap-8">
              {/* Daily Trends */}
              {trendsData.trends_chart && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    <i className="fas fa-chart-line mr-2"></i>
                    Daily Report Trends (Last {selectedPeriod} days)
                  </h3>
                  <img 
                    src={`data:image/png;base64,${trendsData.trends_chart}`} 
                    alt="Daily Trends Chart"
                    className="w-full h-auto rounded"
                  />
                </div>
              )}
              
              {/* Category Trends */}
              {trendsData.category_trends_chart && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    <i className="fas fa-chart-area mr-2"></i>
                    Category Trends by Day (Last {selectedPeriod} days)
                  </h3>
                  <img 
                    src={`data:image/png;base64,${trendsData.category_trends_chart}`} 
                    alt="Category Trends Chart"
                    className="w-full h-auto rounded"
                  />
                </div>
              )}
            </div>
          )}

          {/* Most Common Category */}
          {analyticsData && analyticsData.category_stats && analyticsData.category_stats.most_common_category && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                <i className="fas fa-info-circle mr-2"></i>
                Key Insights
              </h3>
              <p className="text-blue-800">
                The most frequently reported incident type is <strong>{t(analyticsData.category_stats.most_common_category) || analyticsData.category_stats.most_common_category}</strong> with{' '}
                <strong>{analyticsData.category_stats.category_counts[analyticsData.category_stats.most_common_category]}</strong> reports{' '}
                ({analyticsData.category_stats.category_percentages[analyticsData.category_stats.most_common_category]}% of all reports).
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AnalyticsDashboard;
