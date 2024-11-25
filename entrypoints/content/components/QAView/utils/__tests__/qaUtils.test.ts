import {
  parseShortAnswerQuestion,
  parseEvaluation,
  parseSingleChoiceQuestion,
} from "../qaUtils";

describe("parseShortAnswerQuestion", () => {
  test("parses simple question and answer format", () => {
    const input = `
  What is your name?

  answer: **John**`;
    const result = parseShortAnswerQuestion(input);
    expect(result).toEqual({
      question: "What is your name?",
      answer: "John",
    });
  });

  test("parses single line question and answer", () => {
    const input = `
  What is the name of the AI assistant that will be hosting the Web AI Summit for the first time?

  answer: **Jason Mayes**`;
    const result = parseShortAnswerQuestion(input);
    expect(result).toEqual({
      question:
        "What is the name of the AI assistant that will be hosting the Web AI Summit for the first time?",
      answer: "Jason Mayes",
    });
  });

  test("handles no answer format", () => {
    const input = `What is your name?`;
    const result = parseShortAnswerQuestion(input);
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
    const result = parseShortAnswerQuestion(input);
    expect(result).toEqual({
      question: "First line of question\nSecond line of question",
      answer: "The Answer",
    });
  });

  test("parses answer with **answer** format", () => {
    const input = `What is the purpose of the Web AI Summit?

  **answer**
  The Web AI Summit was created to share knowledge between Googlers in the field of Web AI.`;
    const result = parseShortAnswerQuestion(input);
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
    const result = parseShortAnswerQuestion(input);
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
    const result = parseShortAnswerQuestion(input);
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

    const result = parseShortAnswerQuestion(input);
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

describe("parseSingleChoiceQuestion", () => {
  test("parses question with new format", () => {
    const input = `question: What is the main focus of the announcement regarding Microsoft Fabric?
    options: **To unify all of Microsoft's AI models, tools, safety, and monitoring solutions into a single experience integrated with the most popular developer tools.**|**To bring Azure Arc all the way to all of the edge with Azure local.**|**To announce a new machine of 24 logical cubits, the most powerful Quantum machine in the world.**|**To expand Azure boost with a first inhouse DPU.**
    answer: **To unify all of Microsoft's AI models, tools, safety, and monitoring solutions into a single experience integrated with the most popular developer tools.**`;
    const result = parseSingleChoiceQuestion(input);
    expect(result).toEqual({
      question:
        "What is the main focus of the announcement regarding Microsoft Fabric?",
      options: [
        {
          text: "To unify all of Microsoft's AI models, tools, safety, and monitoring solutions into a single experience integrated with the most popular developer tools.",
          isCorrect: true,
        },
        {
          text: "To bring Azure Arc all the way to all of the edge with Azure local.",
          isCorrect: false,
        },
        {
          text: "To announce a new machine of 24 logical cubits, the most powerful Quantum machine in the world.",
          isCorrect: false,
        },
        {
          text: "To expand Azure boost with a first inhouse DPU.",
          isCorrect: false,
        },
      ],
      answer:
        "To unify all of Microsoft's AI models, tools, safety, and monitoring solutions into a single experience integrated with the most popular developer tools.",
    });
  });

  test("parses question with old format for backward compatibility", () => {
    const input = `
    question: **Which feature is most important?**
    options: Feature A|Feature B|Feature C|Feature D
    answer: **Feature B**`;
    const result = parseSingleChoiceQuestion(input);
    expect(result).toEqual({
      question: "Which feature is most important?",
      options: [
        { text: "Feature A", isCorrect: false },
        { text: "Feature B", isCorrect: true },
        { text: "Feature C", isCorrect: false },
        { text: "Feature D", isCorrect: false },
      ],
      answer: "Feature B",
    });
  });

  test("handles malformed input", () => {
    const input = "Just some random text without proper formatting";
    const result = parseSingleChoiceQuestion(input);
    expect(result).toEqual({
      question: undefined,
      options: undefined,
      answer: undefined,
    });
  });

  test("returns undefined answer when answer is not in options", () => {
    const input = `question: What is the main topic?
    options: **Option A**|**Option B**|**Option C**|**Option D**
    answer: **Invalid Answer**`;
    const result = parseSingleChoiceQuestion(input);
    expect(result).toEqual({
      question: "What is the main topic?",
      options: [
        { text: "Option A", isCorrect: false },
        { text: "Option B", isCorrect: false },
        { text: "Option C", isCorrect: false },
        { text: "Option D", isCorrect: false },
      ],
      answer: undefined,
    });
  });

  test("parses comma-separated options", () => {
    const input = `question: What are the main areas of focus?
    options: AI, Windows, Cloud Computing, Security
    answer: **AI**`;
    const result = parseSingleChoiceQuestion(input);
    expect(result).toEqual({
      question: "What are the main areas of focus?",
      options: [
        { text: "AI", isCorrect: true },
        { text: "Windows", isCorrect: false },
        { text: "Cloud Computing", isCorrect: false },
        { text: "Security", isCorrect: false },
      ],
      answer: "AI",
    });
  });

  test("parses comma-separated options with asterisks", () => {
    const input = `question: What are the primary technologies?
    options: **AI**, **Machine Learning**, **Cloud Computing**, **Edge Computing**
    answer: **Machine Learning**`;
    const result = parseSingleChoiceQuestion(input);
    expect(result).toEqual({
      question: "What are the primary technologies?",
      options: [
        { text: "AI", isCorrect: false },
        { text: "Machine Learning", isCorrect: true },
        { text: "Cloud Computing", isCorrect: false },
        { text: "Edge Computing", isCorrect: false },
      ],
      answer: "Machine Learning",
    });
  });

  test("parses question without asterisks in answer", () => {
    const input = `question: What is the name of the new AI security event announced today?
    options: Azure Zero Day Quest, Azure AI Security Challenge, Microsoft AI Security Summit, Azure AI Security Conference
    answer: Azure Zero Day Quest`;
    const result = parseSingleChoiceQuestion(input);
    expect(result).toEqual({
      question:
        "What is the name of the new AI security event announced today?",
      options: [
        { text: "Azure Zero Day Quest", isCorrect: true },
        { text: "Azure AI Security Challenge", isCorrect: false },
        { text: "Microsoft AI Security Summit", isCorrect: false },
        { text: "Azure AI Security Conference", isCorrect: false },
      ],
      answer: "Azure Zero Day Quest",
    });
  });
});
