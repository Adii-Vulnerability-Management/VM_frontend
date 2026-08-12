
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cover: [],
  informationSecurity: [],
  dataProtection: [],
  prototypeProtection: [],
};

const dataSlice = createSlice({
  name: "Data",
  initialState,
  reducers: {
    setCoverData: (state, action) => {
      state.cover = action.payload;
    },
    setInformationSecurityData: (state, action) => {
      state.informationSecurity = action.payload;
    },
    setDataProtectionData: (state, action) => {
      state.dataProtection = action.payload;
    },
    setPrototypeProtectionData: (state, action) => {
      state.prototypeProtection = action.payload;
    },
  },
});

export const {
  setCoverData,
  setInformationSecurityData,
  setDataProtectionData,
  setPrototypeProtectionData,
} = dataSlice.actions;
export default dataSlice.reducer;
