import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from "react";
import { EmptyLayout } from "../../layouts/empty-layout";
import { RegisterInPage } from "./register";
import { VerifyInPage } from "./verify";
import classnames from "classnames";
import { observer } from "mobx-react";
import { useStore } from "../../stores";
import { IntroInPage } from "./intro";
import style from "./style.module.scss";
import { Button } from "reactstrap";
import { KeyRingStore } from "../../stores/keyring";
import { WelcomeInPage } from "./welcome";
import { FormattedMessage, useIntl } from "react-intl";
import Upload from "./upload";
import { Hardware } from "./hardware";
import { LedgerNanoMsg } from "../../../../background/ledger-nano";
import { METHODS } from "../../../../background/ledger-nano/constants";
import { BACKGROUND_PORT } from "../../../../common/message/constant";
import { sendMessage } from "../../../../common/message/send";
import { SuccessPage } from "./successPage";

export enum RegisterState {
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

interface NewAddressWizardProps {
  isRegistering: boolean;
  initialRegisterState?: RegisterState;
}

export const AddAddressWizard: FunctionComponent<NewAddressWizardProps> = observer(
  ({ isRegistering, initialRegisterState = null }) => {
    const [state, setState] = useState<RegisterState>(
      determineInitialState(initialRegisterState)
    );
    const { accountStore } = useStore();

    const [accountIsCreating, setAccountIsCreating] = useState(false);
    const [words, setWords] = useState("");
    const [numWords, setNumWords] = useState<NunWords>(NunWords.WORDS12);
    const [password, setPassword] = useState("");
    const [hardwareErrorMessage, setHardwareErrorMessage] = useState("");
    const [address, setAddress] = useState("");
    const [wizardComplete, setWizardComplete] = useState(false);
    const [addressList, setAddressList] = useState<Array<string>>([]);

    // on mount we fetch all addresses if they are logged in. this list is then passed into whichever method they use to recover an account and
    // is checked against to make sure that we do not register the same address twice
    useEffect(() => {
      // we fetch all addresses
      const fetchEveryAddress = async () => {
        const everyAddress = await accountStore.fetchEveryAddress();
        setAddressList(everyAddress);
      };
      fetchEveryAddress();
    }, []);

    /**
     * If the page is being shown from the address book then we will want to skip the initial page and go directly to the upload page,
     *  or the create page so we set the initial state from the constructor else we start from the begining of this wizard
     *
     * @param initialRegisterState
     */
    function determineInitialState(initialRegisterState: RegisterState | null) {
      let initialState;
      if (initialRegisterState !== null) {
        initialState = initialRegisterState;
      } else {
        initialState = RegisterState.INIT;
      }
      return initialState;
    }

    /**
     * note: fails silently; used only to get load address early from nano so if logged in the next page loads faster
     */
    const getAddressFromNano = async (): Promise<string> => {
      const msg = LedgerNanoMsg.create(METHODS.getCosmosAddress);
      const address = await sendMessage(BACKGROUND_PORT, msg);

      return typeof address.errorMessage === "undefined"
        ? (address.result as string)
        : "";
    };

    const readyToRegisterThroughHardwareWallet = async (): Promise<boolean> => {
      let error = false;
      debugger;
      const msg = LedgerNanoMsg.create(METHODS.isSupportedVersion);
      const result = await sendMessage(BACKGROUND_PORT, msg);

      if (typeof result.errorMessage !== "undefined") {
        error = true;
        // if the hardware error message is one in particular that is wierd that looks like a bug/type we cut off part of it
        if (
          result.errorMessage.includes(
            "Ledger Device is busy (lock getVersion)"
          )
        ) {
          debugger;
          result.errorMessage = result.errorMessage.split(" (lock")[0];
        }

        setHardwareErrorMessage(result.errorMessage);
      }

      return !error;
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
        setWizardComplete(true);
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
        setWizardComplete(true);
      },
      [keyRingStore]
    );

    const onRegister = useCallback(
      async (
        _words: string,
        password: string,
        recovered: boolean
      ): Promise<void> => {
        if (!recovered) {
          if (words !== _words) {
            throw new Error("Unexpected error");
          }
          setPassword(password);
          setState(RegisterState.VERIFY);
        } else {
          await register(_words, password);
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
    // initialize it to something

    if (words === "") {
      generateMnemonic(numWords);
    }

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
      setHardwareErrorMessage("");
      setState(RegisterState.INIT);
    }, []);

    const onBackToChooseRecoverMethod = useCallback(() => {
      setHardwareErrorMessage("");
      setState(RegisterState.RECOVERY_CHOICE);
    }, []);

    const onBackToRegister = useCallback(() => {
      setHardwareErrorMessage("");
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
        {wizardComplete && isRegistering ? <WelcomeInPage /> : null}
        {wizardComplete && !isRegistering ? <SuccessPage /> : null}
        {!wizardComplete && state === RegisterState.INIT ? (
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
                setHardwareErrorMessage("");
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
                setHardwareErrorMessage("");
                setState(RegisterState.RECOVERY_CHOICE);
              }
            }}
          />
        ) : null}
        {!wizardComplete && state === RegisterState.RECOVERY_CHOICE ? (
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
                  setHardwareErrorMessage("");
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
                  const hasHardwareWallet = await readyToRegisterThroughHardwareWallet();
                  if (hasHardwareWallet) {
                    const cosmosAddress = await getAddressFromNano();
                    setAddress(cosmosAddress);
                    setState(RegisterState.HARDWARE_UPLOAD);
                    setHardwareErrorMessage("");
                  }
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
                  setHardwareErrorMessage("");
                  setState(RegisterState.UPLOAD);
                }
              }}
            />
            {isRegistering ? <BackButton onClick={onBackToInit} /> : null}
          </>
        ) : null}
        {!wizardComplete && state === RegisterState.UPLOAD ? (
          <>
            <Upload
              onRegister={onRegister}
              getMnemonic={keyRingStore.getMnemonic}
              verifyPassword={keyRingStore.verifyPassword}
              isRegistering={isRegistering}
              addressList={addressList}
            />
            <BackButton onClick={onBackToChooseRecoverMethod} />
          </>
        ) : null}{" "}
        {!wizardComplete && state === RegisterState.HARDWARE_UPLOAD ? (
          <>
            <Hardware
              onRegister={registerFromHarwareWallet}
              isRegistering={isRegistering}
              verifyPassword={keyRingStore.verifyPassword}
              propsAddress={address}
            />
            <BackButton onClick={onBackToChooseRecoverMethod} />
          </>
        ) : null}{" "}
        {!wizardComplete && state === RegisterState.REGISTER ? (
          <>
            <RegisterInPage
              onRegister={onRegister}
              requestChaneNumWords={numWords => {
                setNumWords(numWords);
                generateMnemonic(numWords);
              }}
              addressList={addressList}
              numWords={numWords}
              words={words}
              isRecover={false}
              isLoading={accountIsCreating}
              isRegistering={isRegistering}
              verifyPassword={keyRingStore.verifyPassword}
            />
            {isRegistering ? <BackButton onClick={onBackToInit} /> : null}
          </>
        ) : null}
        {!wizardComplete && state === RegisterState.RECOVER ? (
          <>
            <RegisterInPage
              addressList={addressList}
              onRegister={onRegister}
              words={words}
              isRecover={true}
              isLoading={accountIsCreating}
              isRegistering={isRegistering}
              verifyPassword={keyRingStore.verifyPassword}
            />
            <BackButton onClick={onBackToChooseRecoverMethod} />
          </>
        ) : null}
        {!wizardComplete && state === RegisterState.VERIFY ? (
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
  }
);
