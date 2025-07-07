// Jest setup file for RAVL timeline tests
import 'jest-environment-jsdom';

// Create shared mock instances
const mockSpeechSynthesis = {
  cancel: jest.fn(),
  speak: jest.fn(),
  getVoices: jest.fn(() => [
    { lang: 'en-US', name: 'Google US English' },
    { lang: 'en-GB', name: 'Microsoft David' }
  ])
};

const mockAudioContext = jest.fn(() => ({
  currentTime: 0,
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    type: 'sine',
    frequency: { setValueAtTime: jest.fn() },
    start: jest.fn(),
    stop: jest.fn()
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: {
      setValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn()
    }
  })),
  destination: {}
}));

// Mock global window objects that Jest doesn't provide
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: mockSpeechSynthesis
});

Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  writable: true,
  value: jest.fn(() => ({
    rate: 0.9,
    pitch: 1.0,
    volume: 0.8,
    voice: null,
    onend: null
  }))
});

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: mockAudioContext
});

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: mockAudioContext
});

// Export mocks for use in tests
(global as any).__mockSpeechSynthesis = mockSpeechSynthesis;
(global as any).__mockAudioContext = mockAudioContext;

// Mock console.warn to avoid noise in tests
global.console.warn = jest.fn();

// Mock Date.now for consistent testing
const mockDateNow = jest.fn(() => 1000000000000);
global.Date.now = mockDateNow;