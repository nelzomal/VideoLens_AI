import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// "<|0.00|> Abby's gonna have more info about these city additions.<|3.06|>"
// "<|0.00|> uniforms early on.<|2.00|><|2.00|> I don'…now what the secrets<|3.00|><|3.00|> are.<|3.00|>"
export function formatChunksWithTimestamps(outputText: string[]) {
  const chunks = outputText[0]
    .split("<|")
    .reduce((acc: [string, string][], segment: string) => {
      if (!segment) return acc;

      const timestampMatch = segment.match(/^(\d+\.\d+)\|>/);
      if (!timestampMatch) return acc;

      const timestamp = timestampMatch[1];
      const text = segment.replace(/^\d+\.\d+\|>/, "");

      if (acc.length === 0) {
        // First chunk
        if (text.trim()) {
          acc.push([`${timestamp} - `, text]);
        }
      } else {
        // Complete previous chunk's timestamp range
        acc[acc.length - 1][0] += timestamp;
        // Add new chunk if there's text
        if (text.trim()) {
          acc.push([`${timestamp} - `, text]);
        }
      }
      return acc;
    }, []);
  return chunks;
}
