import * as React from "react";

export function useLiveReferenceTime(isLive: boolean | undefined): Date {
  const [liveReferenceTime, setLiveReferenceTime] = React.useState(() => new Date());

  React.useEffect(() => {
    if (!isLive) {
      return;
    }

    const scheduleNextTick = () => {
      const now = new Date();
      const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

      return window.setTimeout(() => {
        setLiveReferenceTime(new Date());

        const intervalId = window.setInterval(() => {
          setLiveReferenceTime(new Date());
        }, 60_000);

        cleanup = () => window.clearInterval(intervalId);
      }, msUntilNextMinute);
    };

    let cleanup = () => {};
    setLiveReferenceTime(new Date());
    const timeoutId = scheduleNextTick();

    return () => {
      window.clearTimeout(timeoutId);
      cleanup();
    };
  }, [isLive]);

  return liveReferenceTime;
}
