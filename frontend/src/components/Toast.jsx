import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const Toast = () => {
  const { toast, showToast } = useContext(AppContext);

  if (!toast) return null;

  const bgStyles = {
    success: 'bg-white border-l-4 border-success text-customText shadow-md',
    error: 'bg-white border-l-4 border-error text-customText shadow-md',
    info: 'bg-white border-l-4 border-primary text-customText shadow-md',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success mr-3" />,
    error: <AlertCircle className="w-5 h-5 text-error mr-3" />,
    info: <Info className="w-5 h-5 text-primary mr-3" />,
  };

  return (
    <div className="fixed top-5 right-5 z-50 animate-bounce duration-300 max-w-sm w-full">
      <div className={`p-4 rounded shadow-lg flex items-start justify-between ${bgStyles[toast.type] || bgStyles.info} border border-gray-100`}>
        <div className="flex items-center">
          {icons[toast.type] || icons.info}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      </div>
    </div>
  );
};

export default Toast;
