import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getSpacetimeClient } from '../spacetime-client';
import type { Pixel } from '../../module_bindings/pixel_type';

// Define the state type for better type safety
interface SpacetimeState {
  isConnected: boolean;
  error: string | null;
  pixels: Pixel[];
}

export function useSpacetime() {
  // Get user information from Clerk
  const { user, isLoaded: isUserLoaded } = useUser();
  
  // Manage SpacetimeDB state
  const [state, setState] = useState<SpacetimeState>({
    isConnected: false,
    error: null,
    pixels: []
  });

  useEffect(() => {
    console.log('useSpacetime effect triggered:', {
      isUserLoaded,
      hasUser: !!user,
      moduleAddress: process.env.NEXT_PUBLIC_SPACETIME_MODULE_ADDRESS
    });

    // Don't proceed if user data isn't loaded or module address is missing
    if (!isUserLoaded || !process.env.NEXT_PUBLIC_SPACETIME_MODULE_ADDRESS) {
      console.log('Skipping SpacetimeDB connection:', {
        reason: !isUserLoaded ? 'User not loaded' : 'Missing module address'
      });
      return;
    }

    // Get the SpacetimeDB client instance
    console.log('Getting SpacetimeDB client instance...');
    const client = getSpacetimeClient(process.env.NEXT_PUBLIC_SPACETIME_MODULE_ADDRESS);

    // Try to connect to SpacetimeDB
    async function connectToSpacetime() {
      try {
        console.log('Attempting to connect to SpacetimeDB...');
        await client.connect();
        console.log('Successfully connected to SpacetimeDB');
        
        setState(prev => ({ ...prev, isConnected: true }));

        // If user is authenticated, sync with Clerk
        if (user) {
          console.log('Syncing Clerk user with SpacetimeDB:', {
            userId: user.id,
            hasEmail: !!user.emailAddresses?.[0]?.emailAddress,
            hasUsername: !!user.username
          });
          
          client.syncClerkUser(
            user.id,
            user.emailAddresses?.[0]?.emailAddress,
            user.username || undefined
          );
        }

        // Subscribe to grid updates
        console.log('Setting up grid update subscription...');
        const unsubscribe = client.onGridUpdate((updatedPixels) => {
          console.log('Received grid update:', {
            pixelCount: updatedPixels.length
          });
          setState(prev => ({ ...prev, pixels: updatedPixels }));
        });

        return unsubscribe;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
        console.error('SpacetimeDB connection error:', {
          error: errorMessage,
          details: err
        });
        setState(prev => ({ ...prev, error: errorMessage }));
      }
    }

    // Connect and store the unsubscribe function
    let unsubscribe: (() => void) | undefined;
    connectToSpacetime().then(unsub => {
      console.log('SpacetimeDB connection process completed');
      unsubscribe = unsub;
    });

    // Cleanup function
    return () => {
      console.log('Running useSpacetime cleanup...');
      unsubscribe?.();
      client.disconnect();
      setState(prev => ({ ...prev, isConnected: false }));
    };
  }, [user, isUserLoaded]); // Only re-run if user or isUserLoaded changes

  // Return the current state and client (if connected)
  return {
    ...state,
    client: state.isConnected && process.env.NEXT_PUBLIC_SPACETIME_MODULE_ADDRESS 
      ? getSpacetimeClient(process.env.NEXT_PUBLIC_SPACETIME_MODULE_ADDRESS)
      : null
  };
} 