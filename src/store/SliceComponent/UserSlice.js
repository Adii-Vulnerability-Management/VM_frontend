import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showEvidenceModal: false,
  selectedItemSCFEvidence: null,
  selectedSCFEvidence:null,
  showSelectedScfControlModel:false,
  stopDefaultOpenScfControlModel:false
};

const userSlice = createSlice({
  name: "Evidence", 
  initialState,
  reducers: {
    setShowEvidenceModal: (state, action) => {
      state.showEvidenceModal = action.payload;
    },
    setShowSelectedScfControlModel: (state, action) => {
      state.showSelectedScfControlModel = action.payload;
    },
    setSelectedItemSCFEvidence: (state, action) => {
      state.selectedItemSCFEvidence = action.payload;
    },
    setSelectedSCFEvidence:(state,action)=>{
        state.selectedSCFEvidence=action.payload
    },
    setStopDefaultOpenScfControlModel:(state,action)=>{
        state.stopDefaultOpenScfControlModel=action.payload
    }
  },
});

export const { setShowEvidenceModal, setSelectedItemSCFEvidence,setSelectedSCFEvidence ,setShowSelectedScfControlModel ,setStopDefaultOpenScfControlModel } = userSlice.actions;
export default userSlice.reducer;

  