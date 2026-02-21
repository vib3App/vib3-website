/**
 * Mobile detection hook
 * Detects device type, orientation, and touch capabilities
 */
import { useState, useEffect, useRef } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  hasTouch: boolean;
  orientation: 'portrait' | 'landscape';
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  pixelRatio: number;
  isStandalone: boolean; // PWA mode
}

export function useMobileDetect(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => getDeviceInfo());

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(getDeviceInfo());
    };

    const handleOrientationChange = () => {
      // Delay to allow orientation to settle
      setTimeout(() => {
        setDeviceInfo(getDeviceInfo());
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return deviceInfo;
}

function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isIOS: false,
      isAndroid: false,
      isSafari: false,
      isChrome: false,
      isFirefox: false,
      hasTouch: false,
      orientation: 'landscape',
      screenWidth: 1920,
      screenHeight: 1080,
      viewportWidth: 1920,
      viewportHeight: 1080,
      pixelRatio: 1,
      isStandalone: false,
    };
  }

  const ua = navigator.userAgent;
  const width = window.innerWidth;
  const height = window.innerHeight;

  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const isMobile = /Mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || width < 768;
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua) || (width >= 768 && width < 1024);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isChrome = /Chrome/i.test(ua) && !/Edge|Edg/i.test(ua);
  const isFirefox = /Firefox/i.test(ua);

  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const orientation = width > height ? 'landscape' : 'portrait';

  // Check if running as installed PWA
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  return {
    isMobile: isMobile && !isTablet,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    isIOS,
    isAndroid,
    isSafari,
    isChrome,
    isFirefox,
    hasTouch,
    orientation,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: width,
    viewportHeight: height,
    pixelRatio: window.devicePixelRatio || 1,
    isStandalone,
  };
}

/**
 * Hook for detecting safe areas (notch, home indicator)
 */
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const style = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(style.getPropertyValue('--sat') || '0', 10),
        right: parseInt(style.getPropertyValue('--sar') || '0', 10),
        bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
        left: parseInt(style.getPropertyValue('--sal') || '0', 10),
      });
    };

    // Set CSS variables for safe area insets
    document.documentElement.style.setProperty(
      '--sat',
      'env(safe-area-inset-top)'
    );
    document.documentElement.style.setProperty(
      '--sar',
      'env(safe-area-inset-right)'
    );
    document.documentElement.style.setProperty(
      '--sab',
      'env(safe-area-inset-bottom)'
    );
    document.documentElement.style.setProperty(
      '--sal',
      'env(safe-area-inset-left)'
    );

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);

    return () => {
      window.removeEventListener('resize', updateSafeArea);
    };
  }, []);

  return safeArea;
}

/**
 * Hook for detecting network status
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    const updateConnectionType = () => {
      const connection = (navigator as Navigator & {
        connection?: { effectiveType?: string }
      }).connection;
      if (connection?.effectiveType) {
        setConnectionType(connection.effectiveType);
      }
    };

    updateOnlineStatus();
    updateConnectionType();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return { isOnline, connectionType };
}

/**
 * Hook for handling pull-to-refresh gesture
 * Uses refs for callback and state values to avoid stale closures
 * and unnecessary re-registration of event listeners.
 */
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  // Refs to avoid stale closures in touch handlers
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;
  const pullDistanceRef = useRef(pullDistance);
  pullDistanceRef.current = pullDistance;
  const isRefreshingRef = useRef(isRefreshing);
  isRefreshingRef.current = isRefreshing;

  useEffect(() => {
    let startY = 0;
    let currentY = 0;
    const threshold = 80;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].pageY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY === 0) return;

      currentY = e.touches[0].pageY;
      const distance = currentY - startY;

      if (distance > 0 && window.scrollY === 0) {
        setPullDistance(Math.min(distance, threshold * 1.5));
        if (distance > threshold) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistanceRef.current >= threshold && !isRefreshingRef.current) {
        setIsRefreshing(true);
        try {
          await onRefreshRef.current();
        } finally {
          setIsRefreshing(false);
        }
      }
      setPullDistance(0);
      startY = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return { isRefreshing, pullDistance };
}
