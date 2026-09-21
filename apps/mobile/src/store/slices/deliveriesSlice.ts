import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** UI-only delivery selection (lists come from TanStack Query). */
export interface DeliveriesUiState {
  selectedDeliveryId: string | null;
}

const initialState: DeliveriesUiState = {
  selectedDeliveryId: null,
};

const deliveriesSlice = createSlice({
  name: 'deliveries',
  initialState,
  reducers: {
    deliverySelected(state, action: PayloadAction<string | null>) {
      state.selectedDeliveryId = action.payload;
    },
  },
  selectors: {
    selectSelectedDeliveryId: (state) => state.selectedDeliveryId,
  },
});

export const { deliverySelected } = deliveriesSlice.actions;
export const { selectSelectedDeliveryId } = deliveriesSlice.selectors;
export default deliveriesSlice.reducer;
