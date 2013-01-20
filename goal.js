goog.provide('Goal');

Goal = function(pos, world)
{
	var radius = Constants.cellSize/4;
	var self = this;
	var space = 0.535; // space allocated for each maze block (in a 28x20 maze)
	
	this.circleDef = new b2FixtureDef;
	this.circleDef.shape = new b2CircleShape(radius/2);
	this.circleDef.density = 0.1;
	this.circleDef.restitution = 0.0;
	this.circleDef.friction = 0.3;
	
	this.bodyDef = new b2BodyDef;
	this.bodyDef.type = b2Body.b2_staticBody; // holes don't move
	this.bodyDef.position.x = pos.x;
	this.bodyDef.position.y = pos.y;
	
	this.body = world.CreateBody(this.bodyDef);
	this.body.CreateFixture(this.circleDef);
	
	// add a tag to the body object to represent the maze object type (goal, block, trap, ball)
	var data = { "tag": GameObj.GOAL };
	this.body.SetUserData(data);
	
	this.sprite = (new lime.Circle)
		.setFill('assets/goal.png')
		.setSize(Constants.cellSize * SCALE, Constants.cellSize * SCALE)
		.setPosition(this.body.GetWorldCenter().x * SCALE, this.body.GetWorldCenter().y * SCALE);
}
