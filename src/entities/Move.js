export default class Move {
	/**
	 * Represents a move that a Pokemon can use in battle.
	 * 
	 * @param {string} name - Name of the move
	 * @param {object} definition - Move data from moves.json
	 */
	constructor(name, definition) {
		this.name = name;
		this.type = definition.type;
		this.basePower = definition.basePower;
	}
}