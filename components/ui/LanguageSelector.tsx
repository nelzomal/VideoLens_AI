import { Languages } from "lucide-react";

interface LanguageSelectorProps {
  value: string;
  onChange: (language: string) => void;
}

const languages = [
  { value: "english", label: "English" },
  { value: "chinese", label: "中文" },
  { value: "spanish", label: "Español" },
  { value: "french", label: "Français" },
  { value: "german", label: "Deutsch" },
  { value: "japanese", label: "日本語" },
  { value: "korean", label: "한국어" },
  { value: "russian", label: "Русский" }
];

export default function LanguageSelector({
  value,
  onChange
}: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-2 p-2">
      <Languages className="w-5 h-5 text-gray-600" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-md border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        {languages.map((language) => (
          <option key={language.value} value={language.value}>
            {language.label}
          </option>
        ))}
      </select>
    </div>
  );
}
