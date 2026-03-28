const VALUES_ORDER = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const adjudicator = {
  determineWinner: (trick, trumpSuit) => {
    const leadSuit = trick[0].card.suit;
    let winner = trick[0];

    for (let i = 1; i < trick.length; i++) {
      const current = trick[i];
      const currentCard = current.card;
      const bestCard = winner.card;

      // 1. If current card is Trump and winner isn't, current wins
      if (currentCard.suit === trumpSuit && bestCard.suit !== trumpSuit) {
        winner = current;
      } 
      // 2. If both are Trump, highest value wins
      else if (currentCard.suit === trumpSuit && bestCard.suit === trumpSuit) {
        if (VALUES_ORDER.indexOf(currentCard.value) > VALUES_ORDER.indexOf(bestCard.value)) {
          winner = current;
        }
      } 
      // 3. If neither is Trump, but current matches Lead Suit and winner doesn't
      else if (currentCard.suit === leadSuit && bestCard.suit !== leadSuit && bestCard.suit !== trumpSuit) {
        winner = current;
      }
      // 4. If both are Lead Suit (and no Trump), highest value wins
      else if (currentCard.suit === leadSuit && bestCard.suit === leadSuit) {
        if (VALUES_ORDER.indexOf(currentCard.value) > VALUES_ORDER.indexOf(bestCard.value)) {
          winner = current;
        }
      }
    }
    return winner; // Returns { socketId, card }
  }
};

module.exports = adjudicator;