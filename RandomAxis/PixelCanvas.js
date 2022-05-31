class PixelCanvas {
	static _imageRenderingRuleValue = (
		["pixelated", "crisp-edges", "-moz-crisp-edges", "-webkit-crisp-edges"]
		.find(value => CSS.supports("image-rendering", value))
	);

	constructor(element, width, height, debug = false) {
		if(element === null) {
			this.canvas = document.createElement("canvas");
		} else {
			this.canvas = element;
		}


		this.span = document.createElement("span");
		this.span.classList.add("pixel-canvas-span");
		this.span.style["display"] = "inline-block";
		this.span.style["position"] = "relative";

		console.log(this.span);

		if(this.canvas.parentNode) {
			this.canvas.replaceWith(this.span);
		}

		this.span.append(this.canvas);


		this.width = width;
		this.height = height;

		this.canvas.setAttribute("width", this.width);
		this.canvas.setAttribute("height", this.height);

		this.canvas.style["image-rendering"] = PixelCanvas._imageRenderingRuleValue;

		const brightBGColor = "#EEE";
		const darkBGColor = "#111";

		// this.canvas.style["background-image"] = (
		// 	`linear-gradient(to bottom right, ${darkBGColor} 25%, transparent 25% 75%, ${darkBGColor} 75%), `
		// 	+ `linear-gradient(to bottom right, ${darkBGColor} 25%, transparent 25% 75%, ${darkBGColor} 75%), `
		// 	+ `linear-gradient(to top right, ${brightBGColor} 25%, transparent 25% 75%, ${brightBGColor} 75%), `
		// 	+ `linear-gradient(to top right, ${brightBGColor} 25%, transparent 25% 75%, ${brightBGColor} 75%)`
		// );

		this.debug = debug;

		this.ctx = this.canvas.getContext("2d");
		this.pixelData = this.ctx.createImageData(this.width, this.height);

		this.setDisplaySize({ width: width, height: height });
	}
	get rootElement() {
		return this.span;
	}
	setChannels(rCh, gCh, bCh) {
		this.channels = new MultiChannelProperty(rCh, gCh, bCh);

		return this;
	}
	setDisplaySize({ width, height, ratio, maintainRatio }) {
		if(width === undefined) {
			if(height === undefined) {
				throw "Error in setDisplaySize: width or height must be specified!";
			}

			if(maintainRatio) {
				this.displayedWidth = height * this.displayedWidth / this.displayedHeight;
			} else if(ratio !== undefined) {
				this.displayedWidth = height * ratio;
			}

			this.displayedHeight = height;
		} else {
			if(height === undefined) {
				if(maintainRatio) {
					this.displayedHeight = width * this.displayedHeight / this.displayedWidth;
				} else if(ratio !== undefined){
					this.displayedHeight = width / ratio;
				}
			} else {
				this.displayedHeight = height;
			}

			this.displayedWidth = width;
		}

		this.canvas.style["width"] = this.displayedWidth + "px";
		this.canvas.style["height"] = this.displayedHeight + "px";


		const bgWidth = this.displayedWidth / this.width;
		const bgHeight = this.displayedHeight / this.height;
	//	this.canvas.style["background-size"] = `${bgWidth}px ${bgHeight}px`;
	//	this.canvas.style["background-position"] = `0 0, ${-bgWidth / 2}px ${-bgHeight / 2}px, 0 0, ${-bgWidth / 2}px ${bgHeight / 2}px`;

		return this;
	}
	update() {
		this.ctx.putImageData(this.pixelData, 0, 0);

		return this;
	}
	setPixelColor(x, y, rRaw, gRaw, bRaw) {
		if(x < 0 || x >= this.width || y < 0 || y >= this.height) {
			throw `Error in setPixelColor: coordinate (${x},${y}) is out of bounds for a ${this.width}x${this.height} canvas!`;
		}

		const r = this.channels[0].toDisplayedValue(rRaw);
		const g = this.channels[1].toDisplayedValue(gRaw);
		const b = this.channels[2].toDisplayedValue(bRaw);

		const pixelIndex = ((y * this.width) + x) * 4;

		this.pixelData.data[pixelIndex] = r;
		this.pixelData.data[pixelIndex + 1] = g;
		this.pixelData.data[pixelIndex + 2] = b;
		this.pixelData.data[pixelIndex + 3] = 255;

		if(this.debug) {
			const colorLabel = document.createElement("span");

			colorLabel.innerText = `(${rRaw},${gRaw},${bRaw})`;
			colorLabel.style["display"] = "inline-block";
			colorLabel.style["background-color"] = "white";
			colorLabel.style["position"] = "absolute";
			colorLabel.style["left"] = (x * this.displayedWidth / this.width) + "px";
			colorLabel.style["top"] = (y * this.displayedHeight / this.height) + "px";

			this.span.append(colorLabel);
		}

		return this;
	}
	setPixelRange(x, y, w, h, r, g, b) {
		for(let dx = 0; dx < w; dx++) {
			for(let dy = 0; dy < h; dy++) {
				this.setPixelColor(x + dx, y + dy, r, g, b)
			}
		}

		return this;
	}
	setAllPixels(r, g, b) {
		for(let x = 0; x < this.width; x++) {
			for(let y = 0; y < this.height; y++) {
				this.setPixelColor(x, y, r, g, b);
			}
		}

		return this;
	}
	setPixelRangeByFxn(x, y, w, h, fxn) {
		for(let dx = 0; dx < w; dx++) {
			for(let dy = 0; dy < h; dy++) {
				this.setPixelColor(x + dx, y + dy, ...fxn(x + dx, y + dy, dx, dy));
			}
		}

		return this;
	}
	setAllPixelsByFxn(fxn) {
		this.setPixelRangeByFxn(0, 0, this.width, this.height, fxn);

		return this;
	}
}