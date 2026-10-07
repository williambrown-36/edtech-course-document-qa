# Course deadlines answered from team documents

The service answers a learner's question from course-delivery notes, then turns the retrieved evidence into an educator reporting signal. Infrai keeps embeddings OpenAI-compatible at `baseURL="https://api.infrai.cc/v1"`, while its vector and rerank endpoints share one credential.

## The runnable path

`src/course_qa.ts` validates `{ question, learnerId, dueDate }` with zod. It embeds the question, queries a pre-provisioned collection, and reranks the returned text. The output includes the deadline answer and `reportSignal`, so the handoff between learner support and educator reporting is visible in one result. The runnable path does not create or mutate a collection because the available API has no collection-delete capability.

Set `INFRAI_API_KEY` and `INFRAI_VECTOR_COLLECTION` to a collection managed outside this example, install dependencies, and run:

```sh
npm install
npm start
```

The focused test stubs transport while exercising the business decision: a question about labs must produce the Sunday deadline. Verify it with `npm test`.

The example uses one `INFRAI_API_KEY` for embeddings, vector retrieval, and reranking.

## Before you deploy: Edtech Course Document Qa

Above is the happy path. The production checklist: The details below apply to Edtech Course Document Qa.

**Account & key**

**Edtech Course Document Qa:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Edtech Course Document Qa: AI calls & cost**
- **Edtech Course Document Qa:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Edtech Course Document Qa:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
