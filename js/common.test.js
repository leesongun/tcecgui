// common.test.js
// @author octopoulo <polluxyz@gmail.com>
// @version 2020-06-23
//
/*
globals
__dirname, expect, require, test
*/
'use strict';

let {create_module} = require('./create-module');

let IMPORT_PATH = __dirname.replace(/\\/g, '/'),
    OUTPUT_MODULE = `${IMPORT_PATH}/test/common+`;

create_module(IMPORT_PATH, [
    'common',
], OUTPUT_MODULE, 'IsFloat IsString');

let {
    Clamp, Contain, DefaultFloat, Format, FormatFloat, FormatUnit, FromSeconds, FromTimestamp, HashText,
    InvalidEmail, InvalidPhone, IsDigit, IsFloat, IsString, Pad, QueryString, SetDefault, Split, Stringify, Title,
    Undefined,
} = require(OUTPUT_MODULE);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Clamp
[
    [-1, 1, undefined, undefined, 1],
    [-1, 1, null, null, 1],
    [-1, 1, undefined, 10, 10],
    [20, 1, undefined, undefined, 20],
    [20, 1, 10, undefined, 10],
].forEach(([number, min, max, min_set, answer], id) => {
    test(`Clamp:${id}`, () => {
        expect(Clamp(number, min, max, min_set)).toEqual(answer);
    });
});

// Contain
[
    [['dn', 'mode'], 'mode', true],
    [['dn', 'mode'], 'mod', false],
    [['dn', 'mode'], '^mod', true],
    [['dn', 'mode'], '*od', true],
    [['dn', 'mode'], '$de', true],
].forEach(([list, pattern, answer], id) => {
    test(`Contain:${id}`, () => {
        expect(Contain(list, pattern)).toEqual(answer);
    });
});

// DefaultFloat
[
    [undefined, undefined, undefined],
    [undefined, 0, 0],
    [0, 1, 0],
    ['-0.5', 1, -0.5],
    ['5 or 1', 1, 5],
    ['5', 1, 5],
    ['text 9', null, null],
].forEach(([value, def, answer], id) => {
    test(`DefaultFloat:${id}`, () => {
        expect(DefaultFloat(value, def)).toEqual(answer);
    });
});

// Format
[
    [[-1, 1, Math.PI], undefined, undefined, '-1, 1, 3.142'],
    [[-1, 1, Math.PI], ' : ', undefined, '-1 : 1 : 3.142'],
    [Math.PI, undefined, undefined, '3.142'],
    [{x: 1, y: 9, z: 2, w: -0.0004}, undefined, undefined, '1, 9, 2, 0'],
].forEach(([vector, sep, align, answer], id) => {
    test(`Format:${id}`, () => {
        expect(Format(vector, sep, align)).toEqual(answer);
    });
});

// FormatFloat
[
    [-0.0001, undefined, '0'],
    [Math.PI, undefined, '3.142'],
].forEach(([text, align, answer], id) => {
    test(`FormatFloat:${id}`, () => {
        expect(FormatFloat(text, align)).toEqual(answer);
    });
});

// FormatUnit
[
    [1000000000, undefined, '1B'],
    [1000000, undefined, '1M'],
    [10000, undefined, '10k'],
    [1000, undefined, '1000'],
    [100, undefined, '100'],
    [7841319402, undefined, '7.8B'],
    [58335971.81109362, undefined, '58.3M'],
    [58335971, undefined, '58.3M'],
    ['58335971', undefined, '58.3M'],
    [318315, undefined, '318.3k'],
    [1259, undefined, '1.2k'],
    [725.019, undefined, '725'],
    [NaN, undefined, 'N/A'],
    [Infinity, undefined, 'Infinity'],
    [undefined, undefined, 'undefined'],
    [undefined, '-', '-'],
    // check if we can feed the result back => stability
    ['7.8B', undefined, '7.8B'],
    ['58.3M', undefined, '58.3M'],
    ['725', undefined, '725'],
    ['N/A', undefined, 'N/A'],
    ['Infinity', undefined, 'Infinity'],
    ['null', undefined, 'null'],
    ['null', '-', '-'],
    ['null', null, null],
    ['-', undefined, '-'],
].forEach(([nodes, def, answer], id) => {
    test(`FormatUnit:${id}`, () => {
        expect(FormatUnit(nodes, def)).toEqual(answer);
    });
});

// FromSeconds
[
    ['0', [0, 0, 0, '00']],
    ['32.36', [0, 0, 32, '36']],
    ['4892.737', [1, 21, 32, '73']],
    [208.963, [0, 3, 28, '96']],
].forEach(([time, answer], id) => {
    test(`FromSeconds:${id}`, () => {
        expect(FromSeconds(time)).toEqual(answer);
    });
});

// FromTimestamp
[
    [1576574884, ['19-12-17', '10:28:04']],
].forEach(([stamp, answer], id) => {
    test(`FromTimestamp:${id}`, () => {
        expect(FromTimestamp(stamp)).toEqual(answer);
    });
});

// HashText
[
    ['apple', 2240512858],
    ['orange', 1138632238],
].forEach(([text, answer], id) => {
    test(`HashText:${id}`, () => {
        expect(HashText(text)).toEqual(answer);
    });
});

// InvalidEmail
[
    ['hello@mail.com', false],
    ['hello@mail', true],
    ['hello', true],
].forEach(([email, answer], id) => {
    test(`InvalidEmail:${id}`, () => {
        expect(InvalidEmail(email)).toEqual(answer);
    });
});

