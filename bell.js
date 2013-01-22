goog.provide('Bell');
Bell = function(pos, world) {
	var radius = 0.3;
	var self = this;
	
	this.circleDef = new b2FixtureDef();
	this.circleDef.shape = new b2CircleShape(radius/2);
	this.circleDef.density = 1;
	this.circleDef.restitution = 0.5;
	this.circleDef.friction = 0.0;

	this.bodyDef = new b2BodyDef();
	this.bodyDef.type = b2Body.b2_staticBody; // ball is moving
	this.bodyDef.position.x = pos.x;
	this.bodyDef.position.y = pos.y;
	
	this.startingPosition = goog.object.clone(pos);
	
	this.body = world.CreateBody(this.bodyDef);
	this.body.CreateFixture(this.circleDef);
	
	// add a tag to the body object to represent the maze object type (goal, block, trap, ball)
	var data = { "tag": GameObj.BELL };
	this.body.SetUserData(data);
	this.sprite = new lime.Sprite()
		.setFill("assets/alarm.png")
		.setSize(radius * SCALE, radius * SCALE)
		.setPosition(this.body.GetWorldCenter().x * SCALE, this.body.GetWorldCenter().y * SCALE);;
}
