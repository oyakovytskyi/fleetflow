import { configureStore } from '@reduxjs/toolkit';

import auth from './slices/authSlice';
import network from './slices/networkSlice';
import tracking from './slices/trackingSlice';

export const store = configureStore({
  reducer: { auth, tracking, network },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
