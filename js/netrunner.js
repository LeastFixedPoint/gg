function Netrunner() {}

Netrunner.prototype.sides = ['corp', 'runner']

Netrunner.prototype.initialState = function() {
  return {
    runner: {
      deck: [], hand: [], discard: [], rig: [], agendas: [], identity: null,
      deckSetup: false,
      clicks: 0, maxClicks: 4,
      credits: 5,
    },
    corp: {
      deck: [], hand: [], discard: [], servers: [], agendas: [], identity: null,
      deckSetup: false,
      clicks: 0, maxClicks: 3,
      credits: 5,
    }
  }
}

Netrunner.prototype.init = function(gameRunner, root, side) {
  this.gameRunner = gameRunner
  this.side = side
  this.root = root
  this.opponent = this.side == 'runner' ? 'corp' : 'runner'
}

Netrunner.prototype.onNewState = function(state, currentSide) {
  this.state = state

  if (currentSide != this.side) { this.updateBoard(); return }

  switch (true) {
    case !this.state[this.side].deckSetup: return this.setupDeck()
    case !this.state[this.opponent].deckSetup: console.log("Waiting for opponent to set up their deck"); return this.sendState()
    default: this.beginOurTurn()
  }
}

Netrunner.prototype.beginOurTurn = function() {
  this.state[this.side].clicks = this.state[this.side].maxClicks
  this.updateBoard()
}

Netrunner.prototype.setupDeck = function() {
  console.log("Setting up our deck")

  var deck = this.decks[this.side]
  this.state[this.side].identity = deck.shift()

  deck = _.shuffle(deck)
  this.state[this.side].hand = _.take(deck, 5)
  this.state[this.side].deck = _.drop(deck, 5)
  this.state[this.side].deckSetup = true

  this.updateBoard()

  console.log(this.state)
  this.sendState()
}

Netrunner.prototype.updateBoard = function() {
  if (this.state[this.side].deckSetup) {
    $('#ourSide .mainRow .identity .cardCont', this.root).empty().append(this.renderCard(this.state[this.side].identity))
    $('#ourSide .mainRow .deck .numCont', this.root).text(this.state[this.side].deck.length)
    $('#ourSide .mainRow .discard .numCont', this.root).text(this.state[this.side].discard.length)
    
    var handCont = $('#ourSide .mainRow .hand .handCont', this.root).empty()
    this.state[this.side].hand.map(function(card) { handCont.append(this.renderCard(card)) }, this)
  }

  if (this.state[this.opponent].deckSetup) {
    $('#opponentSide .mainRow .identity .cardCont', this.root).empty().append(this.renderCard(this.state[this.opponent].identity))
    $('#opponentSide .mainRow .deck .numCont', this.root).text(this.state[this.opponent].deck.length)
    $('#opponentSide .mainRow .discard .numCont', this.root).text(this.state[this.opponent].discard.length)
    $('#opponentSide .mainRow .hand .numCont', this.root).text(this.state[this.opponent].hand.length)
  }
}

Netrunner.prototype.sendState = function() { this.gameRunner.sendState(this.state, this.opponent) }

Netrunner.prototype.renderCard = function(card) {
  return CARDS[card.name].render(card.state)
}





function extend(base, self) { return _.defaults(self, base) }

var CARDS = {}
function addCard(card) { CARDS[card.name] = card }

var CARD = {}
CARD.newInstance = function() { return { name: this.name, state: this.newState } }
CARD.newState = {}
CARD.render = function(state) {
  return $('<div class="card"><div class="title">' + this.name + '</div><div class="body">' + this.description + '</div></div>')
}

var IDENTITY  = extend(CARD, { type: 'identity' })
var OPERATION = extend(CARD, { type: 'operation' })
var ASSET     = extend(CARD, { type: 'asset' })
var UPGRADE   = extend(CARD, { type: 'upgrade' })
var ICE       = extend(CARD, { type: 'ice' })
var AGENDA    = extend(CARD, { type: 'agenda' })
var EVENT     = extend(CARD, { type: 'event' })
var HARDWARE  = extend(CARD, { type: 'hardware' })
var SOFTWARE  = extend(CARD, { type: 'software' })
var RESOURCE  = extend(CARD, { type: 'resource' })

addCard(extend(IDENTITY, {
  name: "Aperture Science",
  description: "We do what we must because we can.",
}))

addCard(extend(ICE, {
  name: "AntiVir Enterprise Pro",
  description: "Protect your server just for $99.99 per month!",
}))

addCard(extend(OPERATION, {
  name: "Business As Usual",
  description: "Gain money. A lot.",
}))

addCard(extend(UPGRADE, {
  name: "Registry Optimizer",
  description: "Supercharge PC performance!",
}))

addCard(extend(ASSET, {
  name: "Chairman Evil",
  description: "This is an executive. Give him a severance package.",
}))

addCard(extend(AGENDA, {
  name: "Ultimate Goal",
  description: "Make all your base belong to us.",
}))

addCard(extend(IDENTITY, {
  name: "Digital Warrior",
  description: "We are the ones who ride the edge<br/>We have no boundaries to defend<br/>We are a nuclear drive of viral strength<br/><br/>We are the offspring of a dream<br/>We have to fight and we can win<br/>We own the sharpest weapons of the grid",
}))

addCard(extend(EVENT, {
  name: "Rob a Bank",
  description: "Online, of course.",
}))

addCard(extend(SOFTWARE, {
  name: "Icebreaker",
  description: "Hey, how are you doing?",
}))

addCard(extend(HARDWARE, {
  name: "Arduino Mini",
  description: "Everyone starts with something.",
}))

addCard(extend(RESOURCE, {
  name: "Old Friend",
  description: "Would sleep and drink for you anytime.",
}))

Netrunner.prototype.decks = {
  runner: function() {
    var deck = [ CARDS["Digital Warrior"].newInstance() ]

    for (name in CARDS) {
      if (_.contains([ 'event', 'software', 'hardware', 'resource' ], CARDS[name].type)) {
        deck.push(CARDS[name].newInstance())
        deck.push(CARDS[name].newInstance())
        deck.push(CARDS[name].newInstance())
      }
    }

    return deck
  }(),
  corp: function() {
    var deck = [ CARDS["Aperture Science"].newInstance() ]

    for (name in CARDS) {
      if (_.contains([ 'operation', 'asset', 'agenda', 'ice', 'upgrade' ], CARDS[name].type)) {
        deck.push(CARDS[name].newInstance())
        deck.push(CARDS[name].newInstance())
        deck.push(CARDS[name].newInstance())
      }
    }

    return deck
  }(),
}
