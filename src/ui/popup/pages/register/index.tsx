import React, { FunctionComponent, useCallback, useState } from "react";
import { EmptyLayout } from "../../layouts/empty-layout";
import { RegisterInPage } from "./register";
import { VerifyInPage } from "./verify";
import classnames from "classnames";
import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { IntroInPage } from "./intro";
import style from "./style.module.scss";
import { KeyRingStatus } from "../../../../background/keyring";
import { Button } from "reactstrap";
import { KeyRingStore } from "../../stores/keyring";
import { WelcomeInPage } from "./welcome";
import { FormattedMessage, useIntl } from "react-intl";
import Recover from "./upload";
import { Hardware } from "./hardware";
import Ledger from "@lunie/cosmos-ledger/lib/cosmos-ledger";

enum RegisterState {
  INIT,
  REGISTER,
  RECOVERY_CHOICE,
  UPLOAD,
  HARDWARE_UPLOAD,
  RECOVER,
  VERIFY
}

export enum NunWords {
  WORDS12,
  WORDS24
}

const BackButton: FunctionComponent<{ onClick: () => void }> = ({
  onClick
}) => {
  return (
    <div className={style.backButton}>
      <Button color="link" onClick={onClick}>
        <i className="fas fa-angle-left" style={{ marginRight: "8px" }} />
        <FormattedMessage id="register.button.back" />
      </Button>
    </div>
  );
};

