goog.provide('EnemyBall');

EnemyBall = function(pos, world)
{
	var self = this;
	var cellSize = Constants.cellSize; // space allocated for each maze block (in a 28x20 maze)
	
	this.fixDef = new b2FixtureDef;
	this.fixDef.density = 1;
	this.fixDef.friction = 1;
	this.fixDef.restitution = 1;
	this.fixDef.shape = new b2PolygonShape;
	var size = cellSize;
	this.fixDef.shape.SetAsBox(size, size);
	
	this.bodyDef = new b2BodyDef();
	this.bodyDef.type = b2Body.b2_dynamicBody; // walls don't move
	this.bodyDef.position.x = pos.x;
	this.bodyDef.position.y = pos.y;
    
	this.body = world.CreateBody(this.bodyDef);
	this.body.CreateFixture(this.fixDef);
	
	// add a tag to the body object to represent the maze object type (goal, block, trap, ball)
	var data = { "tag": GameObj.ENEMY_BALL };
	this.body.SetUserData(data);
	this.body.SetBullet(true);
	this.update = function() {
		var center = this.body.GetWorldCenter();
		this.sprite.setPosition(center.x * SCALE, center.y * SCALE);
	}
	this.sprite = new lime.Circle()
		.setFill('#ffffff')
		.setSize(2*size * SCALE, 2*size * SCALE)
		.setPosition(this.body.GetWorldCenter().x * SCALE, this.body.GetWorldCenter().y * SCALE);
}
