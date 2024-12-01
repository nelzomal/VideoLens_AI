import FileProgress from "@/components/ui/FileProgress";

interface ProgressItem {
  file: string;
  progress: number;
}

interface ProgressSectionProps {
  progressItems: ProgressItem[];
  translateWarning: React.ReactNode;
}

export default function ProgressSection({
  progressItems,
  translateWarning,
}: ProgressSectionProps) {
  if (progressItems.length === 0 && !translateWarning) return null;

  return (
    <div className="w-full space-y-2 p-4">
      {translateWarning}
      {progressItems.length > 0 && (
        <>
          <label className="text-base text-gray-600">
            Loading model files... (only run once)
          </label>
          {progressItems.map((data) => (
            <div key={data.file}>
              <FileProgress text={data.file} percentage={data.progress} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}
