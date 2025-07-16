/**
 * Fetches the customizable base path to the assets folder.
 *
 * @returns {string} Base path to the assets folder
 */
function getDefaultBasePath() {
  // If asset base path is customized by users
  if (typeof window !== "undefined" && window.AssetBase) {
    return window.AssetBase;
  }
  // Otherwise, assume assets is at top level
  return "../assets/";
}

/**
 * Constructs full path to an asset given its file name and extension type.
 *
 * @param {string} filename - The filename (with or without extension)
 * @param {string} extension - File extension (e.g., ".mp3")
 * @param {string} basePath - Base path to assets (optional)
 * @returns {string} Complete asset URL
 */
export function getAssetUrl(filename, extension = "", basePath = getDefaultBasePath()) {
  const userBase = typeof window !== "undefined" && window.AssetBase;
  const effectiveBase = userBase || basePath;
  return `${effectiveBase}${filename}${extension}`;
}

/**
 * Overrides the default asset base.
 *
 * @example
 * // CDN:
 * setAssetBase('https://unpkg.com/@jspsych-timelines/list-sorting-working-memory@latest/assets/');
 *
 * // If assets folder is moved to a different relative location, e.g. in the same folder as source:
 * setAssetBase(./assets/')
 *
 * // Custom server:
 * setAssetBase('https://custom-server.com/assets/');
 */
export function setAssetBase(basePath) {
  if (typeof window !== "undefined") {
    window.AssetBase = basePath;
  }
}
