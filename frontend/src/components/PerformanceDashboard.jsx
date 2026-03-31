import React, { useEffect, useState } from 'react';
import axios from '../services/api';

const statCards = [
  { key: 'companies', label: 'Companies', color: 'text-primary' },
  { key: 'employers', label: 'Employers', color: 'text-warning' },
  { key: 'employees', label: 'Employees', color: 'text-success' },
  { key: 'completion_rate', label: 'Task Completion', color: 'text-primary', suffix: '%' },
  { key: 'approval_rate', label: 'Report Approval', color: 'text-success', suffix: '%' },
  { key: 'performance_index', label: 'Performance Index', color: 'text-warning', suffix: '%' },
];

const chartColors = ['bg-primary', 'bg-success', 'bg-warning', 'bg-danger'];
const chartHexColors = ['#3C50E0', '#10B981', '#F59E0B', '#DC2626', '#8B5CF6', '#14B8A6'];

const metricDefs = [
  { key: 'completion_rate', label: 'Task Completion' },
  { key: 'approval_rate', label: 'Report Approval' },
  { key: 'win_score_percent', label: 'Win Score' },
  { key: 'performance_index', label: 'Performance Index' },
];

const formatMetric = (value, suffix = '') => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `${safeValue}${suffix}`;
};

const Bar = ({ value, colorClass = 'bg-primary' }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-2">
    <div
      className={`h-full rounded-full ${colorClass}`}
      style={{ width: `${Math.max(0, Math.min(100, Number(value) || 0))}%` }}
    />
  </div>
);

