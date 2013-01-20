//set main namespace
goog.provide('MainMenu');


//get requirements
goog.require('lime');
goog.require('lime.Circle');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.fill.LinearGradient');
goog.require('lime.Label');
// custom classes
goog.require('Button');
goog.require('Game');
goog.require('Help');


// constants
SCALE = 60.0; // for box2d (pixels/meter)
WIDTH = 320;
HEIGHT = 450;

// entrypoint, pre-flight checks..
MainMenu.start = function() {
	// check all requirements (accelerometer, etc...)
	document.addEventListener("deviceready", MainMenu.setupGame, false);
}

// setup game
MainMenu.setupGame = function() {
	// setup the game, all preconditions are met (accelerometer, etc..)
	// setup the director
	director = new lime.Director(document.body, WIDTH, HEIGHT);
	director.makeMobileWebAppCapable();
	
	// load the main menu scene
	MainMenu.loadMainMenu();
}

// load main menu scene
MainMenu.loadMainMenu = function() {
	// load the main menu
	var scene = new lime.Scene(),
	layer = new lime.Layer().setPosition(WIDTH / 2, 0);
	
	var title = new lime.Sprite().setFill('assets/tilttheball.gif').setPosition(0, 125).setSize(300, 49);
	//title.qualityRenderer = true;
	layer.appendChild(title);
	
	// main menu buttons layer
	var buttonsLayer = new lime.Layer().setPosition(0, 200);
	layer.appendChild(buttonsLayer);
	
	// add play button
	var playButton = MainMenu.makeButton('Play Game').setPosition(0, 80);
	goog.events.listen(playButton, 'click', function() {
		// play the game!!!
		MainMenu.newGame();
	});
	buttonsLayer.appendChild(playButton);
	
	// add Help button
	var helpButton = MainMenu.makeButton('Help').setPosition(0, 150);
	goog.events.listen(helpButton, 'click', function() {
		// show help window
		//loadHelpScene();
        alert('Control the red ball by tilting the phone until it reaches the goal! Avoid black traps!');
	});
	buttonsLayer.appendChild(helpButton);
    
	// add Help button
	var aboutButton = MainMenu.makeButton('About').setPosition(0, 220);
	goog.events.listen(aboutButton, 'click', function() {
		alert('Created by Andrew Blackbourn and Mohamed Ibrahim.\nCopyright 2012 Licensed under BSD 2-clause license ("Simplified BSD License" or "FreeBSD License")');
	});
	buttonsLayer.appendChild(aboutButton);
	
	// add the layer to the scene and view scene
	scene.appendChild(layer);
	
	// set current scene active
	director.replaceScene(scene);
}


// load new game scene
MainMenu.newGame = function() {
    var scene = new Game(director, 0).getScene();
	director.replaceScene(scene);
};

// helper for same size buttons
MainMenu.makeButton = function(text) {
    var btn = new Button(text).setSize(170, 45);
    return btn;
};


// load new help scene
MainMenu.loadHelpScene = function() {
    var scene = new Help().getScene();
	director.replaceScene(scene);
};


// this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('start', MainMenu.start);
