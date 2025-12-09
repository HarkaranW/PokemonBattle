import State from '../../../lib/State.js';
import SoundName from '../../enums/SoundName.js';
import { CANVAS_HEIGHT, sounds, stateStack, timer, typeEffectiveness } from '../../globals.js';
import Pokemon from '../../entities/Pokemon.js';
import BattleMenuState from './BattleMenuState.js';
import BattleMessageState from './BattleMessageState.js';
import BattleState from './BattleState.js';
import { oneInXChance } from '../../../lib/Random.js';
import Easing from '../../../lib/Easing.js';
import PokemonLevelUpStatsState from './PokemonLevelUpStatsState.js';


export default class BattleTurnState extends State {
	/**
	 * When Pokemon attack each other, this state takes
	 * care of lowering their health and reflecting the
	 * changes in the UI. If the Player is victorious,
	 * the Pokemon is awarded with experience based on the
	 * opponent Pokemon's stats.
	 *
	 * @param {BattleState} battleState
	 */
	constructor(battleState, playerMove = null) {
		super();

		this.battleState = battleState;
		this.playerPokemon = battleState.playerPokemon;
		this.opponentPokemon = battleState.opponentPokemon;
		this.playerMove = playerMove;

		// Pick a random move for the opponent
		if (this.opponentPokemon.moves.length > 0) {
			const randomIndex = Math.floor(Math.random() * this.opponentPokemon.moves.length);
			this.opponentMove = this.opponentPokemon.moves[randomIndex];
		} else {
			// Fallback if no moves
			this.opponentMove = null;
		}

		// Determine the order of attack based on the Pokemons' speed.
		if (this.playerPokemon.speed > this.opponentPokemon.speed) {
			this.firstPokemon = this.playerPokemon;
			this.secondPokemon = this.opponentPokemon;
			this.firstMove = this.playerMove;
			this.secondMove = this.opponentMove;
		} else if (this.playerPokemon.speed < this.opponentPokemon.speed) {
			this.firstPokemon = this.opponentPokemon;
			this.secondPokemon = this.playerPokemon;
			this.firstMove = this.opponentMove;
			this.secondMove = this.playerMove;
		} else if (oneInXChance(2)) {
			this.firstPokemon = this.playerPokemon;
			this.secondPokemon = this.opponentPokemon;
			this.firstMove = this.playerMove;
			this.secondMove = this.opponentMove;
		} else {
			this.firstPokemon = this.opponentPokemon;
			this.secondPokemon = this.playerPokemon;
			this.firstMove = this.opponentMove;
			this.secondMove = this.playerMove;
		}
	}

	enter() {
		this.attack(this.firstPokemon, this.secondPokemon, this.firstMove, () => {
			if (this.checkBattleEnded()) {
				stateStack.pop();
				return;
			}

			this.attack(this.secondPokemon, this.firstPokemon, this.secondMove, () => {
				if (this.checkBattleEnded()) {
					stateStack.pop();
					return;
				}

				stateStack.pop();
				stateStack.push(new BattleMenuState(this.battleState));
			});
		});
	}

	update() {
		this.battleState.update();
	}

	/**
	 * Animate the attacking Pokemon and deal damage to the defending Pokemon.
	 * Move the attacker forward and back quickly to indicate an attack motion.
	 *
	 * @param {Pokemon} attacker
	 * @param {Pokemon} defender
	 * @param {function} callback
	 */
	attack(attacker, defender, move, callback) {
		const moveName = move ? move.name : "attacked";
	
		stateStack.push(
			new BattleMessageState(
				`${attacker.name} used ${moveName}!`,
				0.5,
				() => {
					timer.tween(
						attacker.position,
						{ x: attacker.attackPosition.x, y: attacker.attackPosition.y },
						0.1,
						Easing.linear,
						() => {
							timer.tween(
								attacker.position,
								{ x: attacker.battlePosition.x, y: attacker.battlePosition.y },
								0.1,
								Easing.linear,
								() =>
									this.inflictDamage(
										attacker,
										defender,
										move,
										callback
									)
							);
						}
					);
				}
			)
		);
	}

