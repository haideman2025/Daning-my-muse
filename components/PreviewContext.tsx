import React from 'react';

interface PreviewContextType {
  showPreview: (url: string) => void;
}

export const PreviewContext = React.createContext<PreviewContextType | null>(null);

export const usePreview = () => {
  const context = React.useContext(PreviewContext);
  if (!context) {
    throw new Error('usePreview must be used within a PreviewProvider');
  }
  return context;
};
