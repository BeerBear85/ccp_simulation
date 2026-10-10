"""Capture the README screenshots from the built simulator using Playwright."""
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs" / "screenshots"


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            channel="chrome", headless=True, args=["--enable-unsafe-swiftshader"]
        )
        try:
            page = browser.new_page(viewport={"width": 1600, "height": 900}, device_scale_factor=1)
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            url = (ROOT / "dist" / "copenhagen_cable_park_sim.html").as_uri()
            for name, fragment in [("start-screen", ""), ("start-area", "#start-area")]:
                page.goto("about:blank")
                page.goto(url + fragment)
                page.wait_for_function("window.__ccpDebug", timeout=60000)
                if fragment:
                    page.wait_for_function("getComputedStyle(document.getElementById('cover')).opacity === '0'")
                page.evaluate("document.fonts.ready")
                page.wait_for_timeout(2000)
                page.screenshot(path=str(OUTPUT / f"{name}.png"))
                print(f"Captured {name}")
            if errors:
                raise RuntimeError("Browser errors: " + "; ".join(errors))
        finally:
            browser.close()


if __name__ == "__main__":
    main()
