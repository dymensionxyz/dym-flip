import { Bounce, toast, TypeOptions } from 'react-toastify';

export const showToast = (message: string, type: TypeOptions) => toast(message, {
    position: 'top-center',
    autoClose: 5000,
    hideProgressBar: true,
    theme: 'colored',
    transition: Bounce,
    type,
});

export const showErrorToast = (message: string) => showToast(message, 'error');

export const showWarningToast = (message: string) => showToast(message, 'warning');

export const showSuccessToast = (message: string) => showToast(message, 'success');
