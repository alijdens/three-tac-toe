import graph
from collections import defaultdict, deque
from game import Game
from typing import Optional


class Score(int):
    def increment(self):
        if self == 0:
            return self
        elif self < 0:
            return Score(self - 1)
        else:
            return Score(self + 1)


def get_scores() -> dict[int, Optional[str]]:
    """Returns a dict mapping the game state integer representation
    obtained from `Game.encode()` into the player that would win if
    that stage is reached (or None if it would result in a tie).
    An explanation of how this algorithm works can be found in
    http://localhost:4000/2024-08-11-three-men-morris-fifo/
    """

    # build the graph of game states and possible transitions
    IG: graph.Graph = defaultdict(set)
    for parent, child, _, _, _ in graph.bfs():
        IG[child].add(parent)
        IG[parent]  # create empty node

    G = graph.invert(IG)
    leaf_nodes = {node for node, children in G.items() if not children}

    unvisited = deque()

    # set initial scores
    scores: dict[int, Score] = {}
    for node in leaf_nodes:
        game = Game.decode(node)
        winner = game.winner()
        assert winner
        scores[node] = Score(1) if winner == 'x' else Score(-1)

        for parent in IG[node]:
            unvisited.append(parent)

    assert unvisited

    while unvisited:
        node = unvisited.popleft()
        is_max = node >= 1_000_000
        if node in scores:
            continue

        resolved_children = 0
        for child in G[node]:
            if child not in scores:
                continue

            resolved_children += 1
            if (is_max and scores[child] > 0) or (not is_max and scores[child] < 0):
                # increment the score so we can track how far away from victory it currently is
                scores[node] = scores[child].increment()
                for parent in IG[node]:
                    unvisited.append(parent)
                break
        else:
            assert resolved_children <= len(G[node])
            if resolved_children == len(G[node]) and len(G[node]) > 0:
                f = max if is_max else min
                scores[node] = f(scores[child] for child in G[node]).increment()
                for parent in IG[node]:
                    unvisited.append(parent)

    # the rest of the nodes which don't have a score yet lead to a draw
    for code in G:
        if code not in scores:
            scores[code] = 0

    assert len(G) == len(scores)

    # invert the scores so that shorter paths to victory are preferred
    return {node: (1/score if score else 0) for node, score in scores.items()}
