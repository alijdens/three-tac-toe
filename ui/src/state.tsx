import { useReducer } from 'react';
import { decodeBoard, encodeBoard } from './utils';

export enum Player {
    X = 'X',
    O = 'O'
}

export type SquarePos = 0|1|2|3|4|5|6|7|8

export type GameState = {
    // whether it X player's turn now
    xNext: boolean

    // queue of moves played by both players (FIFO order)
    XMoves: Array<SquarePos>
    OMoves: Array<SquarePos>

    winner: Player | null

    // stack of (encoded) past game states
    history: number[]
}

export type SetPlayAction = {
    type: 'set_play',
    position: SquarePos,
}

export type UndoGameAction = {
    type: 'undo',
    offset: number,
}

export type ResetGameAction = {
    type: 'reset',
}

export type Action = SetPlayAction | ResetGameAction | UndoGameAction

export function initialState(): GameState {
    return { xNext: true, XMoves: [], OMoves: [], winner: null, history: [] }
}

export function useGameStateReducer() {
    return useReducer(gameStateReducer, null, initialState)
}

export function gameStateReducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case 'set_play': {
            const newState: GameState = {
                'xNext': !state.xNext,
                'XMoves': [...state.XMoves],
                'OMoves': [...state.OMoves],
                'winner': null,
                'history': [...state.history],
            }
            const moves = state.xNext ? newState.XMoves : newState.OMoves
            moves.push(action.position)
            if (moves.length == 4) {
                moves.shift()
            }
            newState['winner'] = winner(newState)
            // store the old state in the history
            newState.history.push(encodeBoard(state))
            return newState
        }

        case 'undo': {
            if (state.history.length < action.offset) {
                throw new Error("Now enough moves to rollback")
            }
            if (action.offset <= 0) {
                throw new Error('Offset must be positive')
            }
            const end = state.history.length - action.offset + 1
            const history = state.history.slice(0, end)
            const oldState = decodeBoard(history.pop() as number)
            oldState.history = history
            return oldState
        }

        case 'reset': {
            return initialState()
        }

        default: {
            throw Error('Unknown action: ' + action);
        }
    }
}

export function isOccupied(position: SquarePos, state: GameState) {
    return state.XMoves.includes(position) || state.OMoves.includes(position)
}

export function winner(state: GameState): Player | null {
    const winningPositions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],

        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],

        [0, 4, 8],
        [2, 4, 6],
    ]
    const _X = [...state.XMoves]
    _X.sort()
    const X = JSON.stringify(_X)

    const _O = [...state.OMoves]
    _O.sort()
    const O = JSON.stringify(_O)

    for (let i = 0; i < winningPositions.length; i++) {
        if (JSON.stringify(winningPositions[i]) == X) {
            return Player.X
        }
        if (JSON.stringify(winningPositions[i]) == O) {
            return Player.O
        }
    }

    return null
}
