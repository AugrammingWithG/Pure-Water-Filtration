/**
 * The prototype ran three.js r128, where WebGLRenderer scaled every light's
 * intensity by PI ("legacy lights"). That flag defaulted to false in r155 and
 * was removed in r165, so the same intensity values render darker on modern
 * three. Multiplying by PI restores the original look.
 *
 * Set this to 1 to use the raw values from the legacy file instead.
 */
export const LEGACY_LIGHT_SCALE = Math.PI
