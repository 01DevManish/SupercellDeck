'use client'; // This is necessary because we are using client-side hooks (useState, useEffect).

import { useState, useEffect } from 'react';

// An expanded TypeScript interface to define the structure of card data, including optional stats.
interface Card {
  id: number;
  name: string;
  elixirCost: number;
  iconUrls: {
    medium: string;
  };
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Champion';
  // Stats are optional as they don't apply to all card types (e.g., spells).
  hitpoints?: number; 
  damage?: number;
}

// A simple map to get YouTube video IDs for specific cards.
// In a full application, this could be fetched from a database or a more extensive list.
const videoMap: { [key: string]: string } = {
  'P.E.K.K.A.': 'F66-i5Ohp-w',
  'Hog Rider': '_3_212b_4hA',
  'Wizard': 'Xt_N4m7gJ78',
  'Golem': 'p_dYV5v-sGI',
  'Goblin Barrel': 'fsZ2-pH48yY',
  'Knight': 'i-3-n-p-mBE',
};

export default function HomePage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch('/api/cards');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to load card data.');
        }
        const data = await response.json();
        // The API returns stats at a default level (e.g., level 9 or 11). We'll use those.
        setCards(data.cards);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  return (
    <>
      <main className="min-h-screen w-full bg-[url('https://supercell.com/images/180104_clashroyale_bg_pattern.png')] bg-cover bg-center text-white">
        <div className="min-h-screen w-full bg-black/70 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8">
            <header className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 drop-shadow-lg">Clash Royale Card Database</h1>
              <p className="text-gray-300 mt-2">Explore every card in the game.</p>
            </header>

            {loading && <Loader />}
            {error && <ErrorMessage message={error} />}
            
            {!loading && !error && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {cards.map(card => (
                  <CardComponent key={card.id} card={card} onCardClick={() => setSelectedCard(card)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      {selectedCard && (
        <VideoModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </>
  );
}

// --- Helper Components ---
const CardComponent = ({ card, onCardClick }: { card: Card; onCardClick: () => void; }) => {
  const { elixirCost, iconUrls, name, rarity, hitpoints, damage } = card;

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
    <div 
      className={`p-2 border-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer flex flex-col justify-between ${rarityClass}`}
      onClick={onCardClick}
    >
      <div>
        <div className="relative">
          <img src={iconUrls.medium} alt={name} className="w-full h-auto rounded-md" />
          <div className="absolute -top-3 -left-3 bg-purple-600 text-white text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full border-2 border-purple-800 shadow-lg">
            {elixirCost}
          </div>
        </div>
        <h3 className="text-center text-sm md:text-base font-semibold mt-2 truncate">{name}</h3>
      </div>
      <div className="text-xs text-center mt-2 space-y-1 text-gray-300">
        {hitpoints && <p className="flex items-center justify-center gap-1">❤️ <span className="font-bold text-white">{hitpoints}</span> HP</p>}
        {damage && <p className="flex items-center justify-center gap-1">⚔️ <span className="font-bold text-white">{damage}</span> DMG</p>}
      </div>
    </div>
  );
};

const VideoModal = ({ card, onClose }: { card: Card; onClose: () => void; }) => {
  const videoId = videoMap[card.name];
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 p-4 rounded-lg shadow-2xl w-11/12 max-w-2xl border-2 border-yellow-400 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-4 -right-4 bg-red-600 text-white rounded-full w-8 h-8 text-xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-yellow-300">{card.name} - Video Preview</h2>
        {videoId ? (
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-md"
            ></iframe>
          </div>
        ) : (
          <p className="text-center text-gray-400 p-8">Sorry, a video preview for this card is not available yet.</p>
        )}
      </div>
    </div>
  );
};

const Loader = () => (
  <div className="text-center">
    <div className="loader mx-auto"></div>
    <p className="mt-4 text-lg">Loading Cards...</p>
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="text-center bg-red-500/80 p-4 rounded-lg max-w-md mx-auto">
    <p className="font-bold">An Error Occurred</p>
    <p>{message}</p>
  </div>
);

