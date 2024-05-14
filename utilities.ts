import { Player, Game, Card } from "./models.js";

/** Randomly choose Player from array of Players
 *
 * Takes: players, an array of Player instances
 * Returns: Player instance
 */

function randSelectPlayer(players: Player[]): Player {
  const playerInd = Math.floor(Math.random() * players.length);
  return players[playerInd];
}

/** Get next player from array
 *
 * Takes:
 * - players: an array of Player instances
 * - player: a Player instance from the array
 * Returns: a Player instance of the next Player in array
 */

function getNextPlayer(players: Player[], player: Player): Player {
  const currPlayerInd = players.indexOf(player);
  if ((currPlayerInd + 1) < players.length) {
    return players[currPlayerInd + 1];
  } else {
    return players[0];
  }
}

/** Check if current player has flipped all cards
 *
 * Takes: game, a Game instance
 * Returns: boolean, true if all of the current player's cards are flipped
*/

function checkAllFlipped(game: Game): boolean {
  const cards = game.currPlayer.cards;
  for (let card of cards) {
    if (!card.flipped) {
      return false;
    }
  }
  return true;
}

/** Get the index of the Player who won
 *
 * Takes: game, a Game instance
 * Returns: number, the index in the Game's players array of the winning Player
 */

function getWinnerInd(game: Game): number {
  let lowScore = 100000;
  let lowInd = -1;
  for (let i = 0; i < game.scores.length; i++) {
    if (game.scores[i] < lowScore) {
      lowScore = game.scores[i];
      lowInd = i;
    }
  }
  return lowInd;
}

/** Converts Card's value to its numerical point value
 *
 * Takes: string representing a Card's value
 * Returns: number representing a Card's point value
 */

function numberifyVal(val: string): number {
  let points: number;
  switch (val) {
    case "KING":
      points = 0;
      break;
    case "ACE":
      points = 1;
      break;
    case "JACK":
      points = 10;
      break;
    case "QUEEN":
      points = 10;
      break;
    default:
      points = Number(val);
  }
  return points;
}

/** Get index of Card from id of HTML element affiliated with the Card
 *
 * Takes: id, a string of id of an HTML card element
 * Returns: number, representing index of Card
 */

function getIndFromCardSpaceId(id: string): number {
  return Number(id[3]);
}

/** Get the id of the HTML element of a player's card
 *
 * Takes:
 * - cardInd: a number representing a Card's index
 * - game: a Game instance
 * - player: a Player instance (defaults to current player)
 *
 * Returns: string, the id of an HTML card element
 */

function getCardSpaceId(
  cardInd: number, game: Game, player: Player = game.currPlayer
): string {
  const playerInd = getPlayerIndex(game, player);
  return `p${playerInd + 1}-${cardInd}`;
}

/** Get the id of the drawn card space HTML element of the current player
 *
 * Takes: game, a Game instance
 * Returns: string, the id of a drawn card space HTML element
 */

function getDrawnCardSpaceId(game: Game): string {
  return `drawn-card-${getPlayerIndex(game) + 1}`;
}

/** Get the index of a Player in a Game's players array
 *
 * Takes:
 * - game: a Game instance
 * - player: a Player instance (defaults to current player)
 * Returns: number, representing the player's index
 */

function getPlayerIndex(game: Game, player: Player = game.currPlayer): number {
  return game.players.indexOf(player);
}

/** Get the index of a Card in the current player's cards array
 *
 * Takes:
 * - game: a Game instance
 * - card: a Card instace
 * Returns: number, representing the card's index
 */

function getCardIndex(game: Game, card: Card, player: Player = game.currPlayer): number {
  const playerInd = getPlayerIndex(game, player);
  return game.players[playerInd].cards.indexOf(card);
}

/** Get the index of the Card that's vertical to a Card in currPlayer's cards
 *
 * @param ind
 * @returns
 */

