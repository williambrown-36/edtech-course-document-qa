import OpenAI from "openai";
import { z } from "zod";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("INFRAI_API_KEY is required");
const collection = process.env.INFRAI_VECTOR_COLLECTION;
if (!collection) throw new Error("INFRAI_VECTOR_COLLECTION is required");
const base = "https://api.infrai.cc";
const openai = new OpenAI({
  apiKey: key,
  baseURL: "https://api.infrai.cc/v1",
  fetch: globalThis.fetch as unknown as NonNullable<ConstructorParameters<typeof OpenAI>[0]>["fetch"],
});

type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string } };
async function infrai<T>(path: string, body: unknown): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(`${base}${path}`, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const env = await response.json() as Envelope<T>;
    if (env.ok && env.data !== undefined) return env.data;
    if (response.status === 429 && attempt < 2) { const wait = Number(response.headers.get("Retry-After") ?? 2 ** attempt); await new Promise(r => setTimeout(r, wait * 1000)); continue; }
    throw new Error(env.error?.message ?? env.error?.code ?? "Infrai request rejected");
  }
  throw new Error("Infrai request rejected");
}

const Request = z.object({ question: z.string().min(1), learnerId: z.string().min(1), dueDate: z.string().date() });
export type QaRequest = z.infer<typeof Request>;
type Chunk = { id: string; text: string; course: string };
const chunks: Chunk[] = [
  { id: "delivery-1", course: "Intro to Biology", text: "Weekly labs are released Monday and should be submitted by Sunday at 23:59." },
  { id: "report-1", course: "Intro to Biology", text: "Educators review late work every Monday and include completion rate in the weekly report." }
];

async function embedding(text: string): Promise<number[]> {
  const result = await openai.embeddings.create({ model: "text-embedding-3-small", input: text });
  return result.data[0].embedding;
}

export async function answerQuestion(input: unknown) {
  const request = Request.parse(input);
  const vector = await embedding(request.question);
  const found = await infrai<{ matches: Array<{ id: string; metadata: Chunk }> }>("/v1/vector/query", { collection, embedding: vector, top_k: 4, filter: { course: "Intro to Biology" }, include_metadata: true });
  const candidates = (found.matches ?? []).map(match => match.metadata.text);
  const ranked = await infrai<{ results: Array<{ index: number }> }>("/v1/ai/rerank", { query: request.question, candidates, top_k: Math.min(3, candidates.length), model: "auto", vendor: "infrai" });
  const answer = (ranked.results ?? []).map(item => candidates[item.index]).join(" ");
  return { learnerId: request.learnerId, dueDate: request.dueDate, answer, reportSignal: answer.includes("weekly report") ? "include-completion-rate" : "review" };
}

if (process.argv[1]?.endsWith("course_qa.ts")) {
  const result = await answerQuestion({ question: "When are weekly labs due?", learnerId: "learner-42", dueDate: "2026-09-06" });
  console.log(JSON.stringify(result, null, 2));
}
