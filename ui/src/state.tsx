import { useReducer } from 'react';

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
}

export type SetPlayAction = {
    type: 'set_play',
    position: SquarePos,
}

export type ResetGameAction = {
    type: 'reset',
}

export type Action = SetPlayAction | ResetGameAction

export function initialState(): GameState {
    return { xNext: true, XMoves: [], OMoves: [], winner: null }
}

export function useGameStateReducer(state: GameState) {
    return useReducer(gameStateReducer, state)
}

export function gameStateReducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case 'set_play': {
            const newState: GameState = {
                'xNext': !state.xNext,
                'XMoves': [...state.XMoves],
                'OMoves': [...state.OMoves],
                'winner': null,
            }
            const moves = state.xNext ? newState.XMoves : newState.OMoves
            moves.push(action.position)
            if (moves.length == 4) {
                moves.shift()
            }
            newState['winner'] = winner(newState)
            return newState
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
