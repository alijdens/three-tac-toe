import { GameState, gameStateReducer, isOccupied, Player, SquarePos } from './state';
import { encodeBoard } from './utils'
import scores from './assets/scores.json'
import { aiDecisionDistribution, sample } from './sample';


type MoveScore = {
    position: SquarePos,
    score: number,
}

/**
 * Returns the valid next moves for the game and their corresponding
 * scores.
 * @param state
 * @returns valid moves with scores.
 */
export function rankNextMoves(state: GameState): MoveScore[] {
    const availableStates = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) =>
        !isOccupied(i as SquarePos, state)
    )

    const childScores: MoveScore[] = availableStates.map((i) => {
        const childState = gameStateReducer(state, {
            type: 'set_play',
            position: i as SquarePos,
        })
        const childStateCode = encodeBoard(childState).toString()
        return {
            position: i as SquarePos,
            score: (scores as any)[childStateCode] as number,
        }
    })

    return childScores
}

/**
 * Select a move from the available ones.
 * @param xNext whether the X player is picking a move.
 * @param moves valid moves with scores.
 * @param random 
 * @param aiIntelligence 0 for dumb AI 100 for optimal player
 * @returns the next AI move.
 */
export function selectMove(
    xNext: boolean,
    moves: MoveScore[],
    aiIntelligence: number,
) {
    const moveScores = moves.map((move) => xNext ? move.score : -move.score)
    const dist = aiDecisionDistribution(moveScores, aiIntelligence / 100)
    return sample(moves, dist)
}

/**
 * Check if it's the AI's turn to play.
 * @param state 
 * @param aiPlayer The player controlled by the AI.
 * @returns true if it's the AI's turn.
 */
export function isAiTurn(state: GameState, aiPlayer: Player | null) {
    if ((state.xNext && aiPlayer == Player.X) ||
        (!state.xNext && aiPlayer == Player.O)) {
        return true
    }
    return false
}
