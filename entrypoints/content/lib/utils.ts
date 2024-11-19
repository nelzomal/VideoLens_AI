export const sendMessageToBackground = (
  message: MainPage.MessageToBackground
) => {
  browser.runtime.sendMessage({ ...message, source: "content" });
};
