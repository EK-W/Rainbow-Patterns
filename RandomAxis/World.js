class WorldChannelInfo {
	constructor(id, channelObj) {
		this.id = id;
		this.channelObj = channelObj;

		this.totalSize = channelObj.values.length;

		const unsquaredValsArr = [];
		for(let i = 0; i < this.totalSize; i++) {
			unsquaredValsArr.push(i);
		}
		this.unsquaredVals = new SortedArray((a, b) => a - b);
		this.unsquaredVals.values = unsquaredValsArr;

		this.squares = new SortedArray((a, b) => a.constChannelValue - b.constChannelValue);
	}
	get initial() {
		return ColorChannel.getInitial(this.id);
	}
	get name() {
		return ColorChannel.getName(this.id);
	}
	get numUnsquaredVals() {
		return this.unsquaredVals.length;
	}

	registerSquare(square) {
		if(square.constChannel !== this) {
			throw `Error in registerSquare: square ${square.squareId} must be registered in the ${square.constChannel.name}`
				+ ` WorldChannelInfo object, not the ${this.name} WorldChannelInfo object! (note: if these appear to be the same`
				+ ` channel, you might be trying to add the square to the wrong World object.)`;
		}

		if(!this.unsquaredVals.remove(square.constChannelValue)) {
			throw `Error in registerSquare: unable to remove ${square.constChannelValue} from the`
				+ ` ${this.name} WorldChannelInfo's unsquared values!`;
		}

		if(!this.squares.add(square)) {
			throw `Error in registerSquare: unable to add ${square.squareId} to the ${this.name} WorldChannelInfo squares!`;
		}
	}
}
               
class World {
	constructor(canvas, rChannel, gChannel, bChannel, debugCanvases = false) {
		this.channels = new MultiChannelProperty(
			new WorldChannelInfo(0, rChannel),
			new WorldChannelInfo(1, gChannel),
			new WorldChannelInfo(2, bChannel)
		);

		this.valueStatuses = {};
		for(let channel of this.channels) {
			for(let val of channel.unsquaredVals) {
				this.valueStatuses[Square.toSquareId(channel.id, val)] = null;
			}
		}

		const rNum = rChannel.values.length;
		const gNum = gChannel.values.length;
		const bNum = bChannel.values.length;

		this.numVals = new MultiChannelProperty(rNum, gNum, bNum);
		this.squares = [];

		const numColors = rNum * gNum * bNum;
		let width = Math.floor(Math.sqrt(numColors));
		let height = numColors / width;
		while(height !== Math.floor(height)) {
			width--;
			height = numColors / width;
		}

		this.width = width;
		this.height = height;

		this.columnHandler = new ColumnHandler(
			this.width,
			ColumnHandler.countingIterator(this.width),
			(i) => ColumnHandler.countingIterator(this.height)
		);

		this.canvas = new PixelCanvas(canvas, this.width, this.height)
			.setDisplaySize({ width: 1000, height: 1000 })
			.setChannels(rChannel, gChannel, bChannel);

		this.debugCanvases = debugCanvases;

		if(debugCanvases) {
			this.redCanvas = new PixelCanvas(null, rNum, gNum * bNum)
				.setDisplaySize({ width: 256, maintainRatio: true })
				.setChannels(rChannel, gChannel, bChannel);
			
			this.greenCanvas = new PixelCanvas(null, gNum, rNum * bNum)
				.setDisplaySize({ width: 256, maintainRatio: true })
				.setChannels(rChannel, gChannel, bChannel);

			this.blueCanvas = new PixelCanvas(null, bNum, rNum * gNum)
				.setDisplaySize({ width: 256, maintainRatio: true })
				.setChannels(rChannel, gChannel, bChannel);
		}

		
	}
	addSquare(square) {
		if(!(square.squareId in this.valueStatuses)) {
			throw `Error in addSquare: square ${square.squareId} is out of bounds for its channel, `
				+ `which has range [0,${square.constChannel.totalSize})`;
		} else if(this.valueStatuses[square.squareId] !== null) {
			throw `Error in addSquare: square ${squareId} already exists!`;
		} else if(square.world !== this) {
			throw `Error in addSquare: attempting to add a square to a world that it wasn't created for!`;
		}

		square.constChannel.registerSquare(square);

		this.squares.push(square);
		this.valueStatuses[square.squareId] = square;
	}
	assignSquareIntersections() {
		for(let i = 0; i <= 2; i++) {
			const sqChannelA = this.channels[i].squares;
			const sqChannelB = this.channels[(i + 1) % 3].squares;

			for(let sqA of sqChannelA) {
				for(let sqB of sqChannelB) {
					if(sqA.priorityValue > sqB.priorityValue) {
						sqA.addIntersectionWithSquare(sqB);
					} else {
						sqB.addIntersectionWithSquare(sqA);
					}
				}
			}
		}
	}
	setPixelColor(color) {
		const x = this.columnHandler.currentColVal;
		const y = this.columnHandler.advanceToNextRow();

		const r = color[0];
		const g = color[1];
		const b = color[2];

		// this.colorTracker[`${r},${g},${b}`] = true;

		this.canvas.setPixelColor(x, y, r, g, b);

		if(this.debugCanvases) {
			this.redCanvas.setPixelColor(r, (b * this.numVals.g) + g, r, g, b);
			this.greenCanvas.setPixelColor(g, (b * this.numVals.r) + r, r, g, b);
			this.blueCanvas.setPixelColor(b, (g * this.numVals.r) + r, r, g, b);
		}
	}
	updateImage() {
		this.canvas.update();

		if(this.debugCanvases) {
			this.redCanvas.update();
			this.greenCanvas.update();
			this.blueCanvas.update();
		}
		
	}
	draw() {
		let i = 0;
		for(; i < this.squares.length - 10; i++) {
			this.squares[i].draw();
		}
		this.updateImage();

		for(; i < this.squares.length; i++) {
			console.log(`Drawing square ${i}/${this.squares.length - 1}!`);
			if(i === 32) {
				console.log("The error should happen on this square!");
			}

			this.squares[i].draw();
			this.updateImage();
		}
	}

