import State from "../../../lib/State.js";
import { stateStack } from "../../globals.js";
import Menu from "../../user-interface/elements/Menu.js";
import BattleMessageState from "./BattleMessageState.js";
import BattleState from "./BattleState.js";
import BattleTurnState from "./BattleTurnState.js";
import TransitionState from "./TransitionState.js";
import PlayState from "./PlayState.js";
import BattleMoveMenuState from "./BattleMoveMenuState.js";

export default class BattleMenuState extends State {
	static MENU_OPTIONS = {
		Fight: "FIGHT",
		Status: "STATUS",
		Run: "RUN",
	}

	/**
	 * Represents the menu during the battle that the Player can choose an action from.
	 *
	 * @param {BattleState} battleState
	 */
	constructor(battleState) {
		super();

		this.battleState = battleState;

		const items = [
			{ text: BattleMenuState.MENU_OPTIONS.Fight, onSelect: () => this.fight() },
			{ text: BattleMenuState.MENU_OPTIONS.Status, onSelect: () => this.status() },
			{ text: BattleMenuState.MENU_OPTIONS.Run, onSelect: () => this.run() },
		];

		this.battleMenu = new Menu(
			Menu.BATTLE_MENU.x,
			Menu.BATTLE_MENU.y,
			Menu.BATTLE_MENU.width,
			Menu.BATTLE_MENU.height,
			items,
		);
	}

	update() {
		this.battleMenu.update();
		this.battleState.update();
	}

	render() {
		this.battleMenu.render();
	}

	fight() {
		stateStack.pop();
		stateStack.push(new BattleMoveMenuState(this.battleState));
	}

	status() {
		stateStack.push(new BattleMessageState(`You're doing great!`, 2));
	}

	run() {
		// Pop the current menu state
		stateStack.pop();
	
		// Use the battle state's exit method
		this.battleState.exitBattle();
	}
}