# Investigation: Alembic cannot open the SQLite database file

## Hand-off Brief

1. **What happened.** Running `uv run alembic upgrade head` from `apps/backend` failed when SQLAlchemy first attempted to connect to SQLite.
2. **Root cause.** The configured relative URL resolved to `apps/backend/data/app.db`, but its parent directory, `apps/backend/data`, did not exist. SQLite can create a database file, but it cannot create missing parent directories.
3. **Resolution.** The shared engine builder now prepares the parent directory for ordinary file-backed SQLite URLs before creating the engine. A regression test covers a database nested below a missing directory.
4. **Current state.** Concluded with high confidence. The original command, the complete backend test suite, and Ruff all pass.

## Case Info

| Field | Value |
| --- | --- |
| Date | 2026-07-04 |
| Status | Concluded |
| System | deppfellow-page backend; Python 3.14; SQLAlchemy; Alembic; SQLite |
| Failing command | `uv run alembic upgrade head` |
| Working directory | `apps/backend` |
| Reported exception | `sqlalchemy.exc.OperationalError: (sqlite3.OperationalError) unable to open database file` |
| Evidence | Repeated command output, effective URL/path probe, temporary-database control run, regression test, pytest, Ruff |

## Problem Statement

Determine why Alembic cannot open the configured SQLite database, prove the cause rather than inferring it from the exception text, and implement a fix at the shared database boundary.

## Reproduction

The exact command was executed twice from `apps/backend`:

```text
uv run alembic upgrade head
```

Both executions failed at:

```text
app/db/migrations/env.py
→ run_migrations_online()
→ build_engine(...)
→ connectable.connect()
→ sqlite3.connect(...)
→ sqlite3.OperationalError: unable to open database file
```

The repeated result established a deterministic feedback loop.

## Ranked Hypotheses

### Hypothesis 1: The SQLite parent directory does not exist

**Rank:** 1  
**Status:** Confirmed

**Prediction:** The configured database path resolves correctly, but its parent directory is absent. Pointing Alembic at an equivalent path inside an existing temporary directory should succeed.

### Hypothesis 2: The relative URL resolves from an unexpected working directory

**Rank:** 2  
**Status:** Refuted

**Prediction:** The effective absolute path differs from the intended `apps/backend/data/app.db` location.

### Hypothesis 3: The database parent exists but is not writable

**Rank:** 3  
**Status:** Refuted

**Prediction:** The parent directory exists and filesystem permission checks report that it cannot be written.

### Hypothesis 4: Alembic uses an unintended or malformed URL override

**Rank:** 4  
**Status:** Refuted

**Prediction:** Alembic's effective URL differs from `Settings.database_url`, or the SQLite URL uses the wrong relative/absolute slash form.

## Diagnostic Evidence

### Effective configuration and path

The runtime settings and SQLAlchemy URL parser produced:

```text
working directory: apps/backend
URL:               sqlite:///./data/app.db
database portion:  ./data/app.db
resolved file:     apps/backend/data/app.db
parent:            apps/backend/data
parent exists:     false
parent is a dir:   false
```

This evidence refuted the working-directory and URL-override hypotheses. The relative URL resolved exactly where intended.

### One-variable control run

Alembic was then run through its Python API with the same configuration and revision, changing only the database URL to a file inside an existing temporary directory.

Result:

```text
Running upgrade  -> 0001, Empty baseline
migration: passed
database created: true
```

The temporary directory was automatically cleaned afterward.

This control run proved that:

- Alembic configuration and revision loading worked.
- The migration itself worked.
- SQLAlchemy's SQLite engine setup worked once the parent directory existed.
- The missing parent directory was causal, not incidental.

## Root Cause

`Settings.database_url` uses:

```text
sqlite:///./data/app.db
```

For SQLite, three slashes indicate a relative filesystem path. From `apps/backend`, the URL therefore points to:

```text
apps/backend/data/app.db
```

SQLite creates `app.db` when it connects, but file creation requires the containing directory to exist first. Because `apps/backend/data` was missing, the operating system rejected the file-open request. SQLite surfaced that rejection as `sqlite3.OperationalError`, which SQLAlchemy wrapped as `sqlalchemy.exc.OperationalError`.

Alembic was the first caller to open the engine, so the failure appeared during migration startup rather than during application startup.

## Resolution

### Production change

`app/db/session.py` now prepares the parent directory before creating an engine when all of these conditions hold:

- The backend is SQLite.
- The database is file-backed.
- The database is not `:memory:`.
- The URL is not SQLite URI mode beginning with `file:`.

The engine builder uses `Path.mkdir(parents=True, exist_ok=True)`, making repeated calls safe.

The fix belongs in `build_engine()` because it is the shared construction boundary used by:

- Alembic online migrations.
- The application's global engine.
- Database tests that request the project engine behavior.

Putting the behavior at this boundary prevents Alembic and the application from developing separate directory-bootstrap rules.

### Regression test

`tests/db/test_session.py` now creates a SQLite URL whose parent directory does not exist, builds the project engine, connects, executes `SELECT 1`, and verifies that the database file was created.

Before the fix, the test failed with the same `unable to open database file` exception. After the fix, it passes.

### Adjacent verification corrections

Full-suite verification exposed unrelated scaffold issues:

- `PRAGMA journla_mode` was corrected to `PRAGMA journal_mode`.
- Unused imports from Alembic's generated templates were removed.
- The migration smoke test now asserts that the applied revision is `0001`.

These changes did not cause or resolve the original SQLite open failure, but they were required for clean test and lint results.

## Verification Results

| Check | Result |
| --- | --- |
| Focused regression before fix | Failed with `sqlite3.OperationalError` |
| Focused regression after fix | `1 passed` |
| Original `uv run alembic upgrade head` | Passed; applied revision `0001` |
| Full `uv run pytest` | `5 passed` |
| `uv run ruff check app tests` | All checks passed |

## Files Involved

| File | Role |
| --- | --- |
| `apps/backend/app/core/config.py` | Defines the default relative SQLite URL |
| `apps/backend/app/db/session.py` | Builds engines and now prepares file-backed SQLite parent directories |
| `apps/backend/app/db/migrations/env.py` | Requests the shared engine for online migrations |
| `apps/backend/app/db/migrations/versions/0001_empty_baseline.py` | Baseline migration applied during verification |
| `apps/backend/tests/db/test_session.py` | Covers directory preparation and SQLite connection pragmas |
| `apps/backend/tests/db/test_migrations.py` | Verifies a clean migration reaches revision `0001` |

## Prevention and Debugging Heuristic

When SQLite reports `unable to open database file`, inspect the filesystem boundary before changing Alembic:

1. Parse the effective database URL.
2. Resolve relative paths from the command's actual working directory.
3. Check whether the parent exists and is a directory.
4. Check write permissions only after confirming existence.
5. Retry against an existing temporary directory while changing no other variable.

This separates path and permission failures from migration-script, metadata, and Alembic configuration failures.

## References

- [SQLAlchemy database URL syntax](https://docs.sqlalchemy.org/en/20/core/engines.html#database-urls)
- [SQLAlchemy SQLite connection strings](https://docs.sqlalchemy.org/en/20/dialects/sqlite.html#connect-strings)

## Conclusion

**Confidence:** High

The migration failed because the relative SQLite database file was located below a missing parent directory. Reproduction was deterministic, runtime path inspection identified the missing boundary, and a one-variable temporary-directory control run proved causality. Centralizing directory preparation in the shared engine builder resolves both migration and application startup paths, and the regression test prevents recurrence.
