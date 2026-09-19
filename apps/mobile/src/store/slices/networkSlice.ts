import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface NetworkState {
  isOnline: boolean;
}

const initialState: NetworkState = {
  isOnline: true,
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    connectivityChanged(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },
  },
  selectors: {
    selectIsOnline: (state) => state.isOnline,
  },
});

export const { connectivityChanged } = networkSlice.actions;
export const { selectIsOnline } = networkSlice.selectors;
export default networkSlice.reducer;
