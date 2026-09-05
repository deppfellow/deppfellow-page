# Investigation: Backend pytest cannot import app

## Hand-off Brief

1. **What happened.** Confirmed: `uv run pytest` could not resolve the uninstalled `app` source package; restoring collection exposed an incorrect exception superclass and a hidden, failing health test.
2. **Where the case stands.** Concluded with high confidence. Four focused corrections align pytest imports, exception dispatch, test discovery, and the health contract with approved Story 0.1.
3. **What's needed next.** Apply the correction set, run the exact console-form quality gate, and remove committed Python cache artifacts.

## Case Info

| Field            | Value |
| ---------------- | ----- |
| Ticket           | N/A |
| Date opened      | 2026-07-04 |
| Status           | Concluded |
| System           | deppfellow-page workspace; Python 3.14 backend managed by uv |
| Evidence sources | pytest output, uv-managed Python diagnostics, source files, Ruff, dependency tree, repository status, official uv/pytest documentation |

## Problem Statement

Running `uv run pytest` from `apps/backend` yields `ModuleNotFoundError: No module named 'app'` while collecting `tests/api/test_errors.py`. Determine why the console entry point cannot import a package that plain uv-managed Python can resolve, then identify failures masked by collection.

## Evidence Inventory

| Source | Status | Notes |
| ------ | ------ | ----- |
| User-reported error | Available | Developer clarified that the command ran from `apps/backend`. |
| Diagnostic archives | Missing | No archive exists; direct command output is sufficient for this local failure. |
| Issue tracker | Missing | No issue or ticket was supplied. |
| pytest execution | Available | Both console and module invocations were captured. |
| Backend source and tests | Available | Relevant error and test modules were inspected with line numbers. |
| Static analysis | Available | `uv run ruff check` passes. |
| Version control | Partial | Status is available; source history has not yet been needed. |
| Dependency graph | Available | `uv tree` confirms installed package ownership. |
| uv and pytest documentation | Available | Current official behavior was queried through Context7. |

## Investigation Backlog

| # | Path to Explore | Priority | Status | Notes |
| - | --------------- | -------- | ------ | ----- |
| 1 | Run pytest with `apps/backend` as working directory | High | Done | Reproduced collection error with backend rootdir. |
| 2 | Compare plain Python and pytest module invocation | High | Done | Plain Python resolves `app`; `python -m pytest` passes collection. |
| 3 | Trace pytest console import resolution for `app` | High | Done | Temporary `pythonpath=.` override confirms the missing backend-root path. |
| 4 | Check pytest discovery and backend dependency declarations | Medium | Done | Health test is not collected; pydantic-settings is transitive through FastAPI standard. |
| 5 | Trace `DependencyUnavailableError` runtime failure | High | Done | Incorrect superclass confirmed at `app/core/errors.py:22`. |
| 6 | Execute the undiscovered health test explicitly | High | Done | Test runs but expected service name disagrees with settings. |
| 7 | Determine intended corrections and verification sequence | High | Done | Story and project context select the minimal correction set. |
| 8 | Finalize investigation report | High | Done | High-confidence conclusion and verification handoff completed. |

## Timeline of Events

| Time | Event | Source | Confidence |
| ---- | ----- | ------ | ---------- |
| 2026-07-04 | Developer reports `uv run pytest` cannot import `app`. | User message | Confirmed |
| 2026-07-04 | Developer grants execution permission for pytest diagnostics. | User message | Confirmed |
| 2026-07-04 | Developer confirms the original command ran from `apps/backend`. | User message | Confirmed |
| 2026-07-04 | `uv run pytest` reproduces the collection error with backend rootdir. | pytest output | Confirmed |
| 2026-07-04 | Plain uv-managed Python resolves `app` from `apps/backend/app/__init__.py`. | Python import diagnostic | Confirmed |
| 2026-07-04 | `uv run python -m pytest` collects one test and reaches application execution. | pytest output | Confirmed |
| 2026-07-04 | Console pytest with temporary `pythonpath=.` collects normally and reaches the same application failure. | pytest output | Confirmed |
| 2026-07-04 | Explicit execution of `tests/api/health.py` fails on expected service name. | pytest output | Confirmed |
| 2026-07-04 | The local `backend` project is not installed as a distribution in the uv environment. | importlib metadata diagnostic | Confirmed |

