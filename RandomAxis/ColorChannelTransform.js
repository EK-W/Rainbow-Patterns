class ColorChannel {
	static RED = 0;
	static GREEN = 1;
	static BLUE = 2;
	constructor(numValues) {
		this.values = [];

		for(let i = 0; i < numValues; i++) {
			this.values.push(i);
		}
		this.minValue = 0;
		this.maxValue = numValues - 1;
	}
	toDisplayedValue(val) {
		const range = this.maxValue - this.minValue;
		const distBetweenValues = range / (this.values.length - 1);

		return Math.floor(val * distBetweenValues) + this.minValue;
	}
	setRange(minValue, maxValue) {
		this.minValue = minValue;
		this.maxValue = maxValue;
		
		// // at the end, we want this.values[0] to be minValue
		// // and this.values[this.values.length - 1] to be maxValue

		return this;
	}
	removeByIndex(toRemove) {
		if(typeof toRemove === "number") {
			this.values.splice(toRemove, 1);
		}
		// clone the array and sort the clone in ascending order
		toRemove = Array.from(toRemove).sort((a, b) => a - b);

		for(let i = toRemove.length - 1; i >= 0; i--) {
			this.values.splice(toRemove[i], 1);
		}

		return this;
	}
	removeByValue(toRemove) {
		if(typeof toRemove === "number") {
			toRemove = [toRemove];
		}
		// clone the array and sort the clone in ascending order
		toRemove = Array.from(toRemove).sort((a, b) => a - b);
		
		this.values = this.values.filter((val) => !toRemove.includes(this.toDisplayedValue(val)));

		return this;
	}
	toSerializedString() {
		return `${this.minValue},${this.maxValue}:${this.values.map((v) => v.toString(36)).join(",")}`;
	}
	static fromSerializedString(str) {
		const [minMaxStr, valuesStr] = str.split(":");
		
		const minMaxArr = minMaxStr.split(",");
		const min = +minMaxArr[0];
		const max = +minMaxArr[1];

		const values = valuesStr.split(",").map((v) => Number.parseInt(v, 36));

		const ret = new ColorChannel(0);
		ret.values = values;
		ret.minValue = min;
		ret.maxValue = max;

		return ret;
	}
	static getName(channelNum) {
		switch(channelNum) {
		case ColorChannel.RED:
			return "red";
		case ColorChannel.GREEN:
			return "green";
		case ColorChannel.BLUE:
			return "blue";
		default:
			return "InvalidColorChannel";
		}
	}
	static getInitial(channelNum) {
		switch(channelNum) {
		case ColorChannel.RED:
			return "r";
		case ColorChannel.GREEN:
			return "g";
		case ColorChannel.BLUE:
			return "b";
		default:
			return "InvalidColorChannel";
		}
	}
}