/** /llms.txt — concise profile index for AI answer engines (llmstxt.org). See lib/llms.ts. */
import { buildLlmsTxt, markdownResponse } from "@/lib/llms";

export const dynamic = "force-static";

export function GET() {
  return markdownResponse(buildLlmsTxt({ full: false }));
}
