class ColumnHandler {
	constructor(length, valIterable, iterableFxn) {
		this.cols = new Array(length);

		const valIter = valIterable[Symbol.iterator]();

		for(let i = 0; i < length; i++) {
			const val = valIter.next().value;

			if(val === undefined) {
				console.log("What? How??");
			}

			const iter = iterableFxn(i, val)[Symbol.iterator]();
			this.cols[i] = {
				val: val,
				iter: iter,
				lastIterRet: iter.next()
			};
		}

		this.currentColIndex = 0;
	}
	get currentColObj() {
		return this.cols[this.currentColIndex];
	}
	get currentColVal() {
		if(this.currentColObj === undefined) {
			console.log(this);
			throw new Error("Error: she's undefined, folks!");
		}
		return this.currentColObj.val;
	}
	get currentRowVal() {
		return this.currentColObj.lastIterRet.value;
	}
	columnHasRowsLeft() {
		const iterRet = this.currentColObj.lastIterRet;
		return !(iterRet.done && iterRet.value === undefined);
	}
	hasColumnsLeft() {
		return this.cols.length > 0;
	}
	advanceToNextRow() {
		if(!this.columnHasRowsLeft()) {
			throw "Error in progressColumn: column is full!";
		} else {
			const currentCol = this.currentColObj;
			const ret = currentCol.lastIterRet.value;
			currentCol.lastIterRet = currentCol.iter.next();
			return ret;
		}
	}
	advanceToNextColumn() {
		if(!this.columnHasRowsLeft()) {
			this.cols.splice(this.currentColIndex, 1);
			this.currentColIndex--;
		}
		this.currentColIndex = (this.currentColIndex + 1) % this.cols.length;

		return Number.isNaN(this.currentColIndex)? null : this.currentColVal;
	}
	// *rowsLeftInColumnIter() {
	// 	while(this.columnHasRowsLeft()) {
	// 		yield this.advanceToNextRow();
	// 	}
	// }
	toString() {
		return `[${this.cols.map((col) => `c${col.val}-r${col.lastIterRet.value}`).join(", ")}]\n`
		+ `Current column: index ${this.currentColIndex} : c${this.cols[this.currentColIndex].val}`;
	}
	static *countingIterator(length) {
		for(let i = 0; i < length; i++) {
			yield i;
		}
	}
}