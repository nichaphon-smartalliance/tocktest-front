# Frontend Skills — tocktest-front

Next.js 15 · TypeScript · HeroUI · TanStack React Query · NextAuth · Tailwind CSS

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| UI Components | HeroUI v2 (`@heroui/react`) |
| Styling | Tailwind CSS 3 |
| Server State | TanStack React Query 5 |
| HTTP Client | Axios |
| Auth | NextAuth 4 |
| Icons | Lucide React |
| Date | DayJS |

---

## Folder Structure

```
src/
├── app/
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                     ← redirect to /dashboard
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── repos/
│   │       └── [repoId]/
│   │           ├── layout.tsx
│   │           ├── analysis/page.tsx
│   │           ├── docs/page.tsx
│   │           ├── settings/page.tsx
│   │           └── test-cases/page.tsx
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   └── login/page.tsx
│   ├── api/auth/[...nextauth]/route.ts
│   ├── globals.css
│   ├── layout.tsx                       ← Root layout (wraps Providers)
│   └── page.tsx
├── components/
│   ├── layout/
│   │   └── AdminLayout/
│   │       ├── AdminLayout.tsx
│   │       ├── Header/
│   │       │   ├── Header.tsx
│   │       │   └── index.ts
│   │       ├── Sidebar/
│   │       │   ├── Sidebar.tsx
│   │       │   └── index.ts
│   │       └── index.ts
│   ├── partials/
│   │   ├── Dashboard/
│   │   │   ├── DashboardContent.tsx
│   │   │   ├── Dashboard.config.ts
│   │   │   ├── RepoCard.tsx
│   │   │   ├── Modal/
│   │   │   │   ├── AddTokenModal.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── TestCases/
│   │   │   ├── TestCasesContent.tsx
│   │   │   ├── TestCases.config.ts
│   │   │   ├── TestCaseTable.tsx
│   │   │   ├── FolderTree.tsx
│   │   │   ├── Modal/
│   │   │   │   ├── TestCaseModal.tsx
│   │   │   │   ├── AiGenerateModal.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── Analysis/
│   │   │   ├── AnalysisContent.tsx
│   │   │   └── index.ts
│   │   ├── Docs/
│   │   │   ├── DocsContent.tsx
│   │   │   └── index.ts
│   │   ├── Settings/
│   │   │   ├── SettingsContent.tsx
│   │   │   └── index.ts
│   │   └── Login/
│   │       ├── LoginContent.tsx
│   │       └── index.ts
│   └── ui/                              ← Shared base components
│       ├── Button/
│       │   ├── BaseButton.tsx
│       │   └── index.ts
│       └── Input/
│           ├── BaseInput.tsx
│           └── index.ts
├── context/
│   ├── Providers.tsx                    ← Master provider composition
│   ├── auth/
│   │   └── NextAuthProvider.tsx
│   ├── query/
│   │   └── QueryProvider.tsx
│   └── theme/
│       └── ThemeProvider.tsx            ← HeroUI HeroUIProvider wrapper
├── hooks/
│   ├── analysis/
│   │   ├── index.ts
│   │   └── useCommitList.ts
│   ├── common/
│   │   ├── index.ts
│   │   └── useSearchPersist.ts
│   ├── docs/
│   │   ├── index.ts
│   │   └── useProjectDoc.ts
│   ├── repository/
│   │   ├── index.ts
│   │   ├── useGithubTokens.ts
│   │   ├── useRepository.ts
│   │   └── useRepositoryList.ts
│   ├── settings/
│   │   ├── index.ts
│   │   └── useRepoSettings.ts
│   └── testCase/
│       ├── index.ts
│       ├── useAiGenerateTestCases.ts
│       ├── useTestCaseFolders.ts
│       └── useTestCaseList.ts
├── lib/
│   └── api/
│       ├── api-main.ts                  ← All endpoint URLs
│       ├── client.ts                    ← Axios instance
│       └── interceptor.ts              ← Auth + 401 handling
├── services/
│   ├── analysis.service.ts
│   ├── docs.service.ts
│   ├── repository.service.ts
│   ├── settings.service.ts
│   └── testCase.service.ts
└── types/
    ├── api/main/
    │   ├── auth.ts
    │   ├── common.ts
    │   ├── analysis.ts
    │   ├── docs.ts
    │   ├── repository.ts
    │   ├── settings.ts
    │   └── testCase.ts
    ├── app/
    │   ├── analysis/index.ts
    │   ├── docs/index.ts
    │   ├── repository/index.ts
    │   ├── settings/index.ts
    │   └── testCase/index.ts
    └── next-auth.d.ts
```

