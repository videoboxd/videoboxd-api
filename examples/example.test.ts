import { expect, test } from "vitest";

import { subtract, sum } from "./example";

test("adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3);
});

test("adds 10 + -10 to equal 0", () => {
  expect(sum(10, -10)).toBe(0);
});

test("adds 2 - 1 to equal 1", () => {
  expect(subtract()).toBe(1);
});
