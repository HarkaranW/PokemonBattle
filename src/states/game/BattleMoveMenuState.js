import State from "../../../lib/State.js";
import { input, sounds, stateStack } from "../../globals.js";
import Input from "../../../lib/Input.js";
import SoundName from "../../enums/SoundName.js";
import BattleState from "./BattleState.js";
import BattleTurnState from "./BattleTurnState.js";
import Panel from "../../user-interface/elements/Panel.js";
import { context } from "../../globals.js";
import Colour from "../../enums/Colour.js";
import UserInterfaceElement from "../../user-interface/UserInterfaceElement.js";

export default class BattleMoveMenuState extends State {
	/**
	 * Shows a 2x2 grid of moves for the player to select from.
	 * 
	 * @param {BattleState} battleState
	 */
	constructor(battleState) {
		super();

		this.battleState = battleState;
		this.pokemon = battleState.playerPokemon;
		
		// Current selection (0-3 for the 4 slots)
		this.selectedIndex = 0;

		// Create the panel for the move menu
		this.panel = new Panel(
			Panel.BOTTOM_DIALOGUE.x,
			Panel.BOTTOM_DIALOGUE.y,
			Panel.BOTTOM_DIALOGUE.width,
			Panel.BOTTOM_DIALOGUE.height
		);
	}

	update() {
		this.battleState.update();

		// Navigation
		if (input.isKeyPressed(Input.KEYS.A)) {
			sounds.play(SoundName.SelectionChoice);
			if (this.selectedIndex % 2 === 1) { // If on right column
				this.selectedIndex--;
			}
		}
		else if (input.isKeyPressed(Input.KEYS.D)) {
			sounds.play(SoundName.SelectionChoice);
			if (this.selectedIndex % 2 === 0) { // If on left column
				this.selectedIndex++;
			}
		}
		else if (input.isKeyPressed(Input.KEYS.W)) {
			sounds.play(SoundName.SelectionChoice);
			if (this.selectedIndex >= 2) { // If on bottom row
				this.selectedIndex -= 2;
			}
		}
		else if (input.isKeyPressed(Input.KEYS.S)) {
			sounds.play(SoundName.SelectionChoice);
			if (this.selectedIndex < 2) { // If on top row
				this.selectedIndex += 2;
			}
		}

		// Select move
		if (input.isKeyPressed(Input.KEYS.ENTER)) {
			const move = this.pokemon.moves[this.selectedIndex];
			
			// Only allow selection if there's a move in this slot
			if (move) {
				sounds.play(SoundName.SelectionMove);
				stateStack.pop();
				stateStack.push(new BattleTurnState(this.battleState, move));
			}
		}

		// Go back to battle menu
		if (input.isKeyPressed(Input.KEYS.ESCAPE)) {
			sounds.play(SoundName.SelectionChoice);
			stateStack.pop();
		}
	}

	render() {
		this.panel.render();
		this.renderMoves();
	}

	renderMoves() {
		context.save();
		context.fillStyle = Colour.Black;
		context.font = `${UserInterfaceElement.FONT_SIZE}px ${UserInterfaceElement.FONT_FAMILY}`;

		// Grid layout: 2x2
		const startX = 20;
		const startY = 280;
		const columnWidth = 220;
		const rowHeight = 30;

		for (let i = 0; i < 4; i++) {
			const row = Math.floor(i / 2);
			const col = i % 2;
			const x = startX + (col * columnWidth);
			const y = startY + (row * rowHeight);

			// Get the move at this position (or show hyphen if none)
			const move = this.pokemon.moves[i];
			const text = move ? move.name : "-";

			// Draw the move name
			context.fillText(text, x + 20, y);

			// Draw arrow if selected
			if (i === this.selectedIndex) {
				context.fillText(">", x, y);
			}
		}

		context.restore();
	}
}