## Confirmed Findings

### Finding 1: pytest reports an unresolved top-level `app` import

**Evidence:** `uv run pytest` output, 2026-07-04.

**Detail:** Collection of `tests/api/test_errors.py` fails at its import of `app.core.errors`; pytest reports backend `rootdir` and `pyproject.toml`.

### Finding 2: The app package exists and is importable by uv-managed Python

**Evidence:** Python import diagnostic, 2026-07-04.

**Detail:** From the same working directory and environment, `find_spec("app")` resolves `apps/backend/app/__init__.py`, and Python's path contains the empty-string current-directory entry.

### Finding 3: Module-form pytest bypasses the collection failure

**Evidence:** `uv run python -m pytest` output, 2026-07-04.

**Detail:** Module invocation collects one test and executes it, proving that the application package and test import statement are valid when the current directory is on Python's import path.

### Finding 4: A separate exception inheritance defect exists

**Evidence:** `apps/backend/app/core/errors.py:22`, `apps/backend/app/core/errors.py:24`, and module-form pytest traceback.

**Detail:** `DependencyUnavailableError` inherits directly from `Exception` but passes `AppError`-style keyword arguments to `super().__init__`, producing `TypeError: DependencyUnavailableError() takes no keyword arguments`.

### Finding 5: The health test is not discovered

**Evidence:** `apps/backend/tests/api/health.py:8` and both pytest collection summaries.

**Detail:** A function named as a test exists in `health.py`, but pytest collects only `test_errors.py`; the module filename does not match normal test discovery patterns.

### Finding 6: Static analysis does not detect these runtime and discovery failures

**Evidence:** `uv run ruff check` output, 2026-07-04.

**Detail:** Ruff reports all checks passed despite the import-path failure, exception inheritance error, and undiscovered test.

### Finding 7: Adding the backend root to pytest's import path removes the collection error

**Evidence:** `uv run pytest -o pythonpath=.` output, 2026-07-04.

**Detail:** Console-form pytest collects and executes `test_errors.py` when the current directory is temporarily added through pytest configuration. No source file or dependency changed.

### Finding 8: The backend application is not installed in the uv environment

**Evidence:** importlib metadata diagnostic, 2026-07-04, and `apps/backend/pyproject.toml:1`.

**Detail:** `distribution("backend")` reports no installed distribution. The current application-style pyproject has no build-system declaration, so imports rely on the backend source root being present on Python's path.

### Finding 9: The hidden health test expects a different application name

**Evidence:** `apps/backend/tests/api/health.py:12`, `apps/backend/app/core/config.py:9`, and explicit health-test output.

**Detail:** The test expects `deppfellow-page`; `Settings.app_name` defaults to `backend-deppfellow-page`, which flows through `HealthService.check()` into the response.

### Finding 10: The approved story requires the currently failing command and undiscovered test path

**Evidence:** `.docs/bmad-output/project-context.md:193` and `.docs/bmad-output/implementation-artifacts/0-1-epic-0-project-scaffold-and-reviewable-foundation.md:296`.

**Detail:** The quality gate is explicitly `uv run pytest`, and the required health-test path is explicitly `apps/backend/tests/api/test_health.py`.

### Finding 11: Python cache artifacts are not ignored

**Evidence:** `.gitignore:1`, repository status, and commit `d07f54f`.

**Detail:** `.gitignore` lacks Python cache patterns, one `__pycache__` file was committed in the scaffold commit, and diagnostics generated additional untracked cache files.

## Deduced Conclusions

### Deduction 1: uv environment selection is not the import failure

**Based on:** Findings 1 through 3.

