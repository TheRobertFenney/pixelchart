import { DbConnection, ErrorContext, Pixel } from '../module_bindings';

// Simple configuration type for the client
interface SpacetimeConfig {
  moduleAddress: string;
  uri?: string;
}

export class SpacetimeClient {
  private connection: DbConnection;
  private subscribers: Set<(pixels: Pixel[]) => void> = new Set();
  private isConnected: boolean = false;

  constructor(config: SpacetimeConfig) {
    // Get the base URI from config or environment
    const baseUri = config.uri || process.env.NEXT_PUBLIC_SPACETIME_URI || 'localhost:3000';
    
    // Construct the full URI with protocol
    const uri = `http://${baseUri}`;

    console.log('Initializing SpacetimeClient with config:', {
      moduleAddress: config.moduleAddress,
      uri
    });

    try {
      // Initialize the connection with SpacetimeDB
      this.connection = DbConnection.builder()
        .withModuleName(config.moduleAddress)
        .withUri(uri)
        .onConnect((ctx, identity, token) => {
          console.log('SpacetimeDB Connection Successful:', {
            identity: identity?.toHexString(),
            token: token ? 'present' : 'absent'
          });
          this.isConnected = true;
          this.setupSubscriptions();
        })
        .onConnectError((ctx: ErrorContext, error: Error) => {
          console.error('SpacetimeDB Connection Error:', {
            error: error.message,
            stack: error.stack,
            context: ctx
          });
          this.isConnected = false;
        })
        .onDisconnect((ctx: ErrorContext, error?: Error) => {
          this.isConnected = false;
          if (error) {
            console.error('SpacetimeDB Disconnected with error:', {
              error: error.message,
              stack: error.stack,
              context: ctx
            });
          } else {
            console.log('SpacetimeDB Disconnected normally');
          }
        })
        .build();

      console.log('SpacetimeDB connection object built successfully');
    } catch (error) {
      console.error('Failed to build SpacetimeDB connection:', error);
      throw error;
    }
  }

  // Set up subscriptions to the pixel table
  private setupSubscriptions() {
    try {
      console.log('Setting up SpacetimeDB subscriptions...');
      
      // Subscribe to all pixels
      this.connection.subscriptionBuilder()
        .onApplied(() => {
          console.log('Pixel subscription applied successfully');
          this.updatePixels(); // Initial pixel update
        })
        .onError((ctx: ErrorContext) => {
          console.error('Subscription error:', {
            error: ctx.event,
            context: ctx
          });
        })
        .subscribe('SELECT * FROM pixel');

      // Listen for pixel insertions
      this.connection.db.pixel.onInsert(() => {
        console.log('Pixel insertion detected');
        this.updatePixels();
      });

      // Listen for pixel deletions
      this.connection.db.pixel.onDelete(() => {
        console.log('Pixel deletion detected');
        this.updatePixels();
      });

      console.log('All subscriptions set up successfully');
    } catch (error) {
      console.error('Failed to setup subscriptions:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }

  // Update and notify subscribers about pixel changes
  private updatePixels() {
    const pixels = Array.from(this.connection.db.pixel.iter()) as Pixel[];
    console.log('Updating pixels:', {
      count: pixels.length,
      firstFew: pixels.slice(0, 3)
    });
    this.notifySubscribers(pixels);
  }

  // Connect to SpacetimeDB
  async connect(): Promise<void> {
    console.log('Starting SpacetimeDB connection process...');

    if (this.isConnected) {
      console.log('Already connected to SpacetimeDB');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      console.log('Waiting for WebSocket connection to establish...');
      
      const timeout = setTimeout(() => {
        const error = new Error('Connection timeout after 10000ms');
        console.error('SpacetimeDB connection timeout:', {
          error: error.message,
          stack: error.stack
        });
        reject(error);
      }, 10000); // Increased timeout to 10 seconds

      let attempts = 0;
      const checkConnection = setInterval(() => {
        attempts++;
        console.log(`Connection check attempt ${attempts}...`);
        
        if (this.isConnected) {
          console.log('Connection check successful');
          clearInterval(checkConnection);
          clearTimeout(timeout);
          resolve();
        } else if (attempts >= 100) { // Increased attempts for 10 second timeout
          clearInterval(checkConnection);
          clearTimeout(timeout);
          const error = new Error('Connection failed after 100 attempts');
          console.error('SpacetimeDB connection failed:', {
            error: error.message,
            attempts
          });
          reject(error);
        }
      }, 100);
    });
  }

  // Disconnect from SpacetimeDB
  disconnect(): void {
    console.log('Disconnecting from SpacetimeDB...');
    if (this.isConnected) {
      this.connection.disconnect();
      this.isConnected = false;
      console.log('Successfully disconnected from SpacetimeDB');
    } else {
      console.log('Already disconnected from SpacetimeDB');
    }
  }

  // Subscribe to grid updates
  onGridUpdate(callback: (pixels: Pixel[]) => void): () => void {
    console.log('New grid update subscriber added');
    this.subscribers.add(callback);
    return () => {
      console.log('Grid update subscriber removed');
      this.subscribers.delete(callback);
    };
  }

  // Notify all subscribers about pixel updates
  private notifySubscribers(pixels: Pixel[]) {
    console.log(`Notifying ${this.subscribers.size} subscribers about pixel update`);
    for (const subscriber of this.subscribers) {
      subscriber(pixels);
    }
  }

  // Paint pixels on the grid
  paint(positions: number[], color: string | undefined): void {
    if (!this.isConnected) {
      console.warn('Cannot paint: not connected to SpacetimeDB');
      return;
    }
    console.log('Painting pixels:', { positions, color });
    this.connection.reducers.paint(positions, color);
  }

  // Sync Clerk user with SpacetimeDB
  syncClerkUser(clerkId: string, email?: string, username?: string): void {
    if (!this.isConnected) {
      console.warn('Cannot sync user: not connected to SpacetimeDB');
      return;
    }
    console.log('Syncing Clerk user:', { clerkId, email, username });
    this.connection.reducers.syncClerkUser(clerkId, email, username);
  }

  // Clear the grid (admin only)
  clearGrid(): void {
    if (!this.isConnected) {
      console.warn('Cannot clear grid: not connected to SpacetimeDB');
      return;
    }
    console.log('Clearing grid');
    this.connection.reducers.clearGrid();
  }
}

// Create and manage a single instance of the client
let clientInstance: SpacetimeClient | null = null;

export function getSpacetimeClient(moduleAddress: string): SpacetimeClient {
  if (!clientInstance) {
    console.log('Creating new SpacetimeClient instance');
    clientInstance = new SpacetimeClient({ moduleAddress });
  }
  return clientInstance;
} 