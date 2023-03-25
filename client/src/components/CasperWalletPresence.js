import { useState, useEffect } from 'react';

const CasperWalletPresence = () => {
    const [provider, setProvider] = useState(null);

    useEffect(() => {
        if (window.CasperWalletProvider) {
            const CasperWalletProvider = window.CasperWalletProvider;
            const options = {
                timeout: 1800000, // 30 minutes in milliseconds
            };
            const walletProvider = CasperWalletProvider(options);
            setProvider(walletProvider);
        } else {
            setProvider(null);
            console.log("Casper Wallet extension is NOT installed");
        }
    }, []);

    return provider;
};

export default CasperWalletPresence;
