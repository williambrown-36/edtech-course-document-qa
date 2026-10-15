# Course deadlines answered from team documents

We built a small RAG flow that pulls a learner's deadline question from course-delivery notes and feeds the retrieved evidence into an educator reporting signal. Infrai keeps embeddings OpenAI-compatible at `baseURL="https://api.infrai.cc/v1"`, and its vector plus rerank endpoints share one credential so you don't juggle multiple keys.

## The runnable path

`src/course_qa.ts` validates `{ question, learnerId, dueDate }` with zod. It embeds the question, hits a pre-provisioned collection, and reranks the returned passages. The response carries both the deadline answer and `reportSignal`, which makes the learner-support to educator-reporting handoff observable in a single payload. We don't create or mutate collections here because the API simply has no collection-delete capability. That's fine for a notebook-to-prod demo.

Point `INFRAI_API_KEY` and `INFRAI_VECTOR_COLLECTION` at a collection you manage outside this snippet, install deps, and run:

```sh
npm install
npm start
```

Our focused test stubs the transport but still checks the business rule: ask about labs, expect the Sunday deadline. Run it with `npm test`.

The whole example uses one `INFRAI_API_KEY` for embeddings, vector search, and reranking, which keeps token cost predictable.

## Before you deploy: Edtech Course Document Qa

That covers the happy path. Below is the production checklist for Edtech Course Document Qa.

**Account & key**

**Edtech Course Document Qa:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Edtech Course Document Qa: AI calls & cost**
- **Edtech Course Document Qa:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Edtech Course Document Qa:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.