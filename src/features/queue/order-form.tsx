"use client";

import { Trash2 } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { isOrderDetails, orderLimits, type OrderDetails, type PickupOrder } from "./model";

type ItemField = { key: number; name: string; quantity: string };
const fieldClass = "min-h-11 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-base";

export function OrderForm({ busy, error, order, onSave, onCancel }: {
  busy: boolean;
  error: string;
  order?: PickupOrder;
  onSave: (id: string, details: OrderDetails) => void;
  onCancel?: () => void;
}) {
  const [items, setItems] = useState<ItemField[]>(() => order
    ? order.items.map(({ name, quantity }, key) => ({ key, name, quantity: String(quantity) }))
    : [{ key: 0, name: "", quantity: "1" }]);
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [validationError, setValidationError] = useState("");
  const nextKey = useRef(items.length);
  const orderId = useRef<string | null>(order?.id ?? null);

  function editItem(key: number, value: Partial<Pick<ItemField, "name" | "quantity">>) {
    setItems((oldItems) => oldItems.map((item) => item.key === key ? { ...item, ...value } : item));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const details = {
      items: items.map(({ name, quantity }) => ({ name: name.trim(), quantity: Number(quantity) })),
      notes: notes.trim(),
    };
    if (!isOrderDetails(details)) {
      setValidationError("Enter an item name and a whole quantity for each item.");
      return;
    }
    setValidationError("");
    orderId.current ??= Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, "0")).join("");
    onSave(orderId.current, details);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset disabled={busy} className="space-y-3">
        <legend className="sr-only">Order items</legend>
        {items.map(({ key, name, quantity }, index) => (
          <div key={key} className={`grid items-end gap-2 ${items.length > 1 ? "grid-cols-[minmax(0,1fr)_4.5rem_auto]" : "grid-cols-[minmax(0,1fr)_4.5rem]"}`} role="group" aria-label={`Item ${index + 1}`}>
            <label className="grid min-w-0 gap-2 text-sm font-medium">
              <span>Item name</span>
              <input className={fieldClass} data-initial-focus={index === 0 ? "" : undefined} required maxLength={orderLimits.name} value={name} onChange={(event) => editItem(key, { name: event.target.value })} />
            </label>
            <label className="grid min-w-0 gap-2 text-sm font-medium">
              <span>Quantity</span>
              <input className={`${fieldClass} tabular-nums`} type="number" inputMode="numeric" required min={1} max={orderLimits.quantity} value={quantity} onChange={(event) => editItem(key, { quantity: event.target.value })} />
            </label>
            {items.length > 1 && (
              <Button type="button" variant="ghost" className="size-11 px-0" aria-label={`Remove item ${index + 1}`} onClick={() => setItems((oldItems) => oldItems.filter((item) => item.key !== key))}>
                <Trash2 size={18} strokeWidth={1.5} aria-hidden="true" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="px-3"
          disabled={items.length >= orderLimits.items}
          onClick={() => {
            const key = nextKey.current++;
            setItems((oldItems) => [...oldItems, { key, name: "", quantity: "1" }]);
          }}
        >
          Add item
        </Button>
      </fieldset>
      <label className="grid gap-2 text-sm font-medium">
        <span>Notes <span className="font-normal text-muted-foreground">(optional)</span></span>
        <textarea className={`${fieldClass} resize-y py-2 leading-6`} rows={2} maxLength={orderLimits.notes} value={notes} disabled={busy} onChange={(event) => setNotes(event.target.value)} />
      </label>
      {(validationError || error) && <p role="alert" className="rounded-lg bg-danger-surface p-3 text-sm text-danger">{validationError || error}</p>}
      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        {onCancel && <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={busy}>
          {busy ? (order ? "Saving…" : "Creating…") : order ? "Save changes" : "Create order"}
        </Button>
      </div>
    </form>
  );
}
