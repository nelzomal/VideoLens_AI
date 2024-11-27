import { TabTemplate } from "../TabTemplate";
import { QAContent } from "./QAContent";

export function QAView() {
  return (
    <TabTemplate
      mainContent={<QAContent />}
      className="text-foreground bg-background"
    />
  );
}
