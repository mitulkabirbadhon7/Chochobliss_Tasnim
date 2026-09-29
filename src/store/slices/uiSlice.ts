import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UiState {
  isMobileMenuOpen: boolean;
  activeCategory: string;
}

const initialState: UiState = {
  isMobileMenuOpen: false,
  activeCategory: "All",
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },
    setActiveCategory: (state, action: PayloadAction<string>) => {
      state.activeCategory = action.payload;
    },
  },
});

export const { toggleMobileMenu, setMobileMenuOpen, setActiveCategory } = uiSlice.actions;

export const selectIsMobileMenuOpen = (state: { ui: UiState }) => state.ui.isMobileMenuOpen;
export const selectActiveCategory = (state: { ui: UiState }) => state.ui.activeCategory;

export default uiSlice.reducer;
