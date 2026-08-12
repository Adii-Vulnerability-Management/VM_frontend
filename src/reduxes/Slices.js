// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   showEvidenceModal: false,
//   selectedItemSCFEvidence: null,
//   selectedSCFEvidence:null,
// };

// const userSlice = createSlice({
//   name: "Evidence", 
//   initialState,
//   reducers: {
//     setShowEvidenceModal: (state, action) => {
//       state.showEvidenceModal = action.payload;
//     },
//     setSelectedItemSCFEvidence: (state, action) => {
//       state.selectedItemSCFEvidence = action.payload;
//     },
//     setSelectedSCFEvidence:(state,action)=>{
//         state.selectedSCFEvidence=action.payload
//     }
//   },
// });

// export const { setShowEvidenceModal, setSelectedItemSCFEvidence,setSelectedSCFEvidence } = userSlice.actions;
// export default userSlice.reducer;

  // Slices.js
import { combineReducers } from "redux";
import userReducer from "./SliceComponent/UserSlice";
import dataReducer from "./SliceComponent/DataSlice"; // Correct the import path
import importSaveSlice from "./SliceComponent/ImportSaveSlice";
import ImportDropdownData from "./SliceComponent/ImportDropdownData";
import SingleFrameWorkData from "./SliceComponent/SingleFrameWorkDataSlice";
import evidenceReducer from "./SliceComponent/EvidenceSlice";
import categoryReducer from "./SliceComponent/categorySlice"; 
import regulatedEntityReducer from "./SliceComponent/regulatedEntitySlice";
import thresholdCategoryReducer from "./SliceComponent/thresholdCategorySlice";
import thresholdEntityReducer from "./SliceComponent/thresholdEntitySlice";

const rootReducer = combineReducers({
  user: userReducer,
  data: dataReducer, // Include the new slice
  importData:importSaveSlice,
  imprtCardData:ImportDropdownData,
  frameWorkData:SingleFrameWorkData,
  evidence: evidenceReducer,
  category: categoryReducer,
  regulatedEntity: regulatedEntityReducer,
  thresholdCategory: thresholdCategoryReducer,
  thresholdEntity: thresholdEntityReducer,
});

export default rootReducer;
