// ==========================================
// 🃏 THE VIRTUAL DEALER
// ==========================================

const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const dealer = {
  // 1. Open a brand new box of 52 cards
  createDeck: () => {
    let deck = [];
    for (let suit of SUITS) {
      for (let value of VALUES) {
        deck.push({ suit, value });
      }
    }
    return deck;
  },

  // 2. Shuffle the deck (Using the mathematical Fisher-Yates algorithm)
  shuffle: (deck) => {
    let currentIndex = deck.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      // Swap the cards
      [deck[currentIndex], deck[randomIndex]] = [deck[randomIndex], deck[currentIndex]];
    }
    return deck;
  },

  // 3. Deal the cards for a round of Judgement
  // (In Judgement, the number of cards changes every round!)
  dealCards: (players, cardsPerPlayer) => {
    const deck = dealer.shuffle(dealer.createDeck());
    const hands = {}; // We will store each player's hand by their Socket ID
    let cardIndex = 0;

    players.forEach(player => {
      hands[player.socketId] = [];
      for (let i = 0; i < cardsPerPlayer; i++) {
        hands[player.socketId].push(deck[cardIndex]);
        cardIndex++;
      }
    });

    return {
      hands, // The cards dealt to the players
      trumpCard: deck[cardIndex] // The very next card decides the Trump suit!
    };
  }
};

module.exports = dealer;