import { useContext } from 'react';
import { SyncContext } from './SyncContext.js';

export const useSync = () => useContext(SyncContext);