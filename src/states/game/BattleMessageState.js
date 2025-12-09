import State from "../../../lib/State.js";
import Textbox from "../../user-interface/elements/Textbox.js";
import Panel from "../../user-interface/elements/Panel.js";
import { stateStack, timer } from "../../globals.js";
import BattleState from "./BattleState.js";

export default class BattleMessageState extends State {
	/**
	 * Any text to display to the Player during battle
	 * is shown in this state.
	 *
	 * @param {string} message
	 * @param {number} waitDuration How long to wait before auto-closing the textbox.
	 * @param {function} onClose
	 * @param {BattleState|null} battleState Optional battle state to keep updating
	 */
	constructor(message, waitDuration = 0, onClose = () => { }, battleState = null) {
		super();

		this.textbox = new Textbox(
			Panel.BOTTOM_DIALOGUE.x,
			Panel.BOTTOM_DIALOGUE.y,
			Panel.BOTTOM_DIALOGUE.width,
			Panel.BOTTOM_DIALOGUE.height,
			message,
			{ isAdvanceable: waitDuration === 0 }
		);
		this.waitDuration = waitDuration;
		this.onClose = onClose;
		this.battleState = battleState;

		if (waitDuration > 0) {
			timer.wait(this.waitDuration, () => {
				stateStack.pop();
				onClose();
			});
		}
	}

	update() {
		// Update battle state to keep panels updating
		if (this.battleState) {
			this.battleState.update();
		}

		if (this.waitDuration === 0) {
			this.textbox.update();

			if (this.textbox.isClosed) {
				stateStack.pop();
				this.onClose();
			}
		}
	}

	render() {
		this.textbox.render();
	}
}