const StatusBreakdownCard = ({ title, items }) => {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="ta-card">
      <div className="ta-card-header">
        <h3 className="font-semibold text-sidebar">{title}</h3>
      </div>
      <div className="ta-card-body space-y-4">
        <div className="flex h-3 overflow-hidden rounded-full bg-gray-2">
          {items.map((item, index) => {
            const width = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <div
                key={item.status}
                className={chartColors[index % chartColors.length]}
                style={{ width: `${width}%` }}
                title={`${item.label}: ${item.value}`}
              />
            );
          })}
        </div>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.status} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <span className={`h-3 w-3 rounded-full ${chartColors[index % chartColors.length]}`} />
                <span>{item.label}</span>
              </div>
              <span className="font-semibold text-sidebar">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ComparisonBarChart = ({ items }) => {
  const maxValue = Math.max(
    ...metricDefs.flatMap((metric) => items.map((item) => Number(item?.[metric.key]) || 0)),
    0,
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {items.map((item, index) => (
          <div key={item.role} className="flex items-center gap-2 text-gray-500">
            <span className={`h-3 w-3 rounded-sm ${chartColors[index % chartColors.length]}`} />
            <span>{item.role}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {metricDefs.map((metric) => (
          <div key={metric.key} className="rounded-sm border border-stroke bg-whiten p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-sidebar">{metric.label}</p>
              <span className="text-xs text-gray-400">0% - 100%</span>
            </div>

            <div className="flex h-56 items-end justify-center gap-6 rounded-sm bg-white px-4 py-3">
              {items.map((item, index) => {
                const rawValue = Number(item?.[metric.key]) || 0;
                const height = maxValue > 0 ? Math.max((rawValue / maxValue) * 100, 8) : 0;

                return (
                  <div key={`${metric.key}-${item.role}`} className="flex flex-1 flex-col items-center justify-end gap-3">
                    <span className="text-sm font-semibold text-sidebar">{formatMetric(rawValue, '%')}</span>
                    <div className="flex h-40 items-end">
                      <div
                        className={`w-16 max-w-full rounded-t-lg ${chartColors[index % chartColors.length]} transition-all duration-300`}
                        style={{ height: `${height}%` }}
                        title={`${item.role}: ${rawValue}%`}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-500">{item.role}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians)),
  };
};

const describeArc = (centerX, centerY, radius, startAngle, endAngle) => {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', centerX, centerY,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'Z',
  ].join(' ');
};

const CompanyRankingPieChart = ({ companies }) => {
  const totalScore = companies.reduce((sum, company) => sum + (Number(company.performance_index) || 0), 0);
  let currentAngle = 0;

  const slices = companies.map((company, index) => {
    const value = Number(company.performance_index) || 0;
    const angle = totalScore > 0 ? (value / totalScore) * 360 : 0;
    const slice = {
      ...company,
      color: chartHexColors[index % chartHexColors.length],
      percentage: totalScore > 0 ? ((value / totalScore) * 100) : 0,
      path: angle > 0 ? describeArc(100, 100, 80, currentAngle, currentAngle + angle) : '',
    };

    currentAngle += angle;
    return slice;
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px,minmax(0,1fr)] lg:items-center">
      <div className="flex justify-center">
        <div className="relative h-64 w-64">
          <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-sm">
            {slices.map((slice) => (
              slice.path ? <path key={slice.id} d={slice.path} fill={slice.color} stroke="#ffffff" strokeWidth="2" /> : null
            ))}
            <circle cx="100" cy="100" r="42" fill="#ffffff" />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs uppercase tracking-wide text-gray-400">Companies</span>
            <span className="text-2xl font-bold text-sidebar">{companies.length}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {slices.map((slice) => (
          <div key={slice.id} className="flex items-center justify-between gap-4 rounded-sm border border-stroke bg-whiten p-3 text-sm">
            <div className="flex min-w-0 items-center gap-3">
              <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-sidebar">{slice.company_name}</p>
                <p className="text-xs text-gray-500">
                  {slice.employers} employer{slice.employers !== 1 ? 's' : ''} · {slice.employees} employee{slice.employees !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sidebar">{formatMetric(slice.performance_index, '%')}</p>
              <p className="text-xs text-gray-500">{slice.percentage.toFixed(1)} share</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PerformanceDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPerformance = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await axios.get('/api/performance/company-overview');
        setData(response.data);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Failed to load performance analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  if (loading) {
    return (
      <div className="ta-card">
        <div className="ta-card-body py-16 text-center text-sm text-gray-500">Loading performance analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ta-card">
        <div className="ta-card-body py-16 text-center">
          <p className="text-sm text-danger">{error}</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const roleComparison = data?.role_comparison || [];
  const companies = data?.companies || [];
  const hasCompanies = companies.length > 0;

  return (
    <div className="space-y-6">
      <div className="ta-card">
        <div className="ta-card-header">
          <div>
            <h3 className="font-semibold text-sidebar">Performance Overview</h3>
            <p className="mt-1 text-sm text-gray-500">
              Company-wide performance for employers in your groups and the employees in their companies.
            </p>
          </div>
        </div>
        <div className="ta-card-body">
          {!hasCompanies ? (
            <div className="rounded-sm border border-dashed border-stroke bg-whiten px-6 py-10 text-center">
              <p className="text-sm font-medium text-sidebar">No performance data yet.</p>
              <p className="mt-2 text-sm text-gray-500">
                Add employers to your groups so the dashboard can aggregate their company performance.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {statCards.map((card) => (
                <div key={card.key} className="rounded-sm border border-stroke bg-whiten p-5">
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className={`mt-2 text-3xl font-bold ${card.color}`}>
                    {formatMetric(summary[card.key], card.suffix || '')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {hasCompanies && (
        <>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="ta-card">
              <div className="ta-card-header">
                <h3 className="font-semibold text-sidebar">Employers vs Employees</h3>
              </div>
              <div className="ta-card-body">
                <ComparisonBarChart items={roleComparison} />
              </div>
            </div>

            <div className="ta-card">
              <div className="ta-card-header">
                <h3 className="font-semibold text-sidebar">Company Ranking</h3>
              </div>
              <div className="ta-card-body space-y-4">
                <CompanyRankingPieChart companies={companies} />
                {companies.map((company) => {
                  return (
                    <div key={company.id} className="rounded-sm border border-stroke bg-whiten p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-sidebar">{company.company_name}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {company.employers} employer{company.employers !== 1 ? 's' : ''} · {company.employees} employee{company.employees !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <span className="ta-badge-primary">{formatMetric(company.performance_index, '%')}</span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                        <div>
                          <p className="text-gray-400">Tasks</p>
                          <p className="font-semibold text-sidebar">{company.tasks_completed}/{company.tasks_total}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Reports</p>
                          <p className="font-semibold text-sidebar">{company.reports_approved}/{company.reports_total}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Wins</p>
                          <p className="font-semibold text-sidebar">{company.wins_total}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Win Score</p>
                          <p className="font-semibold text-sidebar">{formatMetric(company.avg_win_score)}/5</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <StatusBreakdownCard title="Task Status Distribution" items={data?.status_breakdown?.tasks || []} />
            <StatusBreakdownCard title="Report Status Distribution" items={data?.status_breakdown?.reports || []} />
            <StatusBreakdownCard title="Achievement Status Distribution" items={data?.status_breakdown?.wins || []} />
          </div>
        </>
      )}
    </div>
  );
};

export default PerformanceDashboard;
