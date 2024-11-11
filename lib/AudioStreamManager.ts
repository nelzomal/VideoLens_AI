export default class AudioStreamManager {
  private audioBuffer: Float32Array;
  private lastProcessedIndex: number;

  constructor() {
    this.audioBuffer = new Float32Array(0);
    this.lastProcessedIndex = 0;
    console.log("AudioStreamManager initialized with empty buffer");
  }

  addAudio(newAudio: Float32Array) {
    const audioLength = newAudio.length;
    console.log("Incoming audio length:", audioLength);
    console.log("Last processed index:", this.lastProcessedIndex);

    if (audioLength > this.lastProcessedIndex) {
      try {
        // Create new buffer with only the new audio data
        const newBuffer = new Float32Array(
          audioLength - this.lastProcessedIndex
        );
        // Copy only the new portion of audio
        newBuffer.set(newAudio.slice(this.lastProcessedIndex));

        console.log("New buffer size:", newBuffer.length);
        console.log("New buffer memory usage (bytes):", newBuffer.byteLength);

        // Old buffer will be garbage collected
        this.audioBuffer = newBuffer;
        this.lastProcessedIndex = audioLength;
      } catch (err) {
        console.error("add audio error:", err);
      }
    } else {
      console.log("No new audio data to process");
    }

    console.log("Current audioBuffer size:", this.audioBuffer.length);
    console.log(
      "Current audioBuffer memory usage (bytes):",
      this.audioBuffer.byteLength
    );
    return this.audioBuffer;
  }

  clear() {
    // Explicitly set to null to help garbage collection
    this.audioBuffer = new Float32Array(0);
    this.lastProcessedIndex = 0;
    console.log("AudioStreamManager cleared");
  }
}
