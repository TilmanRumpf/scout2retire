from playwright.sync_api import sync_playwright
import base64

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Navigate to the onboarding page
    page.goto('http://localhost:5173/onboarding')
    
    # Wait for the page to load
    page.wait_for_load_state('networkidle')
    
    # Take a screenshot and save it
    screenshot_path = '/tmp/onboarding_screenshot.png'
    page.screenshot(path=screenshot_path)
    
    # Get page info
    print(f"Current URL: {page.url}")
    print(f"Page title: {page.title()}")
    
    # Check for main content
    if page.locator('h1').count() > 0:
        print(f"Main heading: {page.locator('h1').first.inner_text()}")
    
    # Check for form elements
    input_count = page.locator('input').count()
    button_count = page.locator('button').count()
    print(f"Found {input_count} input fields and {button_count} buttons")
    
    # Get first 500 chars of visible text
    visible_text = page.locator('body').inner_text()[:500]
    print(f"\nPage content preview:\n{visible_text}")
    
    browser.close()
    
print(f"\nScreenshot saved to {screenshot_path}")
