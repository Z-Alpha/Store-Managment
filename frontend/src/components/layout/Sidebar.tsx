import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import {
  HomeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Products', href: '/products', icon: ShoppingBagIcon },
  { name: 'Orders', href: '/orders', icon: ShoppingCartIcon },
  { name: 'Customers', href: '/customers', icon: UserGroupIcon },
  { name: 'Suppliers', href: '/suppliers', icon: TruckIcon },
];

const Sidebar = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) return null;

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="h-full px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="mr-3 h-6 w-6" aria-hidden="true" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 