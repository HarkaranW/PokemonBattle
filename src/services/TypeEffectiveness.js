export default class TypeEffectiveness {
	constructor() {
		// Type effectiveness chart
		// Attacker type -> Defender type -> multiplier
		this.chart = {
			Fire: {
				Fire: 1,
				Water: 0.5,
				Grass: 2,
				Normal: 1
			},
			Water: {
				Fire: 2,
				Water: 1,
				Grass: 0.5,
				Normal: 1
			},
			Grass: {
				Fire: 0.5,
				Water: 2,
				Grass: 1,
				Normal: 1
			},
			Normal: {
				Fire: 1,
				Water: 1,
				Grass: 1,
				Normal: 1
			}
		};
	}

	/**
	 * Get the damage multiplier based on move type and defender type
	 * 
	 * @param {string} moveType - The type of the move being used
	 * @param {string} defenderType - The type of the defending Pokemon
	 * @returns {number} The damage multiplier (0.5, 1, or 2)
	 */
	getMultiplier(moveType, defenderType) {
		if (this.chart[moveType] && this.chart[moveType][defenderType]) {
			return this.chart[moveType][defenderType];
		}
		return 1; // Default to normal effectiveness
	}

	/**
	 * Get the effectiveness message
	 * 
	 * @param {number} multiplier
	 * @returns {string|null} Message to display, or null for normal effectiveness
	 */
	getMessage(multiplier) {
		if (multiplier === 2) {
			return "It's super effective!";
		} else if (multiplier === 0.5) {
			return "It's not very effective...";
		}
		return null; // No message for normal effectiveness
	}

    /**
    * Get the sound to play based on effectiveness
    * 
    * @param {number} multiplier
    * @returns {string} Sound name to play
    */
    getSound(multiplier) {
	    if (multiplier === 2) {
		    return 'hit-super-effective';
	    } else if (multiplier === 0.5) {
		    return 'hit-not-effective';
	    }
	    return 'hit-regular';
    }
}