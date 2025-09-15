// This file has been updated to remove the unused 'request' parameter,
// which resolves the ESLint warning.

import { NextResponse } from 'next/server';

export async function GET() { // 'request' parameter removed
  const apiKey = process.env.SUPERCELL_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { message: 'API key is not configured on the server.' },
      { status: 500 }
    );
  }

  const apiUrl = 'https://api.clashroyale.com/v1/cards';
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Accept': 'application/json',
  };

  try {
    const apiResponse = await fetch(apiUrl, { headers });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      return NextResponse.json(
        { message: errorData.reason || 'Failed to fetch data from Supercell API.' },
        { status: apiResponse.status }
      );
    }

    const data = await apiResponse.json();
    // The 'items' array contains all card details needed by the frontend.
    return NextResponse.json({ cards: data.items });

  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}

