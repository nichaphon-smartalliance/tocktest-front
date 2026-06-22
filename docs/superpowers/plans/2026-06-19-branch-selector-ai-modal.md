# Branch Selector for AI Test Case Generation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional branch dropdown to the AI Generate modal so commits are filtered by the selected branch before test case generation.

**Architecture:** Thread `branch?` param from modal UI → `AiGenerateRequest` type → backend DTO → `generateTestCases` service → `fetchCommitDiffs` → GitHub API `sha` query param. Reuse the existing `getRepositoryBranchesApi` (already defined in `api-main.ts` and used by the Analysis page) to populate the dropdown. No new endpoints needed.

**Tech Stack:** Next.js 15, HeroUI, react-query, NestJS, class-validator, TypeScript, GitHub REST API

---

## File Map

| File | Change |
|---|---|
| `tocktest-back/src/modules/ai/dto/generate-test-cases.dto.ts` | Add `branch?: string` field |
| `tocktest-back/src/modules/ai/ai.controller.ts` | Pass `dto.branch` to `generateTestCases` |
| `tocktest-back/src/modules/ai/ai.service.ts` | Accept + pass `branch` in `generateTestCases` and `fetchCommitDiffs` |
| `tocktest-front/src/types/api/main/testCase.ts` | Add `branch?: string` to `AiGenerateRequest` |
| `tocktest-front/messages/en.json` | Add `"branch"` key under `aiModal` |
| `tocktest-front/messages/th.json` | Add `"branch"` key under `aiModal` (Thai) |
| `tocktest-front/src/components/partials/TestCases/Modal/AiGenerateModal.tsx` | Add branch state, fetch branches, render select dropdown |

---

### Task 1: Backend — Add `branch` to DTO

**Files:**
- Modify: `tocktest-back/src/modules/ai/dto/generate-test-cases.dto.ts`

- [ ] **Step 1: Update the DTO**

Replace full file content:

```typescript
import { IsUUID, IsOptional, IsString, IsArray } from 'class-validator';

export class GenerateTestCasesDto {
  @IsUUID()
  repoId: string;

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  commitShas?: string[];

  @IsOptional()
  @IsString()
  branch?: string;
}
```

- [ ] **Step 2: Commit**

```bash
cd tocktest-back
git add src/modules/ai/dto/generate-test-cases.dto.ts
git commit -m "feat(ai): add branch param to GenerateTestCasesDto"
```

---

### Task 2: Backend — Wire `branch` through controller and service

**Files:**
- Modify: `tocktest-back/src/modules/ai/ai.controller.ts`
- Modify: `tocktest-back/src/modules/ai/ai.service.ts`

- [ ] **Step 1: Update `ai.controller.ts` — pass `branch` to service**

```typescript
@Post('generate-test-cases')
generateTestCases(@CurrentUser() user: User, @Body() dto: GenerateTestCasesDto) {
  return this.aiService.generateTestCases(user.id, dto.repoId, {
    fromDate: dto.fromDate,
    toDate: dto.toDate,
    commitShas: dto.commitShas,
    branch: dto.branch,
  });
}
```

- [ ] **Step 2: Update `generateTestCases` in `ai.service.ts` — accept and pass `branch`**

Find the `generateTestCases` method signature (line ~161):

```typescript
async generateTestCases(userId: string, repoId: string, params: {
  fromDate?: string;
  toDate?: string;
  commitShas?: string[];
  branch?: string;
}) {
```

Then find the `fetchCommitDiffs` call inside it (~line 170) and add `branch`:

```typescript
const diffs = await this.fetchCommitDiffs(repo.fullName, pat, params);
```

(No change needed here — `params` already passes through. Only the signature above needs updating.)

- [ ] **Step 3: Update `fetchCommitDiffs` — add `branch` to params and GitHub API call**

Find `fetchCommitDiffs` method (~line 320). Update its params type and the GitHub API call:

