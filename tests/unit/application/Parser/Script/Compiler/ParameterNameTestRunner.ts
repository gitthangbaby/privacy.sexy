import 'mocha';
import { expect } from 'chai';

export function testParameterName(action: (parameterName: string) => string) {
    describe('name', () => {
        describe('sets as expected', () => {
            // arrange
            const expectedValues = [
                'lowercase',
                'onlyLetters',
                'l3tt3rsW1thNumb3rs',
            ];
            for (const expected of expectedValues) {
                it(expected, () => {
                    // act
                    const value = action(expected);
                    // assert
                    expect(value).to.equal(expected);
                });
            }
        });
        describe('throws if invalid', () => {
            // arrange
            const testCases = [
                {
                    name: 'undefined',
                    value: undefined,
                    expectedError: 'undefined parameter name',
                },
                {
                    name: 'empty',
                    value: '',
                    expectedError: 'undefined parameter name',
                },
                {
                    name: 'has @',
                    value: 'b@d',
                    expectedError: 'parameter name must be alphanumeric but it was "b@d"',
                },
                {
                    name: 'has {',
                    value: 'b{a}d',
                    expectedError: 'parameter name must be alphanumeric but it was "b{a}d"',
                },
            ];
            for (const testCase of testCases) {
                it(testCase.name, () => {
                    // act
                    const act = () => action(testCase.value);
                    // assert
                    expect(act).to.throw(testCase.expectedError);
                });
            }
        });
    });
}