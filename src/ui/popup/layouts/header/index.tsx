import React, { FunctionComponent, ReactNode } from "react";

import { Header as CompHeader } from "../../components/header";

import { observer } from "mobx-react";
import { useStore } from "../../stores";

import style from "./style.module.scss";
import { ToolTip } from "../../../components/tooltip";

import { ChainList } from "./chain-list";
import { Menu, useMenu, MenuButton } from "../menu";

import { motion } from "framer-motion";

export interface Props {
  showChainName: boolean;
  canChangeChainInfo: boolean;
  menuRenderer?: ReactNode;
  rightRenderer?: ReactNode;
  onBackButton?: () => void;
}

export interface LocalProps {
  isMenuOpen: boolean;
}

export const Header: FunctionComponent<Props & LocalProps> = observer(
  ({
    showChainName,
    canChangeChainInfo,
    menuRenderer,
    rightRenderer,
    isMenuOpen,
    onBackButton
  }) => {
    const { chainStore } = useStore();
    const menu = useMenu();

    const chainInfoChangable =
      canChangeChainInfo && chainStore.chainList.length > 1;

    return (
      <CompHeader
        left={
          <div className={style.menuContainer}>
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
              <div
                className={style["menu-img"]}
                onClick={() => {
                  if (onBackButton) {
                    onBackButton();
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path
                    fill="transparent"
                    strokeWidth="2"
                    stroke="hsl(0, 0%, 100%)"
                    strokeLinecap="round"
                    d="M 6.5 10 L 13.5 3.5 M 6.5 10 L 13.5 16.5"
                  />
                </svg>
              </div>
            ) : null}
          </div>
        }
        right={rightRenderer}
      ></CompHeader>
    );
  }
);
