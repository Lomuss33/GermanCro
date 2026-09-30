export function detectInstallGuideContext(userAgent, {
  fallbackBrowser,
  fallbackDesktop,
  fallbackMobile,
}) {
  const ua = userAgent || "";
  const isIOS = /iPad|iPhone|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isMobile = isIOS || isAndroid;
  const isDesktop = !isMobile;
  const isSamsung = /SamsungBrowser/i.test(ua);
  const isFirefox = /Firefox|FxiOS/i.test(ua);
  const isEdgeAndroid = /EdgA/i.test(ua);
  const isEdgeIOS = /EdgiOS/i.test(ua);
  const isEdgeDesktop = /Edg/i.test(ua) && !isEdgeAndroid && !isEdgeIOS;
  const isEdge = isEdgeAndroid || isEdgeIOS || isEdgeDesktop;
  const isOperaTouch = /OPT/i.test(ua);
  const isOpera = /OPR|Opera/i.test(ua) || isOperaTouch;
  const isChromeIOS = /CriOS/i.test(ua);
  const isChromeDesktopOrAndroid = /Chrome/i.test(ua) && !isSamsung && !isFirefox && !isEdge && !isOpera;
  const isChrome = isChromeIOS || isChromeDesktopOrAndroid;
  const isSafari = /Safari/i.test(ua) && !isChrome && !isFirefox && !isEdge && !isOpera && !isSamsung;
  const isFirefoxIOS = /FxiOS/i.test(ua);
  const isFirefoxDesktop = isFirefox && !isMobile;
  const isFirefoxMobile = isFirefox && isMobile;

  let browserLabel = fallbackBrowser;
  let installPathKey = "default";

  if (isIOS && isSafari) {
    browserLabel = "Safari";
    installPathKey = "iosShare";
  } else if (isEdgeIOS) {
    browserLabel = "Edge iPhone";
    installPathKey = "iosShare";
  } else if (isIOS && isChromeIOS) {
    browserLabel = "Chrome iOS";
    installPathKey = "iosShare";
  } else if (isFirefoxIOS) {
    browserLabel = "Firefox iPhone";
    installPathKey = "iosShare";
  } else if (isAndroid && isSamsung) {
    browserLabel = "Samsung";
    installPathKey = "samsung";
  } else if (isEdgeAndroid) {
    browserLabel = "Edge Android";
    installPathKey = "edgeAndroid";
  } else if (isAndroid && isOperaTouch) {
    browserLabel = "Opera Touch";
    installPathKey = "opera";
  } else if (isAndroid && isOpera) {
    browserLabel = "Opera";
    installPathKey = "opera";
  } else if (isFirefoxMobile) {
    browserLabel = "Firefox";
    installPathKey = "firefoxMobile";
  } else if (isAndroid && isChromeDesktopOrAndroid) {
    browserLabel = "Chrome";
    installPathKey = "chromeAndroid";
  } else if (isEdgeDesktop) {
    browserLabel = "Edge";
    installPathKey = "edgeDesktop";
  } else if (isDesktop && isOpera) {
    browserLabel = "Opera";
  } else if (isDesktop && isChromeDesktopOrAndroid) {
    browserLabel = "Chrome";
    installPathKey = "chromeDesktop";
  } else if (isFirefoxDesktop) {
    browserLabel = "Firefox";
    installPathKey = "firefoxDesktop";
  } else if (isDesktop) {
    browserLabel = fallbackDesktop;
  } else if (isMobile) {
    browserLabel = fallbackMobile;
  }

  return { isMobile, isDesktop, browserLabel, installPathKey };
}
