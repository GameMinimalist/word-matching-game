import { useState, useEffect } from 'react';

function App() {
  const allWordPairs = [
    { word: "cat", emoji: "🐱" },
    { word: "dog", emoji: "🐶" },
    { word: "sun", emoji: "☀️" },
    { word: "pig", emoji: "🐷" },
    { word: "hat", emoji: "🎩" },
    { word: "bus", emoji: "🚌" },
    { word: "fox", emoji: "🦊" },
    { word: "owl", emoji: "🦉" },
    { word: "bee", emoji: "🐝" },
    { word: "cow", emoji: "🐮" }
  ];

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    // Randomly select 6 pairs from the pool
    const shuffledPairs = [...allWordPairs].sort(() => Math.random() - 0.5);
    const selectedPairs = shuffledPairs.slice(0, 6);

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
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
    },
    card: {
      aspectRatio: '1',
      border: 'none',
      borderRadius: '0.75rem',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'transform 0.3s ease',
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