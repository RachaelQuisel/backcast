"""
Drive the backcast dashboard end-to-end with mocked Supabase, asserting that
the rendered "current target" matches what the fixed backcast() math predicts
for three different target ages.

Anonymous sign-in is disabled on the user's Supabase project, so we intercept
the network layer and return canned auth/profile responses instead.
"""
import json
import re
import sys
from playwright.sync_api import sync_playwright, Route

USER_ID = "11111111-1111-1111-1111-111111111111"
ACCESS_TOKEN = "fake-access-token"


def make_routes(target_age: int):
    """Return a route handler closure parameterized by target age."""

    def handle(route: Route):
        url = route.request.url
        method = route.request.method

        # Auth endpoints — return a fake anonymous session
        if "/auth/v1/" in url:
            session = {
                "access_token": ACCESS_TOKEN,
                "token_type": "bearer",
                "expires_in": 3600,
                "expires_at": 9999999999,
                "refresh_token": "fake-refresh",
                "user": {
                    "id": USER_ID,
                    "aud": "authenticated",
                    "role": "authenticated",
                    "email": "",
                    "is_anonymous": True,
                    "app_metadata": {"provider": "anonymous"},
                    "user_metadata": {},
                    "created_at": "2026-05-01T00:00:00Z",
                    "updated_at": "2026-05-01T00:00:00Z",
                },
            }
            route.fulfill(status=200, content_type="application/json", body=json.dumps(session))
            return

        # Profile fetch — return our seeded profile
        if "/rest/v1/profiles" in url and method == "GET":
            profile = [{
                "id": USER_ID,
                "age": 35,
                "sex": "female",
                "weight": 150,
                "target_age": target_age,
                "activity_level": "active",
                "selected_goals": ["ohp", "deadlift", "vo2max"],
                "custom_targets": {},
                "has_onboarded": True,
            }]
            # maybeSingle expects one row max — return wrapped in array per PostgREST
            route.fulfill(status=200, content_type="application/json", body=json.dumps(profile))
            return

        # Profile upserts/updates — accept, no-op
        if "/rest/v1/profiles" in url and method in ("POST", "PATCH"):
            route.fulfill(status=200, content_type="application/json", body="[]")
            return

        # Workout logs — empty
        if "/rest/v1/workout_logs" in url and method == "GET":
            route.fulfill(status=200, content_type="application/json", body="[]")
            return

        if "/rest/v1/workout_logs" in url and method in ("POST", "PATCH"):
            route.fulfill(status=200, content_type="application/json", body="[]")
            return

        # Anything else (fonts, JS bundles, expo dev assets) — let through
        route.continue_()

    return handle


def extract_target_for(page, exercise_name: str) -> float | None:
    """
    The dashboard renders each exercise card with the exercise name + a numeric
    'current target' value. Pull that number from the DOM by locating the
    exercise-name element and walking up to the card.
    """
    name_el = page.get_by_text(exercise_name, exact=True).first
    name_el.wait_for(state="visible", timeout=15000)
    card = name_el.locator("xpath=ancestor::*[1]/ancestor::*[1]")
    text = card.inner_text()
    # Find the first decimal number on the card (the "currentTarget" rendered
    # via toFixed(1)). Skip integer-only matches.
    matches = re.findall(r"\b(\d+\.\d)\b", text)
    return float(matches[0]) if matches else None


def run_for_target(target_age: int, expected: float) -> tuple[float | None, str]:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context()
        page = ctx.new_page()
        page.on("pageerror", lambda err: print(f"  [pageerror] {err}", file=sys.stderr))

        page.route("**/*", make_routes(target_age))
        page.goto("http://localhost:8082", wait_until="domcontentloaded", timeout=60000)
        page.wait_for_load_state("networkidle", timeout=30000)
        page.wait_for_timeout(2000)

        screenshot = f"/tmp/backcast_dashboard_t{target_age}.png"
        page.screenshot(path=screenshot, full_page=True)

        url = page.url
        if "/dashboard" not in url:
            # Maybe still loading or stuck on splash
            page.wait_for_timeout(3000)
            page.screenshot(path=screenshot, full_page=True)
            url = page.url

        target = extract_target_for(page, "Overhead Press")
        browser.close()
        return target, url


if __name__ == "__main__":
    cases = [
        (65, 38.8),   # 30.2 / 0.92^3   = 38.7832
        (80, 44.0),   # 30.2 / 0.92^4.5 = 43.9503
        (90, 47.8),   # 30.2 / 0.92^5.5 = 47.7720
    ]
    print(f"{'target':>8}  {'rendered':>10}  {'expected':>10}  {'url':<40}")
    all_ok = True
    for target_age, expected in cases:
        rendered, url = run_for_target(target_age, expected)
        ok = rendered is not None and abs(rendered - expected) < 0.2
        all_ok &= ok
        marker = "OK" if ok else "FAIL"
        print(f"{target_age:>8}  {rendered!s:>10}  {expected:>10}  {url:<40}  {marker}")
    sys.exit(0 if all_ok else 1)
