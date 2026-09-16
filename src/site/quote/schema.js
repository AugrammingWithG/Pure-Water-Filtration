/**
 * The quote form, as data: which questions, in what order, and when each one
 * applies.
 *
 * The questions and their options are the client's own "Instant Quote" form
 * — the same labels and the same choices, in the same order, including its
 * branching (a filter-replacement enquiry skips the water questions and the
 * ownership question). Three fields on top of that, marked `extra`, give the
 * specialist what they would otherwise ring to ask: where the unit would go,
 * ground or wall, and which day suits.
 *
 * Steps are grouped so the visitor sees a handful of screens, not twenty.
 * `when(answers)` on a field or a step hides it; a hidden field is dropped
 * from validation and from the payload, so a stale answer from an earlier
 * branch never travels.
 */

export const SERVICES = [
  { value: 'Whole-house filtration', note: 'Every tap, shower and appliance' },
  { value: 'Under-sink filtration', note: 'Drinking water at the kitchen tap' },
  { value: 'Rainwater filtration', note: 'Tank water made safe to drink' },
  { value: 'Filter replacements', note: 'New cartridges for an existing system' },
]

const notReplacement = (a) => a.service !== 'Filter replacements'

export const STEPS = [
  {
    key: 'service',
    title: 'What do you need?',
    fields: [
      {
        key: 'service',
        type: 'choice',
        label: 'Which service are you interested in?',
        options: SERVICES,
        required: true,
        autoAdvance: true,
      },
      {
        key: 'filterSystem',
        type: 'choice',
        label: 'Which system needs new filters?',
        options: ['Whole-house', 'Reverse Osmosis Under Sink', 'Rainwater'],
        required: true,
        autoAdvance: true,
        when: (a) => a.service === 'Filter replacements',
      },
    ],
  },
  {
    key: 'water',
    title: 'Your water',
    when: notReplacement,
    fields: [
      {
        key: 'healthConcern',
        type: 'choice',
        label: "What's your main concern with your water?",
        options: [
          'Dry skin / hair',
          'Eczema',
          'Calcium / limescale',
          'Chemical taste or smell',
          'Fluoride',
          'Earthy / metallic taste',
          'Discoloured tap water',
          'PFAS',
        ],
        allowOther: true,
        required: true,
        compact: true,
      },
    ],
  },
  {
    key: 'current',
    title: 'Right now',
    fields: [
      {
        key: 'currentFilter',
        type: 'choice',
        label: 'How do you currently filter your water?',
        options: [
          'No Filter',
          'Bottled Water',
          'Water Jug',
          'Fridge Filter',
          'Under Sink',
          'Shower Filter',
          'Tap Filter',
          'Benchtop Filter',
          'Whole House Filter',
        ],
        allowOther: true,
        required: true,
        compact: true,
      },
    ],
  },
  {
    key: 'home',
    title: 'Your home',
    fields: [
      {
        key: 'ownership',
        type: 'choice',
        label: 'Do you own your home?',
        options: ['Yes', 'No'],
        required: true,
        when: notReplacement,
      },
      {
        key: 'ownershipSub',
        type: 'choice',
        label: 'Tell us a bit more',
        options: ['Renting at the moment', 'Looking to purchase soon', 'Building at the moment'],
        required: true,
        when: (a) => notReplacement(a) && a.ownership === 'No',
      },
      {
        key: 'installType',
        type: 'choice',
        label: 'Where would the unit sit?',
        hint: 'Whole-house and rainwater units mount on the ground or a wall near the meter.',
        options: ['Ground', 'Wall', 'Not sure yet'],
        extra: true,
        when: (a) => ['Whole-house filtration', 'Rainwater filtration'].includes(a.service),
      },
      {
        key: 'preferredDay',
        type: 'choice',
        label: 'Which day suits a visit?',
        hint: 'Mon – Fri, 8am – 4pm. Optional.',
        options: ['Any weekday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        extra: true,
        compact: true,
      },
    ],
  },
  {
    key: 'details',
    title: 'Your details',
    fields: [
      {
        key: 'firstName',
        type: 'text',
        label: 'First name',
        placeholder: 'First name',
        autoComplete: 'given-name',
        required: true,
        inline: true,
      },
      {
        key: 'lastName',
        type: 'text',
        label: 'Last name',
        placeholder: 'Last name',
        autoComplete: 'family-name',
        required: true,
        inline: true,
      },
      {
        key: 'phone',
        type: 'tel',
        label: 'Phone',
        placeholder: '04XX XXX XXX',
        autoComplete: 'tel',
        required: true,
      },
      {
        key: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'you@example.com',
        autoComplete: 'email',
        required: true,
      },
      {
        key: 'address',
        type: 'text',
        label: 'Street address',
        placeholder: '12 Smith St',
        autoComplete: 'street-address',
        required: true,
        extra: true,
      },
      {
        key: 'suburb',
        type: 'text',
        label: 'Suburb',
        placeholder: 'Bondi',
        autoComplete: 'address-level2',
        required: true,
        inline: true,
      },
      {
        key: 'postcode',
        type: 'postcode',
        label: 'Postcode',
        placeholder: '2026',
        autoComplete: 'postal-code',
        required: true,
        inline: true,
        extra: true,
      },
      {
        key: 'state',
        type: 'select',
        label: 'State',
        options: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'],
        autoComplete: 'address-level1',
        required: true,
        hint: 'Fills in from your postcode.',
      },
      {
        key: 'comments',
        type: 'textarea',
        label: 'Any other comments?',
        placeholder: 'Anything about your water, your home or access to the site.',
        rows: 3,
      },
    ],
  },
  {
    key: 'review',
    title: 'Check and send',
    review: true,
    fields: [],
  },
]

/** The steps that apply to this set of answers, in order. */
export function activeSteps(answers) {
  return STEPS.filter((step) => !step.when || step.when(answers))
}

/** The fields on a step that apply to this set of answers. */
export function activeFields(step, answers) {
  return step.fields.filter((field) => !field.when || field.when(answers))
}

/** Every field that applies, across every active step. */
export function allActiveFields(answers) {
  return activeSteps(answers).flatMap((step) => activeFields(step, answers))
}
