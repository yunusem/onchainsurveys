import { useState, useEffect } from 'react';

const CasperWalletPresence = () => {
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const checkCasperWalletProvider = async () => {
      while (!window.CasperWalletProvider) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const options = {
        timeout: 1800000, // 30 minutes in milliseconds
      };

      const walletProvider = new window.CasperWalletProvider(options);
      setProvider(walletProvider);
    };

    checkCasperWalletProvider().catch(() => {
      setProvider(null);
      console.log("Casper Wallet extension is NOT installed");
    });
  }, []);

  return provider;
};

export default CasperWalletPresence;
