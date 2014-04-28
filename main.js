/*
 * Robot Digger 3000, a programming adventure beneath the surface!
 * Developed by Fernando del Rio - fernandomdr@gmail.com
 */

window.onload = init;

/* GAME LOGIC
 */
 
function init(){
	initText();
	initBehavior();
	initGrammar();
	initMaps();
	initMap(0);
	robotVelocity = $("#velocity").val() == "" ? 200 : $("#velocity").val();
	canvas = document.getElementById("gameCanvas");
	context = canvas.getContext("2d");
	render();
}

function initGrammar(){
	languageGrammar = 
	"\n{\
	labelCounter=0;\
	loopCounter=0;\
	function getLabel(increment) {\
		if(increment){\
			return 'i' + labelCounter++;\
		} else {\
			return 'i' + labelCounter;\
		}\
	}\
	}\
	start\
	  = stmtlist:stmtlist {\
					var res = {};\
					res.code = stmtlist.code;\
					res.instructionCounter = stmtlist.instructionCounter;\
					return res;\
			   }\n\
	\n\
	stmtlist\
	  = stmt:stmt stmtlist:stmtlist {\
					var res = {};\
					res.code = stmt.code + stmtlist.code;\
					res.instructionCounter = stmt.instructionCounter\
						+ stmtlist.instructionCounter;\
					return res;\
			   }\n\
			 / '' {\
					var res = {};\
					res.code = '';\
					res.instructionCounter = 0;\
					return res;\
			   }\n\
	\n\
	stmt\
	  = escape 'move' escape 'forward' escape{\
					var res = {};\
					res.code = 'moveForward();';\
					res.instructionCounter = 1;\
					return res;\
			   }\n\
		     / escape 'move' escape 'backward' escape{\
					var res = {};\
					res.code = 'moveBackward();';\
					res.instructionCounter = 1;\
					return res;\
			   }\n\
		     / escape 'rotate' escape 'right' escape{\
					var res = {};\
					res.code = 'rotateRight();';\
					res.instructionCounter = 1;\
					return res;\
			   }\n\
		     / escape 'rotate' escape 'left' escape{\
					var res = {};\
					res.code = 'rotateLeft();';\
					res.instructionCounter = 1;\
					return res;\
			   }\n\
		     / escape 'repeat' escape quantity:additive escape 'times' escape\
		       stmt:stmt escape {\
					var res = {};\
					res.code = 'for(var ' + getLabel(false) + '=0; '\
								+ getLabel(false) + '<' + quantity + '; '\
								+ getLabel(true) + '++){'\ + stmt.code + '}';\
					res.instructionCounter = stmt.instructionCounter;\
					return res;\
			   }\n\
			 / escape 'if' escape 'wall' escape 'ahead' escape stmt:stmt\
			 escape 'else' escape stmt2:stmt escape{\
					var res = {};\
					res.code = 'wallAhead(function(){' + stmt.code + '}, \
								function(){'+ stmt2.code +'}, false);';\
					res.instructionCounter = stmt.instructionCounter +\
					stmt2.instructionCounter;\
					return res;\
			   }\n\
			 / escape 'if' escape 'rock' escape 'ahead' escape stmt:stmt\
			 escape 'else' escape stmt2:stmt escape{\
					var res = {};\
					res.code = 'rockAhead(function(){' + stmt.code + '}, \
								function(){'+ stmt2.code +'}, false);';\
					res.instructionCounter = stmt.instructionCounter +\
					stmt2.instructionCounter;\
					return res;\
			   }\n\
			 / escape 'if' escape 'wall' escape 'ahead' escape stmt:stmt\
			 escape{\
					var res = {};\
					res.code = 'wallAhead(function(){' + stmt.code + '}, \
								function(){}, false);';\
					res.instructionCounter = stmt.instructionCounter;\
					return res;\
			   }\n\
			 / escape 'if' escape 'rock' escape 'ahead' escape stmt:stmt\
			 escape{\
					var res = {};\
					res.code = 'rockAhead(function(){' + stmt.code + '}, \
								function(){}, false);';\
					res.instructionCounter = stmt.instructionCounter;\
					return res;\
			   }\n\
			 / escape 'if' escape 'no' escape 'wall' escape 'ahead' escape\
			 stmt:stmt escape 'else' escape stmt2:stmt escape{\
					var res = {};\
					res.code = 'wallAhead(function(){' + stmt.code + '}, \
								function(){'+ stmt2.code +'}, true);';\
					res.instructionCounter = stmt.instructionCounter +\
					stmt2.instructionCounter;\
					return res;\
			   }\n\
			 / escape 'if' escape 'no' escape 'rock' escape 'ahead' escape\
			 stmt:stmt escape 'else' escape stmt2:stmt escape{\
					var res = {};\
					res.code = 'rockAhead(function(){' + stmt.code + '}, \
								function(){'+ stmt2.code +'}, true);';\
					res.instructionCounter = stmt.instructionCounter +\
					stmt2.instructionCounter;\
					return res;\
			   }\n\
			 / escape 'if' escape 'no' escape 'wall' escape 'ahead' escape\
			 stmt:stmt escape{\
					var res = {};\
					res.code = 'wallAhead(function(){' + stmt.code + '}, \
								function(){}, true);';\
					res.instructionCounter = stmt.instructionCounter;\
					return res;\
			   }\n\
			 / escape 'if' escape 'no' escape 'rock' escape 'ahead' escape\
			 stmt:stmt escape{\
					var res = {};\
					res.code = 'rockAhead(function(){' + stmt.code + '}, \
								function(){}, true);';\
					res.instructionCounter = stmt.instructionCounter;\
					return res;\
			   }\n\
		     / escape '{' escape stmtlist:stmtlist escape '}' escape {\
					var res = {};\
					res.code = '{' + stmtlist.code + '}';\
					res.instructionCounter = stmtlist.instructionCounter;\
					return res;\
			   }\n\
	\n\
	additive\n\
	  = escape left:multiplicative escape \"+\" escape right:additive escape\
		{ return left + right; }\n\
	  /  multiplicative \n\
	\n\
	multiplicative\n\
	  = escape left:primary escape \"*\" escape right:multiplicative escape\
		{ return left * right; }\n\
	  /  primary \n\
	\n\
	primary\n\
	  = integer \n\
	  /  \"(\" escape additive:additive escape \")\" { return additive; }\n\
	\n\
	integer \"integer\"\n\
	  =  digits:[0-9]+  { return parseInt(digits.join(\"\"), 10); }\n\
	escape = [' ' / '\\n' / '\\r' / '\\t']*\n";
	languageGrammar = PEG.buildParser(languageGrammar);
}

