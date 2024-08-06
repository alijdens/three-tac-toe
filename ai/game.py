# This file solves the game and generates a map from board states to the best
# outcome that can be reached from it. Using this map you could find the optimal
# next play by inspecting the outcome of the direct sub-states

from collections import deque
from typing import Generator


class Game:

    class InputError(Exception):
        pass

    @staticmethod
    def decode(code: int) -> 'Game':
        """Parse the `code` representing a game state and returns the
        corresponding `Game` object."""

        game = Game()
        game.player = 'x' if code >= 1_000_000 else 'o'

        # decode each move position from each digit in the code

        # first 3 digits represent the 'x's
        for i in range(3):
            j = int(code / 10**i) % 10
            if j > 0:
                game._state[j-1] = 'x'
                game._q['x'].append(j-1)

        # last 3 digits represent the 'o's
        for i in range(3, 6):
            j = int(code / 10**i) % 10
            if j > 0:
                game._state[j-1] = 'o'
                game._q['o'].append(j-1)
        return game

    @staticmethod
    def get_opponent(player: str) -> str:
        """Returns the opponent to `player`."""

        assert player in ('x', 'o')
        return 'x' if player != 'x' else 'o'

    def __init__(self) -> None:
        # stores the state of the board by storing 0 (empty) 'x' or 'o'
        self._state = [0] * 9
        # a queue that holds the move orders for each player so we know
        # which one to delete (FIFO)
        self._q = {
            'x': deque(),
            'o': deque(),
        }
        # current player's turn (read-only)
        self.player = 'x'

    def play(self, player: str, pos: int) -> int:
        """Places a move in the board. `player` is passed just as a sanity
        check. `pos` is the position in the board where the move is made.
        Returns the position of the move that was deleted (or -1 if no move
        was deleted)."""

        assert self.player == player, self.player
        if not 0 <= pos <= 8:
            raise Game.InputError('Input must be between 0 and 8')

        if self._state[pos] != 0:
            raise Game.InputError(f'Cell {pos} is not empty')

        self._state[pos] = player
        if len(self._q[player]) == 3:
            # move limit reached, must delete the oldest one
            deleted_pos = self._q[player].popleft()
            self._state[deleted_pos] = 0
        else:
            # no need to delete yet
            deleted_pos = -1

        self._q[player].append(pos)
        self.player = self.get_opponent(self.player)
        return deleted_pos

    def undo(self, player: str, pos: str, deleted_pos: int) -> None:
        """Undo a move to `pos`. `deleted_pos` indicates the move that was
        deleted when `pos` was played before."""

        assert self.player != player, self.player
        assert self._state[pos] == player, (pos, player)

        self._state[pos] = 0
        self.player = player
        if deleted_pos >= 0:
            self._state[deleted_pos] = player
            self._q[player].appendleft(deleted_pos)
        self._q[player].pop()

    def won(self, player) -> bool:
        """Returns whether `player` has won the game or not."""

        for i in range(3):
            o = 3 * i
            # check horizontal lines
            if self._state[o] == self._state[o+1] == self._state[o+2] == player:
                return True

            # check vertical lines
            if self._state[i] == self._state[i+3] == self._state[i+6] == player:
                return True

        # check diagonals
        if self._state[0] == self._state[4] == self._state[8] == player:
            return True
        if self._state[2] == self._state[4] == self._state[6] == player:
            return True

        # at this point there are no complete lines, so no it's not a winner
        return False

    def winner(self) -> str | None:
        """Returns the winner or None if the game is not over yet."""

        if self.won('x'):
            return 'x'
        if self.won('o'):
            return 'o'
        return None

    def encode(self) -> int:
        """Encode the board state into an integer. The board can be obtained
        from the code again by using `Game.decode`."""

        # there's an upper bound of 2*(10^6) states if we consider that we
        # can place each of the 6 moves in 10 different states (not placed
        # plus 9 boxes), which is 1M. Then we also have to differentiate
        # between which player's turn is next which adds 1 more bit
        # this means we can encode all states in 2M numbers

        x = 0
        # first 3 digits are the X's states
        for i, v in enumerate(self._q['x']):
            x += (v+1) * 10**i
        # next 3 are for O's
        for i, v in enumerate(self._q['o']):
            x += (v+1) * 10**(i+3)
        # final bit to indicate which player's turn it is
        if self.player == 'x':
            x += 1_000_000
        assert x <= 2*10**6, self
        return x
    
    def copy(self) -> 'Game':
        """Returns an independent copy of the board instance."""

        return self.decode(self.encode())

    def valid_sub_states(self) -> Generator[tuple[int, int], None, None]:
        """Yields the valid states that the board can transition to. The first
        item in the tuple is the sub-state code and the second one is the
        position where the player has moved to reach that state."""

        if self.winner():
            return

        for pos, pos_content in enumerate(self._state):
            # can only move to empty boxes in the board
            if pos_content == 0:
                player = self.player
                deleted_pos = self.play(player, pos)
                code = self.encode()
                self.undo(player, pos, deleted_pos)
                yield code, pos

    def print(self) -> None:
        """Prints the game board in stdout."""

        print(str(self))

    def __eq__(self, other):
        if not isinstance(other, Game):
            return NotImplemented
        if self._state != other._state:
            return False
        if self._q != other._q:
            return False
        if self.player != other.player:
            return False
        return True

    def __str__(self) -> str:
        output = [f' * Turn of "{self.player}"']
        for i in range(3):
            def xc(i):
                c = self._state[i]
                if c == 0:
                    return ' '
                elif i == self._q[c][0] and len(self._q[c]) == 3:
                    # if the move is going to be deleted the next turn then
                    # print it lower case
                    return c
                else:
                    return c.upper()

            o = i * 3
            output.append(f' {xc(o)} | {xc(o + 1)} | {xc(o + 2)}')
        return '\n'.join(output)

    def __repr__(self) -> str:
        return str(self)
