goog.provide('Game');

goog.require("goog.events.KeyHandler");

goog.require("lime.animation.FadeTo");
goog.require("lime.animation.ScaleTo");
goog.require("lime.animation.Delay");
goog.require("lime.animation.Sequence");
goog.require("lime.RoundedRect");

goog.require('Ball');
goog.require('Bell');
goog.require('Goal');
goog.require('Trap');
goog.require('Block');
goog.require('Bumper');
goog.require('Blocker');
goog.require('KeyLock');
goog.require('EnemyBall');
goog.require('Spinner');
goog.require('PointSpinner');
goog.require('Constants');
goog.require('WorldListener');
goog.require("Levels");

// entrypoint
Game = function(director, level) {
    
    var deviceName = navigator.userAgent.toLowerCase();
    
    var FRAME_RATE = 60;

    if (level % Levels.length == 3) {
        SCALE = 30.0;
    } else {
        SCALE = 60.0;
    }
	console.log("begin");
	var startDate = new Date();
	// maze object type enum
	GameObj = {
		EMPTY: 0, 
		BALL: 1, 
		GOAL: 2, 
		TRAP: 3, 
		BLOCK: 4, 
		SPINNER_CW: 5, 
		SPINNER_CCW: 6,
		BLOCKER: 7,
		BUMPER: 8,
		BELL: 9,
		RED_KEY: 10,
		RED_LOCK: 11,
		BLUE_KEY: 12,
		BLUE_LOCK: 13,
		YELLOW_KEY: 14,
		YELLOW_LOCK: 15,
		SLOW_SPINNER_CW: 16, 
		SLOW_SPINNER_CCW: 17,
		POINT_SPINNER: 18
	};
	var useKeyboard = false;
	b2Vec2 = Box2D.Common.Math.b2Vec2;
	b2BodyDef = Box2D.Dynamics.b2BodyDef;
	b2Body = Box2D.Dynamics.b2Body;
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
	b2Fixture = Box2D.Dynamics.b2Fixture;
	b2World = Box2D.Dynamics.b2World;
	b2MassData = Box2D.Collision.Shapes.b2MassData;
	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
	b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
	
	var scene = new lime.Scene();
	var layer = new lime.Layer();
    var self = this;
	layer.setPosition(0, 0);
	scene.appendChild(layer);
	
    var addBackgroundToScene = function (scene) {
		var bgSize = 32;

		for (var x = 0; x < WIDTH + bgSize; x += bgSize) {
			for (var y = 0; y < HEIGHT + bgSize; y += bgSize) {
				var bgSprite = new lime.Sprite()
					.setSize(bgSize + 2, bgSize + 2)
					.setFill("assets/tile_blue.png")
					.setAnchorPoint(0, 0)
					.setPosition(x - 1, y - 1);
				scene.appendChild(bgSprite);
			}
		}
	}
    addBackgroundToScene(layer);
	scene.setRenderer(lime.Renderer.CANVAS);

	//debugging labels
	var xLabel = new lime.Label('').setAnchorPoint(0, 0).setPosition(20, 20);
	var yLabel = new lime.Label('').setAnchorPoint(0, 0).setPosition(20, 40);
	var zLabel = new lime.Label('').setAnchorPoint(0, 0).setPosition(20, 60);
	scene.appendChild(xLabel);
	scene.appendChild(yLabel);
	scene.appendChild(zLabel);
    
	var ballAcceleration = {};
	var prevAcceleration = {};
    var world = new b2World(new b2Vec2(0, 0), true);
    world.SetDebugDraw(true);
    
    var balls = [];
    var goal = null;
    var objects = [];
    
    this.timesTrapped = 0;
	var locked = [];
	this.setUnlocked = function(color) {
		locked.push(color);
	}
	this.isUnlocked = function(color) {
		for (var c in locked) {
			if (locked[c] == color) {
				return true;
			}
		}
		return false;
	}
    
	this.director = director;
    this.getScene = function() { return scene; };
    this.getBalls = function() { return balls; };
    this.addBall = function(pos) {
        // Ball
        var b = new Ball(pos, world);
        balls.push(b);
        //lime.scheduleManager.setDisplayRate(1000/FRAME_RATE/balls.length);
        layer.appendChild(b.sprite);
    };
    this.removeBall = function(ball) {
        for (var x = 0; x < balls.length; x++) {
            if (balls[x] === ball) {
                ball.sprite.setHidden(true);
                world.DestroyBody(ball.body);
                balls.splice(x, 1);
            }
        }
    }
	// http://stackoverflow.com/questions/12317040/box2dwebEMPTY-walls-dont-bounce-a-slow-object
	//Box2D.Common.b2Settings.b2_velocityThreshold = 0.0;
	// game loop
	var accumulator = 0;
	var worldStep = function(dt) {
		var deltatime = dt/1000;
		accumulator += deltatime;
		timestep = 1/FRAME_RATE;
		while (accumulator > timestep) {
			world.Step(timestep, 5);
			
			if (!useKeyboard && ballAcceleration.x && ballAcceleration.y) {
				var factor = 1;
				var newGravity = {};
				if (prevAcceleration.x && prevAcceleration.y) {
					newGravity.x = (-ballAcceleration.x * factor) + prevAcceleration.x * (1-factor); // x is backwards
					newGravity.y = (ballAcceleration.y * factor) +  prevAcceleration.y * (1-factor);
				} else {
					newGravity = { x: ballAcceleration.x*factor * -1, y: ballAcceleration.y*factor }; // remove y*-1 for production
				}
				prevAcceleration = { x: newGravity.x, y: newGravity.y };
				world.SetGravity(newGravity); // set the world's gravity, the ball will move accordingly
			}
			for (var b in balls) {
				var ball = balls[b];
				if (ball.body.GetUserData().flaggedForDeletion) {
					if (!ball.body.GetUserData().hasReachedTheGoal) {
						self.addBall(ball.startingPosition);
					}
					self.removeBall(ball);
					continue;
				}
				ball.body.SetAwake(true);
				var ballPos = ball.body.GetWorldCenter();
				ball.sprite.setPosition(ballPos.x * SCALE, ballPos.y * SCALE);
				//ball.body.m_force.SetZero(); // ClearForces
				//ball.body.m_torque = 0.0; // ClearForces
			}
			for (var o in objects) {
				objects[o].update();
			}
			world.ClearForces(); // too expensive - we only have a few moving bodies
			accumulator -= timestep;
		}
		// game end check
		if (!balls.length) {
			lime.scheduleManager.unschedule(worldStep, this);
			navigator.accelerometer.clearWatch(watchID);
			watchID = null;
			goog.events.unlisten(keyhandler, 'key', keyevents);
			setTimeout(levelFinishedAlert, 1000);
			
		}
	};
	
	var startGame = function() {
        console.log("Entering Maze loop");
        var cellSize = Constants.cellSize;
        var maze = Levels[level % Levels.length];
        for(var col = 0; col < maze.length; col++) {
            for(var row = 0; row < maze[col].length; row++) {
                var pos = {};
                pos.x = row * cellSize + cellSize/2;
                pos.y = col * cellSize + cellSize/2;
                var obj;
                if (maze[col][row] == GameObj.BALL) {
                    self.addBall(pos);
                } else if (maze[col][row] == GameObj.GOAL) {
                    obj = new Goal(pos, world);
                } else if (maze[col][row] == GameObj.TRAP) {
                    var obj = new Trap(pos, world);
                } else if (maze[col][row] == GameObj.BLOCK) {
                    obj = new Block(pos, world);
                } else if (maze[col][row] == GameObj.SPINNER_CW) {
                    obj = new Spinner(pos, world, 5, null);
                    objects.push(obj);
                } else if (maze[col][row] == GameObj.SPINNER_CCW) {
                    obj = new Spinner(pos, world, -5, null);
                    objects.push(obj);
                } else if (maze[col][row] == GameObj.SLOW_SPINNER_CW) {
                    obj = new Spinner(pos, world, 2, 2.5);
                    objects.push(obj);
                } else if (maze[col][row] == GameObj.SLOW_SPINNER_CCW) {
                    obj = new Spinner(pos, world, -2, 2.5);
                    objects.push(obj);
                } else if (maze[col][row] == GameObj.POINT_SPINNER) {
                    obj = new PointSpinner(pos, world);
					layer.appendChild(obj.blockSprite);
                    objects.push(obj);
                } else if (maze[col][row] == GameObj.BELL) {
                    obj = new Bell(pos, world);
                } else if (maze[col][row] == GameObj.BLOCKER) {
                    var dir = {x: 1e-2, y: 0};
                    obj = new Blocker(pos, world, dir);
                    objects.push(obj);
				} else if (maze[col][row] == GameObj.BUMPER) {
                    obj = new Bumper(pos, world);
				} else if (maze[col][row] == GameObj.ENEMY_BALL) {
                    obj = new EnemyBall(pos, world);
					objects.push(obj);
				} else if (maze[col][row] == GameObj.RED_KEY) {
                    obj = new KeyLock(pos, world, self, true, "red");
					objects.push(obj);
				} else if (maze[col][row] == GameObj.RED_LOCK) {
                    obj = new KeyLock(pos, world, self, false, "red");
					objects.push(obj);
				} else if (maze[col][row] == GameObj.BLUE_KEY) {
                    obj = new KeyLock(pos, world, self, true, "blue");
					objects.push(obj);
				} else if (maze[col][row] == GameObj.BLUE_LOCK) {
                    obj = new KeyLock(pos, world, self, false, "blue");
					objects.push(obj);
				} else if (maze[col][row] == GameObj.YELLOW_KEY) {
                    obj = new KeyLock(pos, world, self, true, "yellow");
					objects.push(obj);
				} else if (maze[col][row] == GameObj.YELLOW_LOCK) {
                    obj = new KeyLock(pos, world, self, false, "yellow");
					objects.push(obj);
                }
				if (obj) {
					layer.appendChild(obj.sprite);
				}
            }
        }
        console.log("Exiting Maze loop");
        console.log("Entering Game loop");
        
        lime.scheduleManager.schedule(worldStep, this);
        //lime.scheduleManager.scheduleWithDelay(worldStep, this, 1/FRAME_RATE*1000/24);
    };
	
	
		
	// onSuccess: Get a snapshot of the current acceleration
	var onAccelerometerSuccess = function(acceleration) {
		ballAcceleration.x = acceleration.x;
		ballAcceleration.y = acceleration.y;
	};

	// onError: Failed to get the acceleration
	var onAccelerometerError = function() {
		alert('onError!');
	};
	
	// Start listening for Accelerometer, set frequency
	var options = { frequency: 40 }; // this should be some multiple of the frame rate (in ms, rather than fraction) (24x12=288)
	var watchID = navigator.accelerometer.watchAcceleration(onAccelerometerSuccess, onAccelerometerError, options);

	world.SetContactListener(new WorldListener(this));
	
	var dispose = function() {
		lime.scheduleManager.unschedule(worldStep, this);
		goog.events.unlisten(keyhandler, 'key', keyevents);
		navigator.accelerometer.clearWatch(watchID);
		watchID = null;
	};
	
	// phonegap alert is better than a normal javascript alert.
	var levelFinishedAlert = function() {
		endDate = new Date();
		elapsedSeconds = (endDate - startDate)/1000;

		alert('You have solved the maze in: ' + elapsedSeconds + ' seconds.\nTrapped ' + self.timesTrapped + " times.");
		dispose();
		newLevel = new Game(self.director, ++level).getScene();
		director.replaceScene(newLevel);		
	};
	
	var showMenu = function() {
		if (confirm('Are you sure that you want to quit?')) {
			MainMenu.loadMainMenu();
			dispose();
		}
	};
	
	setTimeout(function() {
		goog.events.listen(scene, 'click', showMenu);
	}, 500);
	
	console.log("Exiting Game loop");
	console.log("end");
	var overlay = new lime.RoundedRect()
		.setFill("#000000")
		.setSize(WIDTH, HEIGHT)
		.setAnchorPoint(0, 0)
		.setOpacity(0)
		.setPosition(0, 0);

	this.flashScreen = function() {
		var s = 0.1;
		var sequence = new lime.animation.Sequence(
			new lime.animation.Delay().setDuration(0.25),
			new lime.animation.FadeTo(0.5).setDuration(s),
			new lime.animation.FadeTo(0.0).setDuration(s),
			new lime.animation.FadeTo(0.5).setDuration(s),
			new lime.animation.FadeTo(0.0).setDuration(s),
			new lime.animation.FadeTo(0.5).setDuration(s),
			new lime.animation.FadeTo(0.0).setDuration(s)
		);
		overlay.runAction(sequence);
	}
	scene.appendChild(overlay);
	var keyhandler = new goog.events.KeyHandler(document);
	keyevents = function(e) {
		var keyCodes = goog.events.KeyCodes;
		var keyCode = e.keyCode;
		useKeyboard = true;
		var newGravity = world.GetGravity();
		switch (keyCode) {
			case keyCodes.UP:
				newGravity.y -= 1;
			break;
			case keyCodes.DOWN:
				newGravity.y += 1;
			break;
			case keyCodes.LEFT:
				newGravity.x -= 1;
			break;
			case keyCodes.RIGHT:
				newGravity.x += 1;
			break;
			case keyCodes.SPACE:
				newGravity = {x: 0, y: 0};
			break;
		}
		world.SetGravity(newGravity)
		console.log(world.GetGravity());
	}
	goog.events.listen(keyhandler, 'key', keyevents);
    startGame();
}
