import React from 'react';
import { ViewMode } from '../types';

interface ViewSwitcherProps {
  currentView: ViewMode;
  onChange: (view: ViewMode) => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ currentView, onChange }) => {
  const views: { id: ViewMode; label: string }[] = [
    { id: 'day', label: 'יום' },
    { id: 'week', label: 'שבוע' },
    { id: 'month', label: 'חודש' },
  ];

  return (
    <div className="flex bg-gray-100 p-1 rounded-lg">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onChange(view.id)}
          className={`
            px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200
            ${
              currentView === view.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
};

export default ViewSwitcher;
