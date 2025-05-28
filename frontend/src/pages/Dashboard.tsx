import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import api from '../services/api';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalSuppliers: number;
  lowStockProducts: number;
  revenue: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalSuppliers: 0,
    lowStockProducts: 0,
    revenue: {
      daily: 0,
      weekly: 0,
      monthly: 0,
    },
  });

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const StatCard = ({ title, value, description }: { title: string; value: number; description: string }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          description="Total number of products in inventory"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          description="Total number of orders processed"
        />
        <StatCard
          title="Low Stock Products"
          value={stats.lowStockProducts}
          description="Products that need reordering"
        />
        <StatCard
          title="Monthly Revenue"
          value={stats.revenue.monthly}
          description="Revenue in the last 30 days"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          description="Number of registered customers"
        />
        <StatCard
          title="Total Suppliers"
          value={stats.totalSuppliers}
          description="Number of active suppliers"
        />
      </div>
    </div>
  );
};

export default Dashboard; 