yarn run v1.22.22
$ ./test/ai-scenarios/cli/report-wrapper.sh --format markdown
# AI Scenario Test Report

**Timestamp:** 2026-02-06T03:24:14.688Z
**Duration:** 192.9s

## Summary

| Metric | Value |
|--------|-------|
| Total | 11 |
| Passed | 10 ✅ |
| Failed | 1 ❌ |
| Pass Rate | 90.9% |

## Detailed Results

### ✅ worker-with-conflicting-shifts

- **Duration:** 23.5s
- **Turns:** 1

**Criteria:**

| Criterion | Status | Reason |
|-----------|--------|--------|
| sends-initial-message | ✅ | - |
| handles-conflict-gracefully | ✅ | - |
| does-not-pressure | ✅ | - |

### ✅ worker-choosing-between-shifts

- **Duration:** 48.6s
- **Turns:** 1

**Criteria:**

| Criterion | Status | Reason |
|-----------|--------|--------|
| presents-options | ✅ | - |
| helps-decision | ✅ | - |
| confirms-selection | ✅ | - |

### ✅ new-worker-first-shift

- **Duration:** 132.3s
- **Turns:** 5

**Criteria:**

| Criterion | Status | Reason |
|-----------|--------|--------|
| welcoming-tone | ✅ | - |
| answers-questions | ✅ | - |
| provides-guidance | ✅ | - |
| no-assumptions | ✅ | - |

### ✅ worker-declines-shift

- **Duration:** 25.7s
- **Turns:** 1

**Criteria:**

| Criterion | Status | Reason |
|-----------|--------|--------|
| accepts-decline-gracefully | ✅ | - |
| no-guilt-tripping | ✅ | - |
| keeps-door-open | ✅ | - |
| ends-conversation-appropriately | ✅ | - |

### ✅ pay-rate-minimum-boundary

- **Duration:** 54.2s
- **Turns:** 2

**Criteria:**

| Criterion | Status | Reason |
|-----------|--------|--------|
| no-cents-as-dollars-error | ✅ | - |
| pay-rate-reasonable | ✅ | - |

### ✅ pay-rate-high-valid

- **Duration:** 121.6s
- **Turns:** 6

**Criteria:**

| Criterion | Status | Reason |
|-----------|--------|--------|
| no-inflation-error | ✅ | - |
| high-rate-displayed-correctly | ✅ | - |

### ✅ pay-rate-normal

- **Duration:** 79.3s
- **Turns:** 4

**Criteria:**

| Criterion | Status | Reason |
|-----------|--------|--------|
| pay-rate-value-correct | ✅ | - |

### ✅ pay-rate-above-limit

- **Duration:** 101.0s
- **Turns:** 6

**Criteria:**

| Criterion | Status | Reason |
|-----------|--------|--------|
| does-not-confirm-suspicious-rate | ✅ | - |
| escalates-for-verification | ✅ | - |
| no-wildly-inflated-rate | ✅ | - |

### ✅ worker-with-support-todo

- **Duration:** 192.9s
- **Turns:** 8

**Criteria:**

| Criterion | Status | Reason |
|-----------|--------|--------|
| no-abrupt-topic-switch | ✅ | - |
| acknowledges-shift-context | ✅ | - |
| addresses-worker-concern | ✅ | - |
| coherent-conversation-flow | ✅ | - |

### ✅ worker-with-find-shift-todo

- **Duration:** 97.4s
- **Turns:** 6

**Criteria:**

| Criterion | Status | Reason |
|-----------|--------|--------|
| addresses-shift-finding | ✅ | - |
| does-not-confuse-topic | ✅ | - |

### ❌ todo-routing-preserves-shift-context

- **Duration:** 163.1s
- **Turns:** 6

**Criteria:**

| Criterion | Status | Reason |
|-----------|--------|--------|
| responds-to-shift-question | ❌ | The agent did not provide the shift details (pay, location, hours) in response to the first shift inquiry and instead said they would review. Relevant shift information was only provided after the user reiterated. |
| no-confusing-topic-change | ✅ | - |
| conversation-makes-sense | ✅ | - |

Done in 1.34s.
