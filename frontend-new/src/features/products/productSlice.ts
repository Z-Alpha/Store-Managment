import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/axios';

export interface Product {
  _id: string;
  user: string;
  name: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
  image?: string;
  barcode?: string;
  status: 'in_stock' | 'out_of_stock' | 'discontinued';
  createdAt: string;
  updatedAt: string;
}

interface ProductState {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  message: string;
}

const initialState: ProductState = {
  products: [],
  isLoading: false,
  isError: false,
  message: '',
};

// Get all products
export const getProducts = createAsyncThunk(
  'products/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get('/products');
      return response.data.products;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch products';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create new product
export const createProduct = createAsyncThunk(
  'products/create',
  async (productData: FormData, thunkAPI) => {
    try {
      console.log('Creating product with data:', Object.fromEntries(productData.entries()));
      const response = await axios.post('/products', productData);
      console.log('Create response:', response.data);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to create product';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update product
export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, productData }: { id: string; productData: FormData }, thunkAPI) => {
    try {
      const formDataObj = Object.fromEntries(productData.entries());
      console.log('Updating product:', id, 'with data:', formDataObj);
      
      const response = await axios.put(`/products/${id}`, productData);
      console.log('Update response:', response.data);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to update product';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete product
export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id: string, thunkAPI) => {
    try {
      await axios.delete(`/products/${id}`);
      return id;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to delete product';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.products.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      });
  },
});

export const { reset } = productSlice.actions;
export default productSlice.reducer; 