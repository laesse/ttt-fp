import * as A from 'fp-ts/NonEmptyArray';
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray';
import * as T from 'fp-ts/Task';
import * as S from 'fp-ts/string';
import * as Console from 'fp-ts/Console';
import { pipe } from 'fp-ts/function';
import prompt from 'prompt';
import type { IO } from 'fp-ts/lib/IO';

type Board = A.NonEmptyArray<A.NonEmptyArray<number>>;
type PosibleInputs = `${'A' | 'B' | 'C'}${'1' | '2' | '3'}` | 'CL';

const printLine = (line: A.NonEmptyArray<number>): IO<void> => Console.log(line.join(' '));

const printBoard = (board: Board) => {
  pipe([board, A.map(printLine)]);
};
const promptForInput: T.Task<{ input: PosibleInputs }> = () =>
  prompt.get([
    {
      name: 'input',
      pattern: /([ABC][123])|(CL)/i,
      required: true,
    },
  ]);

const unpackInput = T.map<{ input: PosibleInputs }, PosibleInputs>((a) => a.input);

const doMove = (board: Board) => (input: T.Task<string>) => {
  const row = pipe([input, T.map(S.split('')), T.map(A.last)]);
  const col = pipe([input, T.map(S.split('')), T.map(A.head)]);

  return () => Promise.resolve();
};

const playGame = (board: Board) => (move: number) => (message: string) => {
  Console.log(message);
  printBoard(board);

  const a = promptForInput;
  const b = unpackInput(a);
  const ba = doMove(board)(b);
  pipe([promptForInput(), unpackInput, doMove(board)]);
};

const board = A.makeBy(() => A.makeBy(() => 0)(3))(3);
playGame(board)(1)('Welcome to ttt');
