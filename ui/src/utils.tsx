import { GameState, SquarePos, winner } from "./state"

/**
 * Encode the board state into an integer. The board can be obtained
 * from the code again by using `decodeBoard`.
 * @param state 
 * @returns 
 */
export function encodeBoard(state: GameState) {
    /* there's an upper bound of 2*(10^6) states if we consider that we
       can place each of the 6 moves in 10 different states (not placed
       plus 9 boxes), which is 1M. Then we also have to differentiate
       between which player's turn is next which adds 1 more bit
       this means we can encode all states in 2M numbers */

    let x = 0
    // first 3 digits are the X's states
    state.XMoves.forEach((v, i) => {
        x += (v+1) * 10**i
    })
    // next 3 are for O's
    state.OMoves.forEach((v, i) => {
        x += (v+1) * 10**(i+3)
    })

    // final bit to indicate which player's turn it is
    if (state.xNext) {
        x += 1_000_000
    }

    return x
}

/**
 * Parse the `code` representing a game state and returns the
 * corresponding `Board` state.
 * @param code 
 * @returns Game state
 */
export function decodeBoard(code: number): GameState {
    const xNext = (code >= 1_000_000) ? true : false

    // decode each move position from each digit in the code

    // first 3 digits represent the 'x's
    const XMoves: Array<SquarePos> = []
    for(let i = 0; i < 3; i++) {
        let j = Math.floor(code / 10**i) % 10
        if (j > 0) {
            XMoves.push(j-1 as SquarePos)
        }
    }

    // last 3 digits represent the 'o's
    const OMoves: Array<SquarePos> = []
    for(let i = 3; i < 6; i++) {
        let j = Math.floor(code / 10**i) % 10
        if (j > 0) {
            OMoves.push(j-1 as SquarePos)
        }
    }
    const state: GameState = {
        'XMoves': XMoves,
        'OMoves': OMoves,
        'xNext': xNext,
        'winner': null,
    }
    state.winner = winner(state)
    return state
}
