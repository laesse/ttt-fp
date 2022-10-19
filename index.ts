import * as ARR from 'fp-ts/Array';
import * as A from 'fp-ts/NonEmptyArray';
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray';
import * as T from 'fp-ts/Task';
import * as O from 'fp-ts/Option';
import * as S from 'fp-ts/string';
import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/function';
import prompt from 'prompt';
import { ap } from 'fp-ts/lib/Identity';

type Board = A.NonEmptyArray<A.NonEmptyArray<number>>;
type PosibleInputs = `${'A' | 'B' | 'C'}${'1' | '2' | '3'}`;

/*
  A B C
1 _ _ _
2 _ _ _
3 _ _ _
*/

const printLine = (line: A.NonEmptyArray<number>) => console.log(line.join(' '));

const printBoard = (board: Board) => {
  pipe(board, A.map(printLine));
};
const updateAtWith = (at: number) => (thing: A.NonEmptyArray<number>) => A.updateAt(at, thing);

const makeMoveOnBoard =
  (board: Board) => (row: number) => (col: number) => (playerToMove: number) => {
    const updateBoard = flow(
      updateAtWith(row),
      ap(board),
      E.fromOption(() => "lookup or update din't work")
    );
    console.log(row, col);
    return pipe(
      board,
      ARR.lookup(row),
      O.chain(A.updateAt(col, playerToMove)),
      E.fromOption(() => "lookup or update din't work"),
      E.chain(updateBoard)
    );
  };
const promptForInput: T.Task<{ input: PosibleInputs }> = () =>
  prompt.get([
    {
      name: 'input',
      pattern: /([ABC][123])|(CL)/i,
      required: true,
    },
  ]);

const unpackInput = (a: { input: PosibleInputs }) => a.input;

const charCodeAt = (i: number) => (s: string) => s.charCodeAt(i);
const subFromBase = (base: string) => (charCode: number) => charCode - base.charCodeAt(0);

const getIndexFromBaseLetter = (base: string) =>
  flow(S.toUpperCase, charCodeAt(0), subFromBase(base));

const getColIndex = flow(S.split(''), RNEA.head, getIndexFromBaseLetter('A'));
const getRowIndex = flow(S.split(''), RNEA.last, getIndexFromBaseLetter('1'));

const doMove = (playerToMove: number) => (board: Board) => (input: PosibleInputs) => {
  return pipe(
    makeMoveOnBoard,
    ap(board),
    ap(getRowIndex(input)),
    ap(getColIndex(input)),
    ap(playerToMove)
  );
};

const playGame =
  (board: Board) =>
  (move: number) =>
  (playerToMove: number) =>
  (message: string): T.Task<void> => {
    console.log(message);
    printBoard(board);

    const printError = (errorMessage: string) =>
      pipe(playGame, ap(board), ap(move), ap(playerToMove), ap(errorMessage));
    const nextMove = (newBoard: Board) =>
      pipe(playGame, ap(newBoard), ap(move + 1), ap(playerToMove == 1 ? 2 : 1), ap('next move'));

    return pipe(
      promptForInput,
      T.map(unpackInput),
      T.map(doMove(playerToMove)(board)),
      T.chain(E.match(printError, nextMove))
    );
  };

const board = A.makeBy(() => A.makeBy(() => 0)(3))(3);
(async () => {
  await playGame(board)(1)(1)('Welcome to ttt')();
})();
