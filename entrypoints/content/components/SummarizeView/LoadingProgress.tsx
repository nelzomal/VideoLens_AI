interface LoadingProgressProps {
  progress: { loaded: number; total: number };
}

export const LoadingProgress = ({ progress }: LoadingProgressProps) => (
  <div>
    Loading model: {Math.round((progress.loaded / progress.total) * 100)}%
  </div>
);
