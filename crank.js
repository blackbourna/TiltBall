goog.provide('Crank');

// DOES NOT WORK AT ALL, NO SPRITES BOUND
Crank = function(pos, world)
{
	var self = this;
	var cellSize = Constants.cellSize; // space allocated for each maze block (in a 28x20 maze)

	// Define crank.
	var sd = new b2BoxDef();
	sd.extents.Set(cellSize/5, cellSize);
	sd.density = 1.0;

	var bd = new b2BodyDef();
	bd.AddShape(sd);
	
	var rjd = new b2RevoluteJointDef();

	var prevBody = ground;

	bd.position.Set(pos.x, pos.y);
	var body = world.CreateBody(bd);

	rjd.anchorPoint.Set(pos.x, pos.y-cellSize/2);
	rjd.body1 = prevBody;
	rjd.body2 = body;
	rjd.motorSpeed = -1.0 * Math.PI;
	rjd.motorTorque = 500000000.0;
	rjd.enableMotor = true;
	world.CreateJoint(rjd);

	prevBody = body;

	// Define follower.
	sd.extents.Set(cellSize/2, cellSize * 2);
	bd.position.Set(pos.x, pos.y - cellSize/3);
	body = world.CreateBody(bd);

	rjd.anchorPoint.Set(500/2, 185);
	rjd.body1 = prevBody;
	rjd.body2 = body;
	rjd.enableMotor = false;
	world.CreateJoint(rjd);

	prevBody = body;

	// Define piston
	sd.extents.Set(cellSize*0.8, cellSize*0.8);
	bd.position.Set(pos.x, pos.y - cellSize/5);
	body = world.CreateBody(bd);

	rjd.anchorPoint.Set(pos.x, pos.y - cellSize/5);
	rjd.body1 = prevBody;
	rjd.body2 = body;
	this.rjd = world.CreateJoint(rjd);

	var pjd = new b2PrismaticJointDef();
	pjd.anchorPoint.Set(pos.x, pos.y - cellSize/5);
	pjd.body1 = ground;
	pjd.body2 = body;
	pjd.axis.Set(0.0, 1.0);
	pjd.motorSpeed = 0.0; // joint friction
	pjd.motorForce = 100000.0;
	pjd.enableMotor = true;
	this.pjd = world.CreateJoint(pjd);

	// Create a payload
	sd.density = 2.0;
	bd.position.Set(pos.x, pos.y - cellSize/5);

	this.body = world.CreateBody(bd);
	//this.body.CreateFixture(this.fixDef);
	
	// add a tag to the body object to represent the maze object type (goal, block, trap, ball)
	var data = { "tag": GameObj.CRANK };
	this.body.SetUserData(data);
	
}
