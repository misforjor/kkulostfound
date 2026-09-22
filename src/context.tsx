import { createContext, useContext } from 'react';
import type { User, AppView } from './types';

export interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
  navigate: (v: AppView) => void;
  view: AppView;
  refresh: () => void;
}

export const AppContext = createContext<AppContextType>(null!);
export const useApp = () => useContext(AppContext);
