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
  { value: "russian", label: "Русский" },
];

export default function LanguageSelector({
  value,
  onChange,
}: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-2 p-2">
      <Languages className="w-5 h-5 text-gray-600" />
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full px-4 py-2 pr-8 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
        >
          {languages.map((language) => (
            <option key={language.value} value={language.value}>
              {language.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