	/**
	 * Flash the defender to indicate they were attacked.
	 * When finished, decrease the defender's health bar.
	 */
	inflictDamage(attacker, defender, move, callback) {
		// Calculate type effectiveness
		const moveType = move ? move.type : 'Normal';
		const multiplier = typeEffectiveness.getMultiplier(moveType, defender.type);
		const effectivenessSound = typeEffectiveness.getSound(multiplier);
	
		// Checks if multiplier works properly
		console.log(`${moveType} vs ${defender.type} = ${multiplier}x damage`);

		sounds.play(effectivenessSound);

		const action = () => {
			defender.alpha = defender.alpha === 1 ? 0.5 : 1;
		};
		const interval = 0.05;
		const duration = 0.5;

		timer.addTask(action, interval, duration, () => {
			defender.alpha = 1;

			// Calculate and apply damage with effectiveness
			const power = move ? move.basePower : 40;
			const baseDamage = Math.max(
				1,
				Math.floor(
					(((2 * attacker.level) / 5 + 2) *
						power *
						(attacker.attack / defender.defense)) /
						50 +
						2
				)
			);
			const finalDamage = Math.floor(baseDamage * multiplier);
			defender.currentHealth = Math.max(0, defender.currentHealth - finalDamage);

			// Show effectiveness message if needed
			const message = typeEffectiveness.getMessage(multiplier);
			if (message) {
				stateStack.push(
					new BattleMessageState(message, 1, callback)
				);
			} else {
				callback();
			}
		});
	}	

	checkBattleEnded() {
		if (this.playerPokemon.currentHealth <= 0) {
			this.processDefeat();
			return true;
		} else if (this.opponentPokemon.currentHealth <= 0) {
			this.processVictory();
			return true;
		}

		return false;
	}

	/**
	 * Tween the Player Pokemon off the bottom of the screen.
	 * Fade out and transition back to the PlayState.
	 */
	processDefeat() {
		sounds.play(SoundName.PokemonFaint);
		timer.tween(
			this.playerPokemon.position,
			{ y: CANVAS_HEIGHT },
			0.2,
			Easing.linear,
			() => {
				stateStack.push(
					new BattleMessageState(
						`${this.playerPokemon.name} fainted!`,
						0,
						() => this.battleState.exitBattle()
					)
				);
			}
		);
	}

	/**
	 * Tween the Opponent Pokemon off the bottom of the screen.
	 * Process experience gained by the Player Pokemon.
	 */
	processVictory() {
		sounds.play(SoundName.PokemonFaint);
		timer.tween(
			this.opponentPokemon.position,
			{ y: CANVAS_HEIGHT },
			0.4,
			Easing.linear,
			() => {
				sounds.stop(SoundName.BattleLoop);
				sounds.play(SoundName.BattleVictory);
				stateStack.push(
					new BattleMessageState('You won!', 0, () =>
						this.processExperience()
					)
				);
			}
		);
	}

	processExperience() {
		const experience = this.playerPokemon.calculateExperienceToAward(
			this.opponentPokemon
		);
		const message = `${this.playerPokemon.name} earned ${experience} experience points!`;

		// Award the experience first
		this.playerPokemon.currentExperience += experience;
	
		// Play experience gain sound
		sounds.play(SoundName.ExperienceGain);

		stateStack.push(
			new BattleMessageState(message, 1.5, () => this.processLevelUp(), this.battleState)
		);
	}

	processLevelUp() {
		// Level up if we've gone over the experience threshold.
		if (
			this.playerPokemon.currentExperience <
			this.playerPokemon.targetExperience
		) {
			this.battleState.exitBattle();
			return;
		}

		sounds.play(SoundName.ExperienceFull);

		// Store old stats before leveling up
		const oldStats = {
			health: this.playerPokemon.health,
			attack: this.playerPokemon.attack,
			defense: this.playerPokemon.defense,
			speed: this.playerPokemon.speed
		};

		// Level up the Pokemon
		this.playerPokemon.levelUp();

		// Store new stats after leveling up
		const newStats = {
			health: this.playerPokemon.health,
			attack: this.playerPokemon.attack,
			defense: this.playerPokemon.defense,
			speed: this.playerPokemon.speed
		};

		// Show level up message first
		stateStack.push(
			new BattleMessageState(
				`${this.playerPokemon.name} grew to LV. ${this.playerPokemon.level}!`,
				0,
				() => {
					// Then show the stat changes panel
					stateStack.push(
						new PokemonLevelUpStatsState(
							oldStats,
							newStats,
							this.playerPokemon.name,
							() => this.battleState.exitBattle()
						)
					);
				}
			)
		);
	}
}
