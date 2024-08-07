import { useEffect } from 'react'
import { useGameStateReducer, SquarePos, isOccupied } from './state'
import './Game.css'
import Board from './Board'
import { selectMove, rankNextMoves } from './AI'


function Game() {
    const [state, updateState] = useGameStateReducer({ xNext: true, XMoves: [], OMoves: [], winner: null })

    const onSquareClick = (id: SquarePos) => {
        if (state.winner || isOccupied(id, state)) {
            return
        }
        updateState({ type: 'set_play', position: id })
    }

    useEffect(() => {
        if (!state.xNext) {
            const nextMoves = rankNextMoves(state)
            const aiMove = selectMove(state.xNext, nextMoves, true)

            updateState({ type: 'set_play', position: aiMove.position })
        }
    }, [state])

    let title = state.xNext ? "X's turn" : "O's turn"
    if (state.winner) {
        title = `"${state.winner}" has won!`
    }
    return <>
        <h1>{title}</h1>
        <Board
            state={state}
            onSquareClick={onSquareClick}
        />
    </>
}

export default Game
