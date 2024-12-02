import LanguageSelector from "@/components/ui/LanguageSelector";
import { Language } from "@/lib/constants";

interface TranslateControlsProps {
  targetLanguage: Language;
  setTargetLanguage: (language: Language) => void;
}

export const TranslateControls: React.FC<TranslateControlsProps> = ({
  targetLanguage,
  setTargetLanguage,
}) => {
  return (
    <div className="w-full flex flex-row items-center justify-between space-x-2">
      <div className="w-full md:w-auto">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Translate to
        </label>
        <LanguageSelector
          value={targetLanguage}
          onChange={setTargetLanguage}
          type="target"
        />
      </div>
    </div>
  );
};
