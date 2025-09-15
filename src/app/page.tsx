'use client'; // Yeh zaroori hai kyunki hum client-side hooks (useState, useEffect) istemal kar rahe hain.

import { useState, useEffect } from 'react';
import Image from 'next/image'; // next/image ko import karein

// Card data ke structure ko define karne ke liye ek TypeScript interface
interface Card {
  id: number;
  name: string;
  elixirCost: number;
  iconUrls: {
    medium: string;
  };
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Champion';
}

export default function HomePage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch('/api/cards');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Cards load nahi ho paye.');
        }
        
        const data = await response.json();
        setCards(data.cards);
      } catch (err) {
        // Error ko 'unknown' type se handle karein aur check karein
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Ek anjaan error aayi.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  return (
    <main className="min-h-screen w-full bg-[url('https://supercell.com/images/180104_clashroyale_bg_pattern.png')] bg-cover bg-center text-white">
      <div className="min-h-screen w-full bg-black/70 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 drop-shadow-lg">Clash Royale - Saare Cards</h1>
            <p className="text-gray-300 mt-2">Game ke har card ki jaankari.</p>
          </header>

          {loading && <Loader />}
          {error && <ErrorMessage message={error} />}
          
          {!loading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {cards.map(card => <CardComponent key={card.id} card={card} />)}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// --- Helper Components ---
const CardComponent = ({ card }: { card: Card }) => {
  const { elixirCost, iconUrls, name, rarity } = card;

  if (!iconUrls?.medium) return null;

  const rarityClasses = {
    'Common': 'border-gray-400 bg-gray-800/70',
    'Rare': 'border-yellow-500 bg-yellow-900/40',
    'Epic': 'border-purple-500 bg-purple-900/40',
    'Legendary': 'border-sky-400 bg-sky-900/40',
    'Champion': 'border-orange-400 bg-orange-900/40'
  };
  const rarityClass = rarityClasses[rarity] || 'border-gray-600';

  return (
    <div className={`p-2 border-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl ${rarityClass}`}>
      <div className="relative">
        {/* <img> tag ko <Image> component se replace karein */}
        <Image 
          src={iconUrls.medium} 
          alt={name} 
          width={150} // Width aur height zaroori hai
          height={180}
          style={{ width: '100%', height: 'auto' }} // Responsive banane ke liye
          className="rounded-md"
        />
        <div className="absolute -top-3 -left-3 bg-purple-600 text-white text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full border-2 border-purple-800 shadow-lg">
          {elixirCost}
        </div>
      </div>
      <h3 className="text-center text-sm md:text-base font-semibold mt-2 truncate">{name}</h3>
    </div>
  );
};

const Loader = () => (
  <div className="text-center">
    <div className="loader mx-auto"></div>
    <p className="mt-4 text-lg">Cards Load Ho Rahe Hain...</p>
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="text-center bg-red-500/80 p-4 rounded-lg max-w-md mx-auto">
    <p className="font-bold">Ek Error Aayi</p>
    <p>{message}</p>
  </div>
);

