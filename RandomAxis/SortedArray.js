class SortedArray {
	constructor(arg0, arg1 = []) {
		if(arg0 instanceof SortedArray) {
			this.comparator = arg0.comparator;
			this.values = Array.from(arg0.values);
		} else {
			this.comparator = arg0;
			if(arg1 instanceof SortedArray) {
				this.values = Array.from(arg1.values).sort(arg0);
			} else {
				this.values = Array.from(arg1).sort(arg0);
			}
		}	
	}
	get length() {
		return this.values.length;
	}
	potentialIndexOf(toFind) {
		let start = 0;
		let end = this.values.length;

		let pivotIndex;

		while(start < end) {
			pivotIndex = Math.floor((start + end - 1) / 2);

			const compValue = this.comparator(this.values[pivotIndex], toFind);

			if(compValue === 0) {
				return pivotIndex;
			} else if(compValue > 0) {
				end = pivotIndex;
			} else {
				start = pivotIndex + 1;
			}
		}

		return end;
	}
	indexOf(toFind) {
		const potentialIndex = this.potentialIndexOf(toFind);
		
		if(
			potentialIndex >= this.values.length
			|| this.comparator(this.values[potentialIndex], toFind) !== 0
		) {
			return -1;
		}
		return potentialIndex;
	}
	includes(toFind) {
		return this.indexOf(toFind) !== -1;
	}
	add(toAdd) {
		const potentialIndex = this.potentialIndexOf(toAdd);

		if(
			potentialIndex < this.values.length
			&& this.comparator(this.values[potentialIndex], toAdd) === 0
		) {
			return false;
		}

		this.values.splice(potentialIndex, 0, toAdd);
		return true;
	}
	remove(toRemove) {
		const potentialIndex = this.potentialIndexOf(toRemove);

		if(
			potentialIndex >= this.values.length
			|| this.comparator(this.values[potentialIndex], toRemove) !== 0
		) {
			return false;
		}

		this.values.splice(potentialIndex, 1);
		return true;
	}
	removeIndex(index) {
		this.values.splice(index, 1);
	}
	get(index) {
		return this.values[index];
	}
	[Symbol.iterator]() {
		return this.values[Symbol.iterator]();
	}
	static *mergeIterator(comparator, a, b) {
		const aIter = a[Symbol.iterator]();
		const bIter = b[Symbol.iterator]();

		let aIterVal = aIter.next();
		let bIterVal = bIter.next();

		while(
			!(aIterVal.done && aIterVal.value === undefined)
			&& !(bIterVal.done && bIterVal.value === undefined)
		) {
			if(comparator(aIterVal.value, bIterVal.value) < 0) {
				yield aIterVal.value;
				aIterVal = aIter.next();
			} else {
				yield bIterVal.value;
				bIterVal = bIter.next();
			}
		}

		while(!(aIterVal.done && aIterVal.value === undefined)) {
			yield aIterVal.value;
			aIterVal = aIter.next();
		}

		while(!(bIterVal.done && bIterVal.value === undefined)) {
			yield bIterVal.value;
			bIterVal = bIter.next();
		}
	}
	static merge(comparator, ...arrs) {
		const retArr = [].concat(...arrs.map(arr => arr instanceof SortedArray? arr.values : arr)).sort(comparator);
		// const comparator = arrs[0].comparator;
		
		// const retArr = new Array(arrs.reduce((sum, nextArr) => sum + nextArr.length), 0);
		
		// const arrProgresses = new Array(arrs.length);
		// for(let i = 0; i < arrProgresses.length; i++) {
		// 	arrProgresses[i] = { index: 0, arr: arrs[i] };
		// }
		

		// for(let i = 0; i < retArr.length; i++) {
		// 	let minVal = arrProgresses[0].get(arrProgresses[0].index);
		// 	let minProgressIndex = 0;

		// 	for(let j = 1; j < arrProgresses.length; j++) {
		// 		const nextToTest = arrProgresses[j].arr.get(arrProgresses[j].index);
		// 		const cmpValue = comparator(nextToTest, minVal);
		// 		if(cmpValue < 0) {
		// 			minVal = nextToTest;
		// 			minProgressIndex = j;
		// 		} else if(cmpValue === 0) {
		// 			throw ("Error: Attempting to merge sorted arrays that contain an "
		// 				+ "equal value, according to the first array's comparator!");
		// 		}
		// 	}


		// 	retArr[i] = minVal;

		// 	arrProgresses[minProgressIndex].index++;
		// 	if(arrProgresses[minProgressIndex].index === arrProgresses[minProgressIndex].arr.length) {
		// 		arrProgresses.splice(minProgressIndex, 1);
		// 	}
		//}

		const ret = new SortedArray(comparator);
		ret.values = retArr;
		return ret;
	}
}