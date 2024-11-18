import { formatChunksWithTimestamps } from "./utils";

// Unit tests for formatChunksWithTimestamps
describe("formatChunksWithTimestamps", () => {
  test("handles single timestamp chunk", () => {
    const input = ["<|0.00|>Hello world<|1.23|>"];
    const expected = [["0.00 - 1.23", "Hello world"]];
    expect(formatChunksWithTimestamps(input)).toEqual(expected);
  });

  test("handles multiple timestamp chunks", () => {
    const input = [
      "<|0.00|> First chunk <|1.00|><|2.00|> Second chunk<|3.00|>",
    ];
    const expected = [
      ["0.00 - 1.00", " First chunk "],
      ["2.00 - 3.00", " Second chunk"],
    ];
    expect(formatChunksWithTimestamps(input)).toEqual(expected);
  });

  test("merges chunks with same timestamp", () => {
    const input = ["<|0.00|>Part 1<|1.00|><|1.00|>Part 2<|2.00|>"];
    const expected = [["0.00 - 2.00", "Part 1Part 2"]];
    expect(formatChunksWithTimestamps(input)).toEqual(expected);
  });

  test("ignores empty chunks", () => {
    const input = ["<|0.00|><|1.00|><|1.00|>Valid chunk<|2.00|>"];
    const expected = [["1.00 - 2.00", "Valid chunk"]];
    expect(formatChunksWithTimestamps(input)).toEqual(expected);
  });

  test("handles complex example", () => {
    const input = [
      "<|0.00|>First<|1.00|><|1.50|>Second<|2.00|><|2.00|>Third<|3.00|>",
    ];
    const expected = [
      ["0.00 - 1.00", "First"],
      ["1.50 - 3.00", "SecondThird"],
    ];
    expect(formatChunksWithTimestamps(input)).toEqual(expected);
  });
});