	/*
	function clamp(v, mn, mx) = min(max(v, mn), mx);
function hueToRgb(h) = [
	clamp(abs(3-6*h) - 1, 0, 1),
	clamp(2-abs(2-6*h), 0, 1),
	clamp(2-abs(4-6*h), 0, 1)
];
*/
	toOpenScadCode() {
		let ret = (
			`module square(vals) {\n`
			+ `\tfor(r = vals[0]) for(g = vals[1]) for(b = vals[2]) translate([r, g, b]) cube(1);\n`
			+ `}\n`
			+ `squareVals = [\n`
			+ `function clamp(v, mn, mx) = min(max(v, mn), mx);\n`
			+ `function hueToRgb(h) = [clamp(abs(3-6*h)-1,0,1),clamp(2-abs(2-6*h),0,1),clamp(2-abs(4-6*h),0,1)];\n`
		);

		for(let i = 0; i < this.squares.length; i++) {
			const sq = this.squares[i];

			const channelVals = [0, 0, 0];
			channelVals[sq.constChannel] = [sq.constChannelValue];
			channelVals[sq.colChannel] = sq.getAllColumnVals().values;
			channelVals[sq.rowChannel] = sq.getAllRowVals().values;
			ret += `\t${JSON.stringify(channelVals)}${i < this.squares.length - 1? ',' : ''}\n`;

			//ret += `square(${JSON.stringify(channelVals[0])}, ${JSON.stringify(channelVals[1])}, ${JSON.stringify(channelVals[2])});\n`;
		}
		ret += "];\n";

		for(let i = 0; i < this.squares.length; i++) {
			ret += `color(hueToRgb(${i} / len(squareVals))) square(squareVals[${i}]);\n`;
		}
		// ret += (
		// 	`];\n`
		// 	+ `lastSquareIndex = len(squareVals) - 1;\n`
		// 	+ `// lastSquareIndex = 1;\n`
		// 	+ `for(i = [0 : lastSquareIndex]) {\n`
		// 	+ `\tvals = squareVals[i];\n`
		// 	+ `\tsquare(vals[0], vals[1], vals[2]);\n`
		// 	+ `}`
		// );

		return ret;
	}
	findSquareForColor(r, g, b) {
		const rSquare = this.valueStatuses[Square.toSquareId(0, r)];
		const gSquare = this.valueStatuses[Square.toSquareId(1, g)];
		const bSquare = this.valueStatuses[Square.toSquareId(2, b)];

		if(rSquare !== null && rSquare.includesColor(r, g, b)) {
			return rSquare.squareId;
		} else if(gSquare !== null && gSquare.includesColor(r, g, b)) {
			return gSquare.squareId;
		} else if(bSquare !== null && bSquare.includesColor(r, g, b)) {
			return bSquare.squareId;
		} else {
			return null;
		}
	}
	doAllColorsHaveSquares() {
		for(let r = 0; r < this.channels.r.numVals; r++) {
			for(let g = 0; g < this.channels.g.numVals; g++) {
				for(let b = 0; b < this.channels.b.numVals; b++) {
					if(this.findSquareForColor(r, g, b) === null) {
						console.log(`Color ${r},${g},${b} has no square!`);
					}
				}
			}		
		}
	}
	justifyMissingColor(color) {
		const squareIds = color.map((val, channelId) => Square.toSquareId(channelId, val));
		const squares = squareIds.map((squareId) => this.valueStatuses[squareId]);

		return squares.map((square, index) => {
			const squareId = squareIds[index];

			if(square === null) {
				return `${squareId} is not a square.`;
			} else {
				let ret = `Square ${squareId}: `;

				const toCheck = [
					Math.min((index + 1) % 3, (index + 2) % 3),
					Math.max((index + 1) % 3, (index + 2) % 3)
				];

				toCheck.forEach((channelId) => {
					const channel = this.channels[channelId];
					const value = color[channelId];

					if(square.includesChannelVal(channel, value)) {
						ret += Square.toSquareId(channelId, value) + " ";
					}
				});

				return ret;
			}
		}).join("\n");
	}
	getMissingColors() {
		const missingColors = Object.keys(this.colorTracker)
			.filter((colorKey) => !this.colorTracker[colorKey])
			.map((colorKey) => colorKey.split(",").map((ch) => +ch));


		for(let i = 0; i < Math.min(10, missingColors.length); i++) {
			console.log(this.justifyMissingColor(missingColors[i]));
		}
	}
	toSerializedString() {
		const debugStr = this.debugCanvases? 'T' : 'F';
		const channelsStr = this.channels.map((ch) => ch.channelObj.toSerializedString()).join(" ");
		const squaresStr = this.squares.map((sq) => sq.toSerializedString()).join(" ");

		return `${debugStr}|${channelsStr}|${squaresStr}`;
	}
	static fromSerializedString(canvas, str) {
		const [debugStr, channelsStr, squaresStr] = str.split("|");

		const debugCanvases = debugStr === 'T';

		const [rCh, gCh, bCh] = channelsStr.split(" ").map((chStr) => ColorChannel.fromSerializedString(chStr));

		const ret = new World(canvas, rCh, gCh, bCh, debugCanvases);

		const squares = squaresStr.split(" ").map((sqStr) => Square.fromSerializedString(ret, sqStr));

		for(let square of squares) {
			ret.addSquare(square);
		}

		return ret;
	}
}