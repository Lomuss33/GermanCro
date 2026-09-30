import test from "node:test";
import assert from "node:assert/strict";
import { detectInstallGuideContext } from "../src/ui/install-guide-context.js";

const fallback = {
  fallbackBrowser: "Browser",
  fallbackDesktop: "Desktop browser",
  fallbackMobile: "Mobile browser",
};

test("install guide chooses the right path for common browser families", () => {
  const cases = [
    ["Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1", "Safari", "iosShare", true],
    ["Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 CriOS/120.0 Mobile Safari/604.1", "Chrome iOS", "iosShare", true],
    ["Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0 SamsungBrowser/24.0", "Samsung", "samsung", true],
    ["Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0 EdgA/120.0", "Edge Android", "edgeAndroid", true],
    ["Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120.0 Edg/120.0", "Edge", "edgeDesktop", false],
    ["Mozilla/5.0 (Windows NT 10.0) Gecko/20100101 Firefox/120.0", "Firefox", "firefoxDesktop", false],
    ["Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120.0", "Chrome", "chromeDesktop", false],
  ];

  for (const [ua, browserLabel, installPathKey, isMobile] of cases) {
    assert.deepEqual(detectInstallGuideContext(ua, fallback), {
      isMobile,
      isDesktop: !isMobile,
      browserLabel,
      installPathKey,
    });
  }
});

test("install guide retains localized fallbacks for unknown browsers", () => {
  assert.deepEqual(detectInstallGuideContext("Unknown", fallback), {
    isMobile: false,
    isDesktop: true,
    browserLabel: "Desktop browser",
    installPathKey: "default",
  });
  assert.deepEqual(detectInstallGuideContext("Unknown Android", fallback), {
    isMobile: true,
    isDesktop: false,
    browserLabel: "Mobile browser",
    installPathKey: "default",
  });
});
