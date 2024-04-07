import { SymbolToUpper } from "./symbol-to-upper.pipe"

describe('Symbol to Up pipe', () => {
    let pipe: SymbolToUpper

    beforeEach(() => {
        pipe = new SymbolToUpper()
    })

    it('Every character should be uppercase', () => {
        expect(pipe.transform('testCase', {} as any)).toEqual('TESTCASE')
    })
})