'use client'; // Client-side hooks (useState, useEffect) ke liye zaroori hai.

import { useState, useEffect } from 'react';

// Card data ke structure ko define karne ke liye ek behtar TypeScript interface.
interface Card {
  id: number;
  name: string;
  elixirCost: number;
  iconUrls: {
    medium: string;
  };
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Champion';
  hitpoints?: number;
  damage?: number;
}

// Kuch cards ke liye YouTube video IDs ka ek simple map.
const videoMap: { [key: string]: string } = {
  'P.E.K.K.A.': 'F66-i5Ohp-w', 'Hog Rider': '_3_212b_4hA', 'Wizard': 'Xt_N4m7gJ78',
  'Golem': 'p_dYV5v-sGI', 'Goblin Barrel': 'fsZ2-pH48yY', 'Knight': 'i-3-n-p-mBE',
};

export default function HomePage() {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCardForVideo, setSelectedCardForVideo] = useState<Card | null>(null);

  // Deck Builder ke liye naye states
  const [deckBuilderMode, setDeckBuilderMode] = useState<boolean>(false);
  const [selectedCollection, setSelectedCollection] = useState<Set<number>>(new Set());
  const [recommendedDeck, setRecommendedDeck] = useState<Card[]>([]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch('/api/cards');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to load card data.');
        }
        const data = await response.json();
        setAllCards(data.cards);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError('An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  const handleCardSelection = (cardId: number) => {
    setSelectedCollection(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(cardId)) {
        newSelection.delete(cardId);
      } else {
        newSelection.add(cardId);
      }
      return newSelection;
    });
  };

  const handleFindBestDeck = () => {
    // --- Yahaan par aapka AI/Backend Logic aayega ---
    // Abhi ke liye, yeh user ke selection se 8 random cards chunega.
    // Asli application mein, aap yahaan backend API ko call karenge.
    const userCollection = allCards.filter(card => selectedCollection.has(card.id));
    if (userCollection.length < 8) {
      alert("Please select at least 8 cards to build a deck.");
      return;
    }
    const shuffled = [...userCollection].sort(() => 0.5 - Math.random());
    setRecommendedDeck(shuffled.slice(0, 8));
  };

  return (
    <>
      <main className="min-h-screen w-full bg-[url('https://supercell.com/images/180104_clashroyale_bg_pattern.png')] bg-cover bg-center text-white">
        <div className="min-h-screen w-full bg-black/70 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8">
            <header className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 drop-shadow-lg">Clash Royale Card Database</h1>
              <p className="text-gray-300 mt-2">Explore cards or build your perfect deck.</p>
            </header>

            <DeckBuilderToggle 
              deckBuilderMode={deckBuilderMode} 
              setDeckBuilderMode={setDeckBuilderMode} 
              onFindDeck={handleFindBestDeck}
              selectionCount={selectedCollection.size}
            />

            {loading && <Loader />}
            {error && <ErrorMessage message={error} />}

            {recommendedDeck.length > 0 && <RecommendedDeckDisplay deck={recommendedDeck} />}
            
            {!loading && !error && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 mt-6">
                {allCards.map(card => (
                  <CardComponent 
                    key={card.id} 
                    card={card} 
                    onCardClick={() => {
                      if (deckBuilderMode) {
                        handleCardSelection(card.id);
                      } else {
                        setSelectedCardForVideo(card);
                      }
                    }}
                    isSelected={selectedCollection.has(card.id)}
                    isDeckBuilderMode={deckBuilderMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      {selectedCardForVideo && (
        <VideoModal card={selectedCardForVideo} onClose={() => setSelectedCardForVideo(null)} />
      )}
    </>
  );
}

// --- Helper Components ---

const DeckBuilderToggle = ({ deckBuilderMode, setDeckBuilderMode, onFindDeck, selectionCount }: any) => (
  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-4 bg-gray-900/50 rounded-lg mb-6 border border-gray-700">
    <div className="flex items-center gap-3">
      <span className={`font-semibold ${!deckBuilderMode ? 'text-yellow-300' : 'text-gray-400'}`}>Card Explorer</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={deckBuilderMode} onChange={() => setDeckBuilderMode(!deckBuilderMode)} className="sr-only peer" />
        <div className="w-14 h-7 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
      </label>
      <span className={`font-semibold ${deckBuilderMode ? 'text-yellow-300' : 'text-gray-400'}`}>Deck Builder</span>
    </div>
    {deckBuilderMode && (
      <button 
        onClick={onFindDeck}
        className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        disabled={selectionCount < 8}
      >
        Find Best Deck ({selectionCount} selected)
      </button>
    )}
  </div>
);

const RecommendedDeckDisplay = ({ deck }: { deck: Card[] }) => (
  <div className="mb-8 p-4 bg-green-900/40 border-2 border-green-500 rounded-lg">
    <h2 className="text-2xl font-bold text-center mb-4 text-green-300">Recommended Deck for You</h2>
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
      {deck.map(card => (
        <div key={card.id} className="relative">
          <img src={card.iconUrls.medium} alt={card.name} className="w-full h-auto rounded-md" />
        </div>
      ))}
    </div>
  </div>
);

const CardComponent = ({ card, onCardClick, isSelected, isDeckBuilderMode }: { card: Card; onCardClick: () => void; isSelected: boolean; isDeckBuilderMode: boolean; }) => {
  const { elixirCost, iconUrls, name, rarity, hitpoints, damage } = card;
  if (!iconUrls?.medium) return null;
  const rarityClasses: {[key: string]: string} = {
    'Common': 'border-gray-400 bg-gray-800/70', 'Rare': 'border-yellow-500 bg-yellow-900/40',
    'Epic': 'border-purple-500 bg-purple-900/40', 'Legendary': 'border-sky-400 bg-sky-900/40',
    'Champion': 'border-orange-400 bg-orange-900/40'
  };
  const rarityClass = rarityClasses[rarity] || 'border-gray-600';
  const selectionClass = isDeckBuilderMode && isSelected ? 'ring-4 ring-offset-2 ring-offset-black ring-green-400 scale-105' : '';

  return (
    <div className={`p-1.5 border-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer flex flex-col justify-between ${rarityClass} ${selectionClass}`} onClick={onCardClick}>
      <div>
        <div className="relative">
          <img src={iconUrls.medium} alt={name} className="w-full h-auto rounded-md" />
          <div className="absolute -top-3 -left-3">
            <ElixirDrop cost={elixirCost} />
          </div>
        </div>
        <h3 className="text-center text-sm md:text-base font-semibold mt-2 truncate">{name}</h3>
      </div>
      <div className="text-xs text-center mt-2 space-y-1 text-gray-300">
        {hitpoints && <p className="flex items-center justify-center gap-1">❤️ <span className="font-bold text-white">{hitpoints}</span></p>}
        {damage && <p className="flex items-center justify-center gap-1">⚔️ <span className="font-bold text-white">{damage}</span></p>}
      </div>
    </div>
  );
};

const ElixirDrop = ({ cost }: { cost: number }) => (
  <div className="relative w-10 h-10">
    <svg viewBox="0 0 32 40" className="w-full h-full drop-shadow-lg">
      <path d="M16 0C16 0 32 15.63 32 24C32 32.84 24.84 40 16 40C7.16 40 0 32.84 0 24C0 15.63 16 0 16 0Z" fill="#D652F5"/>
    </svg>
    <span className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold" style={{textShadow: '1px 1px 2px #000'}}>
      {cost}
    </span>
  </div>
);

const VideoModal = ({ card, onClose }: { card: Card; onClose: () => void; }) => {
  const videoId = videoMap[card.name];
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 p-4 rounded-lg shadow-2xl w-full max-w-2xl border-2 border-yellow-400 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-4 -right-4 bg-red-600 text-white rounded-full w-8 h-8 text-xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-yellow-300">{card.name} - Video Preview</h2>
        {videoId ? (
          <div className="aspect-w-16 aspect-h-9 bg-black rounded-md overflow-hidden">
            <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          </div>
        ) : (
          <p className="text-center text-gray-400 p-8">Sorry, a video preview for this card is not available yet.</p>
        )}
      </div>
    </div>
  );
};

const Loader = () => <div className="text-center"><div className="loader mx-auto"></div><p className="mt-4 text-lg">Loading Cards...</p></div>;
const ErrorMessage = ({ message }: { message: string }) => <div className="text-center bg-red-500/80 p-4 rounded-lg max-w-md mx-auto"><p className="font-bold">An Error Occurred</p><p>{message}</p></div>;

