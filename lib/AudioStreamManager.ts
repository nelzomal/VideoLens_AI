export default class AudioStreamManager {
  private audioBuffer: Float32Array;
  private lastProcessedIndex: number;

  constructor() {
    this.audioBuffer = new Float32Array(0);
    this.lastProcessedIndex = 0;
  }

  addAudio(newAudio: Float32Array) {
    const audioLength = newAudio.length;

    if (audioLength > this.lastProcessedIndex) {
      try {
        // Create new buffer with only the new audio data
        const newBuffer = new Float32Array(
          audioLength - this.lastProcessedIndex
        );
        // Copy only the new portion of audio
        newBuffer.set(newAudio.slice(this.lastProcessedIndex));

        // Old buffer will be garbage collected
        this.audioBuffer = newBuffer;
        this.lastProcessedIndex = audioLength;
      } catch (err) {
        console.error("add audio error:", err);
      }
    } else {
      console.log("No new audio data to process");
    }

    return this.audioBuffer;
  }

  clear() {
    // Explicitly set to null to help garbage collection
    this.audioBuffer = new Float32Array(0);
    this.lastProcessedIndex = 0;
  }
}
