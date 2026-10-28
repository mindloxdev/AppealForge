"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
  /** Extra words that should match the search, e.g. denial codes. */
  keywords?: string[];
  description?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  id: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
}

/**
 * Searchable single-select. Radix Popover supplies the focus trap and
 * dismissal; cmdk supplies filtering and roving focus, so the whole control is
 * reachable with a keyboard and announced as a combobox.
 */
export function Combobox({
  options,
  value,
  onChange,
  id,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyText = "No match found.",
  invalid,
  describedBy,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((option) => option.value === value);
  const listId = `${id}-listbox`;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(
            "flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-[var(--radius)] border border-input bg-card px-3.5 py-2 text-left text-base shadow-xs transition-[border-color,box-shadow] outline-hidden md:text-sm",
            "hover:border-navy-300 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
            className,
          )}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground/70")}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-[var(--radius)] border border-border bg-popover text-popover-foreground shadow-lg animate-fade-in"
        >
          <Command
            filter={(itemValue, search, keywords) => {
              const haystack = `${itemValue} ${(keywords ?? []).join(" ")}`.toLowerCase();
              return haystack.includes(search.toLowerCase().trim()) ? 1 : 0;
            }}
          >
            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <Command.Input
                placeholder={searchPlaceholder}
                className="h-11 w-full bg-transparent text-sm outline-hidden placeholder:text-muted-foreground/70"
              />
            </div>
            <Command.List id={listId} className="max-h-72 overflow-y-auto overscroll-contain p-1.5">
              <Command.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
                {emptyText}
              </Command.Empty>
              {options.map((option) => (
                <Command.Item
                  key={option.value}
                  value={option.label}
                  keywords={option.keywords}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm outline-hidden",
                    "data-[selected=true]:bg-accent-soft data-[selected=true]:text-teal-900",
                  )}
                >
                  <Check
                    className={cn(
                      "mt-0.5 size-4 shrink-0 text-accent",
                      option.value === value ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block font-medium">{option.label}</span>
                    {option.description ? (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    ) : null}
                  </span>
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
