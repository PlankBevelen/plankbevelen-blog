export function setRem() {
  const DESIGN_WIDTH_PC = 1920;
  const BASE_FONT_SIZE_PC = 16;
  const MIN_SCALE_PC = 0.85;
  const MAX_SCALE_PC = 1.2;
  
  const BREAKPOINT_TABLET = 1024;
  const BREAKPOINT_MOBILE = 768;
  const MIN_WIDTH_MOBILE = 320;
  const MAX_WIDTH_MOBILE = 768;

  const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  let currentScale = 1;
  let baseFontSize = BASE_FONT_SIZE_PC;

  if (viewportWidth <= BREAKPOINT_MOBILE) {
    const adaptWidth = Math.max(MIN_WIDTH_MOBILE, Math.min(viewportWidth, MAX_WIDTH_MOBILE));
    currentScale = adaptWidth / 750;
    baseFontSize = 20;
    currentScale = Math.min(Math.max(currentScale, 0.8), 1.5);
  } else if (viewportWidth <= BREAKPOINT_TABLET) {
    currentScale = viewportWidth / 1024;
    baseFontSize = BASE_FONT_SIZE_PC * 1.5;
    currentScale = Math.min(Math.max(currentScale, 0.9), 1.1);
  } else {
    currentScale = viewportWidth / DESIGN_WIDTH_PC;
    baseFontSize = BASE_FONT_SIZE_PC * 1.2;
    currentScale = Math.min(Math.max(currentScale, MIN_SCALE_PC), MAX_SCALE_PC);
  }

  const finalFontSize = currentScale * baseFontSize;
  document.documentElement.style.fontSize = `${finalFontSize}px`;
}
