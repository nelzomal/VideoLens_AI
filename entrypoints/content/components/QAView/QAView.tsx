import { TabTemplate } from "../TabTemplate";
import { QAControls } from "./QAControls";
import { QAProgress } from "./QAProgress";
import { QAContent } from "./QAContent";
import { useQA } from "./hooks/useQA";

export function QAView() {
  return <TabTemplate mainContent={<QAContent />} className="text-white" />;
}
