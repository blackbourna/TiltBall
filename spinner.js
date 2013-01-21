goog.provide('Spinner');

Spinner = function(pos, world, angularVelocity) {
    this.cw = 5;
    this.ccw = -5;
	var self = this;
	var cellSize = Constants.cellSize; // space allocated for each maze block (in a 28x20 maze)
	
	this.fixDef = new b2FixtureDef;
	this.fixDef.density = 0.1;
	this.fixDef.friction = 0.3;
	this.fixDef.restitution = 0.0;
	this.fixDef.shape = new b2PolygonShape;
	this.fixDef.shape.SetAsBox(cellSize/4, cellSize);
	
	this.bodyDef = new b2BodyDef();
	this.bodyDef.type = b2Body.b2_kinematicBody; // walls don't move
	this.bodyDef.position.x = pos.x + cellSize;
	this.bodyDef.position.y = pos.y;
    
	this.body = world.CreateBody(this.bodyDef);
	this.body.CreateFixture(this.fixDef);
	
	// add a tag to the body object to represent the maze object type (goal, block, trap, ball)
	var data = { "tag": GameObj.BLOCK, "angularVelocity": (angularVelocity == 'cw' ? this.cw : this.ccw)};
	this.body.SetUserData(data);
	this.update = function() {
		this.body.SetAngularVelocity(this.body.GetUserData().angularVelocity);
		this.body.SetAwake(true);
		var angle = this.body.GetAngle()*180/Math.PI;
		while (angle <= 0) {
			angle += 360;
		}
		while (angle >= 360) {
			angle -= 360;
		}
		this.sprite.setRotation(angle);
	}
	this.sprite = (new lime.Sprite)
		.setFill('assets/pillars.png')
		.setSize(cellSize * SCALE/4, cellSize * SCALE * 2)
		.setPosition(this.body.GetWorldCenter().x * SCALE, this.body.GetWorldCenter().y * SCALE);
}
