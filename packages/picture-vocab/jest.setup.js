// Jest setup file for additional configuration

// Mock console.warn to avoid noise in tests
global.console.warn = jest.fn();

// Mock HTML elements that might be needed
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  value: 100,
});

Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  value: 100,
});