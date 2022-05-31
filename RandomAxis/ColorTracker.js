class ColorTracker {
	constructor(rNum, gNum, bNum) {
		this.rNum = rNum;
		this.gNum = gNum;
		this.bNum = bNum;
		this.totalNumColors = rNum * gNum * bNum;
		this.arr = new Uint8Array(Math.ceil(totalNumColors / 8));
		this.arr.fill(0);
	}
	setColorUsed(r, g, b) {
		const bitIndex = (((r * this.gNum) + g) * bNum) + b;
		const byteIndex = Math.floor(bitIndex / 8);
		const bitIndexInByte = 
	}
}