function getVerticalInd(game: Game, card: Card, player: Player = game.currPlayer): number {
  const ind = getCardIndex(game, card, player);

  if (ind < 3) {
    return ind + 3;
  } else {
    return ind - 3;
  }
}

/*******************************************************************************
 * Helpers functions used for computer player moves
*/

/** Randomly choose an index of card to flip from among cards in columns where
 *  neither card has been flipped
 *
 * Takes:
 * - game: a Game instance
 * - player: a Player instance (defaults to current player)
 * Returns: number representing an index in an array of Card instances
 */

function randSelectCardInd(game: Game, plyr: Player = game.currPlayer): number {
  const unflippedInds = getUnflippedInds(game, plyr);

  // Indexes of cards that are good to flip, if any
  const bestInds = getBestInds(unflippedInds);

  if (bestInds.length < 2) {
    throw new Error(`Only invoke randSelectCardInd with on a player with a
      column with no cards flipped`);
  }

  return bestInds[Math.floor(Math.random() * bestInds.length)];
}

/** Get the indexes of unflipped cards that do not have a flipped card
 *  above them or below them
 *
 * Takes: inds, an array of numbers representing indexes of unflipped cards
 * Returns: an array of numbers representing indexes of unflipped cards
 *    that do not have flipped cards above them or below them
 */

function getBestInds(inds: number[]): number[] {
  const bestInds: number[] = [];

  const passedInds: Record<number, number> = {};
  for (let ind of inds) {

    if (ind - 3 in passedInds) {
      bestInds.push(ind);
      bestInds.push(ind - 3);
    }
    passedInds[ind] = 1;
  }

  return bestInds;
}

/** Get the indexes of a Player's unflipped Cards
 *
 * Takes:
 * - game: a Game instance
 * - player: a Player instance (defaults to current player)
 * Returns: an array of numbers of the indexes of unflipped cards
 */

function getUnflippedInds(game: Game, plr: Player = game.currPlayer): number[] {
  const unflippedInds: number[] = [];

  for (let i = 0; i < plr.cards.length; i++) {
    if (plr.cards[i].flipped === false) {
      unflippedInds.push(i);
    }
  }

  return unflippedInds;
}

/** Check if there is a column where neither Card is flipped
 *
 * Takes: game, a Game instance
 * Returns: boolean, true if there is an unflipped column, otherwise false
 */

function unflippedCol(game: Game): boolean {
  const unflippedInds = getUnflippedInds(game);

  return getBestInds(unflippedInds).length >= 2;
}

/** Check if a Card matches one of a Player's flipped, swappable Cards
 *
 * Takes:
 * - game: a Game instance
 * - card: a Card instance
 * - player: a Player instance (default to current Player)
 * Returns an array of a boolean and a number.  The boolean is true if there's
 *   a match, otherwise false. The number is the index vertical to the matching
 *   card, or -1 if there is no match.
 */

function checkForMatch(game: Game, card: Card, player: Player = game.currPlayer):
  [boolean, number] {
  const cards = player.cards;
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].flipped && !cards[i].locked && (cards[i].value === card.value)) {
      const ind = i < 3 ? i + 3 : i - 3;
      return [true, ind];
    }
  }
  return [false, -1];
}


/** Get the lowest value flipped, not locked card in the current player's hand
 *
 * Takes: game, a Game instance
 * Returns: a Card instance, the current player's best flipped unlocked Card
 */

function getBestCard(game: Game): Card | undefined {
  const cards = game.currPlayer.cards;

  const sortedFlippedCards = cards
    .filter(card => card.flipped && !card.locked)
    .sort((a, b) => numberifyVal(a.value) - numberifyVal(b.value));

  return sortedFlippedCards[0];
}

/** Sort the current player's flipped, not locked cards from highest point
 *  value to lowest (worst to best)
 *
 * Takes: game, a Game instance
 * Returns: array of flipped, not locked cards where the worst are first
 */

