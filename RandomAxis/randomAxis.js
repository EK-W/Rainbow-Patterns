var world;

window.addEventListener("load", function() {
	const canvas = document.getElementById('canvas');
	const ctx = canvas.getContext("2d");

	const channelSize = 256;

	console.log("Starting new image!");

	if(true) {
		/*const*/ world = new World(canvas,
			new ColorChannel(channelSize).setRange(0, 255),
			new ColorChannel(channelSize).setRange(0, 255),
			new ColorChannel(channelSize).setRange(0, 255)
		);

		console.log("Adding squares!");

		while(!world.channels.some((channel) => channel.numUnsquaredVals === 0)) {
			const newSquare = Square.createRandomSquare(world);
			world.addSquare(newSquare);
		}
	} else {
		world = World.fromSerializedString(canvas, "F|0,255:0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f 0,255:0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f 0,255:0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f|2:1F--P0.9932686843895135 0:11T--P0.9755766574555365 2:15T--P0.8369855530039011 1:8T-+P0.9335979705140751 2:2F+-P0.6908017619242346 2:9T--P0.6808400070320512 2:4T++P0.6829801177140465 1:4T-+P0.6842144782446804 1:10T++P0.5674534098788675 1:12F-+P0.5958275724539414 1:11T++P0.578010964052261 1:6T--P0.6772159477395987 1:13T-+P0.4329457449804802 1:2T+-P0.4525626690406358 1:14T++P0.4191813049771447 1:9F+-P0.3406725841259487 1:3T++P0.32213328569294497 0:15T++P0.5471666873691124 2:7F+-P0.39908728835952856 2:6F++P0.3739982306279991 1:7F-+P0.2754080109765924 1:1T+-P0.2583502359998332 1:5T-+P0.27002488094579014 1:0T-+P0.2106222055432888 2:12F++P0.33740838611131563 1:15F++P0.17307193866162607 2:10F--P0.30777524908716647 0:14F++P0.27376753561854184 0:1F-+P0.21229168783316066 2:0F--P0.17505032780265473 2:5T--P0.03202703755464964 2:13T+-P0.03787578927554447 2:3F++P0.10749029170315239 2:8F+-P0.09711251430548129 2:11F-+P0.0421451779118317");
	}

	console.log("Assigning square intersections!");

	world.assignSquareIntersections();

	console.log("Sorting squares!");
	//world.squares.sort((a, b) => b.totalSquareSize - a.totalSquareSize);

	// document.body.append(world.redCanvas.rootElement);
	// document.body.append(world.greenCanvas.rootElement);
	// document.body.append(world.blueCanvas.rootElement);

	//console.log("Making sure all colors can be drawn!");
	//world.doAllColorsHaveSquares();

	console.log("Making sure we don't have too many colors!");
	const numSquareColors = world.squares.reduce((sum, square) => sum + square.totalSquareSize, 0);
	if(numSquareColors > Math.pow(channelSize, 3)) {
		throw `Error! The squares contain ${numSquareColors} colors `
			+ `but the world only has space for ${Math.pow(channelSize, 3)}!`;
	}

	console.log(world);

	console.log("Starting!");

	world.draw();

	//randomAxisSquares(ctx);
	console.log("Done!");
	
	//world.getMissingColors();

	//console.log(world.toOpenScadCode());
});