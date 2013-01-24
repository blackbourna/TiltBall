goog.provide('KeyLock');

KeyLock = function(pos, world, game, isKey, color) {
	var colors = {
		'red': "FEDBCA",
		'blue': "#ABCDEF",
		'yellow': "#009999"
	}
	var self = this;
	var cellSize = Constants.cellSize; // space allocated for each maze block (in a 28x20 maze)
	this.color = color;
	this.fixDef = new b2FixtureDef;
	this.fixDef.density = 0.1;
	this.fixDef.friction = 0.3;
	this.fixDef.restitution = 0.0;
	this.fixDef.shape = new b2PolygonShape;
	this.fixDef.shape.SetAsBox(cellSize/2, cellSize/2);
	
	this.bodyDef = new b2BodyDef();
	this.bodyDef.type = b2Body.b2_staticBody; // walls don't move
	this.bodyDef.position.x = pos.x;
	this.bodyDef.position.y = pos.y;
    
	this.body = world.CreateBody(this.bodyDef);
	this.body.CreateFixture(this.fixDef);
	
	// add a tag to the body object to represent the maze object type (goal, block, trap, ball)
	this.update = function() {
		if (game.isUnlocked(color)) {
			world.DestroyBody(this.body);
			this.sprite.runAction(new lime.animation.ScaleTo(0).setDuration(0.1));
		}
	}
	this.sprite = new lime.Sprite()
		.setSize(cellSize * SCALE, cellSize * SCALE)
		.setPosition(this.body.GetWorldCenter().x * SCALE, this.body.GetWorldCenter().y * SCALE);
	var sprite2 = new lime.Sprite()
		.setSize(cellSize * SCALE, cellSize * SCALE)
		.setPosition(0, 0);
	if (isKey) {
		sprite2.setFill('assets/key_'+color+'.png');
	} else {
		this.sprite.setFill('assets/block_grey.png');
		sprite2.setFill('assets/lock_'+color+'.png');
	}
	this.sprite.appendChild(sprite2);
	var data = { isKey: isKey, isKeyLock: true, "color": color };
	this.body.SetUserData(data);
}
