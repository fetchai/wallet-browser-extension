
import { useIntl } from "react-intl";
/**
 * Checks that a password is of sufficient length and contains all character classes
 * @param  {String} password plaintext password
 * @returns {Boolean} True if password is strong
 * @ignore
 */
export const strongPassword = (password: string): true | string => {
    const intl = useIntl();
  if (password.length < 14) {
    return intl.formatMessage({
      id: "register.create.input.password.error.too-short"
    });
  }

  if (password.match("[a-z]+") === null) {
    return intl.formatMessage({
      id: "register.create.input.password.error.no-lowercase"
    });
  }

  if (password.match("[A-Z]+") === null) {
    return intl.formatMessage({
      id: "register.create.input.password.error.no-uppercase"
    });
  }

  if (password.match("[0-9]+") === null) {
    return intl.formatMessage({
      id: "register.create.input.password.error.no-number"
    });
  }

  if (password.match("[@_!#$£%^&*()<>?/\\|}{~:]") === null) {
    return intl.formatMessage({
      id: "register.create.input.password.error.no-special-character"
    });
  }
  return true;
};
