/**
 * The proposal's data contract, as JSDoc typedefs rather than TypeScript —
 * the repo is plain JS/JSX throughout (see eslint.config.js), and adding a
 * TS toolchain is build config, which this ticket puts out of scope. These
 * give editors real autocomplete and let `checkJs`-style tools catch typos
 * without a compiler step.
 *
 * `SystemId` is not invented here: it is the same three ids the 3D scene
 * and the marketing site already key everything off — see
 * `SYSTEM_ORDER` in src/data/constants.js.
 *
 * `customer`/`specialist` and the top-level `headline`/`savingsDefaults`
 * carry more fields than the ticket's original contract listed — read off
 * the reference screenshots, where the hero, footer and (later) the accept
 * form and savings calculator all need them. The ticket's original four
 * fields (name/address/suburb, name/phone) are still there; the rest are
 * additions a content ticket will read.
 */

/** @typedef {'whole' | 'undersink' | 'rain'} SystemId */

/** @typedef {'once' | 'monthly' | 'yearly'} BillingPeriod */

/**
 * @typedef {Object} LineItem
 * @property {string} id
 * @property {string} label
 * @property {number | 'on-request'} price
 * @property {number} [rrp]
 * @property {boolean} selected
 * @property {boolean} optional
 * @property {BillingPeriod} [billing]
 * @property {string[]} inclusions
 */

/**
 * @typedef {Object} SavingsDefaults
 * @property {number} bottledPerWeek - $ spent on bottled water per week, slider default
 * @property {number} cartridgesPerYear - $ spent on jug/benchtop cartridges per year, slider default
 * @property {number} years - years to compare over, slider default
 */

/**
 * @typedef {Object} Proposal
 * @property {string} ref
 * @property {string} headline - the hero's h1, e.g. "Simple family care for skin and hair."
 * @property {{ name: string, address: string, suburb: string, state: string, postcode: string, mobile: string, email: string }} customer
 * @property {{ name: string, phone: string, email: string }} specialist
 * @property {string} preparedOn
 * @property {string} heldUntil
 * @property {LineItem[]} lineItems
 * @property {SystemId} recommendedSystem
 * @property {SavingsDefaults} savingsDefaults
 */

export {}
