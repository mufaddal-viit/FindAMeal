import "dotenv/config";
import { AI_CONFIG } from "../src/config/ai.config";
import { getGeminiClient, getGeminiGenerateConfig } from "../src/ai/gemini/client";
import { parseGeminiResponse } from "../src/ai/gemini/parser";
import { buildRestaurantSearchPrompt } from "../src/ai/gemini/prompt";
import {
  assertTokenBudget,
  detectInjectionAttempt,
  sanitizeFilters
} from "../src/ai/gemini/safeguards";
import type { PriceLevel } from "../src/types/place";
import type { PlaceFilters, PlaceSort } from "../src/types/placeFilters";

interface CliOptions {
  filters: PlaceFilters;
  printPromptOnly: boolean;
  printRequestOnly: boolean;
}

function parseBooleanFlag(value: string, fieldName: string) {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error(`${fieldName} must be "true" or "false".`);
}

function parseNumberFlag(value: string, fieldName: string) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`${fieldName} must be a valid number.`);
  }

  return parsedValue;
}

function parsePriceLevels(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean) as PriceLevel[];
}

function printHelp() {
  console.log(`
Usage:
  npm run test:gemini -- [options]

Options:
  --query <text>
  --location <text>
  --category <text>
  --lat <number>
  --lng <number>
  --radiusKm <number>
  --minRating <number>
  --priceLevels <comma-separated list>
  --openNow <true|false>
  --sort <distance|rating|price-low|price-high>
  --page <number>
  --pageSize <number>
  --print-prompt
  --print-request
  --help

Examples:
  npm run test:gemini -- --query "ramen" --location "Dubai, UAE"
  npm run test:gemini -- --query "seafood" --location "Dubai Marina, UAE" --lat 25.08 --lng 55.14 --radiusKm 5 --openNow true --sort distance
  npm run test:gemini -- --query "ramen" --location "Dubai, UAE" --print-request
`.trim());
}

function parseCliOptions(argv: string[]): CliOptions {
  const filters: PlaceFilters = {
    location: "Dubai, UAE",
    sort: "rating",
    page: 1,
    pageSize: 10
  };
  let printPromptOnly = false;
  let printRequestOnly = false;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    switch (argument) {
      case "--query":
        filters.query = argv[++index] ?? "";
        break;
      case "--location":
        filters.location = argv[++index] ?? "";
        break;
      case "--category":
        filters.category = argv[++index] ?? "";
        break;
      case "--lat":
        filters.lat = parseNumberFlag(argv[++index] ?? "", "Latitude");
        break;
      case "--lng":
        filters.lng = parseNumberFlag(argv[++index] ?? "", "Longitude");
        break;
      case "--radiusKm":
        filters.radiusKm = parseNumberFlag(argv[++index] ?? "", "Radius");
        break;
      case "--minRating":
        filters.minRating = parseNumberFlag(argv[++index] ?? "", "Minimum rating");
        break;
      case "--priceLevels":
        filters.priceLevels = parsePriceLevels(argv[++index] ?? "");
        break;
      case "--openNow":
        filters.openNow = parseBooleanFlag(argv[++index] ?? "", "openNow");
        break;
      case "--sort":
        filters.sort = (argv[++index] ?? "rating") as PlaceSort;
        break;
      case "--page":
        filters.page = parseNumberFlag(argv[++index] ?? "", "Page");
        break;
      case "--pageSize":
        filters.pageSize = parseNumberFlag(argv[++index] ?? "", "Page size");
        break;
      case "--print-prompt":
        printPromptOnly = true;
        break;
      case "--print-request":
        printRequestOnly = true;
        break;
      case "--help":
        printHelp();
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return {
    filters,
    printPromptOnly,
    printRequestOnly
  };
}

function getRawResponseText(response: { text?: string | (() => string) }) {
  if (typeof response.text === "function") {
    return response.text();
  }

  return response.text ?? "";
}

function buildRestRequestBody(prompt: string) {
  return {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    tools: [{ googleSearch: {} }],
    generationConfig: {
      temperature: AI_CONFIG.model.temperature,
      topP: AI_CONFIG.model.topP,
      maxOutputTokens: AI_CONFIG.model.maxOutputTokens
    }
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeoutId: NodeJS.Timeout | null = null;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`Timed out after ${timeoutMs} ms.`));
        }, timeoutMs);
      })
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

async function main() {
  const { filters: rawFilters, printPromptOnly, printRequestOnly } =
    parseCliOptions(process.argv.slice(2));
  const filters = sanitizeFilters(rawFilters);

  if (detectInjectionAttempt(filters)) {
    throw new Error("The supplied input triggered injection safeguards.");
  }

  const prompt = buildRestaurantSearchPrompt(filters);
  const estimatedTokens = assertTokenBudget(prompt);

  console.log("Sanitized filters:");
  console.log(JSON.stringify(filters, null, 2));
  console.log(`\nEstimated prompt tokens: ${estimatedTokens}`);

  if (printPromptOnly) {
    console.log("\nPrompt:");
    console.log(prompt);
    return;
  }

  if (printRequestOnly) {
    console.log("\nPostman request URL:");
    console.log(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.model.name}:generateContent?key={{GEMINI_API_KEY}}`
    );
    console.log("\nPostman request body:");
    console.log(JSON.stringify(buildRestRequestBody(prompt), null, 2));
    return;
  }

  const client = await getGeminiClient();
  const response = await withTimeout(
    client.models.generateContent({
      model: AI_CONFIG.model.name,
      contents: prompt,
      config: getGeminiGenerateConfig()
    }),
    AI_CONFIG.timeout.requestMs
  );
  const rawText = getRawResponseText(
    response as Parameters<typeof parseGeminiResponse>[0]
  );

  console.log("\nRaw Gemini text:");
  console.log(rawText || "<empty>");

  const parsed = parseGeminiResponse(
    response as Parameters<typeof parseGeminiResponse>[0]
  );

  console.log("\nParsed Gemini payload:");
  console.log(JSON.stringify(parsed, null, 2));
}

main().catch((error) => {
  console.error("\nGemini test failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
