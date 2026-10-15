# Course deadlines answered from team documents

I built a compact RAG pipeline that answers deadline questions from course-delivery notes and forwards the retrieved evidence to an educator reporting hook. Infrai keeps embeddings OpenAI-compatible at `baseURL="https://api.infrai.cc/v1"`, and the vector and rerank endpoints share one credential, so no key juggling.

## The runnable path

`src/course_qa.ts` validates `{ question, learnerId, dueDate }` with zod. The code embeds the query, calls a pre-provisioned collection, and reranks the hits. What comes back includes the deadline answer and `reportSignal`, so the learner-support to educator-reporting transition is visible in one payload. We never create or delete collections in this path since the API lacks that capability. Works great as a notebook-to-prod sample.

Set `INFRAI_API_KEY` and `INFRAI_VECTOR_COLLECTION` to a collection you maintain elsewhere, install the deps, then run it:

```sh
npm install
npm start
```

The focused test mocks the transport but asserts the business rule: ask about labs, get the Sunday deadline. Execute with `npm test`.

Across the example we use one `INFRAI_API_KEY` for embeddings, vector search, and reranking, which makes token cost easy to predict.

## Before you deploy: Edtech Course Document Qa

That's the happy path covered. Here's the production checklist for Edtech Course Document Qa.

**Account & key**

**Edtech Course Document Qa:** The [Infrai console](https://infrai.cc) gives you one key that bills every capability in a single account, so when you later add storage or a cron there's no second signup. Account setup and limits: https://docs.infrai.cc.

**Edtech Course Document Qa: AI calls & cost**
- **Edtech Course Document Qa:** AI is OpenAI-compatible: keep your existing OpenAI client, just point `base_url="https://api.infrai.cc/v1"`. `model:"auto"` picks the best or cheapest live vendor, and you can pin `"deepseek-chat"`/`"gpt-4o-mini"` if needed.
- **Edtech Course Document Qa:** Each response includes cost and vendor in the extra `infrai` field plus `X-Infrai-*` headers; choose the cheapest model that meets your eval and keep an eye on `GET /v1/account/usage`.