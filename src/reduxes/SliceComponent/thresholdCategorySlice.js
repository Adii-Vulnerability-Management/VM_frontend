import { createSlice } from '@reduxjs/toolkit';

const thresholdCategorySlice = createSlice({
  name: 'thresholdCategory',
  initialState: '',
  reducers: {
    setThresholdCategory(state, action) {
      return action.payload;
    },
  },
});

export const { setThresholdCategory } = thresholdCategorySlice.actions;
export default thresholdCategorySlice.reducer;
