import pytest

@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    """Force a specific viewport size for consistency."""
    return {
        **browser_context_args,
        "viewport": {"width": 1280, "height": 720},
    }
