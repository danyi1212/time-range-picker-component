import * as React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { TimeRangePicker } from "./time-range-picker";
import type { TimeRange } from "./time-range";

vi.mock("./ui/popover", () => {
  const React = require("react");
  return {
    Popover: ({ children, open, onOpenChange }: any) =>
      React.createElement(
        "div",
        { "data-testid": "popover-root", "data-open": open },
        React.Children.map(children, (child: any) => {
          if (!child) return null;
          return React.cloneElement(child, { __popoverOpen: open, __onOpenChange: onOpenChange });
        }),
      ),
    PopoverAnchor: ({ children, asChild, __popoverOpen, __onOpenChange, ...props }: any) =>
      asChild
        ? React.cloneElement(React.Children.only(children), props)
        : React.createElement("div", props, children),
    PopoverContent: ({ children, __popoverOpen, ...props }: any) =>
      __popoverOpen ? React.createElement("div", props, children) : null,
  };
});

vi.mock("./ui/tooltip", () => {
  const React = require("react");
  return {
    Tooltip: ({ children }: any) => React.createElement(React.Fragment, null, children),
    TooltipTrigger: ({ children, asChild }: any) =>
      asChild ? React.Children.only(children) : React.createElement("span", null, children),
    TooltipContent: ({ children }: any) =>
      React.createElement("div", { "data-testid": "tooltip-content" }, children),
  };
});

describe("TimeRangePicker controls", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2024-03-15T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("can hide shift controls and the pause control independently", () => {
    const value: TimeRange = {
      mode: "live",
      start: new Date("2024-03-15T11:30:00"),
      end: new Date("2024-03-15T12:00:00"),
      isLive: true,
      liveRange: { mode: "relative", duration: { value: 30, unit: "minute" } },
    };

    const { rerender } = render(
      <TimeRangePicker value={value} showShiftControls={false} showPauseControl={false} />,
    );

    expect(screen.queryByRole("button", { name: /shift range backward/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /shift range forward/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /pause live range/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /clear selection/i })).toBeInTheDocument();

    rerender(<TimeRangePicker value={value} showShiftControls={false} showPauseControl />);

    expect(screen.queryByRole("button", { name: /shift range backward/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /shift range forward/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pause live range/i })).toBeInTheDocument();
  });

  test("supports custom control tooltips", () => {
    const value: TimeRange = {
      mode: "live",
      start: new Date("2024-03-15T11:30:00"),
      end: new Date("2024-03-15T12:00:00"),
      isLive: true,
      liveRange: { mode: "relative", duration: { value: 30, unit: "minute" } },
    };

    const { rerender } = render(
      <TimeRangePicker
        value={value}
        controlLabels={{
          shiftBackward: (duration) => `Back ${duration}`,
          shiftForward: (duration) => `Forward ${duration}`,
          pause: "Pause updates",
          cannotShiftForward: "At live edge",
        }}
      />,
    );

    expect(screen.getByText("Back 30 min")).toBeInTheDocument();
    expect(screen.getByText("Pause updates")).toBeInTheDocument();
    expect(screen.getByText("At live edge")).toBeInTheDocument();

    rerender(
      <TimeRangePicker
        value={{
          mode: "static",
          start: new Date("2024-03-15T10:30:00"),
          end: new Date("2024-03-15T11:00:00"),
          isLive: false,
        }}
        controlLabels={{ shiftForward: (duration) => `Forward ${duration}` }}
      />,
    );

    expect(screen.getByText("Forward 30 min")).toBeInTheDocument();
  });
});
