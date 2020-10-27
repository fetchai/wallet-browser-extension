/**
 * Checks that a password is of sufficient length and contains all character classes
 * @param  {String} password plaintext password
 * @returns {Boolean} True if password is strong
 * @ignore
 */
export const strongPassword = (password: string): true | string => {
  if (password.length < 8)
    return "register.create.input.password.error.too-short";
  if (password.match("[a-z]+") === null)
    return "register.create.input.password.error.no-lowercase";
  if (password.match("[A-Z]+") === null)
    return "register.create.input.password.error.no-uppercase";
  return true;
};
