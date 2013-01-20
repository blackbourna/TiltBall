goog.provide('soft_eng.WorldListener');

soft_eng.WorldListener = function(game) {
	var self = this;
    this.game = game;
    self.wallhitsnd = new Media('/android_asset/www/assets/wallhit.wav');
    self.trapsnd = new Media('/android_asset/www/assets/trap.wav');
    self.goalsnd = new Media('/android_asset/www/assets/goal.wav');
	var b2Listener = Box2D.Dynamics.b2ContactListener;
	//Add listeners for contact
	var listener = new b2Listener;

	listener.BeginContact = function(contact) {
		//console.log(contact.GetFixtureA().GetBody().GetUserData());
	}

	listener.EndContact = function(contact) {
		// console.log(contact.GetFixtureA().GetBody().GetUserData());
	}

	listener.PostSolve = function(contact, impulse) {
		var contactDataA = contact.GetFixtureA().GetBody().GetUserData().tag;
		var contactDataB = contact.GetFixtureB().GetBody().GetUserData().tag;
		//console.log(device.platform);
		// don't think you can call vibrate here b/c it's during the step
		if (device.platform.indexOf("Android") > -1) {
			//navigator.notification.vibrate(50);
		}
		if (contactDataA == MazeEnum.BALL) {
			if (contactDataB == MazeEnum.TRAP) {
                var ballData = contact.GetFixtureA().GetBody().GetUserData();
                ballData.flaggedForDeletion = true;
                game.timesTrapped++;
                self.trapsnd.seekTo(0);
                self.trapsnd.play();
			} else if (contactDataB == MazeEnum.GOAL) {
				var ballData = contact.GetFixtureA().GetBody().GetUserData();
                ballData.flaggedForDeletion = true;
                ballData.hasReachedTheGoal = true;
                self.goalsnd.seekTo(0);
                self.goalsnd.play();
			} else if (contactDataA == MazeEnum.BLOCK && contactDataB == MazeEnum.BLOCKER) {
				alert('test');
				var body = contact.GetFixtureB().GetBody();
				var blockerData = body.GetUserData();
				blockerData.dir.x *= -1;
				blockerData.dir.y *= -1;
				body.SetUserData(blockerData);
			} else if (contactDataA == MazeEnum.BLOCKER && contactDataB == MazeEnum.BLOCK) {
				alert('test2');
			} else {
            }
		} else if (contactDataA == MazeEnum.BLOCK) {
            if (impulse.normalImpulses[0] < 0.05) return;
            //console.log(impulse.normalImpulses[0]);
            self.wallhitsnd.seekTo(0);
            self.wallhitsnd.play();
        }
	}

	listener.PreSolve = function(contact, oldManifold) {
		// PreSolve
	}

	return listener;
}