function draw(){
	drawBackground();
	drawMap(maps[selectedMapIndex]);
	drawRobot();
}

function update(){
	if(robot.instructions.length > 0 && !robot.locked){
		if(instructionIndex < robot.battery){
			var instruction = robot.instructions[0];
			instruction();
			if(isRobotBroken()){
				$("#logTxt").val($("#logTxt").val() + "\nI crashed!");
				scrollLog();
				robot.instructions = [];
				robot.crashed = true;
			} else if(isEnd(maps[selectedMapIndex], robot.x, robot.y)){
				$("#logTxt").val($("#logTxt").val()
					+"\nI got the golden nugget, lets move on!");
					scrollLog();
				if(maps[selectedMapIndex+1]==undefined){
					$("#logTxt").val($("#logTxt").val()
					+"\nI got all golden nuggets, I'm just so awesome!");
					scrollLog();
				} else {
					maps[selectedMapIndex+1].locked=false;
					localStorage.setItem("map"+(selectedMapIndex+1),false);
					initSelect();
				}
				robot.instructions = [];
			} else {
				robot.instructions.splice(0,1);
			}
		} else {
			$("#logTxt").val($("#logTxt").val()+"\nLow Battery!");
			scrollLog();
			robot.instructions = [];
		}
	}
}

function render() {
	update();
	draw();
	setTimeout(render, robotVelocity);
}

/* UI
 */

