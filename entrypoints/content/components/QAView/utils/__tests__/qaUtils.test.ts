import { parseQuestionAndAnswer, parseEvaluation } from "../qaUtils";

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

  test("handles multi-line answer with numbered list", () => {
    const input = `What are the core concepts of the Copilot ecosystem?

**answer**

The three core concepts of the Copilot ecosystem are:

1. **Copilot:** The UI for AI, which acts as an organizing layer for work and how work gets done.
2. **Copilot Studio:** Allows you to create agents that automate business processes.
3. **Control System:** An IT department control system that manages secure and measures the impact of Copilot.`;

    const result = parseQuestionAndAnswer(input);
    expect(result).toEqual({
      question: "What are the core concepts of the Copilot ecosystem?",
      answer: `The three core concepts of the Copilot ecosystem are:

1. **Copilot:** The UI for AI, which acts as an organizing layer for work and how work gets done.
2. **Copilot Studio:** Allows you to create agents that automate business processes.
3. **Control System:** An IT department control system that manages secure and measures the impact of Copilot.`,
    });
  });
});

describe("parseEvaluation", () => {
  it("should parse score and explanation correctly", () => {
    const input =
      "score: 50, explanation: The user answer is incomplete and lacks specific details";
    const result = parseEvaluation(input);

    expect(result.score).toBe(50);
    expect(result.explanation).toBe(
      "The user answer is incomplete and lacks specific details"
    );
  });

  it("should handle missing score", () => {
    const input = "explanation: Some explanation";
    const result = parseEvaluation(input);

    expect(result.score).toBe(0);
    expect(result.explanation).toBe("Some explanation");
  });

  it("should handle missing explanation", () => {
    const input = "score: 75";
    const result = parseEvaluation(input);

    expect(result.score).toBe(75);
    expect(result.explanation).toBe("");
  });
});