```typescript
async fetchCommitDiffs(fullName: string, pat: string, params: {
  fromDate?: string;
  toDate?: string;
  commitShas?: string[];
  branch?: string;
}): Promise<string | null> {
  try {
    let shas = params.commitShas ?? [];
    if (!shas.length) {
      const query: Record<string, unknown> = {
        since: params.fromDate,
        until: params.toDate,
        per_page: 10,
      };
      if (params.branch) query.sha = params.branch;

      const res = await axios.get(`https://api.github.com/repos/${fullName}/commits`, {
        headers: { Authorization: `token ${pat}` },
        params: query,
        timeout: 10000,
      });
      shas = res.data.map((c: any) => c.sha);
    }

    const diffs: string[] = [];
    for (const sha of shas.slice(0, 5)) {
      const res = await axios.get(
        `https://api.github.com/repos/${fullName}/commits/${sha}`,
        { headers: { Authorization: `token ${pat}`, Accept: 'application/vnd.github.v3.diff' }, timeout: 10000 },
      );
      diffs.push(`--- Commit ${sha} ---\n${res.data}`);
    }
    return diffs.join('\n\n').slice(0, 20000);
  } catch (err: any) {
    this.logger.warn(`fetchCommitDiffs error: ${err.message}`);
    return null;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/modules/ai/ai.controller.ts src/modules/ai/ai.service.ts
git commit -m "feat(ai): thread branch param through controller and service to GitHub API"
```

---

### Task 3: Frontend — Add `branch` to `AiGenerateRequest` type

**Files:**
- Modify: `tocktest-front/src/types/api/main/testCase.ts`

- [ ] **Step 1: Add `branch?` to the interface**

Find `AiGenerateRequest` interface (~line 39) and add the field:

```typescript
export interface AiGenerateRequest {
  repoId: string;
  fromDate?: string;
  toDate?: string;
  commitShas?: string[];
  branch?: string;
}
```

- [ ] **Step 2: Commit**

```bash
cd tocktest-front
git add src/types/api/main/testCase.ts
git commit -m "feat(types): add branch to AiGenerateRequest"
```

---

### Task 4: Frontend — Add i18n keys

**Files:**
- Modify: `tocktest-front/messages/en.json`
- Modify: `tocktest-front/messages/th.json`

- [ ] **Step 1: Add `branch` key to `en.json`**

Inside the `"aiModal"` block, add after `"toDate"`:

```json
"branch": "Branch",
"allBranches": "All branches (default)",
```

- [ ] **Step 2: Add `branch` key to `th.json`**

Inside the `"aiModal"` block, add after `"toDate"`:

```json
"branch": "Branch",
"allBranches": "ทุก branch (ค่าเริ่มต้น)",
```

- [ ] **Step 3: Commit**

```bash
git add messages/en.json messages/th.json
git commit -m "feat(i18n): add branch label keys to aiModal"
```

---

### Task 5: Frontend — Add branch dropdown to `AiGenerateModal`

**Files:**
- Modify: `tocktest-front/src/components/partials/TestCases/Modal/AiGenerateModal.tsx`

- [ ] **Step 1: Add imports and branch state**

At the top of the component file, add the API import after the existing imports:

```typescript
import { getRepositoryBranchesApi } from "@/lib/api/api-main";
```

Inside the component function, after the existing state declarations:

```typescript
const [branch, setBranch] = useState("");
const [branches, setBranches] = useState<{ name: string; commitSha: string }[]>([]);
const [branchesLoading, setBranchesLoading] = useState(false);
```

- [ ] **Step 2: Fetch branches when modal opens**

Add a `useEffect` after the existing date-init `useEffect`:

```typescript
useEffect(() => {
  if (!open) return;
  setBranchesLoading(true);
  getRepositoryBranchesApi(repoId)
    .then((res) => setBranches(res.data?.data ?? []))
    .catch(() => setBranches([]))
    .finally(() => setBranchesLoading(false));
}, [open, repoId]);
```

- [ ] **Step 3: Pass `branch` in `handleGenerate`**

Find the `generate(...)` call inside `handleGenerate` and add `branch`:

```typescript
const result = await generate({
  repoId,
  fromDate: dayjs(fromDate).startOf("day").toISOString(),
  toDate: dayjs(toDate).endOf("day").toISOString(),
  ...(branch ? { branch } : {}),
});
```

- [ ] **Step 4: Reset branch in `handleClose` and `resetForm`**

In `handleClose`:
```typescript
const handleClose = useCallback(() => {
  setPreviews([]);
  setFromDate("");
  setToDate("");
  setBranch("");
  onClose();
}, [onClose]);
```

In `resetForm`:
```typescript
const resetForm = () => {
  setPreviews([]);
  setFromDate(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
  setToDate(dayjs().format("YYYY-MM-DD"));
  setBranch("");
};
```

- [ ] **Step 5: Add branch select above the date grid**

Inside the `previews.length === 0` branch of `Modal.Body`, add this block **above** the date `grid` div:

```tsx
<div className="flex flex-col gap-1.5">
  <Label htmlFor="ai-branch">{t("branch")}</Label>
  <select
    id="ai-branch"
    value={branch}
    onChange={(e) => setBranch(e.target.value)}
    disabled={branchesLoading}
    className={DATE_INPUT}
  >
    <option value="">{branchesLoading ? "..." : t("allBranches")}</option>
    {branches.map((b) => (
      <option key={b.name} value={b.name}>
        {b.name}
      </option>
    ))}
  </select>
</div>
```

- [ ] **Step 6: Commit**

```bash
git add src/components/partials/TestCases/Modal/AiGenerateModal.tsx
git commit -m "feat(ui): add branch selector to AI generate test cases modal"
```
