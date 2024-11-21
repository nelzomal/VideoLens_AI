import { ViewHeader } from "../common/ViewHeader";

export const Header = ({
  loadTranscriptButton,
}: {
  loadTranscriptButton?: React.ReactNode;
}) => (
  <ViewHeader title="YouTube Transcript" rightElement={loadTranscriptButton} />
);