---

## HeroUI Setup

### Install

```bash
npm install @heroui/react framer-motion
```

### tailwind.config.ts

```ts
import { heroui } from "@heroui/react";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: {} },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: { DEFAULT: "#6366f1", foreground: "#ffffff" },
          },
        },
        dark: {
          colors: {
            primary: { DEFAULT: "#818cf8", foreground: "#ffffff" },
          },
        },
      },
    }),
  ],
};

export default config;
```

### context/theme/ThemeProvider.tsx

```tsx
"use client";

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light">
      <HeroUIProvider>{children}</HeroUIProvider>
    </NextThemesProvider>
  );
}
```

### context/Providers.tsx

```tsx
"use client";

import NextAuthProvider from "@/context/auth/NextAuthProvider";
import QueryProvider from "@/context/query/QueryProvider";
import ThemeProvider from "@/context/theme/ThemeProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthProvider>
      <QueryProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryProvider>
    </NextAuthProvider>
  );
}
```

### app/layout.tsx

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/context/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = { title: "Tocktest" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## API Layer

### lib/api/client.ts

```ts
import axios from "axios";
import { setupInterceptors } from "./interceptor";

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

setupInterceptors(client);

export default client;
```

### lib/api/interceptor.ts

```ts
import { AxiosInstance } from "axios";
import { getSession, signOut } from "next-auth/react";

export function setupInterceptors(client: AxiosInstance) {
  client.interceptors.request.use(async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      if (error.response?.status === 401) {
        await signOut({ callbackUrl: "/login" });
      }
      return Promise.reject(error);
    }
  );
}
```

### lib/api/api-main.ts

```ts
const BASE = "/api/v1";

export const API = {
  auth: {
    login: `${BASE}/auth/login`,
  },
  repository: {
    list: `${BASE}/repositories`,
    detail: (id: string) => `${BASE}/repositories/${id}`,
    sync: (id: string) => `${BASE}/repositories/${id}/sync`,
  },
  testCase: {
    list: (repoId: string) => `${BASE}/repositories/${repoId}/test-cases`,
    create: (repoId: string) => `${BASE}/repositories/${repoId}/test-cases`,
    update: (repoId: string, id: string) => `${BASE}/repositories/${repoId}/test-cases/${id}`,
    delete: (repoId: string, id: string) => `${BASE}/repositories/${repoId}/test-cases/${id}`,
    aiGenerate: (repoId: string) => `${BASE}/repositories/${repoId}/test-cases/ai-generate`,
    folders: (repoId: string) => `${BASE}/repositories/${repoId}/folders`,
  },
  analysis: {
    commits: (repoId: string) => `${BASE}/repositories/${repoId}/commits`,
  },
  docs: {
    project: (repoId: string) => `${BASE}/repositories/${repoId}/docs`,
  },
  settings: {
    get: (repoId: string) => `${BASE}/repositories/${repoId}/settings`,
    update: (repoId: string) => `${BASE}/repositories/${repoId}/settings`,
  },
  github: {
    tokens: `${BASE}/github/tokens`,
    addToken: `${BASE}/github/tokens`,
  },
} as const;
```

---

## Types Pattern

### types/api/main/common.ts

```ts
export interface PageObject<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export enum TestCaseStatus {
  ACTIVE = "ACTIVE",
  DRAFT = "DRAFT",
  DEPRECATED = "DEPRECATED",
}

export enum AnalysisStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  DONE = "DONE",
  FAILED = "FAILED",
}
```

### types/api/main/testCase.ts  ← raw API shape

```ts
import { TestCaseStatus } from "./common";

export interface TestCaseApiResponse {
  id: string;
  title: string;
  description: string;
  status: TestCaseStatus;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestCaseRequest {
  title: string;
  description: string;
  folderId?: string;
}
```

### types/app/testCase/index.ts  ← frontend domain shape

```ts
import { TestCaseStatus } from "@/types/api/main/common";

export interface TestCase {
  id: string;
  title: string;
  description: string;
  status: TestCaseStatus;
  folderId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestCaseFormValues {
  title: string;
  description: string;
  folderId?: string;
}
```

---

## Service Pattern

### services/testCase.service.ts

```ts
import client from "@/lib/api/client";
import { API } from "@/lib/api/api-main";
import { TestCaseApiResponse, CreateTestCaseRequest } from "@/types/api/main/testCase";
import { TestCase } from "@/types/app/testCase";
import { PageObject } from "@/types/api/main/common";

function toTestCase(raw: TestCaseApiResponse): TestCase {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}

export async function getTestCases(repoId: string, page = 1, limit = 20): Promise<PageObject<TestCase>> {
  const res = await client.get<PageObject<TestCaseApiResponse>>(API.testCase.list(repoId), {
    params: { page, limit },
  });
  return { ...res.data, data: res.data.data.map(toTestCase) };
}

export async function createTestCase(repoId: string, body: CreateTestCaseRequest): Promise<TestCase> {
  const res = await client.post<TestCaseApiResponse>(API.testCase.create(repoId), body);
  return toTestCase(res.data);
}

export async function deleteTestCase(repoId: string, id: string): Promise<void> {
  await client.delete(API.testCase.delete(repoId, id));
}
```

---

## Hooks Pattern

### hooks/testCase/useTestCaseList.ts

```ts
import { useQuery } from "@tanstack/react-query";
import { getTestCases } from "@/services/testCase.service";

export function useTestCaseList(repoId: string, page = 1) {
  return useQuery({
    queryKey: ["testCases", repoId, page],
    queryFn: () => getTestCases(repoId, page),
    enabled: !!repoId,
  });
}
```

### hooks/testCase/useAiGenerateTestCases.ts  ← mutation hook

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import client from "@/lib/api/client";
import { API } from "@/lib/api/api-main";

interface AiGenerateParams {
  repoId: string;
  commitId: string;
}

async function aiGenerateTestCases({ repoId, commitId }: AiGenerateParams) {
  const res = await client.post(API.testCase.aiGenerate(repoId), { commitId });
  return res.data;
}

export function useAiGenerateTestCases(repoId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: aiGenerateTestCases,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["testCases", repoId] });
    },
  });
}
```

### hooks/testCase/index.ts

```ts
export { useTestCaseList } from "./useTestCaseList";
export { useAiGenerateTestCases } from "./useAiGenerateTestCases";
export { useTestCaseFolders } from "./useTestCaseFolders";
```

---

## Component Patterns

### Partial component structure

```
partials/TestCases/
├── TestCasesContent.tsx   ← main content, receives repoId prop
├── TestCases.config.ts    ← column defs, static config
├── TestCaseTable.tsx      ← sub-component
├── FolderTree.tsx         ← sub-component
├── Modal/
│   ├── TestCaseModal.tsx
│   ├── AiGenerateModal.tsx
│   └── index.ts
└── index.ts               ← re-exports TestCasesContent
```

### components/partials/TestCases/TestCasesContent.tsx

```tsx
"use client";

