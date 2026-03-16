import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";
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
    PopoverContent: ({
      children,
      __popoverOpen,
      __onOpenChange,
      onOpenAutoFocus,
      onCloseAutoFocus,
      onInteractOutside,
      className,
      align,
      sideOffset,
      ...props
    }: any) => {
      if (!__popoverOpen) return null;
      return React.createElement("div", { "data-testid": "popover-content", ...props }, children);
    },
    PopoverAnchor: ({ children, ...props }: any) => {
      return React.createElement("div", props, children);
    },
  };
});

describe("TimeRangePicker", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2024-03-15T12:00:00"));
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
});
