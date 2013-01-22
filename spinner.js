goog.provide('Spinner');

Spinner = function(pos, world, angularVelocity, length) {
	var self = this;
	var cellSize = Constants.cellSize; // space allocated for each maze block (in a 28x20 maze)
	if (!length) {
		length = 0.8;
	}
	this.fixDef = new b2FixtureDef;
	this.fixDef.density = 0.01;
	this.fixDef.friction = 0.3;
	this.fixDef.restitution = 0.0;
	this.fixDef.shape = new b2PolygonShape;
	this.fixDef.shape.SetAsBox(cellSize/8, cellSize * length);
	
	this.bodyDef = new b2BodyDef();
	this.bodyDef.type = b2Body.b2_kinematicBody; // walls don't move
	this.bodyDef.position.x = pos.x;
	this.bodyDef.position.y = pos.y;
    
	this.body = world.CreateBody(this.bodyDef);
	this.body.CreateFixture(this.fixDef);
	
	// add a tag to the body object to represent the maze object type (goal, block, trap, ball)
	var data = { "tag": GameObj.BLOCK };
	this.body.SetUserData(data);
	this.update = function() {
		this.body.SetAngularVelocity(angularVelocity);
		this.body.SetAwake(true);
		var angle = this.body.GetAngle()*180/Math.PI;
		while (angle <= 0) {
			angle += 360;
		}
		while (angle >= 360) {
			angle -= 360;
		}
		this.sprite.setRotation(-angle);
	}
	this.sprite = (new lime.Sprite)
		.setFill('assets/pillars.png')
		.setSize(cellSize * SCALE/4, cellSize * SCALE * 2* length)
		.setPosition(this.body.GetWorldCenter().x * SCALE, this.body.GetWorldCenter().y * SCALE);
}
