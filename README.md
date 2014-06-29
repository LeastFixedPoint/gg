gg
==

Game API
====

```javascript
// List of strings representing sides of the game.
game.sides = [ ... ]

// Must return initial state of the game. Will be called once.
game.initialState = function() 

// Will be called once to let game set up UI inside the root element.
// state is the initial state of the game.
// side is the side this game intance is playing for.
game.init = function(gameRunner, root, state, side)

// Called after every successful state poll to let game update UI if necessary.
// When currentSide is equal to the game's side, it means that our turn begins.
// After that this will not be called we end the turn with a gameRunner.sendState call.
game.onNewState = function(state, currentSide)
```