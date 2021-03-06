// xboard.test.js
// @author octopoulo <polluxyz@gmail.com>
// @version 2020-06-03
//
/*
globals
__dirname, expect, require, test
*/
'use strict';

let {create_module} = require('./create-module');

let IMPORT_PATH = __dirname.replace(/\\/g, '/'),
    OUTPUT_MODULE = `${IMPORT_PATH}/test/xboard+`;

create_module(IMPORT_PATH, [
    'common',
    'engine',
    'global',
    'libs/chess-quick',
    //
    'xboard',
], OUTPUT_MODULE, 'Assign START_FEN XBoard');

let {Assign, START_FEN, XBoard} = require(OUTPUT_MODULE);

let archive = new XBoard({}),
    live = new XBoard({id: 'null'});

live.initialise();
live.dual = archive;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// add_moves_string
[
    [
        '1. d4 Nf6 2. c4 c5 3. d5',
        0,
        [0, {m: 'd4'}, {m: 'Nf6'}, {m: 'c4'}, {m: 'c5'}, {m: 'd5'}],
    ],
    [
        '38...Qg7 39. Rf2 Qh6 40. Nxg6',
        75,
        [75, {m: 'Qg7'}, {m: 'Rf2'}, {m: 'Qh6'}, {m: 'Nxg6'}],
    ],
    [
        '41...Kxg8 42. a8=Q+ Kg7',
        81,
        [81, {m: 'Kxg8'}, {m: 'a8=Q+'}, {m: 'Kg7'}],
    ],
].forEach(([text, cur_ply, answer], id) => {
    test(`add_moves_string:${id}`, () => {
        live.add_moves_string(text, cur_ply);

        let offset = answer[0],
            array = new Array(offset);
        for (let i = 1; i < answer.length ; i ++)
            array[offset + i - 1] = answer[i];

        expect(live.moves).toEqual(array);
    });
});

// analyse_fen
[
    ['invalid fen', false],
    [START_FEN, true],
    ['1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 Nc6', false],
    ['1. e4 c5 2. Nf3 d6', false],
].forEach(([fen, answer], id) => {
    test(`analyse_fen:${id}`, () => {
        expect(live.analyse_fen(fen)).toEqual(answer);
    });
});

// chess_fen
[
    [START_FEN, ['d5'], START_FEN],
    [START_FEN, ['d4'], 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1'],
    [START_FEN, ['d4', 'd5'], 'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 2'],
].forEach(([fen, moves, answer], id) => {
    test(`chess_fen:${id}`, () => {
        live.chess_load(fen);
        for (let move of moves)
            live.chess_move(move);
        expect(live.chess_fen()).toEqual(answer);
    });
});

// chess_load
[
    START_FEN,
].forEach((fen, id) => {
    test(`chess_load:${id}`, () => {
        live.chess_load(fen);
        expect(live.chess_fen()).toEqual(fen);
    });
});

// chess_mobility
[
    [{fen: '5k2/5Q2/5K2/8/8/8/8/8 b - - 0 1'}, 0],
    [{fen: '8/8/8/8/8/5k2/5p2/5K2 w - - 0 1'}, -0.5],
    [{fen: '8/8/7k/5B2/6K1/8/8/8 b - - 0 1'}, 1.5],
    [{fen: '8/8/4k3/5q2/6K1/8/8/8 w - - 0 1'}, -2],
    [{fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'}, -20.5],
].forEach(([move, answer], id) => {
    test(`chess_mobility:${id}`, () => {
        expect(live.chess_mobility(move)).toEqual(answer);
    });
});

// chess_move
[
    [START_FEN, 'd5', null],
    [START_FEN, 'd4', {color: 0, flags: 4, from: 99, piece: 'p', to: 67}],
].forEach(([fen, move, answer], id) => {
    test(`chess_move:${id}`, () => {
        live.chess_load(fen);
        expect(live.chess_move(move)).toEqual(answer);
    });
});

// render_text
[
    [
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        {notation: 1 + 4},
        [
            '  a b c d e f g h',
            '8 r n b q k b n r',
            '7 p p p p p p p p',
            '6   ·   ·   ·   ·',
            '5 ·   ·   ·   ·  ',
            '4   ·   ·   ·   ·',
            '3 ·   ·   ·   ·  ',
            '2 P P P P P P P P',
            '1 R N B Q K B N R',
        ].join('\n'),
    ],
    [
        '6k1/pr3p1p/4p1p1/3pB1N1/bp1P2Rq/1nr4B/7K/1R1Q4 w KQkq - 0 1',
        {notation: 0},
        [
            '  ·   ·   · k ·',
            'p r ·   · p · p',
            '  ·   · p · p ·',
            '·   · p B   N  ',
            'b p   P   · R q',
            '· n r   ·   · B',
            '  ·   ·   ·   K',
            '· R · Q ·   ·  ',
        ].join('\n'),
    ],
].forEach(([fen, options, answer], id) => {
    test(`render_text:${id}`, () => {
        Assign(live, options);
        live.set_fen(fen);
        expect(live.render_text()).toEqual(answer);
    });
});

// set_fen
[
    ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w AHah - 0 1', null],
    ['4rrk1/1pq1bppp/p1np1n2/P4R2/4P3/2N1B3/1PPQB1PP/R6K w - - 3 21', null],
    ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', null],
    ['6k1/pr3p1p/4p1p1/3pB1N1/bp1P2Rq/1nr4B/7K/1R1Q4', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'],
].forEach(([fen, answer], id) => {
    test(`set_fen:${id}`, () => {
        live.set_fen(fen);
        expect(live.fen).toEqual(answer || fen);
    });
});
