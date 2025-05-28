import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import Button from '../common/Button';

interface FilterOptions {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  status: 'all' | 'in_stock' | 'out_of_stock' | 'discontinued';
}

interface ProductFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

const ProductFilters = ({ onFilterChange }: ProductFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    status: 'all',
  });

  const { products } = useSelector((state: RootState) => state.products);
  const categories = Array.from(new Set(products.map((product) => product.category)));

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      status: 'all',
    });
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
      <form onSubmit={handleSearch} className="space-y-6">
        {/* Search Bar and Buttons */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleChange}
                placeholder="Search products by name, description, or barcode..."
                className="block w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 ease-in-out"
              />
            </div>
          </div>
          <Button
            type="submit"
            variant="primary"
            className="flex items-center px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-150"
          >
            <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
            Search
          </Button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-gray-500" />
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Category Filter */}
              <div className="filter-group">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 ease-in-out"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filters */}
              <div className="filter-group">
                <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    name="minPrice"
                    id="minPrice"
                    value={filters.minPrice}
                    onChange={handleChange}
                    min="0"
                    placeholder="0.00"
                    className="block w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 ease-in-out"
                  />
                </div>
              </div>

              <div className="filter-group">
                <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    name="maxPrice"
                    id="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleChange}
                    min="0"
                    placeholder="0.00"
                    className="block w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 ease-in-out"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="filter-group">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 ease-in-out"
                >
                  <option value="all">All Status</option>
                  <option value="in_stock">In Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
            </div>

            {/* Additional Options */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="inStock"
                  id="inStock"
                  checked={filters.inStock}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                />
                <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
                  Show Only In-Stock Products
                </label>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleReset}
                className="px-4 py-2 text-sm"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProductFilters; 