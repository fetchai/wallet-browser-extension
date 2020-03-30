import React, { FunctionComponent, useEffect } from "react";

import { Alert } from "reactstrap";

export interface NotificationElementProps {
  type?:
    | "primary"
    | "link"
    | "info"
    | "success"
    | "warning"
    | "danger"
    | "secondary";
  content: string;
  duration: number; // Seconds
  canDelete?: boolean;
  className?: string;
}

export const NotificationElement: FunctionComponent<NotificationElementProps & {
  onDelete: () => void;
}> = ({ type, content, duration, canDelete, onDelete, className }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDelete();
    }, duration * 1000);
    return () => clearTimeout(timer);
  }, [duration, onDelete]);

  return (
    <Alert
      className={typeof className !== "undefined" ? className : undefined}
      color={typeof className !== "undefined" ? type : undefined}
      fade={false}
      toggle={canDelete ? onDelete : undefined}
    >
      <span className="alert-inner--text">{content}</span>
    </Alert>
  );
};
