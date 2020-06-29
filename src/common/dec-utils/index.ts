import { Dec } from "@everett-protocol/cosmosjs/common/decimal";

export class DecUtils {
  static decToStrWithoutTrailingZeros(dec: Dec): string {
    return DecUtils.removeTrailingZerosFromDecStr(dec.toString());
  }

  static removeTrailingZerosFromDecStr(decStr: string): string {
    for (let i = decStr.length - 1; i >= 0; i--) {
      if (decStr[i] === "0") {
        decStr = decStr.slice(0, i);
      } else {
        break;
      }
    }

    if (decStr.length > 0) {
      if (decStr[decStr.length - 1] === ".") {
        decStr = decStr.slice(0, decStr.length - 1);
      }
    }

    return decStr;
  }

  private static precisions: { [precision: string]: Dec } = {};

  static getPrecisionDec(precision: number): Dec {
    if (DecUtils.precisions[precision.toString()]) {
      return DecUtils.precisions[precision.toString()];
    }

    let dec = new Dec(1);
    for (let i = 0; i < precision; i++) {
      dec = dec.mul(new Dec(10));
    }
    DecUtils.precisions[precision.toString()] = dec;
    return dec;
  }

  /**
 *
 * very small utility method. Dec library doesn;t accept ".1" as constructor input, but does accept "0.1" so
 * we just look for strings that start with a decimal point, and prepend with 0.
 */
  public static sanitizeDecimal(s: string): string {
    return (s.trim().charAt(0) === ".")? "0" + s.trim(): s;
}
}
