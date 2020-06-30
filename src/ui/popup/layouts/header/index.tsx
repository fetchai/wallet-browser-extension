import React, { FunctionComponent, ReactNode, useEffect } from "react";

import { Header as CompHeader } from "../../components/header";

import { observer } from "mobx-react";
import style from "./style.module.scss";
import { Menu, MenuButton, useMenu } from "../menu";

import { motion } from "framer-motion";
import { BackButton } from "./back-button";

export interface Props {
  canChangeChainInfo: boolean;
  menuRenderer?: ReactNode;
  rightRenderer?: ReactNode;
  onBackButton?: () => void;
  fetchIcon?: boolean;
  lightMode: boolean;
}

export interface LocalProps {
  isMenuOpen: boolean;
}

export const Header: FunctionComponent<Props & LocalProps> = observer(
  ({
    menuRenderer,
    rightRenderer,
    isMenuOpen,
    onBackButton,
    fetchIcon,
    lightMode
  }) => {
    const menu = useMenu();

    useEffect(() => {
      console.log("counter updated");
    }, [lightMode]);

    return (
      <CompHeader
        left={
          <div className={style.menuContainer}>
            {fetchIcon ? (
              <>
                <div className={style.logo}>
                  <img
                    src={
                      lightMode
                        ? require("../../public/assets/fetch-logo-black.svg")
                        : require("../../public/assets/fetch-logo.svg")
                    }
                    alt="Fetch.ai's Logo"
                  ></img>
                </div>
              </>
            ) : null}
            {menuRenderer ? (
              <>
                <Menu isOpen={isMenuOpen}>{menuRenderer}</Menu>
                <motion.div
                  className={style["menu-img"]}
                  style={{ zIndex: 901 }}
                  animate={isMenuOpen ? "open" : "closed"}
                  onClick={menu.toggle}
                >
                  <MenuButton />
                </motion.div>
              </>
            ) : null}
            {onBackButton ? (
              <BackButton
                stroke={4}
                onClick={() => {
                  if (onBackButton) {
                    onBackButton();
                  }
                }}
              />
            ) : null}
          </div>
        }
        right={rightRenderer}
      ></CompHeader>
    );
  }
);
