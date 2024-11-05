import { INJECTED_COMPONENT_ID } from "@/lib/constants";

export default defineContentScript({
  matches: ["*://*.youtube.com/watch*"],
  world: "MAIN",
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

      // Create shadow root and mount React
      const mountPoint = document.createElement("div");

      // Import React and component dynamically since we're in MAIN world
      const { createRoot } = await import("react-dom/client");
      const root = createRoot(mountPoint);

      // Import and render your React component
      const { InjectedComponent } = await import("./inject");
      root.render(<InjectedComponent />);
    }
  },
});
