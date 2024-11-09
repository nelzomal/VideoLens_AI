import { INJECTED_COMPONENT_ID } from "@/lib/constants";
import ReactDOM from "react-dom/client";
import { InjectedComponent } from "./inject";

export default defineContentScript({
  matches: ["*://*.youtube.com/watch*"],
  // world: "MAIN",
  async main() {
    // Wait for the #secondary element to be available
    const waitForSecondary = () => {
      return new Promise<void>((resolve) => {
        const check = () => {
          const secondary = document.querySelector("#secondary");
          if (secondary) {
            resolve();
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      });
    };

    await waitForSecondary();

    // Create and inject our element
    const container = document.createElement("div");
    container.id = INJECTED_COMPONENT_ID;

    const secondary = document.querySelector("#secondary");
    if (secondary) {
      // Insert at the beginning of #secondary
      secondary.insertAdjacentElement("afterbegin", container);

      // Import and mount React component
      const root = ReactDOM.createRoot(container);
      root.render(<InjectedComponent />);
    }
  },
});