// InvalidPhone
[
    ['911', true],
    ['+32 460-885 567', false],
    ['380(632345599', true],
    ['380(63)2345599', false],
].forEach(([phone, answer], id) => {
    test(`InvalidPhone:${id}`, () => {
        expect(InvalidPhone(phone)).toEqual(answer);
    });
});

// IsDigit
[
    [undefined, false],
    [0, true],
    ['0', true],
    ['', false],
    [NaN, false],
    [{x: 5}, false],
    [5.5, false],
    ['5', true],
].forEach(([text, answer], id) => {
    test(`IsDigit:${id}`, () => {
        expect(IsDigit(text)).toEqual(answer);
    });
});

// IsFloat
[
    [undefined, false],
    [0, false],
    ['', false],
    [NaN, false],
    [{x: 5}, false],
    [5.5, true],
    ['5', false],
    ['5.5', false],
    [Infinity, false],
    [Math.PI, true],
].forEach(([text, answer], id) => {
    test(`IsFloat:${id}`, () => {
        expect(IsFloat(text)).toEqual(answer);
    });
});

// IsString
[
    [undefined, false],
    [0, false],
    [NaN, false],
    ['', true],
    ['hello', true],
    [{x: 5}, false],
].forEach(([text, answer], id) => {
    test(`IsString:${id}`, () => {
        expect(IsString(text)).toEqual(answer);
    });
});

// Pad
[
    [1, undefined, undefined, '01'],
    [1, 3, undefined, '001'],
    [1, 4, undefined, '001'],
    [1, 4, '000', '0001'],
    ['', undefined, undefined, '00'],
    ['hello', undefined, undefined, 'lo'],
    ['hello', 10, undefined, '00hello'],
    ['hello', 10, '  ', '  hello'],
    ['hello', 10, '               ', '     hello'],
].forEach(([value, size, pad, answer], id) => {
    test(`Pad:${id}`, () => {
        expect(Pad(value, size, pad)).toEqual(answer);
    });
});

// QueryString
[
    [{query: 'q=query&lan=eng'}, {lan: 'eng', q: 'query'}],
    [{query: 'q=query&lan=eng', string: true}, 'lan=eng&q=query'],
    [{keep: {lan: 1}, query: 'q=query&lan=eng'}, {lan: 'eng'}],
    [{discard: {lan: 1}, query: 'q=query&lan=eng'}, {q: 'query'}],
    [{query: 'q=query&lan=eng', replace: {lan: 'fra'}}, {lan: 'fra', q: 'query'}],
    [
        {key: null, replace: {class: "phantom", mode: "speed lap", game: "wipeout x"}, string: true},
        'class=phantom&game=wipeout%20x&mode=speed%20lap',
    ],
    [{query: 'season=18&div=l3&game=1', string: true}, 'div=l3&game=1&season=18'],
].forEach(([dico, answer], id) => {
    test(`QueryString:${id}`, () => {
        expect(QueryString(dico)).toEqual(answer);
    });
});

// SetDefault
[
    [{}, 'new', ['a', 'b'], {new: ['a', 'b']}],
    [{lan: 'fra'}, 'new', ['a', 'b'], {lan: 'fra', new: ['a', 'b']}],
    [{}, 'areas', {}, {areas: {}}],
    [{areas: [1, 2, 3]}, 'areas', {}, {areas: [1, 2, 3]}],
    [[1, 2, 3], 3, 'FOUR', [1, 2, 3, 'FOUR']],
    [[1, 2, 3], 3, [5, 6], [1, 2, 3, [5, 6]]],
    [[1, 2, 3], 3, {lan: 'fra', options: {x: 1}}, [1, 2, 3, {lan: 'fra', options: {x: 1}}]],
].forEach(([dico, key, def, answer], id) => {
    test(`SetDefault:${id}`, () => {
        SetDefault(dico, key, def);
        expect(dico).toEqual(answer);
    });
});

// Split
[
    [null, undefined, []],
    ['', undefined, []],
    ['abcd', '', ['a', 'b', 'c', 'd']],
    ['Rank|Engine|Points', undefined, ['Rank', 'Engine', 'Points']],
    ['Rank Engine Points', undefined, ['Rank', 'Engine', 'Points']],
    ['Rank|Engine Points', undefined, ['Rank', 'Engine Points']],
].forEach(([text, char, answer], id) => {
    test(`Split:${id}`, () => {
        expect(Split(text, char)).toEqual(answer);
    });
});

// Stringify
[
    [{point: {x: 1, y: 5}}, undefined, undefined, '{"point":{"x":1,"y":5}}'],
].forEach(([object, depth, maxdepth, answer], id) => {
    test(`Stringify:${id}`, () => {
        expect(Stringify(object, depth, maxdepth)).toEqual(answer);
    });
});

// Title
[
    ['', ''],
    ['white', 'White'],
    [123, '123'],
    [null, 'Null'],
    ['forEach', 'ForEach'],
].forEach(([text, answer], id) => {
    test(`Title:${id}`, () => {
        expect(Title(text)).toEqual(answer);
    });
});

// Undefined
[
    [undefined, undefined, undefined],
    [undefined, null, null],
    [undefined, 0, 0],
    [undefined, 5, 5],
    [undefined, 'ok', 'ok'],
    [null, 'ok', null],
    ['', 'ok', ''],
    [0, 'ok', 0],
    [NaN, undefined, undefined],
    [NaN, 1, 1],
    [NaN, 1.5, 1.5],
    [NaN, 'ok', 'ok'],
].forEach(([value, def, answer], id) => {
    test(`Undefined:${id}`, () => {
        expect(Undefined(value, def)).toEqual(answer);
    });
});