**Reasoning:** The same uv project and working directory can resolve `app` under plain Python and module-form pytest. The failure changes only with the pytest launch form.

**Conclusion:** Dependency installation, uv project discovery, and package presence are not the primary cause.

### Deduction 2: console-form pytest has no stable route to the source package

**Based on:** Findings 1 through 3, 7, and 8.

**Reasoning:** Plain Python and module-form pytest include the current directory and resolve `app`. The console entry point fails until pytest's `pythonpath` is temporarily set to the backend root. The project is not installed into site-packages.

**Conclusion:** `uv run pytest` fails because neither package installation nor pytest configuration places `apps/backend` on the console process's import path.

### Deduction 3: the exception handler cannot receive the intended domain error

**Based on:** Finding 4 and `apps/backend/app/core/errors.py:37`.

**Reasoning:** The handler is registered for `AppError`, but `DependencyUnavailableError` inherits from `Exception`. Its constructor also calls `Exception.__init__` with unsupported keyword arguments.

**Conclusion:** The domain error must participate in the `AppError` hierarchy for construction and handler dispatch to work as designed.

### Deduction 4: test discovery currently gives a false picture of suite health

**Based on:** Findings 5 and 9.

**Reasoning:** Default pytest discovery skips `health.py`. Explicit execution proves the skipped test fails.

**Conclusion:** A normal test run currently hides a real health-contract mismatch.

### Deduction 5: pytest configuration is the smallest import correction consistent with the approved scaffold

**Based on:** Findings 7, 8, and 10.

**Reasoning:** Story 0.1 deliberately uses `uv init --app`, expects an application source directory at `apps/backend/app`, and requires the console-form `uv run pytest` command. Converting the scaffold into a distributable package would broaden project metadata and packaging scope. A project-level pytest `pythonpath = ["."]` policy reproduces module-form import behavior while preserving the required command.

**Conclusion:** Configure pytest in `apps/backend/pyproject.toml` to include the backend root rather than changing the verification command.

### Deduction 6: the canonical health service name should match the project identity

**Based on:** Finding 9, project configuration name `deppfellow-page`, and the existing test contract.

**Reasoning:** The health service intentionally exposes `Settings.app_name`. Both the project name and test use `deppfellow-page`; only the settings default adds the unexplained `backend-` prefix.

**Conclusion:** Correct the settings default rather than weakening the assertion.

## Hypothesized Paths

### Hypothesis 1: pytest is running with the repository root rather than the backend root on the import path

**Status:** Refuted

**Theory:** The importable package lives under `apps/backend/app`, but the command process starts from the repository root, so `import app` cannot resolve.

**Supporting indicators:** The repository is a monorepo and uv's `--project` option selects project metadata without changing the process working directory; uv's `--directory` option does change it.

**Would confirm:** Backend-directory pytest passes the `app` import while repository-root execution reproduces the reported collection error.

**Would refute:** `app` remains unimportable when pytest executes with `apps/backend` as its working directory.

**Resolution:** The developer confirmed backend execution, and pytest itself reported `apps/backend` as rootdir while still failing.

### Hypothesis 2: the pytest console entry point omits the backend current directory from Python's import path

**Status:** Confirmed

**Theory:** The installed `.venv/bin/pytest` script starts Python with the script directory as its initial import location, while `python -m pytest` retains the current directory. pytest's collection import behavior does not add the backend root in this test layout.

**Supporting indicators:** Findings 1 through 3 and the pytest console script shebang/entry point.

**Would confirm:** Capturing the console-run import path or testing a project-level import-path configuration makes console-form pytest collect the same test as module-form pytest.

**Would refute:** The console entry point contains the backend root on `sys.path` at collection time.

**Resolution:** `uv run pytest -o pythonpath=.` removes the collection error without any source or dependency change; module-form pytest also succeeds at collection, and the application is not installed as a distribution.

### Hypothesis 3: the health test is healthy but only misnamed

**Status:** Refuted

