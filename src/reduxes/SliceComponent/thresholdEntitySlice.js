import { createSlice } from "@reduxjs/toolkit";

const thresholdEntitySlice = createSlice({
  name: "thresholdEntity",
  initialState: "",
  reducers: {
    setThresholdEntity: (_state, action) => action.payload,
  },
});

export const { setThresholdEntity } = thresholdEntitySlice.actions;
export default thresholdEntitySlice.reducer;
