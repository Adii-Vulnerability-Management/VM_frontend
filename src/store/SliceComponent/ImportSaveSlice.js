

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  import_tisax_cover: {},
  information_securityQnA: [],
  v603information_securityQnA:[],
  data_protectionQnA: [],
  v603data_protectionQnA: [],
  prototype_protectionQnA: [],
};

const ImportdataSlice = createSlice({
  name: "ImportData",
  initialState,
  reducers: {
    setImportCoverData: (state, action) => {
      state.import_tisax_cover = action.payload;
    },
    setImportInformationSecurityData: (state, action) => {
      state.information_securityQnA = action.payload;
    },
    setImportInformationSecurityDatav603: (state, action) => {
      state.v603information_securityQnA = action.payload;
    },
    setImportDataProtectionData: (state, action) => {
      state.data_protectionQnA = action.payload;
    },
    setImportDataProtectionDatav603: (state, action) => {
      state.v603data_protectionQnA = action.payload;
    },

    setImportPrototypeProtectionData: (state, action) => {
      state.prototype_protectionQnA = action.payload;
    },
  },
});

export const {
  setImportCoverData,
  setImportInformationSecurityData,
  setImportInformationSecurityDatav603,
  setImportDataProtectionData,
  setImportDataProtectionDatav603,
  setImportPrototypeProtectionData,
} = ImportdataSlice.actions;
export default ImportdataSlice.reducer;

