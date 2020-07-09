import React, { FunctionComponent, useEffect } from "react";
import { Button, ButtonGroup, Form } from "reactstrap";
import { Input, TextArea } from "../../../components/form";
import useForm from "react-hook-form";
import style from "./style.module.scss";
import classnames from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { NunWords } from "./index";
import { strongPassword } from "../../../../common/strong-password";
import { EncryptedKeyStructure } from "../../../../background/keyring/crypto";
import { useStore } from "../../stores";
import { mnemonicToAddress } from "../../../../common/utils/mnemonic-to-address";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");

interface FormData {
  words: string;
  password: string;
  confirmPassword: string;
}

/**
 * note: isRecover refers to if the mnemonic is being used to recover privkey or new menmonic to create new privkey
 * where isRegistering refers to if we are registering a new account in a new wallet or else if false then it is in a pre-existing wallet adding an additional address
 *
 *
 */
export const RegisterInPage: FunctionComponent<{
  onRegister: (words: string, password: string, recovered: boolean) => void;
  requestChaneNumWords?: (numWords: NunWords) => void;
  numWords?: NunWords;
  addressList: Array<string>;
  isRecover: boolean;
  isLoading: boolean;
  words: string;
  isRegistering: boolean;
  verifyPassword: (
    password: string,
    keyFile?: EncryptedKeyStructure | null
  ) => Promise<boolean>;
}> = props => {
  const intl = useIntl();
  const { accountStore } = useStore();
  const { isRecover, isRegistering, verifyPassword, addressList } = props;
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    errors,
    clearError
  } = useForm<FormData>({
    defaultValues: {
      words: "",
      password: "",
      confirmPassword: ""
    }
  });

  useEffect(() => {
    if (!isRecover) {
      setValue("words", props.words);
    } else {
      setValue("words", "");
    }
  }, [isRecover, props.words, setValue]);

  return (
    <div>
      <div className={style.title}>
        {isRecover
          ? intl.formatMessage({
              id: "register.recover.title"
            })
          : intl.formatMessage({
              id: "register.create.title"
            })}
        {!isRecover ? (
          <div style={{ float: "right" }}>
            <ButtonGroup size="sm" style={{ marginBottom: "4px" }}>
              <Button
                type="button"
                color={
                  props.numWords === NunWords.WORDS12 ? "primary" : "secondary"
                }
                className={
                  props.numWords === NunWords.WORDS12 ? style.pill : ""
                }
                onClick={() => {
                  if (
                    props.requestChaneNumWords &&
                    props.numWords !== NunWords.WORDS12
                  ) {
                    props.requestChaneNumWords(NunWords.WORDS12);
                  }
                }}
              >
                <FormattedMessage id="register.create.toggle.word12" />
              </Button>
              <Button
                type="button"
                color={props.numWords === NunWords.WORDS24 ? "" : "secondary"}
                className={
                  props.numWords === NunWords.WORDS24 ? style.pill : ""
                }
                onClick={() => {
                  if (
                    props.requestChaneNumWords &&
                    props.numWords !== NunWords.WORDS24
                  ) {
                    props.requestChaneNumWords(NunWords.WORDS24);
                  }
                }}
              >
                <FormattedMessage id="register.create.toggle.word24" />
              </Button>
            </ButtonGroup>
          </div>
        ) : null}
      </div>
      <Form
        className={style.formContainer}
        onSubmit={handleSubmit((data: FormData) => {
          props.onRegister(data.words, data.password, isRecover);
        })}
      >
        <TextArea
          className={classnames(
            style.mnemonic,
            errors.words && errors.words.message
              ? "on-change-remove-error"
              : false
          )}
          placeholder={intl.formatMessage({
            id: "register.create.textarea.mnemonic.place-holder"
          })}
          readOnly={!isRecover}
          name="words"
          rows={props.numWords === NunWords.WORDS24 ? 5 : 3}
          ref={register({
            required: "Mnemonic is required",
            validate: (value: string): string | undefined => {
              if (value.split(" ").length < 8) {
                return intl.formatMessage({
                  id: "register.create.textarea.mnemonic.error.too-short"
                });
              }

              if (!bip39.validateMnemonic(value)) {
                return intl.formatMessage({
                  id: "register.create.textarea.mnemonic.error.invalid"
                });
              }

              const address = mnemonicToAddress(
                value,
                accountStore.chainInfo.bech32Config.bech32PrefixAccAddr
              );
              // if we already have the address in our wallet, it cannot be added again.
              if (!isRegistering && addressList.includes(address)) {
                return intl.formatMessage({
                  id: "register.general.error.address.exists.already"
                });
              }
            }
          })}
          error={errors.words && errors.words.message}
        />
        <Input
          label={
            isRegistering
              ? intl.formatMessage({ id: "register.create.input.password" })
              : intl.formatMessage({
                  id: "register.create.input.password.wallet"
                })
          }
          type="password"
          className={classnames(
            style.password,
            errors.password && errors.password.message
              ? "on-change-remove-error"
              : false
          )}
          onChange={() => {
            clearError(["confirmPassword", "password"]);
          }}
          name="password"
          ref={register({
            required: intl.formatMessage({
              id: "register.create.input.password.error.required"
            }),
            validate: async (password: string): Promise<string | undefined> => {
              // if we are registering then we are adding new pwd so we check it conforms to strength requirement
              if (isRegistering) {
                const strong = strongPassword(password);
                if (strong !== true) {
                  return intl.formatMessage({
                    id: strong
                  });
                }
              } else {
                // if we are not registering we check it is the correct pwd of the wallet
                const correctPassword = await verifyPassword(password);

                if (!correctPassword) {
                  return intl.formatMessage({
                    id: "register.create.input.password.error.incorrect"
                  });
                }

                //
              }
            }
          })}
          error={errors.password && errors.password.message}
        />
        {isRegistering ? (
          <Input
            label={intl.formatMessage({
              id: "register.create.input.confirm-password"
            })}
            type="password"
            className={classnames(style.password)}
            onChange={() => {
              clearError(["confirmPassword", "password"]);
            }}
            name="confirmPassword"
            ref={register({
              required: intl.formatMessage({
                id: "register.create.input.confirm-password.error.required"
              }),
              validate: (confirmPassword: string): string | undefined => {
                if (confirmPassword !== getValues()["password"]) {
                  return intl.formatMessage({
                    id: "register.create.input.confirm-password.error.unmatched"
                  });
                }
              }
            })}
            error={errors.confirmPassword && errors.confirmPassword.message}
          />
        ) : null}

        <Button
          style={{ marginTop: "5px" }}
          className="green"
          type="submit"
          data-loading={props.isLoading}
          block
        >
          <FormattedMessage id="register.create.button.next" />
        </Button>
      </Form>
    </div>
  );
};
