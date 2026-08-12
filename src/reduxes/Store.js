
import { configureStore } from "@reduxjs/toolkit";
import reducer from "./Slices" // Correct the import path

export const store = configureStore({
    reducer: reducer,
});