function initBehavior(){
	$("#execute").click(function(){
		ended=false;
		robotVelocity = $("#velocity").val() == "" ? 200 : $("#velocity").val();
		execute();
	});
	$("#reset").click(function(){
		initMap(selectedMapIndex);
		$("#execute").prop("disabled", false);
	});
	$("#clear").click(function(){
		var quantity = parseInt(localStorage.getItem("mapsQuantity"));
		for(var i=0; i < quantity; i++){
			localStorage.removeItem("map"+i);
		}
		localStorage.removeItem("mapsQuantity");
		selectedMapIndex=0;
		initSelect();
		initMap(0);
	});
	/* FUTURE INPUT FOR DEFINE CONSTANTS
	 */
	// $("#defineTxt").keydown(function(e){  // Tabulation
		// if(e.keyCode==9){
			// e.preventDefault();
			// var start = this.selectionStart;
			// var end = this.selectionEnd;
			// var before = $("#defineTxt").val().substring(0,start);
			// var after = $("#defineTxt").val().
						// substring(start,$("#defineTxt").val().length);
			// $("#defineTxt").val(before + "    " + after);
			// this.setSelectionRange(start+4, end+4);
		// }
	// });
	$("#logicTxt").keydown(function(e){ // Tabulation
		if(e.keyCode==9){
			e.preventDefault();
			var start = this.selectionStart;
			var end = this.selectionEnd;
			var before = $("#logicTxt").val().substring(0,start);
			var after = $("#logicTxt").val().
						substring(start,$("#logicTxt").val().length);
			$("#logicTxt").val(before + "    " + after);
			this.setSelectionRange(start+4, end+4);
		}
	});
	$("#logicTxt").keyup(function(e){
		tryExecute();
	});
	$("#maps").change(function(){
		var mapIndex = parseInt($(this).val());
		if(mapIndex==-1){
			alert("This map is locked!");
			$('#maps option[value='+selectedMapIndex+']').prop('selected',true);
		} else {
			selectedMapIndex = mapIndex;
			initMap(mapIndex);
		}
	});
}

function initText(){
	$("#defineTxt").val("");
	$("#logicTxt").val("");
}

function scrollLog(){
	$("#logTxt").animate(
		{scrollTop: $("#logTxt")[0].scrollHeight - $("#logTxt").height()},10
	);
}

function drawBackground(){
	drawRectangle(0,0,800,600,"#A66102");
}

function initSelect(){
	$('#maps').html('');
	for(var i=0; i < maps.length; i++){
		if(i == selectedMapIndex){
			if(maps[i].locked){
				$('#maps').append('<option selected value="-1">(Locked) Map '
					+(i+1)+'</option>');
			} else {
				$('#maps').append('<option selected value="' + i + '">Map '
					+(i+1)+'</option>');
			}		
		} else {
			if(maps[i].locked){
				$('#maps').append('<option value="-1">(Locked) Map '+(i+1)
					+'</option>');
			} else {
				$('#maps').append('<option value="' + i + '">Map '+(i+1)
					+'</option>');
			}
		}
	}
}

/* ROBOT
 */

var direction = {
	LEFT  : 0,
	DOWN  : 1,
	RIGHT : 2,
	UP    : 3
}

function initRobot(){
	robot = {};
	robot.x = 0;
	robot.y = 0;
	robot.direction = direction.RIGHT;
	robot.battery = 0;
	robot.memory = 0;
	robot.instructions = [];
	robot.locked = true;
	robot.crashed = false;
}

function drawRobot(){
	if(!robot.crashed){
		translate(robot.x+20,robot.y+20);
		switch(robot.direction){
			case direction.UP:
				rotate(90);
			case direction.LEFT:
				rotate(90);
			case direction.DOWN:
				rotate(90);
		}
		beginPolygon(-20,-20,2,"#111");
		drawPolygonLine(-20, 20);
		drawPolygonLine(20, 0);
		drawPolygonLine(-20, -20);
		endPolygon();
		switch(robot.direction){
			case direction.UP:
				rotate(-90);
			case direction.LEFT:
				rotate(-90);
			case direction.DOWN:
				rotate(-90);
		}
		translate(-robot.x-20,-robot.y-20);
	} else {
		drawCircle(robot.x+20, robot.y+20, 20, "#111");
	}
}

