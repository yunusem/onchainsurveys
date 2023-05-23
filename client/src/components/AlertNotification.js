import React, { useContext, useEffect, useState } from 'react';
import AlertContext from '../contexts/AlertContext';

const AlertNotification = () => {
    const { alert } = useContext(AlertContext);
    const [letItShow, setLetItShow] = useState(alert.show);
    const [atype, setAlertType] = useState(alert.type && alert.type);
    const [message, setMessage] = useState(alert.message && alert.message);
    useEffect(() => {
        if (alert.message)
            setMessage(alert.message);
    }, [alert.message]);

    useEffect(() => {
        setLetItShow(alert.show);
    }, [alert.show]);

    useEffect(() => {
        if (alert.type)
            setAlertType(alert.type);
    }, [alert.type]);

    return (
        <div className={`absolute z-[100] top-20 right-2 p-3 min-w-48 rounded flex items-center space-x-4 text-slate-200 bg-slate-900 border-2 transition-all delay-500 duration-500 ease-in-out ${letItShow ? "opacity-100" : "opacity-0 pointer-events-none"} ${alert.type === "error" ? "border-red-500" : "border-green-500"} `}>
                <svg
                    className={`w-4 h-4 ${atype === "error" ? "text-red-500" : "text-green-500"}`}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path d={`${atype === "error" ? "M6 18L18 6M6 6l12 12" : "M5 13l4 4L19 7"}`}></path>
                </svg>
            <div className={`h-full w-64 break-all flex items-center ${atype === "hash" && "underline text-red-400"}`}>
                { atype === "hash" ? (<a href={`https://cspr.live/deploy/${message}`} target="_blank">{message}</a>) : (message) }
            </div>
        </div>
    );
};

export default AlertNotification;