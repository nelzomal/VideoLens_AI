import "./style.css";
import App from "./App";
import ReactDOM from "react-dom/client";
import { PanelProvider } from "./components/PanelProvider";
import { APP_ID } from "@/lib/constants";

export default defineContentScript({
  matches: ["*://*.youtube.com/watch*"],
  cssInjectionMode: "ui",

  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: APP_ID,
      position: "overlay",
      anchor: "body",
      onMount: (container) => {
        const app = document.createElement("div");
        app.id = APP_ID;

        app.style.cssText = `
          resize: both;
          position: fixed;
          height: 80%;
          z-index: 100000;
          pointer-events: auto !important;
          overflow: auto;
        `;

        container.style.cssText = `
          position: fixed;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          z-index: 100000;
        `;

        const containerRef = { current: container };
        const appRef = { current: app };

        container.append(app);
        const root = ReactDOM.createRoot(app);
        root.render(
          <PanelProvider containerRef={containerRef} appRef={appRef}>
            <App />
          </PanelProvider>
        );
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    ui.mount();
  },
});
