import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/axios';

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface CustomerState {
  customers: Customer[];
  customer: Customer | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  message: string;
  page: number;
  pages: number;
  total: number;
}

const initialState: CustomerState = {
  customers: [],
  customer: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
  page: 1,
  pages: 1,
  total: 0,
};

// Get all customers
export const getCustomers = createAsyncThunk(
  'customers/getAll',
  async ({ page = 1, keyword = '' }: { page?: number; keyword?: string }, thunkAPI) => {
    try {
      // Log the request details
      console.log('Making API request to get customers:', { 
        url: `/api/customers?page=${page}&keyword=${keyword}`,
        headers: axios.defaults.headers,
        baseURL: axios.defaults.baseURL
      });

      const response = await axios.get(`/api/customers?page=${page}&keyword=${keyword}`);
      
      // Log the full response
      console.log('Full API response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });

      // Validate response data
      if (!response.data) {
        throw new Error('No data received from server');
      }

      if (!response.data.customers) {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response format - missing customers array');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error in getCustomers:', {
        error,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      const message = 
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch customers';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single customer
export const getCustomer = createAsyncThunk(
  'customers/getOne',
  async (id: string, thunkAPI) => {
    try {
      const response = await axios.get(`/api/customers/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create customer
export const createCustomer = createAsyncThunk(
  'customers/create',
  async (customerData: Omit<Customer, '_id' | 'createdAt' | 'updatedAt' | 'totalOrders' | 'totalSpent'>, thunkAPI) => {
    try {
      const response = await axios.post('/api/customers', customerData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update customer
export const updateCustomer = createAsyncThunk(
  'customers/update',
  async ({ id, customerData }: { id: string; customerData: Partial<Customer> }, thunkAPI) => {
    try {
      const response = await axios.put(`/api/customers/${id}`, customerData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete customer
export const deleteCustomer = createAsyncThunk(
  'customers/delete',
  async (id: string, thunkAPI) => {
    try {
      await axios.delete(`/api/customers/${id}`);
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all customers
      .addCase(getCustomers.pending, (state) => {
        console.log('getCustomers.pending - Setting loading state');
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getCustomers.fulfilled, (state, action) => {
        console.log('getCustomers.fulfilled - Processing response:', action.payload);
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.customers = action.payload.customers;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(getCustomers.rejected, (state, action) => {
        console.log('getCustomers.rejected - Error:', action.payload);
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.customers = [];
      })
      // Get single customer
      .addCase(getCustomer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.customer = action.payload;
      })
      .addCase(getCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.customers.push(action.payload);
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // Update customer
      .addCase(updateCustomer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.customers = state.customers.map((customer) =>
          customer._id === action.payload._id ? action.payload : customer
        );
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // Delete customer
      .addCase(deleteCustomer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.customers = state.customers.filter(
          (customer) => customer._id !== action.payload
        );
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      });
  },
});

export const { reset } = customerSlice.actions;
export default customerSlice.reducer; 