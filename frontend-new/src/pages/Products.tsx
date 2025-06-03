import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from '../app/store';
import { getProducts, deleteProduct, Product, updateProduct } from '../features/products/productSlice';
import ProductModal from '../components/products/ProductModal';
import ProductFilters from '../components/products/ProductFilters';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface FilterOptions {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  status: 'all' | 'in_stock' | 'out_of_stock' | 'discontinued';
}

interface SortConfig {
  field: keyof Pick<Product, 'name' | 'price' | 'quantity' | 'category'>;
  direction: 'asc' | 'desc';
}

const Products = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    status: 'all',
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'name',
    direction: 'asc',
  });

  const dispatch = useDispatch<AppDispatch>();
  const { products, isLoading, isError, message } = useSelector(
    (state: RootState) => state.products
  );

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    dispatch(getProducts());
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
        toast.success('Product deleted successfully');
        dispatch(getProducts());
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete product');
      }
    }
  };

  const handleStatusChange = async (product: Product) => {
    const statusOrder: Product['status'][] = ['out_of_stock', 'in_stock', 'discontinued'];
    const currentIndex = statusOrder.indexOf(product.status || 'out_of_stock');
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

    try {
      const updateData = new FormData();
      Object.entries(product).forEach(([key, value]) => {
        if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
          updateData.append(key, value.toString());
        }
      });
      
      // If changing to out_of_stock or discontinued, set quantity to 0
      if (nextStatus === 'out_of_stock' || nextStatus === 'discontinued') {
        updateData.set('quantity', '0');
      }
      
      updateData.set('status', nextStatus);

      await dispatch(updateProduct({ id: product._id, productData: updateData })).unwrap();
      toast.success(`Product status updated to ${nextStatus.replace('_', ' ').toUpperCase()}`);
      dispatch(getProducts());
    } catch (error: any) {
      toast.error(error.message || 'Failed to update product status');
    }
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !filters.search ||
      product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      (product.barcode && product.barcode.toLowerCase().includes(filters.search.toLowerCase()));

    const matchesCategory =
      !filters.category || product.category === filters.category;

    const matchesPrice =
      (!filters.minPrice || product.price >= parseFloat(filters.minPrice)) &&
      (!filters.maxPrice || product.price <= parseFloat(filters.maxPrice));

    const matchesStock = !filters.inStock || product.status === 'in_stock';

    const matchesStatus =
      filters.status === 'all' ||
      product.status === filters.status;

    return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortConfig.field) {
      case 'name':
        return sortConfig.direction === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      case 'price':
        return sortConfig.direction === 'asc'
          ? a.price - b.price
          : b.price - a.price;
      case 'quantity':
        return sortConfig.direction === 'asc'
          ? a.quantity - b.quantity
          : b.quantity - a.quantity;
      case 'category':
        return sortConfig.direction === 'asc'
          ? a.category.localeCompare(b.category)
          : b.category.localeCompare(a.category);
      default:
        return 0;
    }
  });

  const handleSort = (field: SortConfig['field']) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <button
          onClick={handleAddProduct}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Product
        </button>
      </div>

      <ProductFilters onFilterChange={handleFilterChange} />

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Product
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('category')}
              >
                Category
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('price')}
              >
                Price
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('quantity')}
              >
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedProducts.map((product) => (
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
                  <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                    product.status === 'in_stock'
                      ? 'bg-green-100 text-green-800'
                      : product.status === 'out_of_stock'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      product.status === 'in_stock'
                        ? 'bg-green-600'
                        : product.status === 'out_of_stock'
                        ? 'bg-red-600'
                        : 'bg-gray-600'
                    }`}></span>
                    {product.status === 'in_stock'
                      ? 'In Stock'
                      : product.status === 'out_of_stock'
                      ? 'Out of Stock'
                      : 'Discontinued'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        product={selectedProduct}
      />
    </div>
  );
};

export default Products; 