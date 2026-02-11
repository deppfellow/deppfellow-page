import pytest
from playwright.sync_api import Page, expect

@pytest.mark.django_db
def test_homepage_loads(page: Page, live_server):
    """
    Sanity Check: Does the home page actually render?
    MCP can run this to verify the 'Bio' implementation.
    """
    # 1. Go to the live local server
    page.goto(live_server.url)
    
    # 2. Check for our Bio heading (from Story 1.1)
    # This proves both Django and the Template are working
    heading = page.locator("h1")
    expect(heading).to_contain_text("Deppfellow")
    
    print("✅ Sanity Check Passed: Home page is alive!")
