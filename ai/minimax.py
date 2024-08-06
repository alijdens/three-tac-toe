import graph
from collections import defaultdict, deque
from game import Game
from typing import Optional


def get_scores() -> dict[int, Optional[str]]:
    """Returns a dict mapping the game state integer representation
    obtained from `Game.encode()` into the player that would win if
    that stage is reached (or None if it would result in a tie)."""

    # build the graph of game states and possible transitions
    IG = defaultdict(set)
    for parent, child, _, _, _ in graph.bfs():
        IG[child].add(parent)
        IG[parent]  # create empty node

    G = graph.invert(IG)
    leaf_nodes = {node for node, children in G.items() if not children}

    unvisited = deque()

    # set initial scores
    scores = {}
    for node in leaf_nodes:
        game = Game.decode(node)
        winner = game.winner()
        assert winner
        scores[node] = 3 if winner == 'x' else 1

        for parent in IG[node]:
            unvisited.append(parent)

    assert unvisited

    forced_wins = set()
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
            if (is_max and scores[child] == 3) or (not is_max and scores[child] == 1):
                scores[node] = scores[child]
                forced_wins.add(node)
                for parent in IG[node]:
                    unvisited.append(parent)
                break
        else:
            assert resolved_children <= len(G[node])
            if resolved_children == len(G[node]) and len(G[node]) > 0:
                f = max if is_max else min
                scores[node] = f(scores[child] for child in G[node])
                forced_wins.add(node)
                for parent in IG[node]:
                    unvisited.append(parent)

    _minimax(cache=scores, game=Game(), is_max=True, visit_count=defaultdict(int), G=G, visited=set(), forced_wins=forced_wins)
    assert len(G) == len(scores)
    return scores


def _minimax(
        cache: dict[int, int],
        game: Game,
        is_max: bool,
        visit_count: dict[int, int],
        G: dict[int, set],
        visited: set[int],
        forced_wins: set[int],
    ) -> None:
    """Executes minimax recursively to fill the cache of state scores.
    Returns the current node's score but this is only useful for recursive
    calls. All the data will be stored in `cache` when the main call ends."""

    output_scores = []
    stack = [('in', output_scores, game.encode(), is_max, [])]

    while stack:
        state, parent_scores, code, is_max, child_scores = stack.pop()

        if code in cache and code in visited:
            # this node was already solved, no need to recalculate it
            parent_scores.append(cache[code])
            continue

        if state == 'out':
            if code in forced_wins:
                score = cache[code]
            else:
                # calculate this node's state based on the child scores
                f = max if is_max else min
                score = f(child_scores)
                cache[code] = score

            visit_count[code] -= 1
            assert visit_count[code] >= 0
            parent_scores.append(score)

            visited.add(code)
            continue
        else:
            assert state == 'in', state
            stack.append(('out', parent_scores, code, is_max, child_scores))
            visit_count[code] += 1

        game = Game.decode(code)
        for child_code, _ in game.valid_sub_states():
            # check if this node was already visited. If if was, make sure that
            # we still have unvisited transitions to follow next
            if visit_count[child_code] > 0 and visit_count[child_code] == len(G[child_code]):
                # no new path to take, so we consider this state a tie because we can
                # cycle forever
                child_scores.append(2)
                continue

            assert visit_count[child_code] == 0 or visit_count[child_code] < len(G[child_code])

            child_game = game.decode(child_code)
            if child_game.winner():
                # cut condition, there's a winner at this state
                child_scores.append(cache[child_code])
            else:
                # play the next turn
                stack.append(('in', child_scores, child_code, not is_max, []))
