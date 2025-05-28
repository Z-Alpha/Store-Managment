import { useSelector } from 'react-redux';
import {
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { RootState } from '../app/store';
import StatCard from '../components/dashboard/StatCard';

interface DashboardCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const DashboardCard = ({ title, value, icon }: DashboardCardProps) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
      <div className="bg-blue-50 rounded-full p-3">
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { products } = useSelector((state: RootState) => state.products);
  const lowStockProducts = products.filter(p => p.quantity <= 10);
  const inStockProducts = products.filter(p => p.status === 'in_stock');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Total Products"
          value={products.length}
          icon={<CubeIcon className="h-8 w-8" />}
        />
        <DashboardCard
          title="Low Stock Products"
          value={lowStockProducts.length}
          icon={<ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />}
        />
        <DashboardCard
          title="In Stock Products"
          value={inStockProducts.length}
          icon={<CheckCircleIcon className="h-8 w-8 text-green-500" />}
        />
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Products"
              value={products.length}
              icon={<ShoppingCartIcon className="h-6 w-6" />}
            />
            <StatCard
              title="In Stock Products"
              value={inStockProducts.length}
              icon={<CheckCircleIcon className="h-6 w-6" />}
            />
            <StatCard
              title="Low Stock Products"
              value={lowStockProducts.length}
              icon={<ExclamationTriangleIcon className="h-6 w-6" />}
              description="Products with low quantity"
            />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Products</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.slice(0, 5).map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.image && (
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={product.image}
                              alt={product.name}
                            />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.barcode || 'No barcode'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.status === 'in_stock'
                          ? 'bg-green-100 text-green-800'
                          : product.status === 'out_of_stock'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 