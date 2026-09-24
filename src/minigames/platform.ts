/**
 * Platform Detection — determines input capabilities for minigame adaptation.
 *
 * Desktop: mouse + keyboard input, standard target sizes.
 * Tablet: touch input, medium sensitivity, slightly larger targets.
 * Mobile: touch input, simplified gameplay, larger targets, fewer icons.
 */

export type Platform = 'desktop' | 'tablet' | 'mobile';

/** Breakpoints for platform detection */
const MOBILE_MAX_WIDTH = 480;
const TABLET_MAX_WIDTH = 1024;

/**
 * Detect the current platform based on screen width and touch capability.
 *
 * Rules:
 * - width <= 480px → mobile
 * - width <= 1024px AND touch → tablet
 * - otherwise → desktop
 */
export function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;
  const hasTouch =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0;

  if (width <= MOBILE_MAX_WIDTH) {
    return 'mobile';
  }

  if (width <= TABLET_MAX_WIDTH && hasTouch) {
    return 'tablet';
  }

  return 'desktop';
}

/**
 * Get platform-specific configuration for minigames.
 */
export interface PlatformConfig {
  platform: Platform;
  /** Whether to use touch input */
  touchInput: boolean;
  /** Base icon/target radius multiplier */
  targetScale: number;
  /** Number of simultaneous icons (lower = easier on mobile) */
  iconDensity: number;
  /** Movement sensitivity multiplier */
  sensitivity: number;
  /** Whether to show simplified UI (fewer elements) */
  simplifiedUI: boolean;
}

export function getPlatformConfig(platform?: Platform): PlatformConfig {
  const p = platform ?? detectPlatform();

  switch (p) {
    case 'mobile':
      return {
        platform: 'mobile',
        touchInput: true,
        targetScale: 1.5, // 50% larger targets
        iconDensity: 0.6, // fewer icons
        sensitivity: 0.8,
        simplifiedUI: true,
      };
    case 'tablet':
      return {
        platform: 'tablet',
        touchInput: true,
        targetScale: 1.2,
        iconDensity: 0.8,
        sensitivity: 1.0,
        simplifiedUI: false,
      };
    case 'desktop':
    default:
      return {
        platform: 'desktop',
        touchInput: false,
        targetScale: 1.0,
        iconDensity: 1.0,
        sensitivity: 1.0,
        simplifiedUI: false,
      };
  }
}
