import { useContext } from 'react';
import { SyncContext } from './SyncContext';

export const useSync = () => useContext(SyncContext);