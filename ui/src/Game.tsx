import { useEffect, useState } from 'react'
import { useGameStateReducer, SquarePos, isOccupied, Player } from './state'
import './Game.css'
import Board from './Board'
import { selectMove, rankNextMoves } from './AI'
import { DEFAULT_SETTINGS, SettingsMenu } from './settings'


function Game() {
    const [state, updateState] = useGameStateReducer({ xNext: true, XMoves: [], OMoves: [], winner: null })
    const [settings, setSettings] = useState(DEFAULT_SETTINGS)

    const onSquareClick = (id: SquarePos) => {
        if (state.winner || isOccupied(id, state)) {
            return
        }

        // check if it's the human's turn, otherwise ignore the action
        if ((state.xNext && settings.aiPlayer == Player.X) ||
            (!state.xNext && settings.aiPlayer == Player.O)) {
            return
        }

        updateState({ type: 'set_play', position: id })
    }

    useEffect(() => {
        if (state.winner) {
            return
        }
        if ((state.xNext && settings.aiPlayer == Player.X) ||
            (!state.xNext && settings.aiPlayer == Player.O)) {
            const nextMoves = rankNextMoves(state)
            const aiMove = selectMove(state.xNext, nextMoves, settings.aiRandomize, settings.aiIntelligence)

            updateState({ type: 'set_play', position: aiMove.position })
        }
    }, [state, settings])

    let title = state.xNext ? "X's turn" : "O's turn"
    if (state.winner) {
        title = `"${state.winner}" has won!`
    }
    return <>
        <SettingsMenu values={settings} setValues={setSettings} />
        <h1>{title}</h1>
        <Board
            state={state}
            onSquareClick={onSquareClick}
            showHints={settings.showHints}
            highlightMoveToDelete={settings.highlightMoveToDelete}
        />
    </>
}

export default Game
