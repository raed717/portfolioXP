/** /llms-full.txt — the complete CV as markdown for AI answer engines. See lib/llms.ts. */
import { buildLlmsTxt, markdownResponse } from "@/lib/llms";

export const dynamic = "force-static";

export function GET() {
  return markdownResponse(buildLlmsTxt({ full: true }));
}
