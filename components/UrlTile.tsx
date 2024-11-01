import { useState } from "react";
import Modal from "../modal/Modal";
import { UrlInput } from "../modal/UrlInput";

export default function UrlTile(props: {
  iconStr: string;
  text: string;
  onUrlUpdate: (url: string) => void;
}) {
  const [showModal, setShowModal] = useState(false);

  const onClick = () => {
    setShowModal(true);
  };

  const onClose = () => {
    setShowModal(false);
  };

  const onSubmit = (url: string) => {
    props.onUrlUpdate(url);
    onClose();
  };

  return (
    <>
      <Tile
        iconStr={props.iconStr}
        text={props.text}
        onClick={onClick}
      />
      <UrlModal
        show={showModal}
        onSubmit={onSubmit}
        onClose={onClose}
      />
    </>
  );
}

function Tile(props: { iconStr: string; text?: string; onClick?: () => void }) {
  return (
    <button
      onClick={props.onClick}
      className="flex items-center justify-center rounded-lg p-2 bg-blue text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
    >
      <div className="w-7 h-7">
        <img src={props.iconStr} />
      </div>
      {props.text && <div className="ml-2 break-text text-center text-md w-30">{props.text}</div>}
    </button>
  );
}

function UrlModal(props: { show: boolean; onSubmit: (url: string) => void; onClose: () => void }) {
  const [url, setUrl] = useState<string | undefined>(undefined);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const onSubmit = () => {
    if (url) {
      props.onSubmit(url);
    }
  };

  return (
    <Modal
      show={props.show}
      title={"From URL"}
      content={
        <>
          {"Enter the URL of the audio file you want to load."}
          <UrlInput
            onChange={onChange}
            value={url}
          />
        </>
      }
      onClose={props.onClose}
      submitText={"Load"}
      onSubmit={onSubmit}
    />
  );
}
