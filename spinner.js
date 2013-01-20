goog.provide('soft_eng.Spinner');

soft_eng.Spinner = function(pos, world, angularVelocity) {
    this.cw = 5;
    this.ccw = -5;
	var self = this;
	var cellSize = soft_eng.Constants.cellSize; // space allocated for each maze block (in a 28x20 maze)
	
	this.fixDef = new b2FixtureDef;
	this.fixDef.density = 0.1;
	this.fixDef.friction = 0.3;
	this.fixDef.restitution = 0.0;
	this.fixDef.shape = new b2PolygonShape;
	this.fixDef.shape.SetAsBox(cellSize/4, cellSize/2);
	
	this.bodyDef = new b2BodyDef();
	this.bodyDef.type = b2Body.b2_kinematicBody; // walls don't move
	this.bodyDef.position.x = pos.x + cellSize;
	this.bodyDef.position.y = pos.y;
    
	this.body = world.CreateBody(this.bodyDef);
	this.body.CreateFixture(this.fixDef);
	
	// add a tag to the body object to represent the maze object type (goal, block, trap, ball)
	var data = { "tag": MazeEnum.BLOCK, "angularVelocity": (angularVelocity == 'cw' ? this.cw : this.ccw)};
	this.body.SetUserData(data);
	this.sprite = (new lime.Sprite)
		.setFill('assets/pillars.png')
		.setSize(cellSize * soft_eng.SCALE/4, cellSize * soft_eng.SCALE)
		.setPosition(this.body.GetWorldCenter().x * soft_eng.SCALE, this.body.GetWorldCenter().y * soft_eng.SCALE);
}