function execute(){
	initMap(selectedMapIndex);
	var inputValue=$("#logicTxt").val();
	try{
		var result = languageGrammar.parse(inputValue);
		eval(result.code);
		if(result.instructionCounter > 0){
			$("#logTxt").val($("#logTxt").val()+"\nNumber of instructions: "
				+ result.instructionCounter);
		}
		scrollLog();
		if(result.instructionCounter > robot.memory){
			$("#logTxt").val($("#logTxt").val()+"\nMemory overflow!");
			scrollLog();
			$("#execute").prop("disabled", false);
		} else {
			robot.locked=false;
			instructionIndex = 0;
			$("#execute").prop("disabled", true);
		}
	} catch(err){
		$("#logTxt").val($("#logTxt").val()+"\nError parsing the code");
		scrollLog();
		$("#execute").prop("disabled", false);
	}
}

function tryExecute(){
	tryExec = true;
	initMap(selectedMapIndex);
	var inputValue=$("#logicTxt").val();
	try{
		var result = languageGrammar.parse(inputValue);
		eval(result.code);
		if(result.instructionCounter > 0){
			$("#logTxt").val($("#logTxt").val()+"\nNumber of instructions: "
				+ result.instructionCounter);
		}
		scrollLog();
		if(result.instructionCounter > robot.memory){
			$("#logTxt").val($("#logTxt").val()+"\nMemory overflow!");
			scrollLog();
		} else {
			robot.locked=false;
			instructionIndex = 0;
		}
	} catch(err){
		$("#logTxt").val($("#logTxt").val()+"\nError parsing the code");
		scrollLog();
	}
	tryExec = false;
}
 
function moveForward(){
	if(tryExec){
		return;
	}
	var instruction = function(){
		instructionIndex++;
		$("#logTxt").val($("#logTxt").val()
			+"\nI'm moving forward\nBattery remaining: "
			+ (robot.battery-instructionIndex));
		scrollLog();
		switch(robot.direction){
			case direction.LEFT:
				robot.x-=40;
				break;
			case direction.RIGHT:
				robot.x+=40;
				break;
			case direction.UP:
				robot.y-=40;
				break;
			case direction.DOWN:
				robot.y+=40;
		}
		if(robot.x >= 0 && robot.x < 800 && robot.y >= 0 && robot.y < 600 
		   && maps[selectedMapIndex].data[robot.y/40][robot.x/40] == 4){
			maps[selectedMapIndex].data[robot.y/40][robot.x/40]=0;
		}
	}
	robot.instructions.push(instruction);
}

function moveBackward(){
	if(tryExec){
		return;
	}
	var instruction = function(){
		instructionIndex++;
		$("#logTxt").val($("#logTxt").val()
			+ "\nI'm moving backward\nBattery remaining: "
			+ (robot.battery-instructionIndex));
		scrollLog();
		switch(robot.direction){
			case direction.LEFT:
				robot.x+=40;
				break;
			case direction.RIGHT:
				robot.x-=40;
				break;
			case direction.UP:
				robot.y+=40;
				break;
			case direction.DOWN:
				robot.y-=40;
		}
		if(robot.x >= 0 && robot.x < 800 && robot.y >= 0 && robot.y < 600 
		   && maps[selectedMapIndex].data[robot.y/40][robot.x/40] == 4){
			maps[selectedMapIndex].data[robot.y/40][robot.x/40]=0;
		}
	}
	robot.instructions.push(instruction);
}

function rotateLeft(){
	if(tryExec){
		return;
	}
	var instruction = function(){
		instructionIndex++;
		$("#logTxt").val($("#logTxt").val()
			+ "\nI'm rotating left\nBattery remaining: "
			+ (robot.battery-instructionIndex));
		scrollLog();
		robot.direction++;
		if(robot.direction > 3) {
			robot.direction=0;
		}
	}
	robot.instructions.push(instruction);
}

function rotateRight(){
	if(tryExec){
		return;
	}
	var instruction = function(){
		instructionIndex++;
		$("#logTxt").val($("#logTxt").val()
			+ "\nI'm rotating right\nBattery remaining: "
			+ (robot.battery-instructionIndex));
		scrollLog();
		robot.direction--;
		if(robot.direction < 0) {
			robot.direction=3;
		}
	}
	robot.instructions.push(instruction);
}