import {
  Button,
  Input,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import { Plus, Sparkles } from "lucide-react";
import { useTestCaseList } from "@/hooks/testCase";
import TestCaseTable from "./TestCaseTable";
import { TestCaseModal, AiGenerateModal } from "./Modal";

interface Props {
  repoId: string;
}

export default function TestCasesContent({ repoId }: Props) {
  const { data, isLoading } = useTestCaseList(repoId);
  const createModal = useDisclosure();
  const aiModal = useDisclosure();

  if (isLoading) return <Spinner className="m-auto mt-20" />;

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Test Cases</h1>
        <div className="flex gap-2">
          <Button
            color="default"
            variant="bordered"
            startContent={<Sparkles size={16} />}
            onPress={aiModal.onOpen}
          >
            AI Generate
          </Button>
          <Button
            color="primary"
            startContent={<Plus size={16} />}
            onPress={createModal.onOpen}
          >
            New Test Case
          </Button>
        </div>
      </div>

      <TestCaseTable data={data?.data ?? []} repoId={repoId} />

      <TestCaseModal
        repoId={repoId}
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
      />
      <AiGenerateModal
        repoId={repoId}
        isOpen={aiModal.isOpen}
        onClose={aiModal.onClose}
      />
    </div>
  );
}
```

### Modal pattern with HeroUI

```tsx
"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTestCase } from "@/services/testCase.service";
import { TestCaseFormValues } from "@/types/app/testCase";

