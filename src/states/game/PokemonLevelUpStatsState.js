import State from '../../../lib/State.js';
import { stateStack } from '../../globals.js';
import Textbox from '../../user-interface/elements/Textbox.js';
import Panel from '../../user-interface/elements/Panel.js';

export default class PokemonLevelUpStatsState extends State {
	/**
	 * Shows the stat changes after a Pokemon levels up.
	 * 
	 * @param {object} oldStats - The stats before leveling up
	 * @param {object} newStats - The stats after leveling up
	 * @param {string} pokemonName - Name of the Pokemon
	 * @param {function} callback - Function to call when done
	 */
	constructor(oldStats, newStats, pokemonName, callback = () => {}) {
		super();

		this.oldStats = oldStats;
		this.newStats = newStats;
		this.pokemonName = pokemonName;
		this.callback = callback;

		// Build the message text with shorter formatting to fit all stats
		const message = `Health: ${oldStats.health}>${newStats.health}  Attack: ${oldStats.attack}>${newStats.attack}\nDefense: ${oldStats.defense}>${newStats.defense}  Speed: ${oldStats.speed}>${newStats.speed}`;

		// Create a textbox just like BattleMessageState does
		this.textbox = new Textbox(
			Panel.BOTTOM_DIALOGUE.x,
			Panel.BOTTOM_DIALOGUE.y,
			Panel.BOTTOM_DIALOGUE.width,
			Panel.BOTTOM_DIALOGUE.height,
			message,
			{ isAdvanceable: true }
		);
	}

	update() {
		this.textbox.update();

		if (this.textbox.isClosed) {
			stateStack.pop();
			this.callback();
		}
	}

	render() {
		this.textbox.render();
	}
}