function rockAhead(function1,function2, reverse){
	if(tryExec){
		return;
	}
	var instruction = function(){
		var backupCheck = robot.instructions.slice(0,1);
		var backupAll = robot.instructions.slice(1);
		robot.instructions = [];
		robot.instructions.push(backupCheck[0]);
		if(hasRockAhead()){
			$("#logTxt").val($("#logTxt").val()	+"\nDetected rock ahead: ");
			scrollLog();
			if(!reverse){
				function1();
			} else {
				function2();
			}
		} else {
			$("#logTxt").val($("#logTxt").val()	+"\nThere is no rock ahead: ");
			scrollLog();
			if(!reverse){
				function2();
			} else {
				function1();
			}
		}
		for(var i=0; i < backupAll.length; i++){
			robot.instructions.push(backupAll[i]);
		}
	}
	robot.instructions.push(instruction);
}

function wallAhead(function1,function2, reverse){
	if(tryExec){
		return;
	}
	var instruction = function(){
		var backupCheck = robot.instructions.slice(0,1);
		var backupAll = robot.instructions.slice(1);
		robot.instructions = [];
		robot.instructions.push(backupCheck[0]);
		if(hasWallAhead()){
			$("#logTxt").val($("#logTxt").val()	+"\nDetected wall ahead: ");
			scrollLog();
			if(!reverse){
				function1();
			} else {
				function2();
			}
		} else {
			$("#logTxt").val($("#logTxt").val()	+"\nThere is no wall ahead: ");
			scrollLog();
			if(!reverse){
				function2();
			} else {
				function1();
			}
		}
		for(var i=0; i < backupAll.length; i++){
			robot.instructions.push(backupAll[i]);
		}
	}
	robot.instructions.push(instruction);
}

function isRobotBroken(){
	if(robot.x < 0 || robot.x > 760 || robot.y < 0 || robot.y > 560 
	|| isRock(maps[selectedMapIndex], robot.x, robot.y)){
		return true;
	} else {
		return false;
	}
}

/* MAPS
 */

function initMaps(){
	selectedMapIndex = 0;
	maps = [];
	maps.push({ //0
		robotBattery : 10,
		robotMemory : 6,
		robotDirection : direction.DOWN
	});
	maps.push({ //1
		robotBattery : 10,
		robotMemory : 6,
		robotDirection : direction.DOWN
	});
	maps.push({ //2
		robotBattery : 10,
		robotMemory : 2,
		robotDirection : direction.DOWN
	});
	maps.push({ //3
		robotBattery : 20,
		robotMemory : 20,
		robotDirection : direction.UP
	});
	maps.push({ //4
		robotBattery : 20,
		robotMemory : 5,
		robotDirection : direction.RIGHT
	});
	maps.push({ //5
		robotBattery : 20,
		robotMemory : 5,
		robotDirection : direction.RIGHT
	});
	maps.push({ //6
		robotBattery : 16,
		robotMemory : 30,
		robotDirection : direction.LEFT
	});
	maps.push({ //7
		robotBattery : 40,
		robotMemory : 6,
		robotDirection : direction.RIGHT
	});
}