function sortCards(game: Game): Card[] {
  const cards = game.currPlayer.cards;

  const sortedFlippedCards = cards
    .filter(card => card.flipped && !card.locked)
    .sort((a, b) => numberifyVal(b.value) - numberifyVal(a.value));

  return sortedFlippedCards;
}

/** For deciding whether to lock in a column. Find the lowest point value
 * flipped Card in an unlocked column. Find what the total column point value
 * would be if Player took a Card in the unflipped spot in that column.
 *
 * Takes:
 * - game: a Game instance
 * - card: a Card instance
 * Returns: array of two numbers. The 1st represents the potential column point
 *   value. The 2nd represents the index of the unflipped card in that column.
 */

function getLowColPoints(game: Game, card: Card): [number, number] {
  const bestCard = getBestCard(game);

  if (bestCard) {
    const colTotal = numberifyVal(bestCard.value) + numberifyVal(card.value);
    return [colTotal, getVerticalInd(game, bestCard)];
  } else {
    return [20, -1];
  }
}

/** Get the values of the next Player's unflipped, not locked cards
 *
 * Takes: game, a Game instance
 * Returns: object where the keys represent Card values
 */

function getBadVals(game: Game): Record<string, number> {
  const nextCards = getNextPlayer(game.players, game.currPlayer).cards;
  const badVals: Record<string, number> = {};
  for (let card of nextCards) {
    if (card.flipped && !card.locked) {
      badVals[card.value] = 1;
    }
  }
  return badVals;
}

/** Get the current Player's Card that would be best to discard--the flipped
 *  and not locked Card worth the most points that the next player doesn't want
 *
 * Takes:
 * - game: a Game instance
 * - sorted: array of Cards. Defaults to the current Player's flipped, unlocked
 *   cards, sorted from high to low point value
 * Returns: the Card that would be best to discard, if any.  If none, undefined.
 */

function getBestToSwap(game: Game, srtd: Card[] = sortCards(game)): Card | undefined {
  const sortedCards = srtd;

  if (sortedCards.length < 1) {
    return;
  }

  // The next player wants cards with these values
  const badVals = getBadVals(game);

  if (!(sortedCards[0].value in badVals) && chanceTrue(.95)) {
    return sortedCards[0];
  }

  if (sortedCards.length >= 2) {
    sortedCards.shift();
    return getBestToSwap(game, sortedCards);
  }
  return;
}

/** Decide whether to take or discard the drawnCard when its not a good Card,
 *  but the next player wants it AND wants all the flipped, not locked Cards
 *
 * Takes:
 * - drawnPnt: number of the point value of the current Player's drawn Card
 * - srtdCrds: array cards, the current player's flipped, not locked cards
 *   sorted by point value
 * Returns: number of index to take drawnCard at, or -1 to discard it
 */

function getIndInPinch(game: Game, drawnPnt: number, srtdCrds: Card[]): number {
  if ((drawnPnt > 7 && chanceTrue(.75)) || srtdCrds.length < 1) {
    return -1;
  } else {
    // Last card in sortedVals will have lowest point value
    const bestCard = srtdCrds[srtdCrds.length - 1];
    // Take Card at index across from Card with lowest point value
    return getVerticalInd(game, bestCard);
  }
}

/** Return true a percent of the time determined by passed in number
 *
 * Takes: chance, number representing the percentage it should return true
 * Returns: boolean
 */

function chanceTrue(chance: number): boolean {
  return Math.random() < chance;
}


export {
  randSelectPlayer, getNextPlayer, randSelectCardInd, getIndFromCardSpaceId,
  getCardSpaceId, unflippedCol, chanceTrue, checkForMatch, getPlayerIndex,
  getDrawnCardSpaceId, numberifyVal, getLowColPoints, getUnflippedInds,
  getBestInds, getBadVals, getBestToSwap, getIndInPinch, checkAllFlipped,
  getWinnerInd, getCardIndex, getVerticalInd, sortCards,
};