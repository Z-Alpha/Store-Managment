import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  ChevronDownIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { AppDispatch, RootState } from '../app/store';
import { getOrders, updateOrder, createOrder, Order } from '../features/orders/orderSlice';
import OrderModal from '../components/orders/OrderModal';
import OrderDetailsModal from '../components/orders/OrderDetailsModal';
import Button from '../components/common/Button';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
} as const;

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
} as const;

interface OrderFilters {
  search: string;
  status: string;
  paymentStatus: string;
  dateRange: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const Orders = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, isLoading, isError, message } = useSelector(
    (state: RootState) => state.orders
  );

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    status: 'all',
    paymentStatus: 'all',
    dateRange: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        await dispatch(getOrders()).unwrap();
      } catch (error) {
        toast.error('Failed to fetch orders');
      }
    };
    fetchOrders();
  }, [dispatch]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
    }
  }, [isError, message]);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await dispatch(
        updateOrder({
          id: orderId,
          orderData: { status: newStatus },
        })
      ).unwrap();
      toast.success('Order status updated successfully');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleSort = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Ensure orders is an array before filtering
  const safeOrders = Array.isArray(orders) ? orders : [];
  
  const filteredOrders = safeOrders.filter((order) => {
    const matchesSearch =
      !filters.search ||
      order.orderNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus =
      filters.status === 'all' || order.status === filters.status;

    const matchesPaymentStatus =
      filters.paymentStatus === 'all' ||
      order.paymentStatus === filters.paymentStatus;

    let matchesDateRange = true;
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
    const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));

    switch (filters.dateRange) {
      case '7days':
        matchesDateRange = orderDate >= sevenDaysAgo;
        break;
      case '30days':
        matchesDateRange = orderDate >= thirtyDaysAgo;
        break;
      default:
        matchesDateRange = true;
    }

    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDateRange;
  }).sort((a, b) => {
    const sortField = filters.sortBy as keyof Order;
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return filters.sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return filters.sortOrder === 'asc' 
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and track your customer orders
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            variant="primary"
            onClick={() => {
              setSelectedOrder(null);
              setIsModalOpen(true);
            }}
          >
            Create Order
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Search Input */}
            <div className="col-span-1 md:col-span-2">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="block w-full rounded-lg border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  placeholder="Search by order number, customer name, or email..."
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="block w-full rounded-lg border-0 py-3 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <select
                value={filters.paymentStatus}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    paymentStatus: e.target.value,
                  }))
                }
                className="block w-full rounded-lg border-0 py-3 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('orderNumber')}
                >
                  <div className="flex items-center gap-2">
                    Order Number
                    {filters.sortBy === 'orderNumber' && (
                      <ChevronDownIcon className={`h-4 w-4 transition-transform ${
                        filters.sortOrder === 'desc' ? 'transform rotate-180' : ''
                      }`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('customer.name')}
                >
                  <div className="flex items-center gap-2">
                    Customer
                    {filters.sortBy === 'customer.name' && (
                      <ChevronDownIcon className={`h-4 w-4 transition-transform ${
                        filters.sortOrder === 'desc' ? 'transform rotate-180' : ''
                      }`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalAmount')}
                >
                  <div className="flex items-center gap-2">
                    Total Amount
                    {filters.sortBy === 'totalAmount' && (
                      <ChevronDownIcon className={`h-4 w-4 transition-transform ${
                        filters.sortOrder === 'desc' ? 'transform rotate-180' : ''
                      }`} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Payment</th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-2">
                    Date
                    {filters.sortBy === 'createdAt' && (
                      <ChevronDownIcon className={`h-4 w-4 transition-transform ${
                        filters.sortOrder === 'desc' ? 'transform rotate-180' : ''
                      }`} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <div>
                      <div className="font-medium text-gray-900">{order.customer.name}</div>
                      <div className="text-gray-500">{order.customer.email}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value as Order['status'])}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[order.status]}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      paymentStatusColors[order.paymentStatus]
                    }`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {format(new Date(order.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDetailsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No orders found matching your filters</p>
          </div>
        )}
      </div>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onSubmit={async (orderData) => {
          try {
            if (selectedOrder) {
              await dispatch(updateOrder({ id: selectedOrder._id, orderData })).unwrap();
              toast.success('Order updated successfully');
            } else {
              await dispatch(createOrder(orderData)).unwrap();
              toast.success('Order created successfully');
            }
            setIsModalOpen(false);
            setSelectedOrder(null);
          } catch (error: any) {
            toast.error(error.message || 'Failed to process order');
          }
        }}
      />

      <OrderDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />
    </div>
  );
};

export default Orders; 