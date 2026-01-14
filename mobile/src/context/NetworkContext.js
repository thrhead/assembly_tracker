import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

const NetworkContext = createContext({
  isConnected: true,
  isInternetReachable: true,
});

export const NetworkProvider = ({ children }) => {
  const [connection, setConnection] = useState({
    isConnected: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    // Initial fetch
    NetInfo.fetch().then((state) => {
      setConnection({
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable ?? true,
      });
    });

    // Subscribe to changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      setConnection({
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable ?? true,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <NetworkContext.Provider value={connection}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
