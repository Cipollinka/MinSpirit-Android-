import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
};

export const saveUserData = createAsyncThunk('user/saveUserData', async (userData) => {
  try {
    await AsyncStorage.setItem('entriedUser', JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
});

export const loadUserData = createAsyncThunk('user/loadUserData', async () => {
  try {
    const storedEntUser = await AsyncStorage.getItem('entriedUser');
    return storedEntUser ? JSON.parse(storedEntUser) : initialState;
  } catch (error) {
    console.error('Error loading user data:', error);
    return initialState;
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action) => {
      return { ...state, ...action.payload };
    },
    updateUserData: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetUserData: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserData.fulfilled, (state, action) => {
        return { ...state, ...action.payload };
      });
  },
});

export const { setUserData, updateUserData, resetUserData } = userSlice.actions;
export default userSlice.reducer;
