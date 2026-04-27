import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const userInfoFromStorage = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

const initialState = {
  userInfo: userInfoFromStorage,
  loading: false,
  error: null,
};

export const login = createAsyncThunk('auth/login', async ({ identifier, password }, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { identifier, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Terjadi kesalahan');
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
    try {
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, userData);
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Terjadi kesalahan');
    }
});

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, config);
      const updatedUserInfo = { ...userInfo, ...data };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      return updatedUserInfo;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data profil.');
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthState: (state) => {
      state.error = null;
    },
    logout: (state) => {
      localStorage.removeItem('userInfo');
      state.userInfo = null;
      state.error = null;
    },
    updateUserInfo: (state, action) => {
        state.userInfo = { ...state.userInfo, ...action.payload };
        localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
    },
    updateVerificationStatus: (state, action) => {
        if (state.userInfo) {
            state.userInfo.isVerified = action.payload;
            localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
        }
    },
    updateUserProfileInfo: (state, action) => {
        state.userInfo = action.payload;
        localStorage.setItem('userInfo', JSON.stringify(action.payload));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, updateUserInfo, updateVerificationStatus, updateUserProfileInfo, clearAuthState } = authSlice.actions;
export default authSlice.reducer;
