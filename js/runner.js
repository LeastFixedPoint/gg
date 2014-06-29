function ParseRunner(game) {
  this.game = game
}

ParseRunner.prototype.run = function() {
  Parse.initialize($('#appId').val(), $('#jsKey').val())
  $('#loginSection').hide()
  $('#lobbySection').show()

  if (!window.location.hash) {
    console.log("No hash found in URL, creating a new game")
    this.createGame()
  } else {
    var atPos = window.location.hash.indexOf('@')
    var side = window.location.hash.substring(1, atPos)
    var id = window.location.hash.substring(atPos+1)
    console.log("Hash found in URL, joining game [" + id + "] as [" + side + "]")
    this.joinGame(id, side)
  }
}


ParseRunner.prototype.createGame = function() {
  $('#runnerStatus').empty().html('Creating new game')

  var id = Math.random().toString(36).substring(2)
  var side = this.game.sides[0]

  console.log("Creating game-user [" + id + "] in Parse")

  var user = new Parse.User()
  user.set('username', id)
  user.set('password', id)
  user.set('waitingFor', side)
  user.set('gameState', this.game.initialState())
  user.signUp(null, {
    success: _.bind(function(gameUser) {
      console.log("Game-user created")
      window.location.href = window.location.origin + window.location.pathname + "#" + side + "@" + id
      this.joinGame(id, side)
    }, this),
    error: function(gameUser, error) { alert("Error: " + error.code + " " + error.message) }
  })
}

ParseRunner.prototype.joinGame = function(id, side) {
  $('#runnerStatus').empty().html('Joining game <em>' + id + '</em> as <em>' + side + '</em>')

  this.id = id
  this.side = side

  console.log("Authenticating the game-user [" + this.id + "]")

  Parse.User.logIn(this.id, this.id, {
    success: _.bind(function(gameUser) {
      console.log("Game-user authenticated")

      $('#lobbySection').hide()
      $('#gameSection').show()

      var links = $('<ul />').appendTo($('#runnerSection'))
      for (i in this.game.sides) {
        var side = this.game.sides[i]
        if (side == this.side) { continue }
        var link = window.location.origin + window.location.pathname + "#" + side + "@" + this.id
        links.append($('<li>Send this link to the <em>' + side + '</em>: <a href="' + link + '">' + link + '</a></li>'))
      }

      this.user = gameUser
      this.game.init(this, $('#gameSection'), this.user.get('gameState'), this.side)
      this.game.onNewState(this.user.get('gameState'), this.user.get('waitingFor'))

      if (this.user.get('waitingFor') != side) {
        this.waitForOurTurn()
      }
    }, this),
    error: function(gameUser, error) { alert("Error: " + error.code + " " + error.message) }
  });
}

ParseRunner.prototype.poll = function() {
  this.user.fetch({
    success: _.bind(this.onPollSuccess, this),
    error: function(gameUser, error) { alert("Error: " + error.code + " " + error.message) }
  })
}

ParseRunner.prototype.onPollSuccess = function(gameUser) {
  this.user = gameUser

  if (this.user.get("waitingFor") == this.side) {
    console.log("Poll ok: it's our turn")
    this.startOurTurn()
  } else {
    console.log("Poll ok: waiting for [" + this.user.get("waitingFor") + "]")
    setTimeout(_.bind(this.poll, this), 1000)
  }

  this.game.onNewState(this.user.get('gameState'), this.user.get('waitingFor'))
}

ParseRunner.prototype.startOurTurn = function(){
  $('#runnerStatus').empty().html('It\'s our turn!')
}

ParseRunner.prototype.waitForOurTurn = function() {
  $('#runnerStatus').empty().html('Waiting for our turn')

  console.log("Initiating polling for game state")
  this.poll()
}

ParseRunner.prototype.sendState = function(state, nextSide) {
  if (this.user.get("waitingFor") != this.side) {
    alert("ERROR: it's [" + this.user.get("waitingFor") + "] turn!")
    return
  }

  console.log("Sending updated game state and passing turn to [" + nextSide + "]")

  var t = this
  this.user.set('waitingFor', nextSide)
  this.user.set('gameState', state)
  this.user.save(null, {
      success: function(gameUser) {
        console.log("Updated game state sent")
        t.waitForOurTurn()
      }, 
      error: function(gameUser, error) { alert("Error: " + error.code + " " + error.message) }
  })
}
