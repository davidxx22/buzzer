// @ts-check

export const ticketStatuses = /** @type {const} */ (["waiting", "ready", "collected"]);
export const qrConfirmationTtl = 5 * 60;
export const orderLimits = { items: 8, name: 60, quantity: 99, notes: 240 };

/** @typedef {{name: string, quantity: number}} OrderItem */

/** @param {unknown} value @returns {value is OrderItem[]} */
export function isOrderItems(value) {
  return Array.isArray(value) && value.length > 0 && value.length <= orderLimits.items &&
    value.every((item) => item && typeof item.name === "string" && item.name.trim().length > 0 &&
      item.name.length <= orderLimits.name && !/[\x00-\x1f\x7f]/.test(item.name) &&
      Number.isSafeInteger(item.quantity) && item.quantity >= 1 && item.quantity <= orderLimits.quantity);
}

/** @param {unknown} value @returns {value is {revision: number, items: OrderItem[]}} */
export function isVersionedOrderItems(value) {
  return Boolean(value) && typeof value === "object" && value !== null &&
    "revision" in value && typeof value.revision === "number" && Number.isSafeInteger(value.revision) && value.revision >= 0 &&
    "items" in value && isOrderItems(value.items);
}

/**
 * @param {unknown} value
 * @returns {value is string}
 */
export function isOrderId(value) {
  return typeof value === "string" && /^[a-f0-9]{32}$/.test(value);
}

/**
 * @param {unknown} value
 * @returns {value is (typeof ticketStatuses)[number]}
 */
export function isTicketStatus(value) {
  return ticketStatuses.some((status) => status === value);
}