function initMapData(){
	/*
	 * 0 : Nothing
	 * 1 : Begin
	 * 2 : End
	 * 3 : Rock
	 * 4 : Ground
	 */
	maps[0].data =
	[
		[4,4,4,4,4,4,4,4,4,1,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,2,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]
	];
	maps[1].data =
	[
		[4,4,4,4,4,4,4,4,4,1,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,2,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]
	];
	maps[2].data =
	[
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,2,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,1,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]
	];
	maps[3].data =
	[
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,2,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]
	];
	maps[4].data =
	[
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,1,4,4,4,4,4,4,4,4,4,2,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]
	];
	maps[5].data =
	[
		[4,4,4,4,4,4,4,4,4,4,4,4,3,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,3,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,3,4,4,4,4,4,4,4],
		[4,4,4,1,4,4,4,4,4,4,4,4,3,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,3,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,3,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,3,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,2,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]
	];
	maps[6].data =
	[
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[2,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1,4],
		[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,4,3,3,3,3],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,4,2,3,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
		[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]
	];
	maps[7].data =
	[
		[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
		[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
		[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
		[3,1,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3],
		[3,3,3,3,3,3,3,3,4,3,3,3,3,3,3,3,3,3,3,3],
		[3,3,3,3,3,3,3,3,4,3,3,3,3,3,3,3,3,3,3,3],
		[3,3,3,3,3,3,3,3,4,4,4,3,3,3,3,3,3,3,3,3],
		[3,3,3,3,3,3,3,3,3,3,4,3,3,3,3,3,3,3,3,2],
		[3,3,3,3,3,3,3,3,3,3,4,3,3,3,3,3,3,3,3,4],
		[3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4],
		[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
		[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
		[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
		[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
		[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
	];
	var quantity = parseInt(localStorage.getItem("mapsQuantity"));
	if(quantity > 0){
		for(var i=0; i < quantity; i++){
			if(localStorage.getItem("map"+i) == "true"){
				maps[i].locked = true;
			} else {
				maps[i].locked = false;
			}
		}
	} else {
		quantity = maps.length;
		localStorage.setItem("mapsQuantity",quantity);
		localStorage.setItem("map0",false);
		maps[0].locked = false;
		for(var i=1; i < quantity; i++){
			localStorage.setItem("map"+i,true);
			maps[i].locked = true;
		}
	}
	initSelect();
}

function initMap(index){
	initMapData();
	instructionIndex = 0;
	initRobot();
	robot.x = getBeginX(maps[index]);
	robot.y = getBeginY(maps[index]);
	robot.direction = maps[index].robotDirection;
	robot.battery = maps[index].robotBattery;
	robot.memory = maps[index].robotMemory;
	$("#logTxt").val("Starting...\nBattery : " + robot.battery
		+ "\nMemory  : " + robot.memory);
	$("#execute").prop("disabled", false);
}

function getBeginX(map){
	for(var i=0; i < 14; i++){
		for(var j=0; j < 19; j++){
			if(map.data[i][j] == 1) return j*40;
		}
	}
}

function getBeginY(map){
	for(var i=0; i < 14; i++){
		for(var j=0; j < 19; j++){
			if(map.data[i][j] == 1) return i*40;
		}
	}
}

function isRock(map, i, j){
	return map.data[j/40][i/40] == 3;
}

function isEnd(map, i, j){
	return map.data[j/40][i/40] == 2;
}

function hasWallAhead(){
	switch(robot.direction){
		case direction.LEFT:
			return robot.x == 0;
		case direction.RIGHT:
			return robot.x == 760;
		case direction.UP:
			return robot.y == 0;
		case direction.DOWN:
			return robot.y == 560;
	}
	return false;
}

function hasRockAhead(){
	if(robot.direction == direction.LEFT && robot.x/40-1 > 0){
		return maps[selectedMapIndex].data[robot.y/40][robot.x/40-1] == 3;
	} else if(robot.direction == direction.RIGHT && robot.x/40+1 < 20){
		return maps[selectedMapIndex].data[robot.y/40][robot.x/40+1] == 3;
	} else if(robot.direction == direction.UP && robot.y/40-1 > 0){
		return maps[selectedMapIndex].data[robot.y/40-1][robot.x/40] == 3;
	} else if(robot.direction == direction.DOWN && robot.y/40+1 < 15){
		return maps[selectedMapIndex].data[robot.y/40+1][robot.x/40] == 3;
	}
	return false;
}

function drawMap(map){
	for(var i=0; i < 15; i++){
		for(var j=0; j < 20; j++){
			switch(map.data[i][j]){
				case 2: //END
					drawRectangle(j*40,i*40,40,40,"#ECEC00");
					break;
				case 3: //ROCK
					drawRectangle(j*40,i*40,40,40,"#402000");
					break;
				case 4: //NOTHING
					drawRectangle(j*40,i*40,40,40,"#713800");
			}
		}
	}
}

/* UTILS
 */

function drawCircle(x, y, r, color) {
	context.fillStyle = color;
	context.beginPath();
	context.arc(x, y, r, 0, Math.PI * 2, false);
	context.closePath();
	context.fill();
}

function drawRectangle(x, y, width, height, color) {
	context.fillStyle = color;
	context.fillRect(x, y, width, height);
}

function beginPolygon(x,y,lineWidth,color){
	context.fillStyle = color;
	context.lineWidth = lineWidth;
	context.beginPath();
	context.moveTo(x, y);
}

function drawPolygonLine(x,y){
	context.lineTo(x,y);
}

function endPolygon(){
	context.closePath();
	context.fill();
}

function translate(x,y){
	context.translate(x,y);
}

function rotate(degrees){
	context.rotate(degrees*Math.PI/180);
}