import React, { useContext } from 'react';
import AlertContext from '../contexts/AlertContext';

const AlertNotification = () => {
    const { alert } = useContext(AlertContext);
    const letItShow = alert.show;
    return (
        <>
            {(
                <div
                    className={`fixed bottom-4 right-4 p-4 h-16 rounded-lg text-white ${alert.type === 'success' ? 'bg-green-500' : 'bg-slate-800 border border-red-500'} ${letItShow ? 'opacity-100' : 'opacity-0'} transition-all duration-500 ease-in-out' : 'hidden'} flex items-center space-x-4`}>
                    <svg
                        className="w-4 h-4 text-red-500"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    <span>
                        {alert.message}
                    </span>
                </div>
            )}
        </>
    );
};

export default AlertNotification;