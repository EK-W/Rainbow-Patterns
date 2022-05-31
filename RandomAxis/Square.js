class Square {
	constructor(world, constChannelId, constValue, transposed, colsFlipped, rowsFlipped) {
		this.constChannel = world.channels[constChannelId];
		this.constChannelValue = constValue;

		this.squareId = Square.toSquareId(constChannelId, constValue);
		
		// These values are numerical representations of which channel
		// will have its gradient on the x and y axes. a column channel of 0, for example,
		// means that there will be a red gradient from left to right.
		const colChannelId = (constChannelId + (transposed? 2 : 1)) % 3;
		this.colChannel = world.channels[colChannelId];
		this.colsFlipped = colsFlipped;
		this.extraCols = new SortedArray((a, b) => a - b);

		const rowChannelId = (constChannelId + (transposed? 1 : 2)) % 3;
		this.rowChannel = world.channels[rowChannelId];
		this.rowsFlipped = rowsFlipped;
		this.extraRows = new SortedArray((a, b) => a - b);

		this.world = world;

		this.priorityValue = Math.random();
	}
	get numColVals() {
		return this.colChannel.numUnsquaredVals + this.extraCols.length;
	}
	get numRowVals() {
		return this.rowChannel.numUnsquaredVals + this.extraRows.length;
	}
	get totalSquareSize() {
		return this.numColVals * this.numRowVals;
	}
	hasIntersectionWithSquare(otherSquare) {
		if(otherSquare.constChannel === this.constChannel) {
			return false;
		} else {
			const toCheck = (otherSquare.constChannel === this.colChannel)? this.extraCols : this.extraRows;
			return toCheck.includes(otherSquare.constChannelValue);
		}
	}
	addIntersectionWithSquare(otherSquare) {
		if(otherSquare.constChannel === this.constChannel) {
			throw "Error: cannot add the intersection of two squares with the same constant channel!";
		} else if(!otherSquare.hasIntersectionWithSquare(this)){
			const toAddTo = (otherSquare.constChannel === this.colChannel)? this.extraCols : this.extraRows;
			if(!toAddTo.add(otherSquare.constChannelValue)) {
				throw `Error! Cannot add ${otherSquare.squareId} to ${this.squareId}!`;
			}
		} else {
			throw `Error: ${otherSquare.squareId} already intersects with ${this.squareId}!`;
		}
	}
	draw() {
		if(this.numColVals === 0 || this.numRowVals === 0) {
			return;
		}

		const commonColVals = this.colChannel.unsquaredVals;
		const extraColVals = this.extraCols;
		const colDir = this.colsFlipped? -1 : 1;
		const totalColVals = SortedArray.merge((a, b) => (a - b) * colDir, commonColVals, extraColVals);

		const commonRowVals = this.rowChannel.unsquaredVals;
		const extraRowVals = this.extraRows;
		const rowDir = this.rowsFlipped? -1 : 1;
		const totalRowVals = SortedArray.merge((a, b) => (a - b) * rowDir, commonRowVals, extraRowVals);

		const squareColHandler = new ColumnHandler(
			this.numColVals,
			totalColVals,
			(i) => totalRowVals
		);


		const color = [0, 0, 0];
		color[this.constChannel.id] = this.constChannelValue;

		while(squareColHandler.hasColumnsLeft()) {

			const colVal = squareColHandler.currentColVal;
			color[this.colChannel.id] = colVal;

			while(squareColHandler.columnHasRowsLeft() && this.world.columnHandler.columnHasRowsLeft()) {
				const rowVal = squareColHandler.advanceToNextRow();

				color[this.rowChannel.id] = rowVal;

				this.world.setPixelColor(color);
			}

			squareColHandler.advanceToNextColumn();
			this.world.columnHandler.advanceToNextColumn();
		}
	}
	// TODO: remove these two functions. Will need to update World.toOpenScadCode
	getAllColumnVals() {
		const commonColVals = this.colChannel.unsquaredVals;
		const extraColVals = this.extraCols;

		//return Array.from(mergeIterator(commonColVals, extraColVals));
		return SortedArray.merge((a, b) => a - b, commonColVals, extraColVals);
	}
	getAllRowVals() {
		const commonRowVals = this.rowChannel.unsquaredVals;
		const extraRowVals = this.extraRows;

		return SortedArray.merge((a, b) => a - b, commonRowVals, extraRowVals);
	}
	includesColor(r, g, b) {
		const color = [r, g, b];

		if(color[this.constChannel.id] !== this.constChannelValue) {
			return false;
		}

		const proposedValInCols = color[this.colChannel.id];
		const includesProposedValInCols = this.includesChannelVal(this.colChannel, proposedValInCols);
		
		if(!includesProposedValInCols) {
			return false;
		}

		const proposedValInRows = color[this.rowChannel.id];
		const includesProposedValInRows = this.includesChannelVal(this.rowChannel, proposedValInRows);

		if(!includesProposedValInRows) {
			return false;
		}

		return true;
	}
	includesChannelVal(otherChannel, otherVal) {
		if(otherChannel === this.constChannel) {
			return otherVal === this.constChannelValue;
		}
		const chValId = Square.toSquareId(otherChannel.id, otherVal);
		const otherSquare = this.world.valueStatuses[chValId];
		if(otherSquare === null) {
			return true;
		} else if(otherSquare === undefined) {
			return false;
		} else {
			const toCheck = otherChannel === this.colChannel? this.extraCols : this.extraRows;
			return toCheck.includes(otherVal);
		}
	}
	toString() {
		const constChannelName = this.constChannel.name;
		const colChannelName = this.colChannel.name;
		const rowChannelName = this.rowChannel.name;
		return `Square(${constChannelName}=${this.constChannelValue}, ${this.totalNumCols} ${colChannelName} columns, ${this.totalNumRows} ${rowChannelName} rows)`;
	}
	toSerializedString() {
		const isTransposed = this.colChannel.id === ((this.constChannel.id + 2) % 3);
		const transposeStr = isTransposed? 'T' : 'F';
		const colDir = this.colsFlipped? '-' : '+';
		const rowDir = this.rowsFlipped? '-' : '+';

		return `${this.constChannel.id}:${this.constChannelValue}${transposeStr}${colDir}${rowDir}P${this.priorityValue}`;
	}
	static fromSerializedString(world, str) {
		const args = /([012]):([0-9]+)([TF])([\-+])([\-+])P([0-9\.]+)/.exec(str);

		if(args === null) {
			throw `Error in fromReplicableString: Could not decode string "${str}"`;
		}

		const channelId = +args[1];
		const channelVal = +args[2];
		const transposed = args[3] === 'T';
		const colsFlipped = args[4] === '-';
		const rowsFlipped = args[5] === '-';
		const priority = +args[6];

		const ret = new Square(world, channelId, channelVal, transposed, colsFlipped, rowsFlipped);
		ret.priorityValue = priority;
		return ret;
	}
	static createRandomSquare(world) {
		const availableChannels = world.channels.filter((channel) => channel.numUnsquaredVals > 0);
		const constChannel = availableChannels[Math.floor(Math.random() * availableChannels.length)].id;

		// protect against chosing an empty const channel
		// TODO: make this random (so that it doesn't always go to the channel directly after the empty one.)
		for(let i = 0; world.channels[constChannel].numUnsquaredVals === 0 && i < 2; i++) {
			constChannel = (constChannel + 1) % 3;
		}

		const channelArr = world.channels[constChannel].unsquaredVals;

		if(channelArr.length === 0) {
			throw "Error: attempting to create squares when the supply of channel values has been completely exhausted!";
		}

		const constChannelValue = channelArr.get(Math.floor(Math.random() * channelArr.length));
		const transposed = Math.floor(Math.random() * 2) === 0;
		const colsFlipped = Math.floor(Math.random() * 2) === 0;
		const rowsFlipped = Math.floor(Math.random() * 2) === 0;

		return new Square(
			world,
			constChannel,
			constChannelValue,
			transposed,
			colsFlipped,
			rowsFlipped
		);
	}
	static toSquareId(channel, value) {
		return ColorChannel.getInitial(channel) + value;
	}
}