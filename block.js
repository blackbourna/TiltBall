goog.provide('Block');

Block = function(pos, world)
{
	var self = this;
	var cellSize = Constants.cellSize; // space allocated for each maze block (in a 28x20 maze)
	
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
	var data = { "tag": GameObj.BLOCK };
	this.body.SetBullet(true);
	this.body.SetUserData(data);
	this.sprite = (new lime.Sprite)
		.setFill('assets/pillars.png')
		.setSize(cellSize * SCALE, cellSize * SCALE)
		.setPosition(this.body.GetWorldCenter().x * SCALE, this.body.GetWorldCenter().y * SCALE);
}
