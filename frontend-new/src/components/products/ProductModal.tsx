import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AppDispatch } from '../../app/store';
import { Product, createProduct, updateProduct, getProducts } from '../../features/products/productSlice';
import ImageUpload from './ImageUpload';
import Input from '../common/Input';
import Button from '../common/Button';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const ProductModal = ({ isOpen, onClose, product }: ProductModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    quantity: '',
    image: '',
    barcode: '',
    status: 'out_of_stock' as 'in_stock' | 'out_of_stock' | 'discontinued'
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        quantity: product.quantity.toString(),
        image: product.image || '',
        barcode: product.barcode || '',
        status: product.status
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        quantity: '0',
        image: '',
        barcode: '',
        status: 'out_of_stock'
      });
    }
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to ${value}`);
    
    if (name === 'status') {
      const newStatus = value as 'in_stock' | 'out_of_stock' | 'discontinued';
      console.log('Setting new status:', newStatus);
      
      // If changing status to out_of_stock or discontinued, set quantity to 0
      if (newStatus === 'out_of_stock' || newStatus === 'discontinued') {
        setFormData(prev => ({
          ...prev,
          status: newStatus,
          quantity: '0'
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          status: newStatus
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = new FormData();
      
      const processedData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category.trim(),
        quantity: parseInt(formData.quantity),
        barcode: formData.barcode?.trim(),
        status: formData.status
      };

      console.log('Submitting product with data:', processedData);

      if (isNaN(processedData.price) || processedData.price < 0) {
        throw new Error('Invalid price value');
      }

      if (isNaN(processedData.quantity) || processedData.quantity < 0) {
        throw new Error('Invalid quantity value');
      }

      // Ensure quantity is 0 for out_of_stock or discontinued status
      if (processedData.status === 'out_of_stock' || processedData.status === 'discontinued') {
        processedData.quantity = 0;
      }

      // Convert processedData to FormData
      Object.entries(processedData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          productData.append(key, value.toString());
        }
      });

      if (selectedImage) {
        productData.append('image', selectedImage);
      }

      let result;
      if (product) {
        console.log('Updating product with data:', Object.fromEntries(productData.entries()));
        result = await dispatch(updateProduct({ id: product._id, productData })).unwrap();
        console.log('Product updated:', result);
        toast.success('Product updated successfully');
        
        // Force a refresh of the products list
        dispatch(getProducts());
      } else {
        result = await dispatch(createProduct(productData)).unwrap();
        console.log('Product created:', result);
        toast.success('Product created successfully');
      }

      onClose();
    } catch (error: any) {
      console.error('Error submitting product:', error);
      toast.error(error.message || 'Something went wrong');
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
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />

        <div className="relative bg-white rounded-lg w-full max-w-2xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {product ? 'Edit Product' : 'Add Product'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <ImageUpload
              currentImage={product?.image}
              onImageSelect={(file) => setSelectedImage(file)}
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                id="name"
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <Input
                id="barcode"
                name="barcode"
                label="Barcode"
                value={formData.barcode}
                onChange={handleChange}
              />

              <Input
                id="price"
                name="price"
                label="Price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
              />

              <Input
                id="category"
                name="category"
                label="Category"
                value={formData.category}
                onChange={handleChange}
                required
              />

              <Input
                id="quantity"
                name="quantity"
                label="Quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                required
              />

              <div className="sm:col-span-1">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
                  required
                >
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="in_stock">In Stock</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
              >
                {product ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default ProductModal; 