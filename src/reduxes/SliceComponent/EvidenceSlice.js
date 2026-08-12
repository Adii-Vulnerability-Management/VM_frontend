import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showEvidenceModal: false,
  selectedItemSCFEvidence: null,
  selectedSCFEvidence: null,
};

const evidenceSlice = createSlice({
  name: "Evidence", 
  initialState,
  reducers: {
    setShowEvidenceModal: (state, action) => {
      state.showEvidenceModal = action.payload;
    },
    setSelectedItemSCFEvidence: (state, action) => {
      state.selectedItemSCFEvidence = action.payload;
    },
    setSelectedSCFEvidence: (state, action) => {
      state.selectedSCFEvidence = action.payload;
    },
  },
});

export const { setShowEvidenceModal, setSelectedItemSCFEvidence, setSelectedSCFEvidence } = evidenceSlice.actions;
export default evidenceSlice.reducer;
