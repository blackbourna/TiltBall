goog.provide('KeyLock');

KeyLock = function(pos, world, game, isKey, color) {
	var self = this;
	var cellSize = Constants.cellSize; // space allocated for each maze block (in a 28x20 maze)
	this.color = color;
	this.fixDef = new b2FixtureDef;
	this.fixDef.density = 0.1;
	this.fixDef.friction = 0.3;
	this.fixDef.restitution = 0.0;
	this.fixDef.shape = new b2PolygonShape;
	if (isKey) {
		this.fixDef.shape.SetAsBox(cellSize/8, cellSize/8);
	} else {
		this.fixDef.shape.SetAsBox(cellSize/2, cellSize/2);
	}
	
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
			this.sprite.setOpacity(0);
		}
	}
	if (isKey) {
		this.sprite = new lime.RoundedRect()
			.setFill(color)
			.setSize(cellSize/2 * SCALE, cellSize/2 * SCALE)
			.setPosition(this.body.GetWorldCenter().x * SCALE, this.body.GetWorldCenter().y * SCALE);
	} else {
		this.sprite = new lime.RoundedRect()
			.setFill(color)
			.setSize(cellSize * SCALE, cellSize * SCALE)
			.setPosition(this.body.GetWorldCenter().x * SCALE, this.body.GetWorldCenter().y * SCALE);
	}
	var data = { isKey: isKey, isKeyLock: true, "color": color };
	this.body.SetUserData(data);
}
