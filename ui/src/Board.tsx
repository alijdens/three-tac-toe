import { Box, Grid } from "@mui/material"
import { rankNextMoves } from "./AI"
import { GameState, Player, SquarePos } from "./state"
import { getMoveHintColor } from "./utils"
import './Board.css'


enum SquareValue {
    X = 'X',
    O = 'O',
    Empty = '',
}

type BoardProps = {
    state: GameState,
    onSquareClick: (id: SquarePos) => void,
    showHints: boolean,
    highlightMoveToDelete: boolean,
}

function Board({ state, onSquareClick, showHints, highlightMoveToDelete }: BoardProps) {
    const opacities = Array(9).fill(0)
    const highlight = Array(9).fill(false)

    const squareValues = Array(9).fill(null)

    function updateSquares(player: Player, moves: SquarePos[]) {
        const squareValue = (player == Player.X) ? SquareValue.X : SquareValue.O
        moves.forEach((i, index) => {
            squareValues[i] = squareValue
            opacities[i] = 1
            if (state.winner == player) {
                highlight[i] = true
            } else if (highlightMoveToDelete && index == 0 && moves.length == 3) {
                opacities[i] = 0.4
            }
        })
    }

    updateSquares(Player.X, state.XMoves)
    updateSquares(Player.O, state.OMoves)

    const shadows = Array(9).fill(null)
    if (showHints && !state.winner) {
        const moves = rankNextMoves(state)
        moves.forEach((move) => {
            shadows[move.position] = getMoveHintColor(move.score)
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
                            opacity={opacities[i]}
                            shadow={shadows[i]}
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
    opacity: number,
    onClick: (id: SquarePos) => void,
    shadow: string | null,
    highlight: boolean,
}

function Square({ id, value, opacity, onClick, shadow, highlight } : SquareProps) {
    const classes = ['square']
    if (!value) {
        classes.push('empty')
    }
    const style: any = {
        backgroundColor: highlight ? '#030303' : '#3a3a3a',
        transition: 'transform ease 0.5s, box-shadow ease 0.5s',
    }
    if (highlight) {
        style.borderColor = '#ffffff'
        style.borderWidth = 3
    }
    if (shadow) {
        style.boxShadow = `inset ${shadow} 0 0 10px 10px`
    }
    const contentStyle = {
        color: (value == SquareValue.X) ? '#1bcd80' : '#d13a1b',
        opacity: opacity,
        transition: 'opacity ease 0.7s',
    }
    return <>
        <button
            style={style}
            className={classes.join(' ')}
            onClick={() => onClick(id)}
        >
            <span style={contentStyle}>{value}</span>
        </button>
    </>
}

export default Board
