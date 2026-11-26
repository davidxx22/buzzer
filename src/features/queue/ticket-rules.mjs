// @ts-check

export const ticketStatuses = /** @type {const} */ (["waiting", "ready", "collected"]);

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
