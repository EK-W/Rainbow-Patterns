module square(vals) {
	for(r = vals[0]) for(g = vals[1]) for(b = vals[2]) translate([r, g, b]) cube(1);
}
function clamp(v, mn, mx) = min(max(v, mn), mx);
function hueToRgb(h) = [
	clamp(abs(3-6*h) - 1, 0, 1),
	clamp(2-abs(2-6*h), 0, 1),
	clamp(2-abs(4-6*h), 0, 1)
];
squareVals = [
	[[0,2],[1],[3]],
	[[0,1,2],[0,1,3],[2]],
	[[0,2],[1,3],[0]],
	[[0,2],[2],[0,2,3]],
	[[1],[0,1,2],[0,3]],
	[[0,2],[0],[0,1,3]],
	[[0,1,2,3],[3],[1,3]],
	[[3],[0,1,2],[0,2,3]],
	[[0,1,2,3],[1,2],[1]]
];
difference() {
	cube([4, 4, 4]);
union() {
color(hueToRgb(0 / len(squareVals))) square(squareVals[0]);
color(hueToRgb(1 / len(squareVals))) square(squareVals[1]);
color(hueToRgb(2 / len(squareVals))) square(squareVals[2]);
color(hueToRgb(3 / len(squareVals))) square(squareVals[3]);
color(hueToRgb(4 / len(squareVals))) square(squareVals[4]);
color(hueToRgb(5 / len(squareVals))) square(squareVals[5]);
color(hueToRgb(6 / len(squareVals))) square(squareVals[6]);
color(hueToRgb(7 / len(squareVals))) square(squareVals[7]);
color(hueToRgb(8 / len(squareVals))) square(squareVals[8]);
}
}

// red 1, green 0, blue 1
// red 3, green 0, blue 1
// red 1, green 2, blue 2