goog.provide('WorldListener');

WorldListener = function(game) {
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
	listener.PreSolve = function(contact, oldManifold) {
		var contactDataA = contact.GetFixtureA().GetBody().GetUserData();
		if (!contactDataA) return;
		if (contactDataA.isKey) {
			var color = contactDataA.color;
			game.flashScreen();
			game.setUnlocked(color);
		}
	}
	listener.PostSolve = function(contact, impulse) {
		var contactDataA = contact.GetFixtureA().GetBody().GetUserData();
		var contactDataB = contact.GetFixtureB().GetBody().GetUserData();
		if (!contactDataA) return;
		//console.log(device.platform);
		// don't think you can call vibrate here b/c it's during the step
		var hasSnd = (device.platform.indexOf("Android") > -1);
		if (device.platform.indexOf("Android") > -1) {
			//navigator.notification.vibrate(50);
			
		}
		if (contactDataA.tag == GameObj.BALL) {
			if (contactDataB.tag == GameObj.TRAP) {
                var ballData = contact.GetFixtureA().GetBody().GetUserData();
                ballData.flaggedForDeletion = true;
                game.timesTrapped++;
				if (hasSnd) {
					self.trapsnd.seekTo(0);
					self.trapsnd.play();
				}
			} else if (contactDataB.tag == GameObj.GOAL) {
				var ballData = contact.GetFixtureA().GetBody().GetUserData();
                ballData.flaggedForDeletion = true;
                ballData.hasReachedTheGoal = true;
				if (hasSnd) {
					self.goalsnd.seekTo(0);
					self.goalsnd.play();
				}
			}
		} else if (contactDataA.tag == GameObj.BLOCK) {
            if (impulse.normalImpulses[0] < 0.05) return;
            //console.log(impulse.normalImpulses[0]);
			if (hasSnd) {
				self.wallhitsnd.seekTo(0);
				self.wallhitsnd.play();
			}
        }
	}
	return listener;
}
