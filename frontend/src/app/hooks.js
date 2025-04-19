// import { useAppDispatch, useAppSelector } from './app/hooks';

// export const dispatch = useAppDispatch();
// export const authState = useAppSelector((state) => state.auth);



// src/app/hooks.js
import { useDispatch, useSelector } from 'react-redux';

// Export the hooks for use in components
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;