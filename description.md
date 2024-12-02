## Inspiration

As lifelong learners, we’ve always relied on YouTube’s massive library of long-form videos to explore topics that interest us. But there’s a common challenge: with videos that go on for hours, it’s tough to decide if watching the whole thing is worth it. While we love in-depth learning, we also wish we could get a quick overview of a long video to help us decide if we want to dive deeper.

A lot of the newest information is in English, and for non-native speakers like us, even with English transcripts, getting through long videos takes extra effort and often feels like a big hurdle to learning efficiently.

Even with the rise of short-form content, we believe long videos have unique value. So we wonder: could AI help solve this? Could it help us quickly grasp the main points of a long video, in our preferred language, in a more interactive way, and highlight the parts that matter most?

## What it does

VideoLens is a Chrome extension that transforms your YouTube viewing into an interactive and personalized learning experience. It addresses the challenges of navigating long-form videos via:

- Transcription: Converts any videos into text transcripts, allowing you to read along or quickly scan through the content.
- Translation: Breaks down language barriers by translating transcripts into your preferred language.
- Summarization: Provides concise summaries of videos, enabling you to grasp the main points at a glance, and decide if to explore further.
- Q&A Feature: Offers interactive quizzes & allows you to ask questions about the video and receive context-aware answers.

## How we built it

We developed VideoLens using a combination of cutting-edge technologies and frameworks:

- Chrome's built-in Translation API: for translating video transcript seamlessly
- Chrome's built-in Summarizer API: for summarizing video into concise and structured content
- Chrome's built-in Prompt API: for asking and answering user questions based on video content.
- WXT (Web Extension Toolkit): for rapid and efficient extension development
- React: To create a responsive and dynamic user interface
- transformers.js: providing sound-to-text and RAG capabilities

## Challenges we ran into

Developing VideoLens presented several significant challenges:

- Model Size and Customization: The Whisper model's size was a concern, and customizing it for various languages required careful optimization.
- Summarization Limitations: Dealing with context token limits for longer videos was challenging.
- Question generation: Generating structured outputs for the Q&A feature required intricate prompt engineering and error handling.
- User Experience: Integrating multiple functionalities while maintaining a clean, intuitive interface was a complex task.
- Error Management: Setting up robust error handling for API limitations, network issues, and character count constraints was crucial.
- Performance Optimization: Ensuring smooth performance across different devices and network conditions required extensive testing and refinement.

## Accomplishments that we're proud of

Despite the challenges, we achieved several significant milestones:

- Successfully implemented offline transcription directly in the browser, ensuring user privacy and reducing costs
- Developed a powerful structured Q&A feature that operates entirely within the browser environment
- Created a seamless integration with YouTube that enhances rather than disrupts the viewing experience

## What we learned

Developing VideoLens was an enriching learning experience, allowing us to:

- Effectively explore and utilize Chrome’s built-in AI features
- Discover the potential and limitations of chrome AI for handling complex tasks
- Hone our skills in prompt engineering and appreciate the impact of fine-tuned models
- Gain proficiency in the transformers.js framework and its capabilities

## What's next for VideoLens

We have exciting plans for the future of VideoLens:

- Expand support to additional video platforms beyond YouTube
- Enhance the Q&A feature with more advanced natural language understanding
- Implement a rewriter module to improve the structure and clarity of AI-generated outputs
- Optimize performance further to handle longer videos and more complex queries
- Explore integration with other educational tools and platforms
