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
}

function Board({ state, onSquareClick, showHints }: BoardProps) {
    const colors = Array(9).fill('white')
    const highlight = Array(9).fill(false)

    const squareValues = Array(9).fill(null)
    state.XMoves.forEach((i, index) => {
        squareValues[i] = 'x'
        colors[i] = '#1bcd80'
        if (state.winner == Player.X) {
            highlight[i] = true
        } else if (index == 0 && state.XMoves.length == 3) {
            colors[i] += '40'
        }
    })
    state.OMoves.forEach((i, index) => {
        squareValues[i] = 'o'
        colors[i] = '#d13a1b'
        if (state.winner == Player.O) {
            highlight[i] = true
        } else if (index == 0 && state.OMoves.length == 3) {
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
        <table>
            <tbody>
                {[[0, 1, 2], [3, 4, 5], [6, 7, 8]].flatMap((row) =>
                    <tr key={row[0]}>{
                        row.map((i) =>
                            <td key={i}>
                                <Square
                                    id={i as SquarePos}
                                    value={squareValues[i]}
                                    onClick={onSquareClick}
                                    color={colors[i]}
                                    backgroundColor={bgColors[i]}
                                    highlight={highlight[i]}
                                />
                            </td>
                        )
                    }</tr>
                )}
            </tbody>
        </table>
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
    const style = {
        color: color,
        backgroundColor: highlight ? '#030303' : '#1a1a1a',
        borderColor: highlight ? '#ffffff' : '#000000',
        boxShadow: `inset ${backgroundColor} 0 0 20px 5px`,
        transition: 'transform ease 0.5s, box-shadow ease 0.5s',
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
