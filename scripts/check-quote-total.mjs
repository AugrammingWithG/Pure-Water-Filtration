/**
 * A written test for src/proposal/quote.js, run as plain node — the repo
 * has no test runner and adding one is build config (out of scope for
 * PWF-001), so this follows the fetch-site-assets.mjs pattern of a small
 * standalone script rather than reaching for one.
 *
 *   node scripts/check-quote-total.mjs
 *
 * Asserts computeTotals against the katie-wells fixture: the baseline
 * total and savings, that flipping a selected flag moves both, on-request
 * handling, and the monthly/yearly Care Plan split. This is what makes
 * "bottom bar total recomputes when a fixture line item's selected flips"
 * a checked acceptance criterion rather than a visual one.
 */
import { computeTotals } from '../src/proposal/quote.js'
import fixture from '../src/proposal/data/katie-wells.json' with { type: 'json' }

let failures = 0

function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
  if (!ok) {
    console.log(`  expected: ${JSON.stringify(expected)}`)
    console.log(`  actual:   ${JSON.stringify(actual)}`)
    failures += 1
  }
}

// --- baseline: exactly the fixture's own `selected` flags, monthly period ---
// whole-house-3-stage ($1,799, rrp $2,699) selected; under-sink-ro (on-request)
// deselected; both Care Plan variants selected, the period picks between them.
const baseline = computeTotals(fixture.lineItems, 'monthly')
check('baseline total is the whole-house system only', baseline.total, 1799)
check('baseline savings is RRP minus price on the whole-house system', baseline.savings, 900)
check('baseline Care Plan is the monthly variant', baseline.carePlan, { amount: 25, period: 'monthly' })
check('baseline has no on-request item selected', baseline.hasOnRequest, false)

// --- yearly period picks the yearly Care Plan line item instead ---
const yearly = computeTotals(fixture.lineItems, 'yearly')
check('yearly period selects the yearly Care Plan variant', yearly.carePlan, { amount: 270, period: 'yearly' })
check('one-off total is unaffected by the period toggle', yearly.total, 1799)
check('savings is unaffected by the period toggle', yearly.savings, 900)

// --- flipping a line item's `selected` moves the total and the savings together ---
const withoutWholeHouse = fixture.lineItems.map((item) =>
  item.id === 'whole-house-3-stage' ? { ...item, selected: false } : item,
)
const afterToggle = computeTotals(withoutWholeHouse, 'monthly')
check('deselecting the whole-house system drops the total to zero', afterToggle.total, 0)
check('deselecting the whole-house system drops the savings to zero', afterToggle.savings, 0)

// --- selecting an on-request item never contributes a number ---
const withUnderSink = fixture.lineItems.map((item) =>
  item.id === 'under-sink-ro' ? { ...item, selected: true } : item,
)
const afterOnRequest = computeTotals(withUnderSink, 'monthly')
check('selecting an on-request item leaves the total unchanged', afterOnRequest.total, 1799)
check('selecting an on-request item raises hasOnRequest', afterOnRequest.hasOnRequest, true)

// --- an empty selection totals to zero, with no savings and no Care Plan ---
const nothingSelected = fixture.lineItems.map((item) => ({ ...item, selected: false }))
const empty = computeTotals(nothingSelected, 'monthly')
check('nothing selected totals to zero', empty.total, 0)
check('nothing selected carries no savings', empty.savings, 0)
check('nothing selected carries no Care Plan', empty.carePlan, null)

console.log('')
if (failures > 0) {
  console.log(`${failures} check(s) failed.`)
  process.exit(1)
} else {
  console.log('All checks passed.')
}
