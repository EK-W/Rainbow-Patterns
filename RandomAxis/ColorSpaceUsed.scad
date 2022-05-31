module blueSquare(b, redVals, greenVals) {
	for(r = redVals) {
		for(g = greenVals) {
			translate([r, g, b]) cube(1);
		}
	}
}

module greenSquare(g, redVals, blueVals) {
	for(r = redVals) {
		for(b = blueVals) {
			translate([r, g, b]) cube(1);
		}
	}
}

module redSquare(r, greenVals, blueVals) {
	for(b = blueVals) {
		for(g = greenVals) {
			translate([r, g, b]) cube(1);
		}
	}
}

//blueSquare(0, [0, 2, 3], [0, 1, 2, 3]);
//blueSquare(1, [0, 2, 3], [0, 1, 2, 3]);
//blueSquare(3, [0, 2, 3], [0, 1, 2, 3]);
//redSquare(1, [0, 1, 2, 3], [2]);

blueSquare(2, [0, 1, 3], [0, 2]);
greenSquare(1, [0, 1, 3], [0, 1, 3]);
//redSquare(2, [0, 2, 3], [0, 1, 2, 3]);
//greenSquare(3, [0, 1, 3], [0, 1, 2, 3]);