**Theory:** Renaming `health.py` would simply add a passing test to normal discovery.

**Supporting indicators:** The endpoint returns HTTP 200 and the expected envelope structure.

**Would confirm:** Explicit execution passes.

**Would refute:** Explicit execution reaches an assertion failure.

**Resolution:** Explicit execution fails because configured service name `backend-deppfellow-page` differs from expected `deppfellow-page`.

## Missing Evidence

| Gap | Impact | How to Obtain |
| --- | ------ | ------------- |
| Intended packaging policy for backend `app` | Determines whether to configure pytest path or convert the app into an installed package. | Compare approved scaffold architecture and uv application-project intent. |
| Canonical application name | Determines whether settings or the health expectation should change. | Reconcile project naming guidance with the intended public health contract. |

## Source Code Trace

| Element       | Detail |
| ------------- | ------ |
| Error origin  | Import: `apps/backend/tests/api/test_errors.py:4`; domain error: `apps/backend/app/core/errors.py:24`; health mismatch: `apps/backend/tests/api/health.py:12` |
| Trigger       | `uv run pytest` collection, then endpoint execution after collection is restored |
| Condition     | Console pytest lacks backend source path; domain exception has wrong superclass; health module is misnamed and expects a different configured name |
| Related files | `apps/backend/pyproject.toml`, `apps/backend/app/core/errors.py`, `apps/backend/app/core/config.py`, `apps/backend/tests/api/test_errors.py`, `apps/backend/tests/api/health.py`, `.gitignore` |

### Area model

| Boundary | Input | Output | Failure |
| -------- | ----- | ------ | ------- |
| pytest configuration | Console-form test invocation | Backend root on import path | `app` cannot be imported during collection |
| Domain exception hierarchy | Dependency failure message | `AppError` carrying code/message/status | `Exception.__init__` rejects application keywords |
| Test discovery | Files matching pytest patterns | Collected health test | `health.py` is skipped |
| Settings → health service | `Settings.app_name` | Health response service name | Test and runtime contract disagree |

## Conclusion

**Confidence:** High

The original import failure is confirmed: console-form pytest cannot resolve the uninstalled source package because the backend root is absent from its import path. A temporary pytest `pythonpath=.` override proves the mechanism. After collection is restored, the suite still fails because `DependencyUnavailableError` inherits from the wrong base class; the hidden health test also fails due to an application-name mismatch.

## Recommended Next Steps

### Fix direction

Apply four focused corrections:

1. Add pytest configuration under `apps/backend/pyproject.toml` with backend-root `pythonpath = ["."]`.
2. Change `DependencyUnavailableError` to inherit from `AppError`.
3. Rename `apps/backend/tests/api/health.py` to `apps/backend/tests/api/test_health.py`.
4. Change the default settings application name to `deppfellow-page`.

Separately, add standard Python cache patterns to `.gitignore` and remove already tracked cache artifacts from version control.

### Diagnostic

After implementation, run console-form pytest first because that is the exact contract that failed. Then run module-form pytest as a comparison, Ruff format/lint checks, and repository status to confirm cache artifacts are not regenerated as tracked files.

## Reproduction Plan

1. Preserve the current source snapshot.
2. Apply the four focused corrections.
3. Run `uv run pytest`; expect both API tests to be collected and pass.
4. Run `uv run python -m pytest`; expect the same collection and result.
5. Run Ruff format and lint checks.
6. Inspect repository status for cache artifacts.

## Side Findings

- `pydantic-settings` is currently installed transitively through `fastapi[standard]`, not declared directly in `pyproject.toml`.
- Test execution generated or modified tracked/untracked `__pycache__` artifacts; repository ignore/cleanup policy should be reviewed separately.
- FastAPI's TestClient emits a Starlette deprecation warning recommending `httpx2`; this is not causal for the current failures.
- The scaffold commit `d07f54f` introduced the import policy gap, exception superclass mistake, health filename, health expectation, and committed cache artifacts together.
