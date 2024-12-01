import ReactDOM from "react-dom/client";
import { APP_ID } from "@/lib/constants";
import { PanelProvider } from "./components/PanelProvider";
import App from "./App";
import "../style.css";

export default defineContentScript({
  matches: ["*://*.youtube.com/watch*"],
  cssInjectionMode: "ui",

  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: APP_ID,
      position: "overlay",
      anchor: "body",
      onMount: (container) => {
        const containerRef = { current: container };

        const app = document.createElement("div");
        app.id = APP_ID;
        const appRef = { current: app };

        container.append(app);

        const rootReactDOM = ReactDOM.createRoot(app);
        rootReactDOM.render(
          <PanelProvider containerRef={containerRef} appRef={appRef}>
            <App />
          </PanelProvider>
        );
        return rootReactDOM;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    ui.mount();
  },
});
