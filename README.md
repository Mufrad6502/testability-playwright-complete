# Testability QA Assignment — Playwright + TypeScript

A complete, scalable end-to-end automation framework for the Conduit application:

- Web: `https://conduit.bondaracademy.com`
- API: `https://conduit-api.bondaracademy.com/api`

The solution covers all mandatory scenarios and bonus expectations from the supplied assignment.

## Automated coverage

| Scenario               | Positive test                                                               | Negative test                                              |
| ---------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Create New Article     | UI creation, redirect, rendered data, controls, API persistence             | Required title omitted                                     |
| Edit Article           | API precondition, editor prefill, UI edit, API persistence                  | Required title cleared; original article remains unchanged |
| Delete Article         | API precondition, UI deletion, redirect, API 404                            | Repeated deletion returns controlled 4xx                   |
| Filter Articles by Tag | Deterministic API data, UI tag click, all-card and API filtering validation | Unknown tag returns safe empty feed                        |
| Update User Settings   | UI update, API validation, reload persistence, API restoration              | Invalid email rejected and not persisted                   |


## Architecture

```text
.
├── .github/workflows/playwright.yml
├── playwright/.auth/                 # generated locally; ignored by Git
├── src
│   ├── api/                           # typed API clients
│   ├── data/                          # dynamic test-data builders
│   ├── fixtures/                      # dependency injection
│   ├── pages/                         # page objects/components
│   ├── types/                         # domain models
│   └── utils/                         # authentication helpers
├── tests
│   ├── articles/
│   ├── settings/
│   └── tags/
├── global-setup.ts                    # one-time login + storageState
└── playwright.config.ts
```

## Prerequisites

- Node.js 20 or 22
- npm
- A valid account on the Conduit application

## Setup in VS Code

```bash
npm install
npx playwright install
```

Copy the environment template:

```bash
# macOS/Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Edit `.env`:

```env
BASE_URL=https://conduit.bondaracademy.com
API_URL=https://conduit-api.bondaracademy.com/api
TEST_USER_EMAIL=your_existing_user@example.com
TEST_USER_PASSWORD=your_password
```

Credentials and generated authenticated state are excluded from Git.

## Run tests

```bash
npm test                  # all configured browsers
npm run test:chromium
npm run test:firefox
npm run test:webkit
npm run test:headed
npm run test:ui
```

Static checks:

```bash
npm run typecheck
npm run lint
npm run format:check
```

Open the HTML report:

```bash
npm run report
```

## Session management

`global-setup.ts` signs in once and stores the authenticated browser state at:

```text
playwright/.auth/user.json
```

Every browser project reuses that state, avoiding repeated UI login in every test.

## Reliability and maintainability decisions

- API preconditions are used for edit/delete/filter setup to reduce execution time.
- API verification complements UI assertions for end-to-end persistence checks.
- Faker and timestamps prevent collisions during parallel execution.
- Cleanup occurs in `finally` blocks so failed assertions do not leave test data behind.
- Settings tests run serially because they mutate one shared user profile.
- Settings are restored through API, which is faster and safer than UI cleanup.
- User-facing roles/placeholders are preferred over brittle DOM chains.
- Web-first assertions and `expect.poll` are used instead of fixed sleeps.
- Traces, screenshots, and videos are retained on failures.

## Cross-browser and parallel execution

The Playwright configuration includes:

- Chromium
- Firefox
- WebKit
- `fullyParallel: true`
- CI retries
- Three CI matrix jobs

## CI/CD

The GitHub Actions workflow runs on pushes, pull requests, and manual dispatch.

Create these repository secrets:

- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`

The workflow:

1. Installs dependencies.
2. Installs the required browser.
3. Runs TypeScript and ESLint validation.
4. Executes the browser-specific suite.
5. Uploads the HTML report.
6. Uploads traces, screenshots, and videos after failure.

## Assumptions

1. A valid pre-created test account is available.
2. The application follows the RealWorld/Conduit `Authorization: Token <JWT>` convention.
3. The authentication token is stored in browser local storage.
4. The deployed UI exposes standard Conduit labels and placeholders.
5. Environment-specific hosts can be changed without editing source code.

## Submission

Initialize and push the project:

```bash
git init
git add .
git commit -m "Complete Testability Playwright assignment"
git branch -M main
git remote add origin <your-repository-url>
git push -u origin main
```

