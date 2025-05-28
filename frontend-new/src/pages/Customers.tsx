import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { AppDispatch, RootState } from '../app/store';
import {
  Customer,
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  reset,
} from '../features/customers/customerSlice';
import CustomerModal from '../components/customers/CustomerModal';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Pagination from '../components/common/Pagination';
import { formatDate } from '../utils';

const Customers = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get auth state
  const { user } = useSelector((state: RootState) => state.auth);
  
  const { customers, isLoading, isError, message, page, pages, total } = useSelector(
    (state: RootState) => state.customers
  );

  console.log('Component rendered with state:', {
    isAuthenticated: !!user,
    userDetails: user ? { id: user._id, email: user.email, role: user.role } : null,
    customersState: {
      hasCustomers: Array.isArray(customers) && customers.length > 0,
      customerCount: Array.isArray(customers) ? customers.length : 0,
      isLoading,
      isError,
      message,
      page,
      pages,
      total
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to login...');
      navigate('/login');
      return;
    }

    const fetchCustomers = async () => {
      try {
        console.log('Fetching customers with params:', { page: currentPage, keyword: searchTerm });
        const result = await dispatch(getCustomers({ page: currentPage, keyword: searchTerm })).unwrap();
        console.log('Customers fetch result:', result);
      } catch (error: any) {
        console.error('Error fetching customers:', error);
        if (typeof error === 'string' && error.includes('not authorized')) {
          console.log('Authorization error, redirecting to login...');
          navigate('/login');
        } else {
          toast.error(error.message || 'Failed to fetch customers');
        }
      }
    };

    fetchCustomers();

    return () => {
      console.log('Cleaning up customers component...');
      dispatch(reset());
    };
  }, [dispatch, currentPage, searchTerm, user, navigate]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
    }
  }, [isError, message]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    dispatch(getCustomers({ page: 1, keyword: searchTerm }));
  };

  const openCreateModal = () => {
    console.log('Opening create modal...');
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleCreateCustomer = async (customerData: Omit<Customer, '_id' | 'createdAt' | 'updatedAt' | 'totalOrders' | 'totalSpent'>) => {
    console.log('Creating customer with data:', customerData);
    try {
      const result = await dispatch(createCustomer(customerData)).unwrap();
      console.log('Customer created successfully:', result);
      toast.success('Customer created successfully');
      setIsModalOpen(false); // Close the modal after successful creation
      dispatch(getCustomers({ page: currentPage, keyword: searchTerm }));
    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast.error(error.message || 'Failed to create customer');
    }
  };

  const handleUpdateCustomer = async (customerData: Partial<Customer>) => {
    if (!selectedCustomer) return;
    try {
      await dispatch(
        updateCustomer({ id: selectedCustomer._id, customerData })
      ).unwrap();
      toast.success('Customer updated successfully');
      dispatch(getCustomers({ page: currentPage, keyword: searchTerm }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to update customer');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await dispatch(deleteCustomer(id)).unwrap();
        toast.success('Customer deleted successfully');
        dispatch(getCustomers({ page: currentPage, keyword: searchTerm }));
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete customer');
      }
    }
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  // Render the main content
  const renderContent = () => {
    if (isLoading) {
      console.log('Showing loading spinner...');
      return <Spinner />;
    }

    if (isError) {
      console.log('Error state detected:', message);
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{message}</span>
        </div>
      );
    }

    if (!customers || customers.length === 0) {
      console.log('No customers found, showing empty state');
      return (
        <div className="bg-white shadow-sm rounded-lg p-6 text-center">
          <p className="text-gray-500">No customers found. Click the "Add Customer" button to create one.</p>
        </div>
      );
    }

    console.log('Rendering customers table with data:', customers);
    return (
      <>
        {/* Customers Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.email}</div>
                      <div className="text-sm text-gray-500">{customer.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customer.totalOrders}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${customer.totalSpent.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${
                            customer.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(customer.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(customer)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={pages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
        <Button
          variant="primary"
          onClick={() => {
            console.log('Add Customer button clicked');
            openCreateModal();
          }}
          className="flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border-gray-300 pl-10 
                  focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </div>
      </form>

      {/* Main Content */}
      {renderContent()}

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          console.log('Closing modal...');
          setIsModalOpen(false);
        }}
        customer={selectedCustomer}
        onSubmit={selectedCustomer ? handleUpdateCustomer : handleCreateCustomer}
      />
    </div>
  );
};

export default Customers; 