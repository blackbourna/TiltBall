goog.provide('Game');

goog.require("lime.animation.FadeTo");
goog.require("lime.animation.Sequence");

goog.require('Ball');
goog.require('Goal');
goog.require('Trap');
goog.require('Block');
goog.require('Bumper');
goog.require('Blocker');
goog.require('KeyLock');
goog.require('EnemyBall');
goog.require('Spinner');
goog.require('Constants');
goog.require('WorldListener');
goog.require("Levels");

// entrypoint
Game = function(director, level) {
    
    var deviceName = navigator.userAgent.toLowerCase();
    
    var FRAME_RATE = 60;

    if (level % Levels.length == 2) {
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
		ENEMY_BALL: 9,
		RED_KEY: 10,
		RED_LOCK: 11,
		BLUE_KEY: 12,
		BLUE_LOCK: 13,
		YELLOW_KEY: 14,
		YELLOW_LOCK: 15
	};
	
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
					.setFill("assets/tile.png")
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
                    obj = new Spinner(pos, world, 'cw');
                    objects.push(obj);
                } else if (maze[col][row] == GameObj.SPINNER_CCW) {
                    obj = new Spinner(pos, world, 'ccw');
                    objects.push(obj);
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
                    obj = new KeyLock(pos, world, self, true, "#FF0000");
					objects.push(obj);
				} else if (maze[col][row] == GameObj.RED_LOCK) {
                    obj = new KeyLock(pos, world, self, false, "#FF0000");
					objects.push(obj);
				} else if (maze[col][row] == GameObj.BLUE_KEY) {
                    obj = new KeyLock(pos, world, self, true, "#0000FF");
					objects.push(obj);
				} else if (maze[col][row] == GameObj.BLUE_LOCK) {
                    obj = new KeyLock(pos, world, self, false, "#0000FF");
					objects.push(obj);
				} else if (maze[col][row] == GameObj.YELLOW_KEY) {
                    obj = new KeyLock(pos, world, self, true, "#FFFF00");
					objects.push(obj);
				} else if (maze[col][row] == GameObj.YELLOW_LOCK) {
                    obj = new KeyLock(pos, world, self, false, "#FFFF00");
					objects.push(obj);
                }
                layer.appendChild(obj.sprite);
            }
        }
        console.log("Exiting Maze loop");
        console.log("Entering Game loop");
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
                
                if (ballAcceleration.x && ballAcceleration.y) {
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
                }
                accumulator -= timestep;
            }
            // game end check
			if (!balls.length) {
				lime.scheduleManager.unschedule(worldStep, this);
				navigator.accelerometer.clearWatch(watchID);
				watchID = null;
				
				setTimeout(levelFinishedAlert, 1000);
				
			}
        };
        
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
		navigator.accelerometer.clearWatch(watchID);
		watchID = null;
	};
	
	// phonegap alert is better than a normal javascript alert.
	var levelFinishedAlert = function() {
		endDate = new Date();
		elapsedSeconds = (endDate - startDate)/1000;
		
		//navigator.notification.confirm(
		//'You have solved the maze in: ' + elapsedSeconds + ' seconds.\nTrapped ' + self.timesTrapped + " times.", // message
		//onLevelFinishedAlertConfirm, // callback
		//'Well done!',            	// title
		//'Quit,Continue'          		// actions. this can be 'Continue,Quit,etc..'
		//);
		
		// use this instead (Ripple doesn't emulate notifications)
		alert('You have solved the maze in: ' + elapsedSeconds + ' seconds.\nTrapped ' + self.timesTrapped + " times.");
		newLevel = new Game(self.director, ++level).getScene();
		director.replaceScene(newLevel);		
	};
	// this controls what to do when a button is pressed (could be multiple actions based on the button choice)
	var onLevelFinishedAlertConfirm = function(button) {
		if (button == 2) {
			// new level
			newLevel = new Game(self.director, ++level).getScene();
			director.replaceScene(newLevel);
		}
		if (button == 1) {
			MainMenu.loadMainMenu();
		}
	};
	
	var showMenu = function() {
		//this.director.setPaused(true);
		//navigator.notification.confirm(
		//'Are you sure that you want to quit?', // message
		//continueGame, // callback
		//'Game Paused',            	// title
		//'Quit,Continue'          		// actions. this can be 'Continue,Quit,etc..'
		//);
		if (confirm('Are you sure that you want to quit?')) {
			MainMenu.loadMainMenu();
		}
	};
	
	var continueGame = function(button) {
		//this.director.setPaused(false);
		if (button == 1) {
			//dispose();
			loadMainMenu();
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
		var s = 0.08;
		var sequence = new lime.animation.Sequence(
			new lime.animation.FadeTo(1.0).setDuration(s),
			new lime.animation.FadeTo(0.0).setDuration(s),
			new lime.animation.FadeTo(1.0).setDuration(s),
			new lime.animation.FadeTo(0.0).setDuration(s),
			new lime.animation.FadeTo(1.0).setDuration(s),
			new lime.animation.FadeTo(0.0).setDuration(s)
		);
		overlay.runAction(sequence);
	}
	scene.appendChild(overlay);
    startGame();
}
