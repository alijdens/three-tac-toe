import { Box, Grid } from "@mui/material"
import { rankNextMoves } from "./AI"
import { GameState, Player, SquarePos } from "./state"
import { getMoveHintColor } from "./utils"

enum SquareValue {
    X = 'x',
    O = 'o',
    Empty = '',
}

type BoardProps = {
    state: GameState,
    onSquareClick: (id: SquarePos) => void,
    showHints: boolean,
    highlightMoveToDelete: boolean,
}

function Board({ state, onSquareClick, showHints, highlightMoveToDelete }: BoardProps) {
    const colors = Array(9).fill('white')
    const highlight = Array(9).fill(false)

    const squareValues = Array(9).fill(null)
    state.XMoves.forEach((i, index) => {
        squareValues[i] = 'x'
        colors[i] = '#1bcd80'
        if (state.winner == Player.X) {
            highlight[i] = true
        } else if (highlightMoveToDelete && index == 0 && state.XMoves.length == 3) {
            colors[i] += '40'
        }
    })
    state.OMoves.forEach((i, index) => {
        squareValues[i] = 'o'
        colors[i] = '#d13a1b'
        if (state.winner == Player.O) {
            highlight[i] = true
        } else if (highlightMoveToDelete && index == 0 && state.OMoves.length == 3) {
            colors[i] += '40'
        }
    })

    const bgColors = Array(9).fill('#1a1a1a')
    if (showHints && !state.winner) {
        const moves = rankNextMoves(state)
        moves.forEach((move) => {
            bgColors[move.position] = getMoveHintColor(move.score)
        })
    }

    return <>
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gridTemplateRows: 'repeat(3, 1fr)',
                    aspectRatio: '1 / 1',
                    width: '100%',
                    gap: '10px'
                }}
            >
                {squareValues.map((_, i) => (
                    <Grid
                        key={i}
                        item
                        sx={{ aspectRatio: '1 / 1', border: '0px' }}
                    >
                        <Square
                            id={i as SquarePos}
                            value={squareValues[i]}
                            onClick={onSquareClick}
                            color={colors[i]}
                            backgroundColor={bgColors[i]}
                            highlight={highlight[i]}
                        />
                    </Grid>
                ))}
            </Box>
        </Box>
    </>
}


type SquareProps = {
    id: SquarePos,
    value: SquareValue,
    onClick: (id: SquarePos) => void,
    color: string,
    backgroundColor: string,
    highlight: boolean,
}

function Square({ id, value, onClick, color, backgroundColor, highlight } : SquareProps) {
    const classes = ['square']
    if (!value) {
        classes.push('empty')
    }
    const style: any = {
        color: color,
        backgroundColor: highlight ? '#030303' : '#1a1a1a',
        boxShadow: `inset ${backgroundColor} 0 0 20px 5px`,
        transition: 'transform ease 0.5s, box-shadow ease 0.5s',
    }
    if (highlight) {
        style.borderColor = '#ffffff'
        style.borderWidth = 3
    }
    return <>
        <button
            style={style}
            className={classes.join(' ')}
            onClick={() => onClick(id)}
        >
            { value }
        </button>
    </>
}

export default Board
