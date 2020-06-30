import { useEffect, useState } from "react";

import {
  ApproveSignMsg,
  GetRequestedMessage,
  RejectSignMsg
} from "../../background/keyring";
import { sendMessage } from "../../common/message";
import { BACKGROUND_PORT } from "../../common/message/constant";

/**
 * useSignature hook returns the object related to cosmosjs's signature system.
 * This will not make a state transaction after unmounted.
 * `initiailizing` means if message is initializing.
 * `message` is the initialized message.
 * `loading` means if approving or rejecting is requesting.
 * `error` is the thrown error during approving or rejecting.
 * @param id Id of requested signing.
 */
export const useSignature = (
  id: string,
) => {
  const [initializing, setInitializing] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (isMounted) {
        setInitializing(true);
      }

      const msg = GetRequestedMessage.create(id);
      try {
        const result = await sendMessage(BACKGROUND_PORT, msg);

        const message = Buffer.from(result.messageHex, "hex").toString();

        if (isMounted) {
          setMessage(message);
        }
      } catch (e) {
        if (isMounted) {
          setMessage("");
        }
      } finally {
        if (isMounted) {
          setInitializing(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const [approve, setApprove] = useState<(() => Promise<void>) | undefined>(
    undefined
  );
  const [reject, setReject] = useState<(() => Promise<void>) | undefined>(
    undefined
  );

  useEffect(() => {
    let isMounted = true;
    if (loading) {
      setLoading(false);
    }
    if (requested) {
      setRequested(false);
    }

    const appove = async () => {
      if (isMounted) {
        setLoading(true);
        setRequested(true);
      }

      try {
        const msg = ApproveSignMsg.create(id);
        await sendMessage(BACKGROUND_PORT, msg);
      } catch (e) {
        if (isMounted) {
          setError(e);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const reject = async () => {
      if (isMounted) {
        setLoading(true);
        setRequested(true);
      }

      try {
        const msg = RejectSignMsg.create(id);
        await sendMessage(BACKGROUND_PORT, msg);
      } catch (e) {
        if (isMounted) {
          setError(e);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    setApprove(() => appove);
    setReject(() => reject);

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return {
    id,
    initializing,
    message,
    loading,
    requested,
    error,
    approve,
    reject
  };
};
