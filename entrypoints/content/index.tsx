export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    console.log("Hello content.");
    // TODO show transcript
  }
});
