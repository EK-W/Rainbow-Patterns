class MultiChannelProperty extends Array {
	constructor(r, g, b) {
		super(3);
		this[0] = r;
		this[1] = g;
		this[2] = b;
	}
	get r() { return this[0]; }
	get g() { return this[1]; }
	get b() { return this[2]; }
	set r(v) { this[0] = v; }
	set g(v) { this[1] = v; }
	set b(v) { this[2] = v; }

	get red() { return this[0]; }
	get green() { return this[1]; }
	get blue() { return this[2]; }
	set red(v) { this[0] = v; }
	set green(v) { this[1] = v; }
	set blue(v) { this[2] = v; }
}