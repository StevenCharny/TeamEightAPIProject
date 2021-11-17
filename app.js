// BLACKJACK
let deckID = "";
let playerCards = [];
let playerScore = 0;
let dealerCards = [];
let dealerScore = 0;
let roundLost = false;
let roundWon = false;
let roundTied = false;

//Page Element Selectors
let dealerScoreElement = document.getElementById("dealer-number");
let playerScoreElement = document.getElementById("player-number");
let dealerCardsElement = document.getElementById("dealer-cards");
let playerCardsElement = document.getElementById("player-cards");
let announcementElement = document.getElementById("announcement");
let newDeckElement = document.getElementById("new-game")
let nextHandElement = document.getElementById("next-hand");
let hitMeElement = document.getElementById("hit-me");
let stayElement = document.getElementById("stay");


// On click events
nextHandElement.onclick = newRound;
hitMeElement.onclick = () => hitMe('player');
stayElement.onclick = () => setTimeout(() => dealerTurn(), 50);

// New Game Function
function newGame() {
    dealerCards = [];
    playerCards = [];
    roundLost = false;
    roundWon = false;
    roundTied = false;
    dealerScore = "";
    playerScore = 0;
    dealerScoreElement.textContent = dealerScore;
    announcementElement.textContent = ``;
    while (dealerCardsElement.firstChild) {
        dealerCardsElement.removeChild(dealerCardsElement.firstChild);
    }
    while (playerCardsElement.firstChild) {
        playerCardsElement.removeChild(playerCardsElement.firstChild);
    }
    fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6')
        .then(res => res.json())
        .then(res => {
            deckID = res.deck_id;
        })
        .catch(console.error)
}

//New Hand Function
function newRound() {
    newGame();
    fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=6`)
        .then(res => res.json())
        .then(res => {
            hitMeElement.style.display = "inline";
            stayElement.style.display = "inline";

            dealerCards.push(res.cards[0], res.cards[1])
            playerCards.push(res.cards[2], res.cards[3])

            dealerScore = "?";
            dealerScoreElement.textContent = dealerScore;

            dealerCards.forEach((card, i) => {
                let cardDomElement = document.createElement("img");
                if (i === 0) {
                    cardDomElement.src = './cardback.png';
                } else {
                    cardDomElement.src = card.image;
                }
                dealerCardsElement.appendChild(cardDomElement)
            })

            playerCards.forEach(card => {
                let cardDomElement = document.createElement("img");
                cardDomElement.src = card.image;
                playerCardsElement.appendChild(cardDomElement)
            })

            playerScore = aceMath(playerCards);
            if (playerScore === 21) {
                roundWon = true;
                announcementElement.textContent = "BlackJack! You Win!";
            }
            playerScoreElement.textContent = playerScore;

        })
        .catch(console.error)
}

// Hit Function
function hitMe(target) {
    if (roundLost || roundWon || roundTied) {return}
    fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`)
    .then(res => res.json())
    .then(res => {
  
      // If player
      if (target === 'player') {
        playerCards.push(res.cards[0])
        let cardDomElement = document.createElement("img");
        cardDomElement.src = res.cards[0].image;
        playerCardsElement.appendChild(cardDomElement)
  
        playerScore = aceMath(playerCards);
  
        playerScoreElement.textContent = playerScore;
        if (playerScore > 21) {
          roundLost = true;
          announcementElement.textContent = "You broke over 21. You lose this one!"
        }
      }
  
      // If dealer
      if (target === 'dealer') {
        let cardDomElement = document.createElement("img");
        dealerCards.push(res.cards[0])
        cardDomElement.src = res.cards[0].image;
        dealerCardsElement.appendChild(cardDomElement)
        dealerTurn();
      }
  
    })
    .catch(console.log)
  }

// Dealer's turn
function dealerTurn() {
    if (roundLost || roundWon || roundTied) {return}
    dealerScore = aceMath(dealerCards);
    dealerScoreElement.textContent = dealerScore;
    dealerCardsElement.firstChild.src = dealerCards[0].image;
    if (dealerScore < 17) {
      setTimeout(()=>hitMe('dealer'), 900)
    }
    else if (dealerScore > 21) {
      roundWon = true;
      announcementElement.textContent = "The Dealer broke over 21. You win the hand!";
    }
    else if (dealerScore > playerScore) {
      roundLost = true;
      announcementElement.textContent = `You have ${playerScore} and the dealer has ${dealerScore}. You lose the hand.`;
    }
    else if (dealerScore === playerScore) {
      roundTied = true;
      announcementElement.textContent = "Tie round.";
    }
    else {
      roundWon = true;
      announcementElement.textContent = "You won this hand!";
    }
  }

// Ace Math
function aceMath(cards) {
    let hasAce = false;
    score = cards.reduce((acc, card) => {
      if (card.value === "ACE") {
        hasAce = true;
        return acc + 1
      }
      if (isNaN(card.value)) { return acc + 10 }
      return acc + Number(card.value);
    }, 0)
    if (hasAce) {
      score = (score + 10) > 21 ? score : score + 10;
    }
    return score
  }