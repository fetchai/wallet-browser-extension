import { Currencies, Currency } from "../../chain-info";

export function getCurrency(type: string): Currency | undefined {
  return Currencies[type];
}

export function getCurrencies(types: string[]): Currency[] {
  const currencies: Currency[] = [];
  // Guard
  if (!types) {
    return currencies;
  }

  for (const type of types) {
    const currency = getCurrency(type);
    if (currency) {
      currencies.push(currency);
    }
  }

  return currencies;
}

export function getCurrencyFromDenom(denom: string): Currency | undefined {
  if (!denom) {
    return undefined;
  }

  const currencies = getCurrenciesFromDenoms([denom]);
  if (currencies.length >= 1) {
    return currencies[0];
  }
  return undefined;
}

export function getCurrenciesFromDenoms(denoms: string[]): Currency[] {
  const currencies: Currency[] = [];
  // Guard
  if (!denoms) {
    return currencies;
  }

  for (const key in Currencies) {
    const currency = Currencies[key];
    if (denoms.indexOf(currency.coinDenom) >= 0) {
      currencies.push(currency);
    }
  }

  return currencies;
}

/**
 * if this denom is within any currency in chain info we return name (first match)
 */
export function getCurrencyFromUnknownDenom(
  denom: string
): Currency | undefined {
  for (const key in Currencies) {
    const currency = Currencies[key];
    if (denom === currency.coinMinimalDenom) {
      return currency;
    }

    if (denom === currency.coinDenom) {
      return currency;
    }
  }

  return undefined;
}

/**
 * We look through the predefined currencies and see if this denom is minimal or not.
 *
 * @param denom
 */
export function isMinimalDenom(denom: string): boolean {
  for (const key in Currencies) {
    const currency = Currencies[key];
    if (denom === currency.coinMinimalDenom) {
      return true;
    }
  }
  return false;
}

export function getCurrencyFromMinimalDenom(
  denom: string
): Currency | undefined {
  if (!denom) {
    return undefined;
  }

  const currencies = getCurrenciesFromMinimalDenoms([denom]);
  if (currencies.length >= 1) {
    return currencies[0];
  }
  return undefined;
}

export function getCurrenciesFromMinimalDenoms(denoms: string[]): Currency[] {
  const currencies: Currency[] = [];
  // Guard
  if (!denoms) {
    return currencies;
  }

  for (const key in Currencies) {
    const currency = Currencies[key];
    if (denoms.indexOf(currency.coinMinimalDenom) >= 0) {
      currencies.push(currency);
    }
  }

  return currencies;
}
