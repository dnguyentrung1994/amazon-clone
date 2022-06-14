import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IApp {
  theme: string;
}

const initialState: IApp = {
  theme: 'dark',
};

export const appSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    setAppState: (state, action: PayloadAction<Partial<IApp>>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setAppState } = appSlice.actions;

export default appSlice.reducer;
