import React, { forwardRef, useState } from "react";

import classnames from "classnames";

import {
  FormFeedback,
  FormGroup,
  FormText,
  Input as ReactStrapInput,
  Label
} from "reactstrap";
import { InputType } from "reactstrap/lib/Input";

const Buffer = require("buffer/").Buffer;

import styleInput from "./input.module.scss";

export interface InputProps {
  type: Exclude<InputType, "textarea">;
  label?: string;
  text?: string | React.ReactElement;
  error?: string;
}

// eslint-disable-next-line react/display-name
export const Input = forwardRef<
  HTMLInputElement,
  InputProps & React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const { type, label, text, error } = props;

  const attributes = { ...props };
  delete attributes.className;
  delete attributes.type;
  delete attributes.color;
  delete attributes.label;
  delete attributes.text;
  delete attributes.error;
  delete attributes.children;

  const [inputId] = useState(() => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return `input-${Buffer.from(bytes).toString("hex")}`;
  });

  return (
    <FormGroup>
      {label ? (
        <Label for={inputId} className={styleInput.label}>
          {label}
        </Label>
      ) : null}
      <ReactStrapInput
        id={inputId}
        className={classnames("form-control-alternative", props.className)}
        type={type}
        innerRef={ref}
        invalid={error != null}
        {...attributes}
      />
      {error ? (
        <FormFeedback>{error}</FormFeedback>
      ) : text ? (
        <FormText>{text}</FormText>
      ) : null}
    </FormGroup>
  );
});
