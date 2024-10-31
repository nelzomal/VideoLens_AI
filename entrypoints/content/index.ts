import { match } from "ts-pattern";

let recorder;
let data = [];
const startRecording = async (streamId: string) => {
  const media = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });

  const output = new AudioContext();
  const source = output.createMediaStreamSource(media);
  source.connect(output.destination);

  recorder = new MediaRecorder(media, { mimeType: "video/webm" });
  recorder.ondataavailable = (event) => {
    data.push(event.data);
    console.log("data length: ", data.length);
  };
};
browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log(request.message, chrome.tabs); // Outputs: Hello from Side Panel

  if (request.action === "captureContent") {
    // Outputs: Hello from Side Panel
    const streamID: string = request.message;
    console.log("captureContent", request.message, streamID);
    startRecording(streamID);
  }
});
export default defineContentScript({
  matches: ["*://*.google.com/*"],
  main() {
    console.log("Hello content.");
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log(request.message); // Outputs: Hello from Side Panel
      if (request.action === "startRecord") {
        console.log("startRecord", request.message); // Outputs: Hello from Side Panel
      }
    });
    // const receiveMessageFromBackground = (
    //   messageFromBg: Background.MessageToMain
    // ) => {
    //   match(messageFromBg)
    //     .with({ status: "start-recording-tab" }, ({ data: streamId }) => {
    //       console.log("receive streamId:", streamId);
    //       startRecording(streamId);
    //     })
    //     .with({ status: "startAgain" }, () => {})
    //     .with({ status: "completeChunk" }, ({ data }) => {})
    //     // model files
    //     .with({ status: "modelsLoaded" }, (data) => {})
    //     .with({ status: "initiate" }, (data) => {})
    //     .with({ status: "progress" }, ({ progress, file }) => {})
    //     .with({ status: "done" }, ({ file }) => {})
    //     .with({ status: "ready" }, () => {});
    // };
    // chrome.runtime.onMessage.addListener(receiveMessageFromBackground);
  },
});
