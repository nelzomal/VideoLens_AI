import { TabTemplate } from "../TabTemplate";

interface AIFeatureWarningProps {
  isLoading: boolean;
  isFeatureEnabled: boolean;
  feature: string;
  url: string
}

export function AIFeatureWarning({
  isLoading,
  isFeatureEnabled,
  feature,
  url,
}: AIFeatureWarningProps) {
  if (isLoading) {
    return (
      <TabTemplate
        mainContent={
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        }
        className="text-foreground bg-background"
      />
    );
  }

  if (!isFeatureEnabled) {
    return (
      <TabTemplate
        mainContent={
          <div className="flex items-center justify-center h-full text-center p-4">
            <p className="text-red-500">
              The {feature} feature is not enabled. Please <a href={url} className="text-blue-500 hover:text-blue-700 underline">click here</a> to learn how to enable it.
            </p>
          </div>
        }
        className="text-foreground bg-background"
      />
    );
  }

  return null;
}
