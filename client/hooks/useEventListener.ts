import { useEffect, useRef } from 'react';

type PropsType = {
  eventType: any;
  callback: Function;
  element: Window;
};

export default function useEventListener({
  eventType,
  callback,
  element = window,
}: PropsType) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (element == null) return;
    const handler = (e: EventListener) => callbackRef.current(e);
    element.addEventListener(eventType, handler);

    return () => element.removeEventListener(eventType, handler);
  }, [eventType, element]);
}
