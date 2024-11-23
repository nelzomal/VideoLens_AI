import { parseQuestionAndAnswer } from "../qaUtils";

describe("parseQuestionAndAnswer", () => {
  test("parses simple question and answer format", () => {
    const input = `
What is your name?

answer: **John**`;
    const result = parseQuestionAndAnswer(input);
    expect(result).toEqual({
      question: "What is your name?",
      answer: "John",
    });
  });

  test("parses single line question and answer", () => {
    const input = `
What is the name of the AI assistant that will be hosting the Web AI Summit for the first time?

answer: **Jason Mayes**`;
    const result = parseQuestionAndAnswer(input);
    expect(result).toEqual({
      question:
        "What is the name of the AI assistant that will be hosting the Web AI Summit for the first time?",
      answer: "Jason Mayes",
    });
  });

  test("handles no answer format", () => {
    const input = `What is your name?`;
    const result = parseQuestionAndAnswer(input);
    expect(result).toEqual({
      question: "What is your name?",
      answer: undefined,
    });
  });

  test("handles multi-line question", () => {
    const input = `
First line of question
Second line of question

answer: **The Answer**`;
    const result = parseQuestionAndAnswer(input);
    expect(result).toEqual({
      question: "First line of question\nSecond line of question",
      answer: "The Answer",
    });
  });

  test("parses answer with **answer** format", () => {
    const input = `What is the purpose of the Web AI Summit?

**answer**
The Web AI Summit was created to share knowledge between Googlers in the field of Web AI.`;
    const result = parseQuestionAndAnswer(input);
    expect(result).toEqual({
      question: "What is the purpose of the Web AI Summit?",
      answer:
        "The Web AI Summit was created to share knowledge between Googlers in the field of Web AI.",
    });
  });

  test("parses answer with **answer:** format", () => {
    const input = `What is the main goal?

**answer:**
To create better AI experiences on the web.`;
    const result = parseQuestionAndAnswer(input);
    expect(result).toEqual({
      question: "What is the main goal?",
      answer: "To create better AI experiences on the web.",
    });
  });

  test("handles multi-paragraph answer", () => {
    const input = `What are the benefits?

**answer**
First benefit is improved performance.
Second benefit is better user experience.

Another question would be here.`;
    const result = parseQuestionAndAnswer(input);
    expect(result).toEqual({
      question: "What are the benefits?",
      answer:
        "First benefit is improved performance.\nSecond benefit is better user experience.",
    });
  });
});
