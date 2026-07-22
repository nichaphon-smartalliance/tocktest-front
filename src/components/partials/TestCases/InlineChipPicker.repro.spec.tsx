import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Bot } from "lucide-react";
import { Dropdown, ListBox, Popover, Tooltip, Select } from "@heroui/react";
import { InlineChipPicker } from "./InlineChipPicker";

// Hunt for the source of the runtime warning:
//   "A PressResponder was rendered without a pressable child."
// Render each distinct HeroUI trigger pattern the app uses, in isolation, and
// capture console.error/warn. Whichever pattern emits it is the culprit.

let errSpy: ReturnType<typeof vi.spyOn>;
let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  errSpy.mockRestore();
  warnSpy.mockRestore();
});

function pressResponderMsgs() {
  return [...errSpy.mock.calls, ...warnSpy.mock.calls]
    .map((c) => String(c[0]))
    .filter((m) => m.includes("PressResponder"));
}

describe("PressResponder source hunt", () => {
  it("InlineChipPicker (Popover.Trigger with content)", () => {
    render(
      <InlineChipPicker
        value="a"
        options={[{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }]}
        ariaLabel="pick"
        errorMsg="err"
        chipWidth="w-24"
        onChange={async () => {}}
      />,
    );
    expect(pressResponderMsgs().join("\n")).toBe("");
  });

  it("Tooltip.Trigger with a bare icon child", () => {
    render(
      <Tooltip>
        <Tooltip.Trigger>
          <Bot size={12} />
        </Tooltip.Trigger>
        <Tooltip.Content>tip</Tooltip.Content>
      </Tooltip>,
    );
    expect(pressResponderMsgs().join("\n")).toBe("");
  });

  it("Tooltip.Trigger with a bare span child", () => {
    render(
      <Tooltip>
        <Tooltip.Trigger>
          <span>hi</span>
        </Tooltip.Trigger>
        <Tooltip.Content>tip</Tooltip.Content>
      </Tooltip>,
    );
    expect(pressResponderMsgs().join("\n")).toBe("");
  });

  it("Dropdown.Trigger wrapping a div", () => {
    render(
      <Dropdown>
        <Dropdown.Trigger>
          <div>menu</div>
        </Dropdown.Trigger>
        <Dropdown.Popover>
          <Dropdown.Menu>
            <Dropdown.Item id="x" textValue="x">x</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>,
    );
    expect(pressResponderMsgs().join("\n")).toBe("");
  });

  it("Dropdown.Trigger with props-only + icon child", () => {
    render(
      <Dropdown>
        <Dropdown.Trigger aria-label="more" className="x">
          <Bot size={14} />
        </Dropdown.Trigger>
        <Dropdown.Popover>
          <Dropdown.Menu>
            <Dropdown.Item id="x" textValue="x">x</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>,
    );
    expect(pressResponderMsgs().join("\n")).toBe("");
  });

  it("Popover.Trigger wrapping a single button", () => {
    render(
      <Popover>
        <Popover.Trigger aria-label="p" className="x">
          <span>chip</span>
        </Popover.Trigger>
        <Popover.Content>
          <Popover.Dialog>
            <ListBox><ListBox.Item id="x" textValue="x">x</ListBox.Item></ListBox>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>,
    );
    expect(pressResponderMsgs().join("\n")).toBe("");
  });

  it("Select.Trigger", () => {
    render(
      <Select placeholder="pick">
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox><ListBox.Item id="x" textValue="x">x</ListBox.Item></ListBox>
        </Select.Popover>
      </Select>,
    );
    expect(pressResponderMsgs().join("\n")).toBe("");
  });
});
