

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cardDetails: [],
  webshocketmessage:{}
};

const DataCard = createSlice({
  name: "ImportCardData", 
  initialState,
  reducers: {
    setCardDetails: (state, action) => {
      state.cardDetails = action.payload;
    },
    setWebShocketMessage:(state,action)=>{
      state.webshocketmessage=action.payload
    }
  },
});

export const {setCardDetails,setWebShocketMessage} = DataCard.actions;
export default DataCard.reducer;

  