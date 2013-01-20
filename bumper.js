goog.provide('Bumper');

Bumper = function(pos, world)
{
	var radius = 0.3;
	var self = this;
	var cellSize = Constants.cellSize; // space allocated for each maze block (in a 28x20 maze)
	
	this.circleDef = new b2FixtureDef();
	this.circleDef.shape = new b2CircleShape(radius/2);
	this.circleDef.density = 100;
	this.circleDef.restitution = 1;
	this.circleDef.friction = 100;
	
	this.bodyDef = new b2BodyDef();
	this.bodyDef.type = b2Body.b2_staticBody; // walls don't move
	this.bodyDef.position.x = pos.x;
	this.bodyDef.position.y = pos.y;
    
	this.body = world.CreateBody(this.bodyDef);
	this.body.CreateFixture(this.circleDef);
	
	// add a tag to the body object to represent the maze object type (goal, block, trap, ball)
	var data = { "tag": GameObj.BUMPER };
	this.body.SetUserData(data);
	this.sprite = (new lime.Sprite)
		.setFill('assets/ball.png')
		.setSize(radius * SCALE, radius * SCALE)
		.setPosition(this.body.GetWorldCenter().x * SCALE, this.body.GetWorldCenter().y * SCALE);
}
