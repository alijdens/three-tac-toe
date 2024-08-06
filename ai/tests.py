from game import Game
import graph


def test_game():
    assert Game.get_opponent('x') == 'o'
    assert Game.get_opponent('o') == 'x'
    
    game = Game()

    assert game.play('x', 0) == -1
    assert game.play('o', 8) == -1

    assert game.play('x', 1) == -1
    assert game.play('o', 7) == -1

    assert game.play('x', 3) == -1
    assert game.play('o', 5) == -1
    assert game.decode(game.encode()) == game

    deleted = game.play('x', 4)
    assert deleted == 0
    assert game._state == [0, 'x', 0, 'x', 'x', 'o', 0, 'o', 'o']
    assert game.decode(game.encode()) == game

    game.undo('x', 4, deleted)
    assert game.decode(game.encode()) == game
    assert game._state == ['x', 'x', 0, 'x', 0, 'o', 0, 'o', 'o']
    game.undo('o', 5, -1)
    assert game.decode(game.encode()) == game
    assert game._state == ['x', 'x', 0, 'x', 0, 0, 0, 'o', 'o']


def test_graph():
    G = {
        1: {2},
        2: {3},
        3: {4},
        4: {},
    }
    assert graph.toposort(start={1}, parents=G) == [1, 2, 3, 4]

    G[1].add(5)
    G[5] = {3}
    assert graph.toposort(start={1}, parents=G) in ([1, 2, 5, 3, 4], [1, 5, 2, 3, 4])

    G[5].add(2)
    assert graph.toposort(start={1}, parents=G) == [1, 5, 2, 3, 4]

    G[5].remove(2)
    G[2].add(5)
    assert graph.toposort(start={1}, parents=G) == [1, 2, 5, 3, 4]


if __name__ == '__main__':
    tests = [
        f for name, f
        in locals().items()
        if name.startswith('test_') and callable(f)
    ]
    for test in tests:
        print('Running', test.__name__)
        test()
