import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PlusIcon, TrashIcon, TruckIcon, CreditCardIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from '../../app/store';
import { Order, createOrder, updateOrder } from '../../features/orders/orderSlice';
import { getProducts } from '../../features/products/productSlice';
import Button from '../common/Button';
import Input from '../common/Input';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  onSubmit: (orderData: Omit<Order, '_id' | 'createdAt' | 'updatedAt' | 'orderNumber'>) => Promise<void>;
}

interface OrderItem {
  product: string;
  quantity: number;
  price: number;
  total: number;
}

interface OrderFormData {
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  status: Order['status'];
  paymentStatus: Order['paymentStatus'];
  shippingMethod: string;
  totalAmount: number;
}

const initialFormData: OrderFormData = {
  customer: {
    name: '',
    email: '',
    phone: '',
    address: '',
  },
  items: [],
  status: 'pending',
  paymentStatus: 'pending',
  shippingMethod: 'standard',
  totalAmount: 0,
};

const OrderModal = ({ isOpen, onClose, order, onSubmit }: OrderModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const { products } = useSelector((state: RootState) => state.products);
  const { isError, message } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  useEffect(() => {
    if (order) {
      setFormData({
        customer: { ...order.customer },
        items: [...order.items],
        status: order.status,
        paymentStatus: order.paymentStatus,
        shippingMethod: order.shippingMethod,
        totalAmount: order.totalAmount,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [order]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
    }
  }, [isError, message]);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        [name]: value,
      },
    }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { product: '', quantity: 1, price: 0, total: 0 },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      const item = { ...newItems[index] };

      switch (field) {
        case 'product':
          const selectedProduct = products.find(p => p._id === value);
          if (selectedProduct) {
            item.product = value as string;
            item.price = selectedProduct.price;
            item.total = selectedProduct.price * item.quantity;
          }
          break;
        case 'quantity':
          item.quantity = Number(value);
          item.total = item.price * item.quantity;
          break;
        case 'price':
          item.price = Number(value);
          item.total = item.price * item.quantity;
          break;
      }

      newItems[index] = item;
      return {
        ...prev,
        items: newItems,
        totalAmount: newItems.reduce((sum, item) => sum + item.total, 0),
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate items
    if (formData.items.length === 0) {
      toast.error('Please add at least one item to the order');
      return;
    }

    // Validate each item
    for (const item of formData.items) {
      if (!item.product) {
        toast.error('Please select a product for all items');
        return;
      }
      if (item.quantity <= 0) {
        toast.error('Quantity must be greater than 0 for all items');
        return;
      }
      
      // Check stock availability
      const product = products.find(p => p._id === item.product);
      if (product && product.quantity < item.quantity) {
        toast.error(`Insufficient stock for ${product.name}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error: any) {
      // Error will be handled by the useEffect above
      console.error('Order submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />

        <div className="relative bg-white w-full max-w-4xl mx-auto rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {order ? 'Edit Order' : 'Create New Order'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Input
                  label="Name"
                  name="name"
                  value={formData.customer.name}
                  onChange={handleCustomerChange}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.customer.email}
                  onChange={handleCustomerChange}
                  required
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={formData.customer.phone}
                  onChange={handleCustomerChange}
                  required
                />
                <Input
                  label="Address"
                  name="address"
                  value={formData.customer.address}
                  onChange={handleCustomerChange}
                  required
                />
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddItem}
                  className="flex items-center"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-4">
                      <select
                        value={item.product}
                        onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Product</option>
                        {products.map((product) => (
                          <option 
                            key={product._id} 
                            value={product._id}
                            disabled={product.status === 'out_of_stock' || product.quantity === 0}
                          >
                            {product.name} - ${product.price.toFixed(2)} 
                            {product.status === 'out_of_stock' || product.quantity === 0 ? ' (Out of Stock)' : ''}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        min="1"
                        max={products.find(p => p._id === item.product)?.quantity || 999999}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                        min="0"
                        step="0.01"
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                        readOnly
                      />
                      <div className="flex items-center justify-between">
                        <span className="font-medium">${item.total.toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                      Order Status
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Order['status'] }))}
                      className="mt-1 block w-full rounded-lg border-gray-300 bg-white py-2 pl-3 pr-10 text-base 
                        focus:border-blue-500 focus:outline-none focus:ring-blue-500 transition-colors duration-200
                        cursor-pointer hover:bg-gray-50"
                    >
                      <option value="pending" className="py-2">Pending</option>
                      <option value="processing" className="py-2">Processing</option>
                      <option value="shipped" className="py-2">Shipped</option>
                      <option value="delivered" className="py-2">Delivered</option>
                      <option value="cancelled" className="py-2">Cancelled</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <CreditCardIcon className="h-5 w-5 text-gray-400" />
                      Payment Status
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value as Order['paymentStatus'] }))}
                      className="mt-1 block w-full rounded-lg border-gray-300 bg-white py-2 pl-3 pr-10 text-base 
                        focus:border-blue-500 focus:outline-none focus:ring-blue-500 transition-colors duration-200
                        cursor-pointer hover:bg-gray-50"
                    >
                      <option value="pending" className="py-2">Pending</option>
                      <option value="paid" className="py-2">Paid</option>
                      <option value="failed" className="py-2">Failed</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <TruckIcon className="h-5 w-5 text-gray-400" />
                      Shipping Method
                    </div>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.shippingMethod}
                      onChange={(e) => setFormData(prev => ({ ...prev, shippingMethod: e.target.value }))}
                      className="mt-1 block w-full rounded-lg border-gray-300 bg-white py-2 pl-3 pr-10 text-base 
                        focus:border-blue-500 focus:outline-none focus:ring-blue-500 transition-colors duration-200
                        cursor-pointer hover:bg-gray-50"
                    >
                      <option value="standard" className="py-2">Standard Shipping</option>
                      <option value="express" className="py-2">Express Shipping</option>
                      <option value="overnight" className="py-2">Overnight Shipping</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Amount */}
            <div className="flex justify-between items-center pt-6 border-t">
              <div className="text-lg font-medium text-gray-900">
                Total Amount: <span className="text-blue-600">${formData.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="px-4 py-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : order ? 'Update Order' : 'Create Order'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default OrderModal; 