import * as React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { TimeRangePicker } from "./time-range-picker";
import type { TimeRange } from "./time-range";

// Mock the Popover to render inline (Radix Portal + Presence don't work in jsdom)
vi.mock("./ui/popover", () => {
  const React = require("react");
  return {
    Popover: ({ children, open, onOpenChange }: any) => {
      return React.createElement(
        "div",
        { "data-testid": "popover-root", "data-open": open },
        React.Children.map(children, (child: any) => {
          if (!child) return null;
          return React.cloneElement(child, { __popoverOpen: open, __onOpenChange: onOpenChange });
        }),
      );
    },
    PopoverTrigger: ({ children, asChild, __popoverOpen, __onOpenChange, ...props }: any) => {
      if (asChild) {
        return React.cloneElement(React.Children.only(children), props);
      }
      return React.createElement("button", props, children);
    },
    PopoverAnchor: ({ children, asChild, __popoverOpen, __onOpenChange, ...props }: any) => {
      if (asChild) {
        return React.cloneElement(React.Children.only(children), props);
      }
      return React.createElement("div", props, children);
    },
    PopoverContent: ({
      children,
      __popoverOpen,
      __onOpenChange,
      onOpenAutoFocus: _onOpenAutoFocus,
      onCloseAutoFocus: _onCloseAutoFocus,
      onInteractOutside: _onInteractOutside,
      className: _className,
      align: _align,
      sideOffset: _sideOffset,
      ...props
    }: any) => {
      if (!__popoverOpen) return null;
      return React.createElement("div", { "data-testid": "popover-content", ...props }, children);
    },
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

describe("TimeRangePicker", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2024-03-15T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("renders with default placeholder", () => {
    render(<TimeRangePicker />);
    expect(screen.getByPlaceholderText("Search time range...")).toBeInTheDocument();
  });

  test("renders with custom placeholder", () => {
    render(<TimeRangePicker placeholder="Pick a time..." />);
    expect(screen.getByPlaceholderText("Pick a time...")).toBeInTheDocument();
  });

  test("opens popover on input focus", async () => {
    render(<TimeRangePicker />);
    const input = screen.getByPlaceholderText("Search time range...");
    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.getByText("Presets")).toBeInTheDocument();
    });
  });

  test("displays presets when popover is open", async () => {
    render(<TimeRangePicker />);
    const input = screen.getByPlaceholderText("Search time range...");
    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.getByText("Past 1 hour")).toBeInTheDocument();
      expect(screen.getByText("Today")).toBeInTheDocument();
      expect(screen.getByText("Yesterday")).toBeInTheDocument();
    });
  });

  test("shows examples section when no input", async () => {
    render(<TimeRangePicker />);
    const input = screen.getByPlaceholderText("Search time range...");
    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.getByText("Examples")).toBeInTheDocument();
      expect(screen.getByText("Try typing:")).toBeInTheDocument();
    });
  });

  test("parses typed input and shows preview", async () => {
    render(<TimeRangePicker />);
    const input = screen.getByPlaceholderText("Search time range...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "3h" } });
    await waitFor(() => {
      expect(screen.getByText("Parsed Result")).toBeInTheDocument();
    });
    expect(screen.getAllByText("3h").length).toBeGreaterThan(0);
  });

  test("filters presets and hides examples once the user types", async () => {
    render(<TimeRangePicker />);
    const input = screen.getByPlaceholderText("Search time range...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "past 30" } });

    await waitFor(() => {
      expect(screen.getByText("Past 30 minutes")).toBeInTheDocument();
      expect(screen.getByText("Past 30 days")).toBeInTheDocument();
    });

    expect(screen.queryByText("Past 1 hour")).not.toBeInTheDocument();
    expect(screen.queryByText("Examples")).not.toBeInTheDocument();
  });

  test("selects a preset and fires onChange", async () => {
    const onChange = vi.fn();
    render(<TimeRangePicker onChange={onChange} />);
    const input = screen.getByPlaceholderText("Search time range...");
    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.getByText("Past 1 hour")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Past 1 hour"));
    expect(onChange).toHaveBeenCalledTimes(1);
    const range = onChange.mock.calls[0][0] as TimeRange;
    expect(range.start).toBeInstanceOf(Date);
    expect(range.end).toBeInstanceOf(Date);
    expect(range.isLive).toBe(true);
  });

  test("Enter key selects parsed result", async () => {
    const onChange = vi.fn();
    render(<TimeRangePicker onChange={onChange} />);
    const input = screen.getByPlaceholderText("Search time range...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "3h" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledTimes(1);
    const range = onChange.mock.calls[0][0] as TimeRange;
    expect(range.isLive).toBe(true);
  });

  test("clicking the input after selection closes the popover reopens the preset list", async () => {
    function ControlledHarness() {
      const [value, setValue] = React.useState<TimeRange | null>(null);
      return <TimeRangePicker value={value} onChange={setValue} />;
    }

    render(<ControlledHarness />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "3h" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(screen.queryByText("Presets")).not.toBeInTheDocument();
    });

    fireEvent.click(input);

    await waitFor(() => {
      expect(screen.getByText("Presets")).toBeInTheDocument();
      expect(screen.getByText("Past 1 hour")).toBeInTheDocument();
    });
  });

  test("selecting a second preset after reopening replaces the previous preset", async () => {
    function ControlledHarness() {
      const [value, setValue] = React.useState<TimeRange | null>(null);
      return <TimeRangePicker value={value} onChange={setValue} />;
    }

    render(<ControlledHarness />);

    const input = screen.getByRole("textbox") as HTMLInputElement;

    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.getByText("Past 1 hour")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Past 1 hour"));

    await waitFor(() => {
      expect(input.placeholder).toBe("11:00 - now");
    });
    expect(screen.getByText("1h")).toBeInTheDocument();

    fireEvent.click(input);

    await waitFor(() => {
      expect(screen.getByText("Past 3 hours")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Past 3 hours"));

    await waitFor(() => {
      expect(input.placeholder).toBe("09:00 - now");
    });
    expect(screen.getByText("3h")).toBeInTheDocument();
    expect(screen.queryByText("1h")).not.toBeInTheDocument();
  });

  test("typing after reopening a selected preset starts from an empty input", async () => {
    function ControlledHarness() {
      const [value, setValue] = React.useState<TimeRange | null>(null);
      return <TimeRangePicker value={value} onChange={setValue} />;
    }

    render(<ControlledHarness />);

    const input = screen.getByRole("textbox") as HTMLInputElement;

    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.getByText("Past 1 hour")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Past 1 hour"));

    await waitFor(() => {
      expect(input.placeholder).toBe("11:00 - now");
    });

    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText("Presets")).toBeInTheDocument();
    });
    expect(input.value).toBe("");

    fireEvent.change(input, { target: { value: "30m" } });

    await waitFor(() => {
      expect(input.value).toBe("30m");
      expect(screen.getByText("Past 30 minutes")).toBeInTheDocument();
    });
    expect(screen.queryByText("Examples")).not.toBeInTheDocument();
  });

  test("blur commits a parsed value after the picker loses focus", async () => {
    const onChange = vi.fn();
    render(<TimeRangePicker onChange={onChange} />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "3h" } });

    await waitFor(() => {
      expect(screen.getByText("Parsed Result")).toBeInTheDocument();
    });

    fireEvent.blur(input);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0]?.[0] as TimeRange).label).toBe("Past 3 hours");
    expect(input.value).toBe("");
  });

  test("blur clears invalid input without committing a value", async () => {
    const onChange = vi.fn();
    render(<TimeRangePicker onChange={onChange} />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "asdfghjkl" } });

    await waitFor(() => {
      expect(screen.getByText(/could not parse/i)).toBeInTheDocument();
    });

    fireEvent.blur(input);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(input.value).toBe("");
  });

  test("does not commit or reset when focus moves within the picker", async () => {
    const onChange = vi.fn();
    render(<TimeRangePicker onChange={onChange} />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "3h" } });

    await waitFor(() => {
      expect(screen.getByText("Past 3 hours")).toBeInTheDocument();
    });

    const presetButton = screen.getByText("Past 3 hours");
    fireEvent.blur(input, { relatedTarget: presetButton });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(input.value).toBe("3h");
  });

  test("Escape key closes popover", async () => {
    render(<TimeRangePicker />);
    const input = screen.getByPlaceholderText("Search time range...");
    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.getByText("Presets")).toBeInTheDocument();
    });
    fireEvent.keyDown(input, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByText("Presets")).not.toBeInTheDocument();
    });
  });

  test("clear button resets value", async () => {
    const onChange = vi.fn();
    const value: TimeRange = {
      start: new Date("2024-03-15T11:30:00"),
      end: new Date("2024-03-15T14:30:00"),
      isLive: true,
    };
    render(<TimeRangePicker value={value} onChange={onChange} />);
    const clearButton = screen.getByRole("button", { name: /clear selection/i });
    fireEvent.click(clearButton);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  test("shows duration badge when range is selected", () => {
    const value: TimeRange = {
      start: new Date("2024-03-15T11:30:00"),
      end: new Date("2024-03-15T14:30:00"),
      isLive: false,
    };
    render(<TimeRangePicker value={value} />);
    expect(screen.getByText("3h")).toBeInTheDocument();
  });

  test("selected preset value shows full range in the input instead of preset label", () => {
    const value: TimeRange = {
      start: new Date("2024-03-15T09:30:00"),
      end: new Date("2024-03-15T12:30:00"),
      label: "Past 3 hours",
      isLive: true,
      liveRange: { mode: "relative", duration: { value: 3, unit: "hour" } },
    };
    render(<TimeRangePicker value={value} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.placeholder).toBe("09:00 - now");
    expect(screen.getByText("3h")).toBeInTheDocument();
  });

  test("relative live ranges update their displayed window over time", () => {
    const value: TimeRange = {
      start: new Date("2024-03-15T11:30:00"),
      end: new Date("2024-03-15T12:00:00"),
      label: "Past 30 minutes",
      isLive: true,
      liveRange: { mode: "relative", duration: { value: 30, unit: "minute" } },
    };
    render(<TimeRangePicker value={value} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.placeholder).toBe("11:30 - now");

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(input.placeholder).toBe("11:31 - now");
    expect(screen.getByText("30 min")).toBeInTheDocument();
  });

  test("pause button freezes a live range into a static snapshot", () => {
    const onChange = vi.fn();
    const value: TimeRange = {
      start: new Date("2024-03-15T11:30:00"),
      end: new Date("2024-03-15T12:00:00"),
      label: "Past 30 minutes",
      isLive: true,
      liveRange: { mode: "relative", duration: { value: 30, unit: "minute" } },
    };

    render(<TimeRangePicker value={value} onChange={onChange} />);

    const pauseButton = screen.getByRole("button", { name: /pause live range/i });
    fireEvent.click(pauseButton);

    expect(onChange).toHaveBeenCalledTimes(1);
    const nextValue = onChange.mock.calls[0][0] as TimeRange;
    expect(nextValue.isLive).toBe(false);
    expect(nextValue.liveRange).toBeUndefined();
    expect(nextValue.start.getTime()).toBe(new Date("2024-03-15T11:30:00").getTime());
    expect(nextValue.end.getTime()).toBe(new Date("2024-03-15T12:00:00").getTime());
  });

  test("shift backward button moves a static range by its current duration", () => {
    const onChange = vi.fn();
    const value: TimeRange = {
      mode: "static",
      start: new Date("2024-03-15T11:00:00"),
      end: new Date("2024-03-15T12:30:00"),
      isLive: false,
    };

    render(<TimeRangePicker value={value} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /shift range backward/i }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const nextValue = onChange.mock.calls[0][0] as TimeRange;
    expect(nextValue.mode).toBe("static");
    expect(nextValue.isLive).toBe(false);
    expect(nextValue.start.getTime()).toBe(new Date("2024-03-15T09:30:00").getTime());
    expect(nextValue.end.getTime()).toBe(new Date("2024-03-15T11:00:00").getTime());
  });

  test("shift backward button pauses and moves a live range by its resolved duration", () => {
    const onChange = vi.fn();
    const value: TimeRange = {
      mode: "live",
      start: new Date("2024-03-15T11:30:00"),
      end: new Date("2024-03-15T12:00:00"),
      label: "Past 30 minutes",
      isLive: true,
      liveRange: { mode: "relative", duration: { value: 30, unit: "minute" } },
    };

    render(<TimeRangePicker value={value} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /shift range backward/i }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const nextValue = onChange.mock.calls[0][0] as TimeRange;
    expect(nextValue.mode).toBe("static");
    expect(nextValue.isLive).toBe(false);
    expect(nextValue.start.getTime()).toBe(new Date("2024-03-15T11:00:00").getTime());
    expect(nextValue.end.getTime()).toBe(new Date("2024-03-15T11:30:00").getTime());
  });

  test("shift forward button is disabled when the next window would exceed now", () => {
    const onChange = vi.fn();
    const value: TimeRange = {
      mode: "live",
      start: new Date("2024-03-15T11:30:00"),
      end: new Date("2024-03-15T12:00:00"),
      label: "Past 30 minutes",
      isLive: true,
      liveRange: { mode: "relative", duration: { value: 30, unit: "minute" } },
    };

    render(<TimeRangePicker value={value} onChange={onChange} />);

    const forwardButton = screen.getByRole("button", { name: /shift range forward/i });
    expect(forwardButton).toBeDisabled();

    fireEvent.click(forwardButton);
    expect(onChange).not.toHaveBeenCalled();
  });

  test("shift forward button advances a historical range until it reaches now", () => {
    const onChange = vi.fn();
    const value: TimeRange = {
      mode: "static",
      start: new Date("2024-03-15T11:00:00"),
      end: new Date("2024-03-15T11:30:00"),
      isLive: false,
    };

    render(<TimeRangePicker value={value} onChange={onChange} />);

    const forwardButton = screen.getByRole("button", { name: /shift range forward/i });
    expect(forwardButton).toBeEnabled();

    fireEvent.click(forwardButton);

    const nextValue = onChange.mock.calls[0][0] as TimeRange;
    expect(nextValue.mode).toBe("static");
    expect(nextValue.isLive).toBe(false);
    expect(nextValue.start.getTime()).toBe(new Date("2024-03-15T11:30:00").getTime());
    expect(nextValue.end.getTime()).toBe(new Date("2024-03-15T12:00:00").getTime());
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

  test("controlled mode reflects external value changes", () => {
    const value: TimeRange = {
      start: new Date("2024-03-15T11:30:00"),
      end: new Date("2024-03-15T14:30:00"),
      isLive: false,
    };
    const { rerender } = render(<TimeRangePicker value={value} />);
    expect(screen.getByText("3h")).toBeInTheDocument();

    const newValue: TimeRange = {
      start: new Date("2024-03-15T00:00:00"),
      end: new Date("2024-03-15T23:59:59"),
      isLive: false,
    };
    rerender(<TimeRangePicker value={newValue} />);
    expect(screen.queryByText("3h")).not.toBeInTheDocument();
  });

  test("focusing a selected value keeps the input empty and shows all presets", async () => {
    const value: TimeRange = {
      start: new Date("2024-03-15T09:30:00"),
      end: new Date("2024-03-15T12:30:00"),
      isLive: true,
      liveRange: { mode: "relative", duration: { value: 3, unit: "hour" } },
    };

    render(<TimeRangePicker value={value} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;

    expect(input.value).toBe("");
    expect(input.placeholder).toBe("09:00 - now");

    act(() => {
      input.focus();
    });

    await waitFor(() => {
      expect(screen.getByText("Presets")).toBeInTheDocument();
    });

    expect(input.value).toBe("");
    expect(screen.getByText("Past 1 hour")).toBeInTheDocument();
    expect(screen.getByText("Examples")).toBeInTheDocument();
  });

  test("focused controlled input keeps placeholder in sync with external value updates", async () => {
    const initialValue: TimeRange = {
      start: new Date("2024-03-15T11:30:00"),
      end: new Date("2024-03-15T14:30:00"),
      isLive: false,
    };
    const nextValue: TimeRange = {
      start: new Date("2024-03-15T09:00:00"),
      end: new Date("2024-03-15T10:00:00"),
      isLive: false,
    };

    const { rerender } = render(<TimeRangePicker value={initialValue} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;

    act(() => {
      input.focus();
    });

    expect(document.activeElement).toBe(input);

    expect(input.value).toBe("");
    expect(input.placeholder).toBe("Today, 11:30 - 14:30");

    rerender(<TimeRangePicker value={nextValue} />);

    await waitFor(() => {
      expect(input.placeholder).toBe("Today, 09:00 - 10:00");
    });

    expect(input.value).toBe("");
  });

  test("invalid input shows no results message", async () => {
    render(<TimeRangePicker />);
    const input = screen.getByPlaceholderText("Search time range...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "asdfghjkl" } });
    await waitFor(() => {
      expect(screen.getByText(/could not parse/i)).toBeInTheDocument();
    });
  });

  test("12h clock format changes display", () => {
    const value: TimeRange = {
      start: new Date("2024-03-15T14:00:00"),
      end: new Date("2024-03-15T16:30:00"),
      isLive: false,
    };
    const { rerender } = render(<TimeRangePicker value={value} clockFormat="24h" />);
    const input24 = screen.getByRole("textbox") as HTMLInputElement;
    expect(input24.placeholder).toContain("14:00");

    rerender(<TimeRangePicker value={value} clockFormat="12h" />);
    const input12 = screen.getByRole("textbox") as HTMLInputElement;
    expect(input12.placeholder).toContain("2:00 PM");
  });

  test("renders custom examples", async () => {
    render(<TimeRangePicker examples={["business hours", "past quarter"]} />);
    const input = screen.getByPlaceholderText("Search time range...");
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText("business hours")).toBeInTheDocument();
      expect(screen.getByText("past quarter")).toBeInTheDocument();
    });
  });

  test("uses custom presets when defaults are disabled", async () => {
    const onChange = vi.fn();
    render(
      <TimeRangePicker
        onChange={onChange}
        includeDefaultPresets={false}
        presets={[
          {
            label: "Business hours",
            value: "business hours",
            getRange: (referenceDate = new Date("2024-03-15T12:00:00")) => ({
              mode: "static",
              start: new Date("2024-03-15T09:00:00"),
              end: new Date("2024-03-15T17:00:00"),
              label: "Business hours",
              isLive: false,
            }),
            getHint: () => "09:00 - 17:00",
          },
        ]}
      />,
    );

    const input = screen.getByPlaceholderText("Search time range...");
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText("Business hours")).toBeInTheDocument();
      expect(screen.queryByText("Past 1 hour")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Business hours"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test("merges custom presets with the defaults by default", async () => {
    render(
      <TimeRangePicker
        presets={[
          {
            label: "Business hours",
            value: "business hours",
            shortcut: "biz",
            getRange: () => ({
              mode: "static",
              start: new Date("2024-03-15T09:00:00"),
              end: new Date("2024-03-15T17:00:00"),
              label: "Business hours",
              isLive: false,
            }),
            getHint: () => "09:00 - 17:00",
          },
        ]}
      />,
    );

    const input = screen.getByRole("textbox");
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText("Business hours")).toBeInTheDocument();
      expect(screen.getByText("Past 1 hour")).toBeInTheDocument();
    });

    fireEvent.change(input, { target: { value: "biz" } });

    await waitFor(() => {
      expect(screen.getByText("Business hours")).toBeInTheDocument();
    });

    expect(screen.queryByText("Past 1 hour")).not.toBeInTheDocument();
  });

  test("omits the preset section when default and custom presets are disabled", async () => {
    render(<TimeRangePicker includeDefaultPresets={false} presets={[]} />);

    const input = screen.getByRole("textbox");
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText("Examples")).toBeInTheDocument();
    });

    expect(screen.queryByText("Presets")).not.toBeInTheDocument();
  });
});
