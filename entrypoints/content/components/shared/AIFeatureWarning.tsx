import { TabTemplate } from "../TabTemplate";

interface AIFeatureWarningProps {
  isLoading: boolean;
  isFeatureEnabled: boolean;
  feature: string;
}

export function AIFeatureWarning({
  isLoading,
  isFeatureEnabled,
  feature,
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
              {feature} feature is currently unavailable. Please check your
              settings and try again later.
            </p>
          </div>
        }
        className="text-foreground bg-background"
      />
    );
  }

  return null;
}
