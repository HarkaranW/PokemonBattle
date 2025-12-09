import Colour from "../../enums/Colour.js";
import { context } from "../../globals.js";
import Pokemon from "../../entities/Pokemon.js";
import UserInterfaceElement from "../UserInterfaceElement.js";
import Panel from "../elements/Panel.js";
import ProgressBar from "../elements/ProgressBar.js";

export default class BattlePlayerPanel extends Panel {
	/**
	 * The Panel displayed beside the Player's Pokemon
	 * during battle that displays their name, health,
	 * level and experience.
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {number} width
	 * @param {number} height
	 * @param {Pokemon} pokemon
	 * @param {object} options Options for the super Panel.
	 */
	constructor(x, y, width, height, pokemon, options = {}) {
		super(x, y, width, height, options);

		this.pokemon = pokemon;

		// Create health bar
		this.healthBar = new ProgressBar(
			this.position.x + 15,
			this.position.y + 45,
			this.dimensions.x - 30,
			8,
			this.pokemon.currentHealth,
			this.pokemon.health,
			Colour.Chartreuse,
			true
		);

		// Create experience bar
		this.experienceBar = new ProgressBar(
			this.position.x + 80,
			this.position.y + 85,
			this.dimensions.x - 95,
			6,
			this.pokemon.currentExperience - this.pokemon.levelExperience,
			this.pokemon.targetExperience - this.pokemon.levelExperience,
			Colour.DodgerBlue,
			false
		);
	}

	update() {
		// Update health bar
		this.healthBar.update(this.pokemon.currentHealth, this.pokemon.health);

		// Update experience bar
		this.experienceBar.update(
			this.pokemon.currentExperience - this.pokemon.levelExperience,
			this.pokemon.targetExperience - this.pokemon.levelExperience
		);
	}

	render() {
		super.render();

		this.renderStatistics();
		this.healthBar.render();
		this.experienceBar.render();
	}

	/**
	 * All the magic number offsets here are to
	 * arrange all the pieces nicely in the space.
	 */
	renderStatistics() {
		context.save();
		context.textBaseline = 'top';
		context.fillStyle = Colour.Black;
		context.font = `${UserInterfaceElement.FONT_SIZE}px ${UserInterfaceElement.FONT_FAMILY}`;
		
		// Pokemon name on left
		context.textAlign = 'left';
		context.fillText(
			this.pokemon.name.toUpperCase(),
			this.position.x + 15,
			this.position.y + 12
		);
		
		// Level on right
		context.textAlign = 'right';
		context.fillText(
			`Lv${this.pokemon.level}`,
			this.position.x + this.dimensions.x - 15,
			this.position.y + 12
		);
		
		// Health text below health bar on right
		const displayHealth = Math.floor(this.healthBar.displayValue);
		context.fillText(
			`${displayHealth} / ${this.pokemon.health}`,
			this.position.x + this.dimensions.x - 15,
			this.position.y + 56
		);
		
		context.restore();
	}
}