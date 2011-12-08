// wild node shit


var socket = io.connect('http://localhost:8000');


var sendBt = document.getElementById('sendButton');
var msgTx = document.getElementById('mensagemInput');
socket.emit('mensagem', 'game array' + '\n');




// end wild node shit

var SnakeGame = function(canvas){
	var NORTH = 1, EAST = 2, SOUTH = 4, WEST = 8, HEAD = 16, TAIL = 32, 
	CELL_SIZE = 20,
	PI = Math.PI,
	MAX_X = 35, MAX_Y = 20,
	FOOD_GROWTH = 5;
	
	// canvas and drawing context
	var canvas = $(canvas)[0],
	ctx = canvas.getContext('2d');
	
	var snakeBits = [], 		// Position of each bit of snake
	heading, 					// Current heading (N/S/E/W)
	bitsToGrow, 	// number of bit left to grow
	timer,						// game loop
	food; 						// current food position 
	
	// create a simple bit object
	
	function bit(x, y){
		return {x: x, y: y};
	}
	
	function newGame(){
		snakeBits = []
		startGame();
	}
	
	function startGame(){
		heading = EAST,
		bitsToGrow = FOOD_GROWTH;
		snakeBits.unshift(bit(4,4));
		
		placeFood();
		
		clearInterval(timer);
		timer = setInterval(gameLoop, 100);
	}
	
	// controlls nigga
	
	function checkKey(e)
	{
		if (heading == SOUTH || heading == NORTH){
	    switch (e.keyCode){
	      case 37:
	      	heading = WEST;
	      break;

	      case 39:
	      	heading = EAST;
	      break;
			}	
		} 
		if (heading == EAST || heading == WEST){
			switch (e.keyCode){
				case 38:
	      	heading = NORTH;
	      break;

	      case 40:
	      	heading = SOUTH;
	      break;
			}	
		}
	}      


	if ($.browser.mozilla) {
	    $(document).keypress (checkKey);
	} else {
	    $(document).keydown (checkKey);
	}
	
	function gameLoop(){
		advanceSnake();
		checkCollision();
		clearCanvas();
		drawSnake();
		drawFood();
	}
	
	function advanceSnake(){
		// shit in here
		var head = snakeBits[0];
		switch(heading){
			case NORTH:
				snakeBits.unshift(bit(head.x, head.y -1));
			break;
			
			case SOUTH:
				snakeBits.unshift(bit(head.x, head.y +1));
			break;
			
			case EAST:
				snakeBits.unshift(bit(head.x +1, head.y));
			break;
			
			case WEST:
				snakeBits.unshift(bit(head.x -1, head.y));
			break;
		}
		
		if(bitsToGrow === 0){
			// no growth needed
			snakeBits.pop();
		} else {
			bitsToGrow--;
		}
		
		socket.emit('mensagem', snakeBits + '\n');
		
	}
	
	function checkCollision(){
		// check to see if snake has eaten the shit
		for(i = 0; i < snakeBits.length; i++){
			if(food.x == snakeBits[i].x && food.y == snakeBits[i].y){
				placeFood();
				bitsToGrow = FOOD_GROWTH;
			}
		}
		
		// check to see if the snake has crashed into the wall
		
		if(snakeBits[0].x == MAX_X || snakeBits[0].x == -1 || snakeBits[0].y == MAX_Y || snakeBits[0].y == -1){
			// you be dead
			newGame();
		}
		
		// check to see if the snake has crashed into itself
		for(i = 1; i < snakeBits.length; i++){
			if(snakeBits[0].x == snakeBits[i].x && snakeBits[0].y == snakeBits[i].y){
				// you be dead
				newGame();
			}
		}
			
	}
	
	function clearCanvas(){
		ctx.clearRect(0,0, canvas.width, canvas.height);
	};
	
	function drawSnake(){
		var i, length = snakeBits.length;
		for(i=0; i < length; i++){
			drawBit(snakeBits[i]);
		}
	}
	
	function placeFood(){
		var x = Math.round(Math.random() * (MAX_X - 1)),
		 	y = Math.round(Math.random() * (MAX_Y -1));
		
		// check for snake collision
		if(inSnake(x, y, true)) return placeFood();
		
		food = {x:x, y:y};
	}
	
	// check if x and y are in the snake
	function inSnake(x, y, includeHead){
		var length = snakeBits.length,
			i = includeHead ? 0 : 1;
		
		for(; i < length; i++){
			if(x == snakeBits[i].x && y == snakeBits[i].y)
			return true
		}
		return false;
	}
	
	function drawFood(){
		drawInCell(food.x, food.y, function(){
			ctx.fillStyle = "grey";
			ctx.beginPath();
			ctx.arc(CELL_SIZE/2, CELL_SIZE/2,
					CELL_SIZE/2, 0, 2*PI, true);
			ctx.fill();
		});
	}
	
	// draws one segment of the snake
	function drawBit(bit){
		drawInCell(bit.x, bit.y, function(){
			ctx.beginPath();
			ctx.rect(0,0, CELL_SIZE, CELL_SIZE)
			ctx.fill();
		});
	};
	
	function drawInCell(cellX, cellY, fn){
		var x = cellX * CELL_SIZE,
			y = cellY * CELL_SIZE;
			
		ctx.save();
		ctx.translate(x, y);
		fn();
		ctx.restore();
	}
	
	return {
		start: startGame
	}
};

$(function(){
	
	window.game = SnakeGame('#game');
 	game.start();
	
	

})