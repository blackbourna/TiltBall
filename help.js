//set main namespace
goog.provide('Help');

Help = function() {
	var scene = new lime.Scene();
	var layer = new lime.Layer();
    var self = this;
	layer.setPosition(0, 0);
	scene.appendChild(layer);
	
	backgroundSprite = new lime.Sprite().setSize(WIDTH, HEIGHT).setFill('#000000').setAnchorPoint(0,0);
	layer.appendChild(backgroundSprite);
	
	// add Back button
	var backButton = MainMenu.makeButton('Back').setPosition(WIDTH / 2, 50);
	goog.events.listen(backButton, 'click', function() {
		// load the main menu scene
		loadMainMenu();
	});
	layer.appendChild(backButton);
	
	var txt1 = new lime.Label().setFontSize(28).setSize(WIDTH, 50).setPosition(WIDTH / 2, 170).setAlign('center').setFontColor('#ffffff');
	txt1.setText('Game Instructions');
	layer.appendChild(txt1);
	
	var txt2 = new lime.Label().setFontSize(18).setSize(WIDTH * 0.80, 100).setPosition(WIDTH / 2, 250).setAlign('center').setFontColor('#ffffff');
	txt2.setText('Control the red ball by tilting the phone until it reaches the goal! Avoid black traps!');
	layer.appendChild(txt2);
	
	
	
	
	
	
	this.getScene = function() { return scene; };
}
