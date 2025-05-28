import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AppDispatch } from '../../app/store';
import { Product, createProduct, updateProduct } from '../../features/products/productSlice';
import ImageUpload from './ImageUpload';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const ProductModal = ({ isOpen, onClose, product }: ProductModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    sku: '',
    stockQuantity: '',
    reorderPoint: '',
    unit: 'piece',
    supplier: '',
    isActive: true,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        sku: product.sku,
        stockQuantity: product.stockQuantity.toString(),
        reorderPoint: product.reorderPoint.toString(),
        unit: product.unit,
        supplier: product.supplier,
        isActive: product.isActive,
      });
    }
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const productData = new FormData();
      
      // Convert all values to strings before appending
      const formDataEntries = Object.entries(formData).map(([key, value]) => [
        key,
        typeof value === 'boolean' ? value.toString() : value
      ]);

      // Append all form fields as strings
      formDataEntries.forEach(([key, value]) => {
        productData.append(key, value);
      });

      // Append image if selected
      if (selectedImage) {
        productData.append('image', selectedImage);
      }

      if (product) {
        await dispatch(updateProduct({ id: product._id, productData }));
        toast.success('Product updated successfully');
      } else {
        await dispatch(createProduct(productData));
        toast.success('Product created successfully');
      }

      onClose();
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-black bg-opacity-30" />

        <div className="relative bg-white rounded-lg w-full max-w-md mx-4 p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium">
              {product ? 'Edit Product' : 'Add Product'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <ImageUpload
              currentImage={product?.imageUrl}
              onImageSelect={(file) => setSelectedImage(file)}
            />
            <div>
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="form-label">
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="input-field"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="sku" className="form-label">
                  SKU
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label htmlFor="stockQuantity" className="form-label">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  id="stockQuantity"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  className="input-field"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="reorderPoint" className="form-label">
                  Reorder Point
                </label>
                <input
                  type="number"
                  id="reorderPoint"
                  name="reorderPoint"
                  value={formData.reorderPoint}
                  onChange={handleChange}
                  className="input-field"
                  min="0"
                  required
                />
              </div>

              <div>
                <label htmlFor="unit" className="form-label">
                  Unit
                </label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="piece">Piece</option>
                  <option value="kg">Kilogram</option>
                  <option value="liter">Liter</option>
                  <option value="box">Box</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="supplier" className="form-label">
                Supplier ID
              </label>
              <input
                type="text"
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                {product ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default ProductModal; 