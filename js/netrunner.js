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

  $('.endturn').click(_.bind(function(e) { this.sendState() }, this))
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
  this.state[this.side].canSpendClicks = true
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
    $('.side.runner .section.identity', this.root).empty().append(renderCard(this.state.runner.identity))
    $('.side.runner .section.stats .clicks .count', this.root).text(this.state.runner.clicks)
    $('.side.runner .section.stats .credits .count', this.root).text(this.state.runner.credits)
    $('.side.runner .section.stats .stack .count', this.root).text(this.state.runner.deck.length)
    $('.side.runner .section.stats .heap .count', this.root).text(this.state.runner.discard.length)

    if (this.side == 'runner') {
      var grip = $('.side.runner .section.us.grip', this.root).empty()
      this.state.runner.hand.map(function(card) { grip.append(renderCard(card)) }, this)
    } else {
      $('.side.runner .section.them.grip .count', this.root).empty().text(this.state.runner.hand.length)
    }
  }

  if (this.state.corp.deckSetup) {
    $('.side.corp .section.identity', this.root).empty().append(renderCard(this.state.corp.identity))
    $('.side.corp .section.stats .clicks .count', this.root).text(this.state.corp.clicks)
    $('.side.corp .section.stats .credits .count', this.root).text(this.state.corp.credits)
    $('.side.corp .section.stats .rnd .count', this.root).text(this.state.corp.deck.length)
    $('.side.corp .section.stats .archives .count', this.root).text(this.state.corp.discard.length)

    if (this.side == 'corp') {
      var hq = $('.side.corp .section.us.hq', this.root).empty()
      this.state.corp.hand.map(function(card) { hq.append(renderCard(card)) }, this)
    } else {
      $('.side.corp .section.them.hq .count', this.root).empty().text(this.state.corp.hand.length)
    }
  }

  $('.trigger', this.root).hide()

  this.state[this.side].hand.map(function(card, i) {
    var opts = CARDS[card.name].playingOptions(this.state)
    if (opts.length) {
      $($('.side.us .section.hand .trigger', this.root)[i]).show()
    }
  }, this)

  if (this.state[this.side].canSpendClicks) {
    $('.side.us .section.stats .credits .trigger', this.root).show()
    $('.side.us .section.stats .deck .trigger', this.root).show()
  }
}

Netrunner.prototype.sendState = function() { 
  this.state[this.side].canSpendClicks = false
  this.updateBoard()
  this.gameRunner.sendState(this.state, this.opponent)
}

function renderCard(card) { return CARDS[card.name].render(card.state) }





function extend() { return _.extend.apply(this, [{}].concat(Array.prototype.slice.call(arguments))) }

var CARDS = {}
function addCard(card) { CARDS[card.name] = card }

var CARD = {
  newInstance: function() { return { name: this.name, state: this.newState } },
  newState: {},
  title: function() { return this.name },
  description: function() {
    var s = '<em>' + NAMES[this.type] + '</em>'
    if ('playCost' in this)    { s += '<br />Play cost <em>' + this.playCost + '</em>' }
    if ('rezCost' in this)     { s += '<br />Rez cost <em>' + this.rezCost + '</em>' }
    if ('installCost' in this) { s += '<br />Install cost <em>' + this.installCost + '</em>' }
    if (!!this.fluff)          { s += '<br/><br/><i>' + this.fluff + '</i>' }
    return s
  },
  render: function(state) {
    return $('<div/>').addClass('card').addClass(this.type)
      .append($('<div/>').addClass('title').html(this.title())
        .append($('<div/>').addClass('trigger')))
      .append($('<div/>').addClass('body').html(this.description()))
  },
  playingOptions: function(state) { return [] }
}

var NAMES = {
  identity: "Identity",
  operation: "Operation", asset: "Asset", ice: "ICE", agenda: "Agenda",
  event: "Event", software: "Software", hardware: "Hardware", resource: "Resource",
}

var IDENTITY  = extend(CARD, { type: 'identity' })
var OPERATION = extend(CARD, { 
  type: 'operation', 
  playCost: 0,
  playingOptions: function(state) { return (state.corp.canSpendClicks && this.playCost <= state.corp.credits) ? ['yes'] : [] },
})
var ASSET     = extend(CARD, { type: 'asset', rezCost: 0 })
var UPGRADE   = extend(CARD, { type: 'upgrade', rezCost: 0 })
var ICE       = extend(CARD, { type: 'ice', rezCost: 0 })
var AGENDA    = extend(CARD, { type: 'agenda' })
var EVENT     = extend(CARD, { 
  type: 'event',
  playCost: 0,
  playingOptions: function(state) { return (state.runner.canSpendClicks && this.playCost <= state.runner.credits) ? ['yes'] : [] },
})
var HARDWARE  = extend(CARD, { type: 'hardware', installCost: 0 })
var SOFTWARE  = extend(CARD, { type: 'software', installCost: 0 })
var RESOURCE  = extend(CARD, { type: 'resource', installCost: 0 })

addCard(extend(IDENTITY, {
  name: "Aperture Science",
  fluff: "We do what we must because we can.",
}))

addCard(extend(ICE, {
  name: "AntiVir Enterprise Pro",
  fluff: "Protect your server just for $99.99 per month!",
}))

addCard(extend(OPERATION, {
  name: "Business As Usual",
  fluff: "Gain money. A lot.",
}))

addCard(extend(UPGRADE, {
  name: "Registry Optimizer",
  fluff: "Supercharge PC performance!",
}))

addCard(extend(ASSET, {
  name: "Chairman Evil",
  fluff: "This is an executive. Give him a severance package.",
}))

addCard(extend(AGENDA, {
  name: "Ultimate Goal",
  fluff: "Make all your base belong to us.",
}))

addCard(extend(IDENTITY, {
  name: "Digital Warrior",
  fluff: "We are the ones who ride the edge<br/>We have no boundaries to defend<br/>We are a nuclear drive of viral strength<br/><br/>We are the offspring of a dream<br/>We have to fight and we can win<br/>We own the sharpest weapons of the grid",
}))

addCard(extend(EVENT, {
  name: "Rob a Bank",
  fluff: "Online, of course.",
}))

addCard(extend(SOFTWARE, {
  name: "Icebreaker",
  fluff: "Hey, how are you doing?",
}))

addCard(extend(HARDWARE, {
  name: "Arduino Mini",
  fluff: "Everyone starts with something.",
}))

addCard(extend(RESOURCE, {
  name: "Old Friend",
  fluff: "Would sleep and drink for you anytime.",
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
