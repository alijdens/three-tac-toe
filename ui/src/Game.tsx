import { useEffect, useState } from 'react'
import { useGameStateReducer, SquarePos, isOccupied, initialState, Action } from './state'
import './Game.css'
import Board from './Board'
import { selectMove, rankNextMoves, isAiTurn } from './AI'
import { DEFAULT_SETTINGS, SettingsMenu } from './settings'
import { CircularProgress, IconButton, Tooltip } from '@mui/material'
import RestartAltIcon from '@mui/icons-material/RestartAlt'


function Game() {
    const [state, updateState] = useGameStateReducer(initialState())
    const [settings, setSettings] = useState(DEFAULT_SETTINGS)

    const onSquareClick = (id: SquarePos) => {
        if (state.winner || isOccupied(id, state) || isAiTurn(state, settings.aiPlayer)) {
            return
        }
        updateState({ type: 'set_play', position: id })
    }

    useEffect(() => {
        if (state.winner || !isAiTurn(state, settings.aiPlayer)) {
            return
        }

        // wait the defined time before executing the action
        const id = setTimeout(() => {
            const nextMoves = rankNextMoves(state)
            const aiMove = selectMove(state.xNext, nextMoves, settings.aiRandomize, settings.aiIntelligence)

            updateState({ type: 'set_play', position: aiMove.position })
        }, settings.aiResponseDelay * 1000)

        return () => clearTimeout(id)
    }, [state, settings])

    let title = state.xNext ? "X's turn" : "O's turn"
    if (state.winner) {
        title = `"${state.winner}" has won!`
    }
    return <>
        <SettingsMenu values={settings} setValues={setSettings} />
        <h1>
            {title}
            <RestartGameButton updateState={updateState} />
            {isAiTurn(state, settings.aiPlayer) ? <CircularProgress /> : <></>}
        </h1>
        <Board
            state={state}
            onSquareClick={onSquareClick}
            showHints={settings.showHints}
            highlightMoveToDelete={settings.highlightMoveToDelete}
        />
    </>
}


type RestartGameButtonProps = {
    updateState: React.Dispatch<Action>,
}
function RestartGameButton({ updateState }: RestartGameButtonProps) {
    return <>
        <Tooltip title='Restart game'>
            <IconButton color='primary' onClick={() => updateState({type: 'reset'})}>
                <RestartAltIcon fontSize='large' />
            </IconButton>
        </Tooltip>
    </>
}

export default Game
