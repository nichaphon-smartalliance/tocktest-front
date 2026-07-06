# Chat history sidebar — active row alignment fix

Date: 2026-07-06
Component: `src/components/partials/Chat/ConversationItem.tsx`

## Problem

The selected conversation row rendered a purple accent using
`border-l-4` on a container that also had `rounded-[10px]`. Because the
corner radius (10px) is larger than the border width (4px), the left
border follows the rounded corner path and curls inward at the top-left
and bottom-left. Combined with the button's 12px left padding, the
accent read as a small detached "floating pill" to the left of the
chat icon rather than a clean selection indicator.

This was confirmed visually (inline mockup reproducing the exact
Tailwind classes and colors) rather than guessed from a screenshot.

## Options considered

- A (chosen) — Highlight only. Remove the left bar entirely; the active
  state is a rounded light-purple background (`bg-[#F6F4FF]`) plus the
  existing purple icon and purple title text. Cleanest, modern
  (ChatGPT-style), zero corner artifacts.
- B — Flush stripe. Keep a left accent but as a straight, full-height
  3px stripe (absolutely positioned) clipped square by the rounded
  card, so it never curls. Stronger "selected" cue, slightly more markup.

## Decision

Option A. The purple icon + bold purple title already communicate the
selected state, so the accent bar was redundant as well as buggy.

## Change

In the row wrapper, drop `border-l-4` and both `border-*` color
utilities:

- Active: `bg-[#F6F4FF] shadow-sm dark:bg-[#37373d]`
- Inactive: `hover:bg-[#ECE9FF] dark:hover:bg-[#2a2d2e]`

Every row loses the same 4px former border box, so rows stay aligned
with each other. No other component changes.

## Related

A prior edit in `ChatHistorySidebar.tsx` unified the header and list
horizontal gutter to 16px (`p-4` / `px-4`) so the New-chat button,
search box, section label, and conversation cards share one left edge.
