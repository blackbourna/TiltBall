goog.provide("PointSpinner");

PointSpinner = function(pos, world, scaleY) {
	var self = this;
	var cellSize = Constants.cellSize; // space allocated for each maze block (in a 28x20 maze)
	if (!length) {
		length = 0.8;
	}
	if (!scaleY) {
		scaleY = 1;
	}
	
	// setup block
	this.fixDef = new b2FixtureDef;
	this.fixDef.density = 10;
	this.fixDef.friction = 0.3;
	this.fixDef.restitution = 0.0;
	this.fixDef.shape = new b2PolygonShape;
	this.fixDef.shape.SetAsBox(cellSize/8, cellSize/8);
	
	this.bodyDef = new b2BodyDef();
	this.bodyDef.type = b2Body.b2_staticBody; // walls don't move
	this.bodyDef.position.x = pos.x;
	this.bodyDef.position.y = pos.y;
    
	this.staticBody = world.CreateBody(this.bodyDef);
	this.staticBody.CreateFixture(this.fixDef);
	
	// add a tag to the body object to represent the maze object type (goal, block, trap, ball)
	var data = { "tag": GameObj.POINT_SPINNER };
	this.blockSprite = (new lime.Sprite)
		.setFill('assets/block.png')
		.setSize(cellSize/4 * SCALE, cellSize/4 * SCALE)
		.setPosition(this.staticBody.GetWorldCenter().x * SCALE, this.staticBody.GetWorldCenter().y * SCALE);
	// setup spinner
	this.fixDef = new b2FixtureDef;
	this.fixDef.density = 10;
	this.fixDef.friction = 1;
	this.fixDef.restitution = 0.0;
	this.fixDef.shape = new b2PolygonShape;
	this.fixDef.shape.SetAsBox(cellSize/4, cellSize * 1.5 * length * scaleY);
	
	this.bodyDef = new b2BodyDef();
	this.bodyDef.type = b2Body.b2_dynamicBody; // walls don't move
	this.bodyDef.position.x = pos.x;
	this.bodyDef.position.y = pos.y;
    
	this.dynamicBody = world.CreateBody(this.bodyDef);
	this.dynamicBody.CreateFixture(this.fixDef);
	
	var data = { "tag": GameObj.POINT_SPINNER };
	this.dynamicBody.SetUserData(data);
	this.update = function() {
		//this.body.SetAwake(true);
		var angle = this.dynamicBody.GetAngle()*180/Math.PI;
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
		.setSize(cellSize * SCALE/4, cellSize * 2 * SCALE* length * scaleY)
		.setAnchorPoint(0.5, 0)
		.setPosition(this.dynamicBody.GetWorldCenter().x * SCALE, this.dynamicBody.GetWorldCenter().y * SCALE);
	// setup revolute joint
	var joint  = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
	joint.Initialize(this.staticBody, this.dynamicBody, this.staticBody.GetWorldCenter());
	joint.maxMotorTorque = 100;
	joint.motorSpeed = 10;
	joint.enableMotor = true;
	world.CreateJoint(joint);
	console.log(Box2D.Dynamics.Joints.b2RevoluteJointDef);
}