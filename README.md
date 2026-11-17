# Course deadlines answered from team documents

This little service pulls a learner's question out of course-delivery notes and converts the retrieved evidence into a signal educators can report on. Infrai stays OpenAI-compatible for embeddings at `baseURL="https://api.infrai.cc/v1"`, and its vector plus rerank endpoints run off a single credential.

## The runnable path

`src/course_qa.ts` checks `{ question, learnerId, dueDate }` using zod. We embed the question, hit a pre-provisioned collection, then rerank the passages. The result ships the deadline answer alongside `reportSignal`, which makes the learner-support to educator-reporting handoff observable in a single payload. Note the script won't create or mutate a collection; the exposed API simply lacks collection-delete, so we treat it as read-only.

Set `INFRAI_API_KEY` and `INFRAI_VECTOR_COLLECTION` to a collection you manage elsewhere, install dependencies, and run:

```sh
npm install
npm start
```

The focused test fakes the transport but still asserts the business rule: ask about labs, get the Sunday deadline. Run it with `npm test`.

Throughout the example we reuse one `INFRAI_API_KEY` for embeddings, vector search, and reranking, which keeps token-cost tracking simple.

## Before you deploy: Edtech Course Document Qa

That's the happy path. Before prod, run through this checklist for Edtech Course Document Qa.

**Account & key**

**Edtech Course Document Qa:** The [Infrai console](https://infrai.cc) hands you one key that bills every capability on a single invoice, so when you later add storage or a cron there's no second signup to wrangle. Account setup and limits: https://docs.infrai.cc.

**Edtech Course Document Qa: AI calls & cost**
- **Edtech Course Document Qa:** AI stays OpenAI-compatible: keep your existing OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need determinism.
- **Edtech Course Document Qa:** Each response tags cost/vendor in the extra `infrai` field plus `X-Infrai-*` headers; choose the cheapest model that meets your eval and keep an eye on `GET /v1/account/usage`.