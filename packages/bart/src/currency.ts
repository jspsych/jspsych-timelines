/**
 * Currency configuration and formatting utilities for BART timeline
 */

export interface CurrencyConfig {
  locale: string;
  currency: string;
  symbol: string;
  decimalPlaces: number;
  baseUnit: number; // e.g., 100 for cents-based currencies, 1 for whole unit currencies
}

/**
 * Predefined currency configurations
 */
export const CURRENCY_PRESETS: Record<string, CurrencyConfig> = {
  USD: {
    locale: 'en-US',
    currency: 'USD',
    symbol: '$',
    decimalPlaces: 2,
    baseUnit: 100
  },
  EUR: {
    locale: 'de-DE',
    currency: 'EUR',
    symbol: '€',
    decimalPlaces: 2,
    baseUnit: 100
  },
  GBP: {
    locale: 'en-GB',
    currency: 'GBP',
    symbol: '£',
    decimalPlaces: 2,
    baseUnit: 100
  },
  JPY: {
    locale: 'ja-JP',
    currency: 'JPY',
    symbol: '¥',
    decimalPlaces: 0,
    baseUnit: 1
  },
  CAD: {
    locale: 'en-CA',
    currency: 'CAD',
    symbol: 'C$',
    decimalPlaces: 2,
    baseUnit: 100
  },
  AUD: {
    locale: 'en-AU',
    currency: 'AUD',
    symbol: 'A$',
    decimalPlaces: 2,
    baseUnit: 100
  }
};

/**
 * Centralized currency formatter that handles all currency formatting consistently
 */
export class CurrencyFormatter {
  private formatter: Intl.NumberFormat;
  private config: CurrencyConfig;

  constructor(config: CurrencyConfig = CURRENCY_PRESETS.USD) {
    this.config = config;
    this.formatter = new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: config.decimalPlaces,
      maximumFractionDigits: config.decimalPlaces
    });
  }

  /**
   * Format a value in the base unit (e.g., cents for USD) to currency string
   * @param baseUnitValue - Value in base units (e.g., cents for USD)
   * @returns Formatted currency string
   */
  formatBaseUnit(baseUnitValue: number): string {
    const actualValue = baseUnitValue / this.config.baseUnit;
    return this.formatter.format(actualValue);
  }

  /**
   * Format a decimal value to currency string
   * @param decimalValue - Value in decimal format (e.g., 1.23 for $1.23)
   * @returns Formatted currency string
   */
  formatDecimal(decimalValue: number): string {
    return this.formatter.format(decimalValue);
  }

  /**
   * Get a formatted zero value for this currency
   * @returns Formatted zero value (e.g., "$0.00" for USD, "¥0" for JPY)
   */
  getZeroValue(): string {
    return this.formatter.format(0);
  }

  /**
   * Convert pump count to currency value based on currency_unit_per_pump
   * @param pumpCount - Number of pumps
   * @param currencyUnitPerPump - Currency units earned per pump
   * @returns Formatted currency string
   */
  formatPumpEarnings(pumpCount: number, currencyUnitPerPump: number): string {
    const baseUnitValue = pumpCount * currencyUnitPerPump;
    return this.formatBaseUnit(baseUnitValue);
  }

  /**
   * Get the currency configuration
   */
  getConfig(): CurrencyConfig {
    return { ...this.config };
  }
}

/**
 * Default currency formatter (USD)
 */
export const defaultCurrencyFormatter = new CurrencyFormatter();