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
        const newBuffer = new Float32Array(
          audioLength - this.lastProcessedIndex
        );
        // Append new audio to buffer
        newBuffer.set(newAudio.slice(this.lastProcessedIndex));
        this.audioBuffer = newBuffer;
        this.lastProcessedIndex = audioLength;
      } catch (err) {
        console.log("add audio error:", err);
      }
    }

    return this.audioBuffer;
  }

  clear() {
    this.audioBuffer = new Float32Array(0);
    this.lastProcessedIndex = 0;
  }
}
