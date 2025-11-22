// components/CustomAlert.jsx
import { useState, useEffect } from "react";
import { 
  XMarkIcon, 
  CheckIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

export default function CustomAlert({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = "info", // success, error, warning, info, confirm
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  showCancel = false
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsLeaving(false);
      onClose();
    }, 200);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    handleClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    handleClose();
  };

  const getAlertConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: <CheckIcon className="w-8 h-8 text-pink-600" />,
          bgColor: "bg-pink-50",
          borderColor: "border-pink-200",
          headerBg: "bg-love-gradient"
        };
      case "error":
        return {
          icon: <ExclamationCircleIcon className="w-8 h-8 text-red-600" />,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          headerBg: "bg-passion-gradient"
        };
      case "warning":
        return {
          icon: <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />,
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          headerBg: "bg-gradient-to-r from-yellow-500 to-yellow-600"
        };
      case "confirm":
        return {
          icon: <InformationCircleIcon className="w-8 h-8 text-rose-600" />,
          bgColor: "bg-rose-50",
          borderColor: "border-rose-200",
          headerBg: "bg-romantic-gradient"
        };
      default: // info
        return {
          icon: <InformationCircleIcon className="w-8 h-8 text-pink-600" />,
          bgColor: "bg-pink-50",
          borderColor: "border-pink-200",
          headerBg: "bg-heart-gradient"
        };
    }
  };

  if (!isOpen || !isVisible) return null;

  const config = getAlertConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-200 ${
          isLeaving ? 'opacity-0' : 'opacity-50'
        }`}
        onClick={handleClose}
      />
      
      {/* Alert Modal */}
      <div className={`relative bg-white rounded-2xl shadow-2xl border ${config.borderColor} max-w-sm w-full transform transition-all duration-200 ${
        isLeaving ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        
        {/* Header */}
        <div className={`${config.headerBg} px-6 py-4 rounded-t-2xl flex items-center justify-between`}>
          <div className="flex items-center gap-3 text-white">
            {config.icon}
            <h3 className="text-lg font-semibold">
              {title || (type === 'success' ? 'Success' : 
                        type === 'error' ? 'Error' : 
                        type === 'warning' ? 'Warning' : 
                        type === 'confirm' ? 'Confirm' : 'Information')}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className={`${config.bgColor} px-6 py-6`}>
          <p className="text-gray-800 text-base leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-white rounded-b-2xl flex gap-3 justify-end">
          {showCancel && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              type === 'success' 
                ? 'btn-romantic'
                : type === 'error'
                ? 'btn-passion'
                : type === 'warning'
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'btn-romantic'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}