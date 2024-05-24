import { Mp3Encoder } from "@breezystack/lamejs";

self.addEventListener("message", (event) => {
  const [leftSamples, rightSamples, sampleRate, bitRate] = event.data;
  const mp3Encoder = new Mp3Encoder(2, sampleRate, bitRate);
  const blockSize = 1152;
  const mp3Data = [];

  for (let i = 0; i < leftSamples.length; i += blockSize) {
    const leftChunk = leftSamples.subarray(i, i + blockSize);
    const rightChunk = rightSamples.subarray(i, i + blockSize);
    const mp3Buffer = mp3Encoder.encodeBuffer(leftChunk, rightChunk);
    if (mp3Buffer.length > 0) {
      mp3Data.push(mp3Buffer);
    }
    self.postMessage([undefined, i / leftSamples.length]);
  }

  const mp3End = mp3Encoder.flush();
  if (mp3End.length > 0) {
    mp3Data.push(mp3End);
  }

  self.postMessage([mp3Data, undefined]);
});
