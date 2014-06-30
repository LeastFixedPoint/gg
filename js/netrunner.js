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

  var opponentSide = $('.side', root)
  var usSide = opponentSide.clone().appendTo(root)

  opponentSide.addClass(this.opponent).addClass('them')
  usSide.addClass(this.side).addClass('us')
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
  if (this.state.runner.deckSetup) {
    $('.side.runner .section.identity', this.root).empty().append(this.renderCard(this.state.runner.identity))
    $('.side.runner .section.stats .clicks .count', this.root).text(this.state.runner.clicks)
    $('.side.runner .section.stats .stack .count', this.root).text(this.state.runner.deck.length)
    $('.side.runner .section.stats .heap .count', this.root).text(this.state.runner.discard.length)

    if (this.side == 'runner') {
      var grip = $('.side.runner .section.us.grip', this.root).empty()
      this.state.runner.hand.map(function(card) { grip.append(this.renderCard(card)) }, this)
    } else {
      $('.side.runner .section.them.grip .count', this.root).empty().text(this.state.runner.hand.length)
    }
  }

  if (this.state.corp.deckSetup) {
    $('.side.corp .section.identity', this.root).empty().append(this.renderCard(this.state.corp.identity))
    $('.side.corp .section.stats .clicks .count', this.root).text(this.state.corp.clicks)
    $('.side.corp .section.stats .rnd .count', this.root).text(this.state.corp.deck.length)
    $('.side.corp .section.stats .archives .count', this.root).text(this.state.corp.discard.length)

    if (this.side == 'corp') {
      var hq = $('.side.corp .section.us.hq', this.root).empty()
      this.state.corp.hand.map(function(card) { hq.append(this.renderCard(card)) }, this)
    } else {
      $('.side.corp .section.them.hq .count', this.root).empty().text(this.state.corp.hand.length)
    }
  }


}

Netrunner.prototype.sendState = function() { this.gameRunner.sendState(this.state, this.opponent) }

Netrunner.prototype.renderCard = function(card) { return CARDS[card.name].render(card.state) }





function extend() { return _.extend.apply(this, [{}].concat(Array.prototype.slice.call(arguments))) }

var CARDS = {}
function addCard(card) { CARDS[card.name] = card }

var CARD = {
  newInstance: function() { return { name: this.name, state: this.newState } },
  newState: {},
  title: function() { return this.name },
  render: function(state) {
    return $('<div class="card ' + this.type + '"><div class="title">' + this.title() + '</div><div class="body">' + this.description + '</div></div>')
  },
}

WITH_COST = {
  title: function() { return '<div class="cost">' + this.cost + '</div>' + this.name }
}

var IDENTITY  = extend(CARD, { type: 'identity' })
var OPERATION = extend(CARD, WITH_COST, { type: 'operation', cost: 0 })
var ASSET     = extend(CARD, WITH_COST, { type: 'asset', cost: 0 })
var UPGRADE   = extend(CARD, WITH_COST, { type: 'upgrade', cost: 0 })
var ICE       = extend(CARD, WITH_COST, { type: 'ice', cost: 0 })
var AGENDA    = extend(CARD, { type: 'agenda' })
var EVENT     = extend(CARD, WITH_COST, { type: 'event', cost: 0 })
var HARDWARE  = extend(CARD, WITH_COST, { type: 'hardware', cost: 0 })
var SOFTWARE  = extend(CARD, WITH_COST, { type: 'software', cost: 0 })
var RESOURCE  = extend(CARD, WITH_COST, { type: 'resource', cost: 0 })

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
