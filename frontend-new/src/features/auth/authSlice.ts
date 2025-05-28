import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  token: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  message: string;
}

// Get user from localStorage and initialize axios headers
const user = localStorage.getItem('user');
const initialUser = user ? JSON.parse(user) : null;
if (initialUser?.token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialUser.token}`;
}

const initialState: AuthState = {
  user: initialUser,
  isLoading: false,
  isError: false,
  message: '',
};

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData: { email: string; password: string }, thunkAPI) => {
    try {
      console.log('Attempting login with:', userData.email);
      console.log('Using axios instance:', axios.defaults.baseURL);
      
      const response = await axios.post('/api/users/login', userData);
      console.log('Raw login response:', response);
      console.log('Login response data:', response.data);
      
      if (!response.data) {
        throw new Error('No response data received');
      }

      if (!response.data.token) {
        console.error('Response data missing token:', response.data);
        throw new Error('Invalid response format - no token received');
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Set axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      return response.data;
    } catch (error: any) {
      console.error('Login error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        error: error.message
      });
      
      const message =
        error.response?.data?.message || error.message || 'Login failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    console.log('Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
  }
});

export const authSlice = createSlice({
  name: 'auth',
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
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.user = action.payload;
        console.log('Login successful:', action.payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.user = null;
        console.error('Login rejected:', action.payload);
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer; 