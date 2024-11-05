import { INJECTED_COMPONENT_ID } from "@/lib/constants";
import { createRoot } from "react-dom/client";

// Your React component
export const InjectedComponent = () => {
  console.log("InjectedComponent");
  return (
    <div className="my-injected-component">
      {/* Your component content */}
      <h2>Injected Content</h2>
    </div>
  );
};

// Wait for the container to be created by the content script
const waitForContainer = () => {
  return new Promise<HTMLElement>((resolve) => {
    const check = () => {
      const container = document.querySelector(INJECTED_COMPONENT_ID);
      if (container) {
        resolve(container as HTMLElement);
      } else {
        requestAnimationFrame(check);
      }
    };
    check();
  });
};

export default defineUnlistedScript(async () => {
  const container = await waitForContainer();
  const root = createRoot(container);
  root.render(<InjectedComponent />);
});
