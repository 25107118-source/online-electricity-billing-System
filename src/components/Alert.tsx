import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} />;
      case 'error':
        return <AlertCircle size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  return (
    <div className={`gov-alert ${type}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {getIcon()}
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'inherit',
            display: 'flex',
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
