interface ViewHeaderProps {
  title: string;
  rightElement?: React.ReactNode;
}

export const ViewHeader = ({ title, rightElement }: ViewHeaderProps) => (
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-medium">{title}</h2>
    {rightElement}
  </div>
);
