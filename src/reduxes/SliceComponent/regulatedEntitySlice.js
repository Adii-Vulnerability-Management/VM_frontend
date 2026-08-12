import { createSlice } from '@reduxjs/toolkit';

const regulatedEntitySlice = createSlice({
  name: 'regulatedEntity',
  initialState: '',
  reducers: {
    setRegulatedEntity(state, action) {
      return action.payload;
    },
  },
});

export const { setRegulatedEntity } = regulatedEntitySlice.actions;
export default regulatedEntitySlice.reducer;
