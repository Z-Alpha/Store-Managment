import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/axios';

export interface OrderItem {
  product: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingMethod: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  isError: boolean;
  message: string;
}

const initialState: OrderState = {
  orders: [],
  isLoading: false,
  isError: false,
  message: '',
};

// Get all orders
export const getOrders = createAsyncThunk(
  'orders/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get('/api/orders');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create new order
export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData: Partial<Order>, thunkAPI) => {
    try {
      const response = await axios.post('/api/orders', orderData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update order
export const updateOrder = createAsyncThunk(
  'orders/update',
  async ({ id, orderData }: { id: string; orderData: Partial<Order> }, thunkAPI) => {
    try {
      const response = await axios.put(`/api/orders/${id}`, orderData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete order
export const deleteOrder = createAsyncThunk(
  'orders/delete',
  async (id: string, thunkAPI) => {
    try {
      await axios.delete(`/api/orders/${id}`);
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    reset: (state) => {
      state.orders = [];
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrders.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.orders = Array.isArray(action.payload.orders) ? action.payload.orders : [];
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(updateOrder.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        const index = state.orders.findIndex(
          (order) => order._id === action.payload._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(deleteOrder.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.orders = state.orders.filter(
          (order) => order._id !== action.payload
        );
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      });
  },
});

export const { reset } = orderSlice.actions;
export default orderSlice.reducer; 