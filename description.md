## Inspiration

Our inspiration for VideoLens came from the desire to help users better understand and learn from YouTube videos. We identified several key challenges:

- Many videos lack transcripts, especially non-English content
- The need for offline transcription and translation to avoid costs and ensure privacy
- The difficulty in quickly grasping the main points of long videos
- The challenge of interacting with video content in a more dynamic way

We wanted to create a tool that would break down language barriers, enhance comprehension, and transform passive video watching into an interactive learning experience.

## What it does

VideoLens is a powerful Chrome extension that enhances your YouTube viewing experience:

- Transcription: Uses transformers.js to generate accurate transcripts for videos, even without existing captions
- Translation: Leverages Chrome's built-in translation capabilities to make content accessible in multiple languages
- Summarization: Provides concise summaries of video content, allowing users to jump to related sections easily
- Q&A: Enables users to ask questions about the video content and receive context-aware answers
- Comprehension Check: Helps users test their understanding of the video material

## How we built it

We developed VideoLens using a combination of cutting-edge technologies and frameworks:

- Chrome's built-in Translation, Summarizer and Prompt AI : providing seamless language translation, concise content summaries, and intelligent suggestions to enhance user interaction and productivity.
- WXT (Web Extension Toolkit): For rapid and efficient extension development
- React: To create a responsive and dynamic user interface
- transformers.js: providing sound-to-text and RAG capabilities

## Challenges we ran into

Developing VideoLens presented several significant challenges:

1. Model Size and Customization: The Whisper model's size was a concern, and customizing it for various languages required careful optimization.
2. Summarization Limitations: Dealing with context token limits for longer videos was challenging.
3. Question generation: Generating structured outputs for the Q&A feature required intricate prompt engineering and error handling.
4. User Experience: Integrating multiple functionalities while maintaining a clean, intuitive interface was a complex task.
5. Error Management: Setting up robust error handling for API limitations, network issues, and character count constraints was crucial.
6. Performance Optimization: Ensuring smooth performance across different devices and network conditions required extensive testing and refinement.

## Accomplishments that we're proud of

Despite the challenges, we achieved several significant milestones:

- Successfully implemented offline transcription directly in the browser, ensuring user privacy and reducing costs
- Developed a powerful summarization and Q&A feature that operates entirely within the browser environment
- Created a seamless integration with YouTube that enhances rather than disrupts the viewing experience
- Achieved high accuracy in transcription and translation across multiple languages

## What we learned

Developing VideoLens was an enriching learning experience, allowing us to:

- Effectively explore and utilize Chrome’s built-in AI features
- Discover the potential and limitations of Chrome's AI for handling complex tasks
- Hone our skills in prompt engineering and appreciate the impact of fine-tuned models
- Gain proficiency in the transformers.js framework and its capabilities

## What's next for VideoLens

We have exciting plans for the future of VideoLens:

- Expand support to additional video platforms beyond YouTube
- Enhance the Q&A feature with more advanced natural language understanding
- Implement a rewriter module to improve the structure and clarity of AI-generated outputs
- Optimize performance further to handle longer videos and more complex queries
- Explore integration with other educational tools and platforms
