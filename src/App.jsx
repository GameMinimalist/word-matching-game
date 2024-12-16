import { useState, useEffect } from 'react';

function App() {
  const allWordPairs = [
    // Animals
    { word: "cat", emoji: "🐱" },
    { word: "dog", emoji: "🐶" },
    { word: "pig", emoji: "🐷" },
    { word: "fox", emoji: "🦊" },
    { word: "owl", emoji: "🦉" },
    { word: "bee", emoji: "🐝" },
    { word: "cow", emoji: "🐮" },
    { word: "rat", emoji: "🐀" },
    { word: "ant", emoji: "🐜" },
    { word: "bat", emoji: "🦇" },
    { word: "hen", emoji: "🐔" },
    { word: "ram", emoji: "🐏" },
    
    // Nature
    { word: "sun", emoji: "☀️" },
    { word: "sky", emoji: "🌤️" },
    { word: "sea", emoji: "🌊" },
    { word: "bug", emoji: "🐛" },
    { word: "ice", emoji: "🧊" },
    
    // Objects/Transport
    { word: "hat", emoji: "🎩" },
    { word: "bus", emoji: "🚌" },
    { word: "car", emoji: "🚗" },
    { word: "bed", emoji: "🛏️" },
    { word: "cup", emoji: "☕" },
    { word: "pen", emoji: "✏️" },
    { word: "key", emoji: "🔑" },
    { word: "box", emoji: "📦" },
    { word: "bag", emoji: "👜" },
    { word: "fan", emoji: "🌀" },
    
    // Food
    { word: "pie", emoji: "🥧" },
    { word: "egg", emoji: "🥚" },
    { word: "jam", emoji: "🫐" },
    { word: "nut", emoji: "🥜" },
    
    // People/Body
    { word: "man", emoji: "👨" },
    { word: "boy", emoji: "👦" },
    { word: "ear", emoji: "👂" },
    { word: "eye", emoji: "👁️" },
    { word: "leg", emoji: "🦵" },
    
    // Fun/Games
    { word: "toy", emoji: "🧸" },
    { word: "win", emoji: "🏆" },
    { word: "fun", emoji: "🎈" },
    { word: "bow", emoji: "🎀" }
];

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    // Randomly select 6 pairs from the pool
    const shuffledPairs = [...allWordPairs].sort(() => Math.random() - 0.5);
    const selectedPairs = shuffledPairs.slice(0, 8); // Change from 6 to 8 pairs
    
    // Create and shuffle the cards
    const cardPairs = [...selectedPairs.flatMap(pair => [
      { id: `word-${pair.word}`, content: pair.word, type: 'word', match: pair.word },
      { id: `emoji-${pair.word}`, content: pair.emoji, type: 'emoji', match: pair.word }
    ])].sort(() => Math.random() - 0.5);
    setCards(cardPairs);
  }, []);

  const handleCardClick = (id) => {
    if (flipped.length === 2) return;
    if (matched.includes(id) || flipped.includes(id)) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    setMoves(moves + 1);

    if (newFlipped.length === 2) {
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);

      if (firstCard.match === secondCard.match) {
        setMatched([...matched, firstId, secondId]);
        setFlipped([]);
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(to bottom, #e0e7ff, #ede9fe)',
    },
    gameArea: {
      maxWidth: '800px',
      margin: '0 auto',
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    title: {
      fontSize: '2rem',
      color: '#6d28d9',
      marginBottom: '1rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)', // Keep 4 columns
      gap: '0.75rem', // Slightly reduce gap to fit more cards
  },
  card: {
    aspectRatio: '1',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '1.25rem', // Slightly smaller font
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.3s ease',
    minHeight: '80px', // Adjust size to fit more cards
},
    button: {
      backgroundColor: '#6d28d9',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '9999px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      marginTop: '1rem',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.gameArea}>
        <div style={styles.header}>
          <h1 style={styles.title}>Word Match</h1>
          <p style={{fontSize: '1.25rem', color: '#4b5563'}}>Moves: {moves}</p>
        </div>

        <div style={styles.grid}>
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              style={{
                ...styles.card,
                backgroundColor: flipped.includes(card.id) || matched.includes(card.id)
                  ? 'white'
                  : '#6d28d9',
                transform: flipped.includes(card.id) || matched.includes(card.id)
                  ? 'scale(1.05)'
                  : 'scale(1)',
              }}
            >
              {(flipped.includes(card.id) || matched.includes(card.id)) && (
                <span style={{
                  fontSize: card.type === 'emoji' ? '2rem' : '1.5rem'
                }}>
                  {card.content}
                </span>
              )}
            </button>
          ))}
        </div>

        {matched.length === cards.length && (
          <div style={{textAlign: 'center', marginTop: '2rem'}}>
            <p style={{fontSize: '1.5rem', color: '#059669', fontWeight: 'bold', marginBottom: '1rem'}}>
              Well Done! 🎉
            </p>
            <button
              onClick={() => window.location.reload()}
              style={styles.button}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;