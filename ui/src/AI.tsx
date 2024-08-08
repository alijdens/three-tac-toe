import { GameState, gameStateReducer, isOccupied, Player, SquarePos } from './state';
import { encodeBoard } from './utils'
import scores from './assets/scores.json'


type MoveScore = {
    position: SquarePos,
    score: number,
}


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
            score: scores[childStateCode] as number,
        }
    })

    return childScores
}


export function selectMove(
    xNext: boolean,
    moves: MoveScore[],
    random: boolean,
    aiIntelligence: number,
) {
    const bestMove = findBest(xNext, moves)
    if (!random) {
        return bestMove
    }

    const bestMoves = moves.filter((move) => isBestOrEqual(xNext, move, bestMove))
    const r = Math.floor(Math.random() * bestMoves.length)
    return bestMoves[r]
}


function findBest(xNext: boolean, moves: MoveScore[]): MoveScore {
    let bestMove: MoveScore = {
        score: xNext ? -Infinity : Infinity,
        position: 0,
    }

    moves.forEach((move) => {
        if (isBestOrEqual(xNext, move, bestMove)) {
            bestMove = move
        }
    })
    return bestMove
}

function isBestOrEqual(xNext: boolean, move: MoveScore, other: MoveScore): boolean {
    if ((xNext && move.score >= other.score) || (!xNext && move.score <= other.score)) {
        return true
    }
    return false
}

export function isAiTurn(state: GameState, aiPlayer: Player | null) {
    if ((state.xNext && aiPlayer == Player.X) ||
        (!state.xNext && aiPlayer == Player.O)) {
        return true
    }
    return false
}
