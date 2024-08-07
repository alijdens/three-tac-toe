import { GameState, Player, SquarePos } from "./state"

enum SquareValue {
    X = 'x',
    O = 'o',
    Empty = '',
}

type BoardProps = {
    state: GameState,
    onSquareClick: (id: SquarePos) => void,
}

function Board({ state, onSquareClick }: BoardProps) {
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
    highlight: boolean,
}

function Square({ id, value, onClick, color, highlight } : SquareProps) {
    const classes = ['square']
    if (!value) {
        classes.push('empty')
    }
    const style = {
        color: color,
        backgroundColor: highlight ? '#030303' : '#1a1a1a'
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
