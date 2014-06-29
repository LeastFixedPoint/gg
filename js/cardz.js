var Cardz = function() {}

Cardz.prototype.initialState = function() {
  return {
    available: {
      first: [1,2,3],
      second: [1,2,3],
    },
    score: { first: 0, second: 0 },
    selection: {}
  }
}

Cardz.prototype.sides = [ 'first', 'second' ]

Cardz.prototype.oppositeSide = function() { return this.side == 'first' ? 'second' : 'first' }
Cardz.prototype.isOurTurn = function() { return this.currentSide == this.side }

Cardz.prototype.init = function(runner, root, state, side) {
  console.log("Game initialized as [" + side + "]")

  this.runner = runner
  this.side = side
  this.state = state

  root.on('click', '.card', _.bind(function(e) {
    if (!this.isOurTurn()) { return }
    this.onCardClicked(e)
  }, this))

  var cards = this.state.available[this.side]
  for (i in cards) {
    $('#cards', root).append($('<div class="card" data-value="' + cards[i] + '">' + cards[i] + '</div>'))
  }

  console.log("UI intialized")
}

Cardz.prototype.onNewState = function(state, currentSide) {
  this.state = state
  this.currentSide = currentSide

  if (this.side == 'first' && 'first' in this.state.selection && 'second' in this.state.selection) {    
    this.record()
    this.state.selection = {}
  }
}

Cardz.prototype.onCardClicked = function(e) {
  console.log("Card clicked")

  var i = parseInt($(e.target).attr('data-value'))
  $(e.target).remove()
  
  this.state.available[this.side] = _.without(this.state.available[this.side], i)
  this.state.selection[this.side] = i

  if (this.side == 'second') {
    this.record()
  }

  this.runner.sendState(this.state, this.oppositeSide())
}

Cardz.prototype.record = function() {
  var ours = this.state.selection[this.side]
  var theirs = this.state.selection[this.oppositeSide(this.side)]

  var text
  if (ours > theirs) {
    text = "our " + ours + ' > their ' + theirs + ": we won one point"
    if (this.side == 'second') { this.state.score[this.side]++ }
  } else if (theirs > ours) {
    text = "our " + ours + ' < their ' + theirs + ": opponent won one point"
    if (this.side == 'second') { this.state.score[this.oppositeSide()]++ }
  } else {
    text = "our " + ours + ' = their ' + theirs + ": a tie!"
  }

  $('#history', this.root).append($('<p>' + text + '</p>'))

  $('#us', this.root).text(this.state.score[this.side])
  $('#opponent', this.root).text(this.state.score[this.oppositeSide()])

  if (this.state.available[this.side].length == 0) {
    $('#cards', this.root).hide()
    $('#history', this.root).append($('<p>Game over!</p>'))
  }
}