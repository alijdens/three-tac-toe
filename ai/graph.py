from copy import deepcopy
from collections import deque, defaultdict
from game import Game
from typing import Generator, Tuple


Graph = dict[int, set[int]]


def toposort(start: set[int], parents: Graph) -> list[int]:
    """Returns the nodes in the `parents` graph ordered by topological sort.
    `parents` is the adjacency list defining the relation from child nodes to
    parent nodes while `children` is the inverse (parent -> children).
    `start` is the set of starting (i.e. leaf) nodes.
    The graph should not have cycles."""

    start = deepcopy(start)
    children = invert(parents)
    sorted = []

    while start:
        n = start.pop()
        sorted.append(n)
        for m in parents[n]:
            children[m].remove(n)
            if not children[m]:
                start.add(m)

    for node, child in children.items():
        if len(child):
            raise RuntimeError(f'cycle in G: {node} -> {child}')

    return sorted


def bfs() -> Generator[Tuple[int, int, int, int, bool], None, None]:
    """Does a BFS over the possible game states (starting from the
    empty board).
    For each edge, yields a tuple with the following elements:
    1. the source state
    2. the child state
    3. the move that was made
    4. the BFS level
    5. whether the node was already visited before
    """

    q = deque()
    q.append((Game().encode(), 0))
    visited = set()
    while q:
        code, level = q.popleft()

        game = Game.decode(code)
        if code in visited:
            # avoid entering loops
            continue

        visited.add(code)

        for child_code, move in game.valid_sub_states():
            was_visited = True
            if child_code not in visited:
                q.append((child_code, level+1))
                was_visited = False

            yield code, child_code, move, level+1, was_visited


def invert(G: Graph) -> Graph:
    """Returns the inverted graph `G`."""

    IG = defaultdict(set)
    for node, children in G.items():
        for child in children:
            IG[child].add(node)
            IG[node]  # create empty node
    return IG
