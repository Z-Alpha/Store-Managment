import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isUpward: boolean;
  };
  description?: string;
}

const StatCard = ({ title, value, icon, trend, description }: StatCardProps) => {
  return (
    <div className="relative overflow-hidden rounded-lg bg-white p-6 shadow">
      <dt>
        <div className="absolute rounded-md bg-blue-100 p-3">
          <div className="h-6 w-6 text-blue-600">{icon}</div>
        </div>
        <p className="ml-16 truncate text-sm font-medium text-gray-500">{title}</p>
      </dt>
      <dd className="ml-16 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {trend && (
          <p
            className={`ml-2 flex items-baseline text-sm font-semibold ${
              trend.isUpward ? 'text-green-600' : 'text-red-600'
            }`}
          >
            <span className="inline-flex items-center gap-0.5">
              {trend.isUpward ? (
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M3.707 5.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L7 8.586V1a1 1 0 10-2 0v7.586L3.707 5.293z" />
                </svg>
              ) : (
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M3.707 6.707a1 1 0 001.414-1.414L7 2.414V10a1 1 0 102 0V2.414l2.293 2.293a1 1 0 001.414-1.414l-4-4a1 1 0 00-1.414 0l-4 4z" />
                </svg>
              )}
              {Math.abs(trend.value)}%
            </span>
          </p>
        )}
        {description && (
          <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-2">
            <div className="text-sm text-gray-500">{description}</div>
          </div>
        )}
      </dd>
    </div>
  );
};

export default StatCard; 