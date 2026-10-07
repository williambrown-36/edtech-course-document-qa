export {};

process.env.INFRAI_API_KEY = process.env.INFRAI_API_KEY ?? "test-key";
process.env.INFRAI_VECTOR_COLLECTION = process.env.INFRAI_VECTOR_COLLECTION ?? "pre-provisioned-course-docs";
const original = globalThis.fetch;
const requestedUrls: string[] = [];
globalThis.fetch = async (input, init) => {
  const url = String(input);
  requestedUrls.push(url);
  const body = JSON.parse(String(init?.body));
  let data: unknown = {};
  if (url.includes("/embeddings")) return new Response(JSON.stringify({ data: [{ embedding: [0.1, 0.2, 0.3] }], model: "text-embedding-3-small", usage: { prompt_tokens: 1, total_tokens: 1 } }), { status: 200, headers: { "Content-Type": "application/json" } });
  if (url.endsWith("collection/create")) data = { created: true };
  if (url.endsWith("vector/upsert")) data = { upserted: body.vectors.length };
  if (url.endsWith("vector/query")) data = { matches: [{ id: "delivery-1", metadata: { text: "Weekly labs are released Monday and should be submitted by Sunday at 23:59.", course: "Intro to Biology" } }] };
  if (url.endsWith("ai/rerank")) data = { results: [{ index: 0 }] };
  return new Response(JSON.stringify({ ok: true, data }), { status: 200 });
};
const { answerQuestion } = await import("./course_qa.js");
(globalThis as unknown as { __openai?: boolean }).__openai = true;
const result = await answerQuestion({ question: "When are labs due?", learnerId: "learner-42", dueDate: "2026-09-06" });
if (!result.answer.includes("Sunday")) throw new Error("deadline decision missing");
if (requestedUrls.some(url => url.endsWith("collection/create") || url.endsWith("vector/upsert"))) throw new Error("runnable path must not create persistent resources");
console.log("course QA decision test passed");
globalThis.fetch = original;
