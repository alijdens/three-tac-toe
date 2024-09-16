# three-tac-toe
A tic-tac-toe variation where each player can only have 3 moves in the board. When playing the 4th move, the oldest one is deleted from the board.

This game can be played on https://alijdens.github.io/three-tac-toe/

## Build

To generate the AI execute (requires Python 3.9+):

```shell
python ./ai
```

The explanation about how it works can be found [here](http://localhost:4000/2024-08-11-three-men-morris-fifo/).

To test the UI locally refer to [`ui`](./ui).

## Deployment

This game is a fully static website, so the only steps for deployment are to build and upload to github pages, which is done automatically (using Github actions) after every push to `main`.
