// hooks/useCustomAlert.js
import { useState } from 'react';
import { playSound } from '../utils/simpleSound';

export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false,
    onConfirm: null,
    onCancel: null
  });

  const showAlert = ({
    title,
    message,
    type = 'info',
    confirmText = 'OK',
    cancelText = 'Cancel',
    showCancel = false,
    onConfirm,
    onCancel
  }) => {
    setAlertConfig({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      cancelText,
      showCancel,
      onConfirm,
      onCancel
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Convenience methods with sound
  const showSuccess = (message, title = 'Success!') => {
    showAlert({ title, message, type: 'success' });
    // Play sound after showing alert to ensure user interaction
    setTimeout(() => playSound('success'), 100);
  };

  const showError = (message, title = 'Error!') => {
    showAlert({ title, message, type: 'error' });
    // Play sound after showing alert to ensure user interaction
    setTimeout(() => playSound('error'), 100);
  };

  const showWarning = (message, title = 'Warning!') => {
    showAlert({ title, message, type: 'warning' });
    setTimeout(() => playSound('error'), 100);
  };

  const showInfo = (message, title = 'Information') => {
    showAlert({ title, message, type: 'info' });
    setTimeout(() => playSound('notification'), 100);
  };

  const showConfirm = (message, onConfirm, title = 'Confirm Action') => {
    showAlert({ 
      title, 
      message, 
      type: 'confirm', 
      showCancel: true,
      confirmText: 'Yes',
      cancelText: 'No',
      onConfirm 
    });
  };

  return {
    alertConfig,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  };
};