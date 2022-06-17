import { AppDispatch, AppState } from '~/app';
import { useDispatch, useSelector } from 'react-redux';

export { default } from './useEventListener';
export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppState = <T extends (state: AppState) => any>(
  selector: T
): ReturnType<T> => useSelector(selector);
