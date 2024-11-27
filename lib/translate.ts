/**
 * Creates and initializes a translator with the specified language pair
 */
export async function createTranslator(
  sourceLanguage: TranslationLanguageCode,
  targetLanguage: TranslationLanguageCode,
  onProgress?: (loaded: number, total: number) => void
): Promise<LanguageTranslator | null> {
  const languagePair = {
    sourceLanguage,
    targetLanguage,
  };

  const canTranslate = await translation.canTranslate(languagePair);

  if (canTranslate === "no") {
    return null;
  }

  try {
    const translator = await translation.createTranslator(languagePair);

    if (canTranslate === "after-download" && onProgress) {
      translator.addEventListener(
        "downloadprogress",
        (e: AIDownloadProgressEvent) => {
          onProgress(e.loaded, e.total);
        }
      );
      await translator.ready;
    }

    return translator;
  } catch (error) {
    console.error("Error creating translator:", error);
    return null;
  }
}

/**
 * Translates the given text using the specified language pair
 */
export async function translateText(
  text: string,
  sourceLanguage: TranslationLanguageCode,
  targetLanguage: TranslationLanguageCode,
  onProgress?: (loaded: number, total: number) => void
): Promise<string | null> {
  try {
    const languagePair = createLanguagePair(sourceLanguage, targetLanguage);
    const translator = await createTranslator(
      languagePair.sourceLanguage,
      languagePair.targetLanguage,
      onProgress
    );

    if (!translator) {
      return null;
    }

    const result = await translator.translate(text);
    return result;
  } catch (error) {
    console.error("Error translating text:", error);
    return null;
  }
}

/**
 * Translates multiple texts in sequence using the same language pair
 */
export async function translateMultipleTexts(
  texts: string[],
  sourceLanguage: TranslationLanguageCode,
  targetLanguage: TranslationLanguageCode,
  onProgress?: (loaded: number, total: number) => void
): Promise<(string | null)[]> {
  const translator = await createTranslator(
    sourceLanguage,
    targetLanguage,
    onProgress
  );

  if (!translator) {
    return texts.map(() => null);
  }

  try {
    const results = await Promise.all(
      texts.map((text) => translator.translate(text))
    );
    return results;
  } catch (error) {
    console.error("Error translating multiple texts:", error);
    return texts.map(() => null);
  }
}

/**
 * Language names for display
 */
export const LANGUAGE_NAMES: Record<TranslationLanguageCode, string> = {
  en: "English",
  ar: "Arabic",
  bn: "Bengali",
  de: "German",
  es: "Spanish",
  fr: "French",
  hi: "Hindi",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
  nl: "Dutch",
  pl: "Polish",
  pt: "Portuguese",
  ru: "Russian",
  th: "Thai",
  tr: "Turkish",
  vi: "Vietnamese",
  zh: "Chinese (Simplified)",
  "zh-Hant": "Chinese (Traditional)",
} as const;

/**
 * List of supported language codes
 */
export const SUPPORTED_LANGUAGES: TranslationLanguageCode[] = Object.keys(
  LANGUAGE_NAMES
) as TranslationLanguageCode[];

/**
 * Checks if a language pair is supported
 */
export function isLanguagePairSupported(
  sourceLanguage: TranslationLanguageCode,
  targetLanguage: TranslationLanguageCode
): boolean {
  // All supported pairs must include English as either source or target
  if (sourceLanguage === targetLanguage) return false;
  if (sourceLanguage !== "en" && targetLanguage !== "en") return false;
  return (
    SUPPORTED_LANGUAGES.includes(sourceLanguage) &&
    SUPPORTED_LANGUAGES.includes(targetLanguage)
  );
}

/**
 * Gets all available target languages for a given source language
 */
export function getAvailableTargetLanguages(
  sourceLanguage: TranslationLanguageCode
): TranslationLanguageCode[] {
  if (!SUPPORTED_LANGUAGES.includes(sourceLanguage)) {
    return [];
  }

  if (sourceLanguage === "en") {
    return SUPPORTED_LANGUAGES.filter((lang) => lang !== "en");
  } else {
    return ["en"];
  }
}

/**
 * Validates and creates a language pair object
 * Throws an error if the pair is invalid
 */
export function createLanguagePair(
  sourceLanguage: TranslationLanguageCode,
  targetLanguage: TranslationLanguageCode
): TranslationLanguageOptions {
  if (!isLanguagePairSupported(sourceLanguage, targetLanguage)) {
    throw new Error(
      `Unsupported language pair: ${sourceLanguage} → ${targetLanguage}`
    );
  }

  return {
    sourceLanguage,
    targetLanguage,
  };
}
