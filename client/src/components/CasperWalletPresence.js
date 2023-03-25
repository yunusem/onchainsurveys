import { useState, useEffect } from 'react';

const CasperWalletPresence = () => {
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    if (window.CasperWalletProvider) {
      setProvider(window.CasperWalletProvider);
      console.log("Casper Wallet extension is installed");
    } else {
      setProvider(null);
      console.log("Casper Wallet extension is NOT installed");
    }
  }, []);

  return provider;
};

export default CasperWalletPresence;
