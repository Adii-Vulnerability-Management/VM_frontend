import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  frameWorkData: {},
  frameWorkControlData:{}
};

const singleFrameWorkSlice = createSlice({
  name: "singleFrameWorkData",
  initialState,
  reducers: {
    setFrameWorkData(state, action) {
      state.frameWorkData = action.payload;
    },
    updateFrameWorkData(state, action) {
      state.frameWorkData = { ...state.frameWorkData, ...action.payload };
    },
    setFrameWorkControlData(state, action) {
      state.frameWorkControlData = action.payload;
    },
    updateFrameWorkControlData(state, action) {
      state.frameWorkControlData = { ...state.frameWorkControlData, ...action.payload };
    },
  },
});

export const { setFrameWorkData,updateFrameWorkData,setFrameWorkControlData,updateFrameWorkControlData } = singleFrameWorkSlice.actions;
export default singleFrameWorkSlice.reducer;
