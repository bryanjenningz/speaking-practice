import { describe, expect, it } from "vitest";
import { parseVideoId } from "./parseVideoId";

describe("parseVideoId", () => {
  const nonUrlTestCases: { input: string; expected: string }[] = [
    { input: "", expected: "" },
    { input: "hello", expected: "hello" },
    { input: "wow", expected: "wow" },
    { input: "abc-123_4xyz", expected: "abc-123_4xyz" },
  ];
  it.each(nonUrlTestCases)(
    "should return the same string if it's not a URL %s",
    ({ input, expected }) => {
      expect(parseVideoId(input)).toEqual(expected);
    }
  );

  const queryParamUrlTestCases: { input: string; expected: string }[] = [
    { input: "youtube.com/watch?v=aBc1-23_4", expected: "aBc1-23_4" },
    { input: "www.youtube.com/watch?v=aBc1-23_4", expected: "aBc1-23_4" },
    {
      input: "https://www.youtube.com/watch?v=aBc1-23_4",
      expected: "aBc1-23_4",
    },
    {
      input: "www.youtube.com/watch?v=aBc1-23_4&si=2134",
      expected: "aBc1-23_4",
    },
  ];
  it.each(queryParamUrlTestCases)(
    "should return the video ID from URL 'v' query param %s",
    ({ input, expected }) => {
      expect(parseVideoId(input)).toEqual(expected);
    }
  );

  const shortenedUrlTestCases: { input: string; expected: string }[] = [
    { input: "youtu.be/aBc1-23_4", expected: "aBc1-23_4" },
    { input: "www.youtu.be/aBc1-23_4", expected: "aBc1-23_4" },
    {
      input: "https://www.youtu.be/aBc1-23_4",
      expected: "aBc1-23_4",
    },
    {
      input: "https://youtu.be/aBc1-23_4?si=2134",
      expected: "aBc1-23_4",
    },
  ];
  it.each(shortenedUrlTestCases)(
    "should return the video ID from the shortened URL %s",
    ({ input, expected }) => {
      expect(parseVideoId(input)).toEqual(expected);
    }
  );
});
