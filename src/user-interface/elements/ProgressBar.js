import { context } from '../../globals.js';
import Colour from '../../enums/Colour.js';
import Easing from '../../../lib/Easing.js';
import { timer } from '../../globals.js';
import { roundedRectangle } from '../../../lib/Drawing.js';

export default class ProgressBar {
	constructor(x, y, width, height, currentValue, maxValue, colour = Colour.Chartreuse, isHealthBar = false) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.currentValue = currentValue;
		this.displayValue = currentValue;
		this.maxValue = maxValue;
		this.colour = colour;
		this.isHealthBar = isHealthBar;
	}

	update(currentValue, maxValue) {
		if (this.currentValue !== currentValue) {
			timer.tween(
				this,
				{ displayValue: currentValue },
				0.5,
				Easing.linear
			);
		}

		this.currentValue = currentValue;
		this.maxValue = maxValue;

		if (this.isHealthBar) {
			const percentage = this.currentValue / this.maxValue;
			
			if (percentage > 0.5) {
				this.colour = Colour.Chartreuse;
			} else if (percentage > 0.25) {
				this.colour = Colour.Gold;
			} else {
				this.colour = Colour.Crimson;
			}
		}
	}

	render() {
		context.save();
		
		// Draw border
		context.fillStyle = Colour.Black;
		roundedRectangle(context, this.x, this.y, this.width, this.height, 3, true, false);
		
		// Draw background (empty bar)
		context.fillStyle = Colour.White;
		roundedRectangle(context, this.x + 2, this.y + 2, this.width - 4, this.height - 4, 2, true, false);
		
		// Calculate filled width based on percentage
		// Clamp the display value to not exceed max value
		const clampedValue = Math.min(this.displayValue, this.maxValue);
		const percentage = Math.max(0, clampedValue / this.maxValue);
		const filledWidth = (this.width - 4) * percentage;

		if (filledWidth > 0) {
			context.fillStyle = this.colour;
			roundedRectangle(context, this.x + 2, this.y + 2, filledWidth, this.height - 4, 2, true, false);
		}

		context.restore();
	}
}