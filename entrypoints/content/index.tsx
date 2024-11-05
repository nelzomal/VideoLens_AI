import ReactDOM from "react-dom/client";
import App from "./App";

export default defineContentScript({
  matches: ["<all_urls>"],
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "realtime-whisper-ui",
      position: "inline",
      onMount(container) {
        console.log(container);
        const app = document.createElement("div");
        container.append(app);
        const root = ReactDOM.createRoot(app);
        root.render(<App />);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });
    ui.mount();
  },
});
