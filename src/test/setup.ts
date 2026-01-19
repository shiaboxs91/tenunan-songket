import "@testing-library/jest-dom";

// Polyfill for ResizeObserver (required for Radix UI components)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
