import random
import minimax
from game import Game


def run_game():
    game = Game()
    history = []

    scores = minimax.get_scores()
    bot = 'o'
    while not game.winner():
        try:
            options = [(scores[code], move) for code, move in game.valid_sub_states()]
            print(f'State={game.encode()}, {options=}')
            if game.player != bot:
                play = input(f'{game.player}: ')
                if play == '':
                    i = pick_best_play(game=game, options=options)
                    print('Automatically selected', i)
                else:
                    i = int(play)
            else:
                i = pick_best_play(game=game, options=options)
                print('Bot selected', i)

            if i < 0:
                while i < 0 and history:
                    game = Game.decode(history.pop())
                    i += 1
            else:
                history.append(game.encode())
                game.play(game.player, i)
        except Game.InputError as e:
            print(e)
            continue

        game.print()

    print(game.winner(), 'won!')


def pick_best_play(game: Game, options: list[int, int]) -> int:
    f = max if game.player == 'x' else min
    best_score = f(score for score, _ in options)
    top_move = random.choice([move for score, move in options if score == best_score])
    return top_move


if __name__ == '__main__':
    run_game()
