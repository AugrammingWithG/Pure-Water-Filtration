/**
 * Australian postcode → state. The ranges Australia Post allocates, with the
 * ACT's two blocks carved out of the NSW range and the NT's out of the 0800s.
 * A handful of border-town exceptions exist (e.g. some 26xx codes are NSW);
 * the field stays editable, so a wrong guess costs one click.
 */
const RANGES = [
  ['ACT', 200, 299],
  ['ACT', 2600, 2618],
  ['ACT', 2900, 2920],
  ['NSW', 1000, 2999],
  ['VIC', 3000, 3999],
  ['VIC', 8000, 8999],
  ['QLD', 4000, 4999],
  ['QLD', 9000, 9999],
  ['SA', 5000, 5999],
  ['WA', 6000, 6999],
  ['TAS', 7000, 7999],
  ['NT', 800, 999],
]

/** The state for a four-digit postcode string, or '' if it is not one. */
export function stateForPostcode(postcode) {
  if (!/^\d{4}$/.test(postcode)) return ''
  const n = Number(postcode)
  const hit = RANGES.find(([, lo, hi]) => n >= lo && n <= hi)
  return hit ? hit[0] : ''
}
