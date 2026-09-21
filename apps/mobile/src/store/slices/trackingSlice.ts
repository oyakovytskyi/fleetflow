import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { LocationSampleDto, WsConnectionStatus } from '@fleetflow/shared-types';

export interface TrackingState {
  isTracking: boolean;
  activeDeliveryId: string | null;
  currentLocation: LocationSampleDto | null;
  connectionStatus: WsConnectionStatus;
  /** Count of samples waiting in AsyncStorage offline queue. */
  pendingCount: number;
  lastError: string | null;
}

const initialState: TrackingState = {
  isTracking: false,
  activeDeliveryId: null,
  currentLocation: null,
  connectionStatus: 'DISCONNECTED',
  pendingCount: 0,
  lastError: null,
};

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    trackingStarted(state, action: PayloadAction<string>) {
      state.isTracking = true;
      state.activeDeliveryId = action.payload;
      state.lastError = null;
    },
    trackingStopped(state) {
      state.isTracking = false;
      state.activeDeliveryId = null;
    },
    locationReceived(state, action: PayloadAction<LocationSampleDto>) {
      state.currentLocation = action.payload;
    },
    connectionStatusChanged(state, action: PayloadAction<WsConnectionStatus>) {
      state.connectionStatus = action.payload;
    },
    pendingCountChanged(state, action: PayloadAction<number>) {
      state.pendingCount = action.payload;
    },
    queueFlushed(state) {
      state.pendingCount = 0;
    },
    trackingFailed(state, action: PayloadAction<string>) {
      state.isTracking = false;
      state.lastError = action.payload;
    },
  },
  selectors: {
    selectIsTracking: (state) => state.isTracking,
    selectActiveDeliveryId: (state) => state.activeDeliveryId,
    selectCurrentLocation: (state) => state.currentLocation,
    selectConnectionStatus: (state) => state.connectionStatus,
    selectPendingCount: (state) => state.pendingCount,
  },
});

export const {
  trackingStarted,
  trackingStopped,
  locationReceived,
  connectionStatusChanged,
  pendingCountChanged,
  queueFlushed,
  trackingFailed,
} = trackingSlice.actions;

export const {
  selectIsTracking,
  selectActiveDeliveryId,
  selectCurrentLocation,
  selectConnectionStatus,
  selectPendingCount,
} = trackingSlice.selectors;

export default trackingSlice.reducer;
