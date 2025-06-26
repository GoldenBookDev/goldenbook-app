import * as Network from 'expo-network';
import { useEffect, useState } from 'react';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [networkState, setNetworkState] = useState<any>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkNetworkStatus = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        
        setIsConnected(networkState.isConnected ?? false);
        setNetworkState(networkState);
      } catch (error) {
        console.error('❌ Error checking network:', error);
        setIsConnected(false);
      }
    };

    // Check immediately
    checkNetworkStatus();

    // Check every 5 seconds
    intervalId = setInterval(checkNetworkStatus, 5000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return {
    isConnected,
    networkState,
    isWifi: networkState?.type === Network.NetworkStateType.WIFI,
    isCellular: networkState?.type === Network.NetworkStateType.CELLULAR
  };
};