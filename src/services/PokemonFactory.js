import Pokemon from "../entities/Pokemon.js";
import PokemonName from "../enums/PokemonName.js";

export default class PokemonFactory {
	constructor(context) {
		this.context = context;
		this.pokemon = {};
		this.moves = {};
	}

	load(pokemonDefinitions, movesDefinitions) {
		this.pokemon = pokemonDefinitions;
		this.moves = movesDefinitions;

		Object.keys(pokemonDefinitions).forEach((name) => {
			PokemonName[name] = name;
		});
	}

	get(name) {
		return this.pokemon[name];
	}

	createInstance(name, level = 1) {
		const pokemonDef = this.pokemon[name];
		// Add moves data to the definition
		const defWithMoves = {
			...pokemonDef,
			movesData: this.moves
		};
		return new Pokemon(name, defWithMoves, level);
	}
}