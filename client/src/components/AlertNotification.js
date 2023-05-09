import React, { useContext, useEffect, useState } from 'react';
import AlertContext from '../contexts/AlertContext';

const AlertNotification = () => {
    const { alert } = useContext(AlertContext);
    const [letItShow, setLetItShow] = useState(alert.show);
    const [message, setMessage] = useState(alert.message && alert.message);
    useEffect(() => {
        if (alert.message)
            setMessage(alert.message);
    }, [alert.message]);

    useEffect(() => {
        setLetItShow(alert.show);
    }, [alert.show]);

    return (
        <div className={`absolute z-[100] top-20 right-2 p-3 h-16 min-w-48 rounded flex items-center space-x-4 text-slate-200 bg-slate-900 border-2 transition-all duration-500 ease-in-out ${letItShow ? "opacity-100" : "opacity-0"} ${alert.type === "success" ? "border-green-500" : "border-red-500"} `}>
            {alert.type === "error" ?
            (<svg
                className="w-4 h-4 text-red-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>)
            :(<svg
                className="w-4 h-4 text-green-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path d="M5 13l4 4L19 7"></path>
            </svg>)
            }
            <div className="h-full w-52 break-words flex items-center">
                {message}
            </div>
        </div>
    );
};

export default AlertNotification;