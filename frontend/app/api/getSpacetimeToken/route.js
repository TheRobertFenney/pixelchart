import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';

// This should be a short-lived token (e.g., 1 hour)
const TEMP_TOKEN_EXPIRY = '1h';

export async function GET() {
  try {
    if (!process.env.SPACETIME_TOKEN) {
      return NextResponse.json({ error: 'Token not configured' }, { status: 500 });
    }

    // Create a temporary token with limited scope
    const tempToken = sign(
      {
        // Add any user-specific data or restrictions here
        scope: 'pixel-grid-read-write',
        // Add rate limiting info
        rateLimit: {
          updates: 100, // max updates per hour
          reads: 1000   // max reads per hour
        }
      },
      process.env.SPACETIME_TOKEN, // Use the actual token as signing key
      { 
        expiresIn: TEMP_TOKEN_EXPIRY,
        audience: 'pixel-grid-client'
      }
    );

    return NextResponse.json({ 
      token: tempToken,
      expiresIn: TEMP_TOKEN_EXPIRY 
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
} 