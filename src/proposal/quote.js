/**
 * The proposal's pricing math, kept pure and framework-free so it can be
 * unit-tested with plain node (see scripts/check-quote-total.mjs) and
 * reused by both the bottom bar and any section that needs the same
 * figure.
 *
 * A proposal mixes two kinds of money: what the job costs once (the
 * system, the install, an optional add-on) and what the Care Plan costs
 * on an ongoing basis. Folding a monthly fee into a capital total would
 * misstate the price, so `computeTotals` keeps them apart — "YOUR TOTAL"
 * in the bottom bar is the one-off figure; the Care Plan's recurring
 * amount rides alongside it for sections that want to show both.
 *
 * `savings` is the reference's "You save $900 off RRP" pill: the sum of
 * (rrp − price) over selected items that carry an rrp. It is a pure
 * function of the same line items, so it lives here rather than being
 * recomputed inside the investment section.
 */

/** The period a proposal opens on, before the visitor touches the toggle. */
export const DEFAULT_PERIOD = 'monthly'

/**
 * @param {import('./data/types').LineItem[]} lineItems
 * @param {import('./data/types').BillingPeriod} period
 */
export function computeTotals(lineItems, period = DEFAULT_PERIOD) {
  let total = 0
  let savings = 0
  let hasOnRequest = false
  let carePlan = null

  for (const item of lineItems) {
    if (!item.selected) continue

    const billing = item.billing ?? 'once'

    if (billing === 'once') {
      if (item.price === 'on-request') {
        hasOnRequest = true
      } else {
        total += item.price
        if (item.rrp) savings += item.rrp - item.price
      }
      continue
    }

    // A recurring item only counts toward the Care Plan figure when its
    // own billing matches the period currently in view — the fixture
    // carries a monthly and a yearly variant of the same plan, and the
    // period toggle is which one the customer is looking at.
    if (billing === period) {
      carePlan = {
        amount: item.price === 'on-request' ? 0 : item.price,
        period: billing,
      }
    }
  }

  return { total, savings, carePlan, hasOnRequest }
}
