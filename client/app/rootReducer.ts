import app from './slices/app';
import { combineReducers } from '@reduxjs/toolkit';

const rootReducer = combineReducers({
  app,
});

export default rootReducer;
