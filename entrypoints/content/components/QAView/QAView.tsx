import { TabTemplate } from "../TabTemplate";
import { QAContent } from "./QAContent";

interface QAViewProps {
  isActive: boolean;
}

export const QAView: React.FC<QAViewProps> = ({ isActive }) => {
  return (
    <TabTemplate
      mainContent={<QAContent isActive={isActive} />}
      className="text-foreground bg-background"
    />
  );
};
