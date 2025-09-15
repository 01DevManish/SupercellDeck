// Yeh file app router ke conventions ke hisaab se hai.
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Suraksha ke liye, API Key ko Environment Variable se lein.
  const apiKey = process.env.SUPERCELL_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { message: 'Server par API key configure nahi hai.' },
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
        { message: errorData.reason || 'Supercell API se data fetch nahi ho paya.' },
        { status: apiResponse.status }
      );
    }

    const data = await apiResponse.json();
    return NextResponse.json({ cards: data.items });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