export const RegisterPage: FunctionComponent = observer(() => {
  const [state, setState] = useState<RegisterState>(RegisterState.INIT);
  const [accountIsCreating, setAccountIsCreating] = useState(false);
  const [words, setWords] = useState("");
  const [numWords, setNumWords] = useState<NunWords>(NunWords.WORDS12);
  const [password, setPassword] = useState("");
  const [hardwareErrorMessage, setHardwareErrorMessage] = useState("");

  const RegisterThroughHardwareWallet = async () => {
    const ledger = new Ledger();

    let error = false;
    await ledger.connect().catch(err => {
      error = true;
      setHardwareErrorMessage(err.message);
    });

    return error ? false : true;
  };

  const intl = useIntl();
  const { keyRingStore } = useStore();

  const register = useCallback(
    async (words: string, password: string) => {
      setAccountIsCreating(true);
      try {
        await keyRingStore.createKey(words, password);
        await keyRingStore.save();
      } finally {
        setAccountIsCreating(false);
      }
    },
    [keyRingStore]
  );

  const registerFromHarwareWallet = useCallback(
    async (publicKeyHex: string, password: string) => {
      setAccountIsCreating(true);
      try {
        await keyRingStore.createHardwareKey(publicKeyHex, password);
        await keyRingStore.save();
      } finally {
        setAccountIsCreating(false);
      }
    },
    [keyRingStore]
  );

  const onRegister = useCallback(
    (_words: string, password: string, recovered: boolean): void => {
      if (!recovered) {
        if (words !== _words) {
          throw new Error("Unexpected error");
        }
        setPassword(password);
        setState(RegisterState.VERIFY);
      } else {
        register(_words, password);
      }
    },
    [register, words]
  );

  const generateMnemonic = useCallback((numWords: NunWords) => {
    switch (numWords) {
      case NunWords.WORDS12:
        setWords(KeyRingStore.GenereateMnemonic(128));
        break;
      case NunWords.WORDS24:
        setWords(KeyRingStore.GenereateMnemonic(256));
        break;
      default:
        throw new Error("Invalid num words");
    }
  }, []);

  const onVerify = useCallback(
    async (_words: string) => {
      if (words !== _words) {
        throw new Error("Unexpected error");
      }
      await register(_words, password);
    },
    [register, password, words]
  );

  const onBackToInit = useCallback(() => {
    setState(RegisterState.INIT);
  }, []);

  const onBackToChooseRecoverMethod = useCallback(() => {
    setState(RegisterState.RECOVERY_CHOICE);
  }, []);

  const onBackToRegister = useCallback(() => {
    setState(RegisterState.REGISTER);
  }, []);

  return (
    <EmptyLayout
      className={classnames(style.container)}
      style={{ height: "100%", padding: 0 }}
    >
      <div>
        <img
          className={style.logo}
          src={require("../../public/assets/fetch-logo.svg")}
          alt="logo"
        />
      </div>
      {keyRingStore.status !== KeyRingStatus.NOTLOADED &&
      keyRingStore.status !== KeyRingStatus.EMPTY ? (
        <WelcomeInPage />
      ) : null}
      {keyRingStore.status === KeyRingStatus.EMPTY &&
      state === RegisterState.INIT ? (
        <IntroInPage
          topButton={{
            title: intl.formatMessage({
              id: "register.intro.button.new-account.title"
            }),
            content: intl.formatMessage({
              id: "register.intro.button.new-account.content"
            }),
            onClick: () => {
              generateMnemonic(numWords);
              setState(RegisterState.REGISTER);
            }
          }}
          bottomButton={{
            title: intl.formatMessage({
              id: "register.intro.button.import-account.title"
            }),
            content: intl.formatMessage({
              id: "register.intro.button.import-account.content"
            }),
            onClick: () => {
              setState(RegisterState.RECOVERY_CHOICE);
            }
          }}
        />
      ) : null}
      {keyRingStore.status === KeyRingStatus.EMPTY &&
      state === RegisterState.RECOVERY_CHOICE ? (
        <>
          <IntroInPage
            topButton={{
              title: intl.formatMessage({
                id: "register.intro.button.recover-choice.menumonic.title"
              }),
              content: intl.formatMessage({
                id: "register.intro.button.recover-choice.menumonic.content"
              }),
              onClick: () => {
                generateMnemonic(numWords);
                setState(RegisterState.RECOVER);
              }
            }}
            middleButton={{
              title: intl.formatMessage({
                id: "register.intro.button.recover-choice.hardware.title"
              }),
              content: intl.formatMessage({
                id: "register.intro.button.recover-choice.hardware.content"
              }),
              errorMessage: hardwareErrorMessage,
              onClick: async () => {
                const hasHardwareWallet = await RegisterThroughHardwareWallet();
                if (hasHardwareWallet) setState(RegisterState.HARDWARE_UPLOAD);
                debugger;
              }
            }}
            bottomButton={{
              title: intl.formatMessage({
                id: "register.intro.button.recover-choice.file.content"
              }),
              content: intl.formatMessage({
                id: "register.intro.button.recover-choice.file.title"
              }),
              onClick: () => {
                setState(RegisterState.UPLOAD);
              }
            }}
          />
          <BackButton onClick={onBackToInit} />
        </>
      ) : null}
      {keyRingStore.status === KeyRingStatus.EMPTY &&
      state === RegisterState.UPLOAD ? (
        <>
          <Recover
            onRegister={onRegister}
            getMneumonic={keyRingStore.getMneumonic}
            verifyPassword={keyRingStore.verifyPassword}
          />
          <BackButton onClick={onBackToChooseRecoverMethod} />
        </>
      ) : null}{" "}
      {keyRingStore.status === KeyRingStatus.EMPTY &&
      state === RegisterState.HARDWARE_UPLOAD ? (
        <>
          <Hardware onRegister={registerFromHarwareWallet} />
          <BackButton onClick={onBackToChooseRecoverMethod} />
        </>
      ) : null}{" "}
      {keyRingStore.status === KeyRingStatus.EMPTY &&
      state === RegisterState.REGISTER ? (
        <>
          <RegisterInPage
            onRegister={onRegister}
            requestChaneNumWords={numWords => {
              setNumWords(numWords);
              generateMnemonic(numWords);
            }}
            numWords={numWords}
            words={words}
            isRecover={false}
            isLoading={accountIsCreating}
          />
          <BackButton onClick={onBackToInit} />
        </>
      ) : null}
      {keyRingStore.status === KeyRingStatus.EMPTY &&
      state === RegisterState.RECOVER ? (
        <>
          <RegisterInPage
            onRegister={onRegister}
            words={words}
            isRecover={true}
            isLoading={accountIsCreating}
          />
          <BackButton onClick={onBackToChooseRecoverMethod} />
        </>
      ) : null}
      {keyRingStore.status === KeyRingStatus.EMPTY &&
      state === RegisterState.VERIFY ? (
        <>
          <VerifyInPage
            words={words}
            onVerify={onVerify}
            isLoading={accountIsCreating}
          />
          <BackButton onClick={onBackToRegister} />
        </>
      ) : null}
    </EmptyLayout>
  );
});
