import { useEffect, useState } from 'react'
import { useGameStateReducer, SquarePos, isOccupied, Action, GameState } from './state'
import './Game.css'
import Board from './Board'
import { selectMove, rankNextMoves, isAiTurn } from './AI'
import { DEFAULT_SETTINGS, SettingsMenu, Settings } from './settings'
import { Accordion, AccordionDetails, AccordionSummary, CircularProgress, Grid, IconButton, Tooltip, Typography } from '@mui/material'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import UndoIcon from '@mui/icons-material/Undo';
import { ExpandMore } from '@mui/icons-material'


function Game() {
    const [state, updateState] = useGameStateReducer()
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
            const aiMove = selectMove(state.xNext, nextMoves, settings.aiIntelligence)

            updateState({ type: 'set_play', position: aiMove.position })
        }, settings.aiResponseDelay * 1000)

        return () => clearTimeout(id)
    }, [state, settings])

    let title = state.xNext ? "X's turn" : "O's turn"
    if (state.winner) {
        title = `"${state.winner}" has won!`
    }
    return <>
        <Instructions />
        <SettingsMenu values={settings} setValues={setSettings} />
        <Grid container spacing={1} alignItems="center">
            <Grid item sm={10} md={8}><h1 style={{textAlign: "left"}}>{title}</h1></Grid>
            <Grid item xs={2} md={1}>{isAiTurn(state, settings.aiPlayer) && !state.winner ? <CircularProgress /> : <></>}</Grid>
            <Grid container xs={12} md={3}>
                <Grid container spacing={2} justifyContent="center" alignItems="center">
                    <Grid item><RestartGameButton state={state} updateState={updateState} /></Grid>
                    <Grid item><UndoButton state={state} updateState={updateState} settings={settings} /></Grid>
                </Grid>
            </Grid>
        </Grid>
        <Board
            state={state}
            onSquareClick={onSquareClick}
            showHints={settings.showHints}
            highlightMoveToDelete={settings.highlightMoveToDelete}
        />
    </>
}


type RestartGameButtonProps = {
    state: GameState,
    updateState: React.Dispatch<Action>,
}
function RestartGameButton({ state, updateState }: RestartGameButtonProps) {
    const gameStarted = state.history.length > 0
    return <>
        <Tooltip title='Restart game'>
            <IconButton disabled={!gameStarted} color='primary' onClick={() => updateState({type: 'reset'})}>
                <RestartAltIcon fontSize='large' />
            </IconButton>
        </Tooltip>
    </>
}

type UndoButtonProps = {
    state: GameState,
    updateState: React.Dispatch<Action>,
    settings: Settings,
}
function UndoButton({ state, updateState, settings }: UndoButtonProps) {
    // if we are playing against the AI we need to skip the AI's last move
    const offset = settings.aiPlayer ? 2 : 1
    const canUndo = !isAiTurn(state, settings.aiPlayer) && state.history.length >= offset
    return <>
        <Tooltip title='Undo last move'>
            <IconButton disabled={!canUndo} color='primary' onClick={() => updateState({type: 'undo', 'offset': offset})}>
                <UndoIcon fontSize='large' />
            </IconButton>
        </Tooltip>
    </>
}

function Instructions() {
    const [expanded, setExpanded] = useState(false)

    return <>
        <Accordion expanded={expanded} onChange={(_, isExpanded) => setExpanded(isExpanded)}>
            <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
            >
                <Typography sx={{ width: '33%', flexShrink: 0 }}>Instructions</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <p>
                    Like the <a href="https://en.wikipedia.org/wiki/Three_men%27s_morris">three men's morris game: </a>
                    each player has three pieces, but when moving pieces, players must first move their first pieces,
                    then the second pieces, then the third pieces, then the first pieces, and so on.
                </p>
                <p>
                    The piece that will be moved next will be colored darker (if the corresponding setting in ON).
                </p>
            </AccordionDetails>
        </Accordion>
    </>
}

export default Game