interface Props {
  repoId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TestCaseModal({ repoId, isOpen, onClose }: Props) {
  const qc = useQueryClient();
  const { control, handleSubmit, reset } = useForm<TestCaseFormValues>();

  const { mutate, isPending } = useMutation({
    mutationFn: (values: TestCaseFormValues) => createTestCase(repoId, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["testCases", repoId] });
      reset();
      onClose();
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <form onSubmit={handleSubmit((v) => mutate(v))}>
          <ModalHeader>New Test Case</ModalHeader>
          <ModalBody className="gap-4">
            <Controller
              name="title"
              control={control}
              rules={{ required: "Title is required" }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Title"
                  isInvalid={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea {...field} label="Description" minRows={3} />
              )}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>Cancel</Button>
            <Button color="primary" type="submit" isLoading={isPending}>Create</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
```

### Table pattern with HeroUI

```tsx
"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
} from "@heroui/react";
import { Trash2 } from "lucide-react";
import { TestCase } from "@/types/app/testCase";
import { TestCaseStatus } from "@/types/api/main/common";
import { TEST_CASE_COLUMNS } from "./TestCases.config";

const statusColorMap: Record<TestCaseStatus, "success" | "warning" | "danger"> = {
  [TestCaseStatus.ACTIVE]: "success",
  [TestCaseStatus.DRAFT]: "warning",
  [TestCaseStatus.DEPRECATED]: "danger",
};

interface Props {
  data: TestCase[];
  repoId: string;
}

export default function TestCaseTable({ data, repoId }: Props) {
  return (
    <Table aria-label="Test cases">
      <TableHeader columns={TEST_CASE_COLUMNS}>
        {(col) => <TableColumn key={col.key}>{col.label}</TableColumn>}
      </TableHeader>
      <TableBody items={data} emptyContent="No test cases found">
        {(item) => (
          <TableRow key={item.id}>
            <TableCell>{item.title}</TableCell>
            <TableCell>{item.description}</TableCell>
            <TableCell>
              <Chip color={statusColorMap[item.status]} size="sm" variant="flat">
                {item.status}
              </Chip>
            </TableCell>
            <TableCell>
              <Button isIconOnly size="sm" variant="light" color="danger">
                <Trash2 size={14} />
              </Button>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
```

### Config file pattern

```ts
// components/partials/TestCases/TestCases.config.ts
export const TEST_CASE_COLUMNS = [
  { key: "title", label: "Title" },
  { key: "description", label: "Description" },
  { key: "status", label: "Status" },
  { key: "actions", label: "" },
] as const;
```

---

## Layout Pattern

### components/layout/AdminLayout/Sidebar/Sidebar.tsx

```tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Listbox, ListboxItem } from "@heroui/react";
import { LayoutDashboard, GitBranch } from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "repos", href: "/repos", label: "Repositories", icon: GitBranch },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 border-r border-divider h-screen flex flex-col p-4">
      <div className="font-bold text-lg mb-6 px-2">Tocktest</div>
      <Listbox aria-label="Navigation">
        {NAV_ITEMS.map(({ key, href, label, icon: Icon }) => (
          <ListboxItem
            key={key}
            as={Link}
            href={href}
            startContent={<Icon size={16} />}
            className={pathname.startsWith(href) ? "text-primary" : ""}
          >
            {label}
          </ListboxItem>
        ))}
      </Listbox>
    </aside>
  );
}
```

### components/layout/AdminLayout/Header/Header.tsx

```tsx
"use client";

import {
  Navbar,
  NavbarContent,
  NavbarItem,
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <Navbar isBordered maxWidth="full">
      <NavbarContent justify="end">
        <NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                as="button"
                size="sm"
                name={session?.user?.name ?? "User"}
                className="cursor-pointer"
              />
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key="logout" color="danger" onPress={() => signOut()}>
                Sign Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
```

---

## Auth Pattern

### app/(auth)/login/page.tsx

```tsx
import LoginContent from "@/components/partials/Login";

export default function LoginPage() {
  return <LoginContent />;
}
```

### components/partials/Login/LoginContent.tsx

```tsx
"use client";

import { Card, CardBody, CardHeader, Input, Button } from "@heroui/react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("Invalid credentials");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-xl font-semibold justify-center pt-6">
          Sign In
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onValueChange={setEmail}
              isRequired
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onValueChange={setPassword}
              isRequired
            />
            {error && <p className="text-danger text-sm">{error}</p>}
            <Button color="primary" type="submit" isLoading={loading} fullWidth>
              Sign In
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
```

---

## Page Pattern

Pages are thin — they only import the partial and pass params.

```tsx
// app/(admin)/repos/[repoId]/test-cases/page.tsx
import TestCasesContent from "@/components/partials/TestCases";

interface Props {
  params: Promise<{ repoId: string }>;
}

export default async function TestCasesPage({ params }: Props) {
  const { repoId } = await params;
  return <TestCasesContent repoId={repoId} />;
}
```

---

## HeroUI Component Quick Reference

| Need | HeroUI Component |
|---|---|
| Button | `<Button color="primary" variant="solid">` |
| Loading button | `<Button isLoading>` |
| Icon button | `<Button isIconOnly>` |
| Text input | `<Input label="..." onValueChange={set}>` |
| Textarea | `<Textarea label="..." minRows={3}>` |
| Modal | `Modal + ModalContent + ModalHeader + ModalBody + ModalFooter` |
| Modal state | `const { isOpen, onOpen, onClose } = useDisclosure()` |
| Table | `Table + TableHeader + TableColumn + TableBody + TableRow + TableCell` |
| Dropdown | `Dropdown + DropdownTrigger + DropdownMenu + DropdownItem` |
| Badge/Tag | `<Chip color="success" variant="flat">` |
| Spinner | `<Spinner size="md">` |
| Card | `<Card><CardHeader/><CardBody/></Card>` |
| Sidebar nav | `<Listbox><ListboxItem as={Link}>` |
| Top nav | `<Navbar isBordered>` |
| Select | `<Select><SelectItem key={...}>` |
| Pagination | `<Pagination total={10} page={1} onChange={set}>` |
| Tooltip | `<Tooltip content="..."><Button>` |
| Divider | `<Divider>` |

---

## Naming Conventions

- **Files:** PascalCase for components (`TestCaseModal.tsx`), camelCase for hooks/services/utils
- **Hooks:** `use` prefix + domain + action (`useTestCaseList`, `useAiGenerateTestCases`)
- **Services:** `verbNoun` named exports (`getTestCases`, `createTestCase`, `deleteTestCase`)
- **Types API:** suffix `ApiResponse`, `Request` (`TestCaseApiResponse`, `CreateTestCaseRequest`)
- **Types App:** plain domain names (`TestCase`, `TestCaseFormValues`)
- **Query keys:** `[domain, id?, page?]` tuple (`["testCases", repoId, page]`)
- **Config files:** `Domain.config.ts` (`TestCases.config.ts`)
- **Index files:** re-export the main component only (`export { default } from "./TestCasesContent"`)
