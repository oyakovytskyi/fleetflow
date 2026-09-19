import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { UserDto } from '@fleetflow/shared-types';

/** Tokens deliberately absent — they live in SecureStore only. */
export interface AuthState {
  user: UserDto | null;
  /** False until SecureStore has been read once on launch. */
  isHydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  isHydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionRestored(state, action: PayloadAction<UserDto | null>) {
      state.user = action.payload;
      state.isHydrated = true;
    },
    signedIn(state, action: PayloadAction<UserDto>) {
      state.user = action.payload;
      state.isHydrated = true;
    },
    signedOut(state) {
      state.user = null;
      state.isHydrated = true;
    },
  },
  selectors: {
    selectUser: (state) => state.user,
    selectIsAuthenticated: (state) => state.user !== null,
    selectIsHydrated: (state) => state.isHydrated,
  },
});

export const { sessionRestored, signedIn, signedOut } = authSlice.actions;
export const { selectUser, selectIsAuthenticated, selectIsHydrated } = authSlice.selectors;
export default authSlice.reducer;
