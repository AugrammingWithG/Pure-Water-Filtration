/**
 * The form's controls. One component per field type in schema.js, each
 * wired the same way: a real form element, a visible label, a hint tied on
 * with aria-describedby, and an error line that only exists when there is
 * one. Choices are radio inputs inside a fieldset, so the group has a name
 * and arrow keys walk it, and the visible tile is the label.
 */

function Hint({ id, text }) {
  return text ? (
    <small className="q-hint" id={id}>
      {text}
    </small>
  ) : null
}

function ErrorLine({ id, text }) {
  return text ? (
    <small className="q-error" id={id} role="alert">
      {text}
    </small>
  ) : null
}

function describedBy(field, error) {
  return [field.hint && `${field.key}-hint`, error && `${field.key}-error`].filter(Boolean).join(' ') || undefined
}

export function ChoiceGroup({ field, value, otherValue, error, onChange, onOtherChange, onAutoAdvance, inputRef }) {
  const options = field.options.map((o) => (typeof o === 'string' ? { value: o } : o))
  const isOther = value === 'Other'
  return (
    <fieldset
      className={`q-field${error ? ' has-error' : ''}`}
      aria-describedby={describedBy(field, error)}
      aria-invalid={error ? true : undefined}
    >
      <legend className="q-label">
        {field.label}
        {!field.required && <span className="q-optional"> (optional)</span>}
      </legend>
      <Hint id={`${field.key}-hint`} text={field.hint} />
      <div className={`choice-grid${field.compact ? ' compact' : ''}`}>
        {options.map((option, i) => {
          const id = `${field.key}-${option.value}`
          const selected = value === option.value
          return (
            <label className={`choice${selected ? ' selected' : ''}`} htmlFor={id} key={option.value}>
              <input
                ref={i === 0 ? inputRef : undefined}
                type="radio"
                id={id}
                name={field.key}
                value={option.value}
                checked={selected}
                onChange={() => {
                  onChange(option.value)
                  if (field.autoAdvance) onAutoAdvance?.(option.value)
                }}
              />
              <strong>{option.value}</strong>
              {option.note && <small>{option.note}</small>}
            </label>
          )
        })}
        {field.allowOther && (
          <label className={`choice${isOther ? ' selected' : ''}`} htmlFor={`${field.key}-Other`}>
            <input
              type="radio"
              id={`${field.key}-Other`}
              name={field.key}
              value="Other"
              checked={isOther}
              onChange={() => onChange('Other')}
            />
            <strong>Something else</strong>
          </label>
        )}
      </div>
      {isOther && (
        <input
          className="q-input"
          type="text"
          aria-label={`${field.label} — tell us more`}
          placeholder="Tell us more"
          value={otherValue ?? ''}
          onChange={(e) => onOtherChange(e.target.value)}
          autoFocus
        />
      )}
      <ErrorLine id={`${field.key}-error`} text={error} />
    </fieldset>
  )
}

export function TextField({ field, value, error, onChange, onBlur, inputRef }) {
  const type = field.type === 'postcode' ? 'text' : field.type
  const inputMode = field.type === 'tel' ? 'tel' : field.type === 'postcode' ? 'numeric' : undefined
  return (
    <div className={`q-field${field.inline ? ' inline' : ''}${error ? ' has-error' : ''}`}>
      <label className="q-label" htmlFor={field.key}>
        {field.label}
        {!field.required && <span className="q-optional"> (optional)</span>}
      </label>
      <Hint id={`${field.key}-hint`} text={field.hint} />
      <input
        ref={inputRef}
        className="q-input"
        id={field.key}
        name={field.key}
        type={type}
        inputMode={inputMode}
        maxLength={field.type === 'postcode' ? 4 : undefined}
        placeholder={field.placeholder}
        autoComplete={field.autoComplete}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(field, error)}
        required={field.required}
      />
      <ErrorLine id={`${field.key}-error`} text={error} />
    </div>
  )
}

export function SelectField({ field, value, error, onChange, inputRef }) {
  return (
    <div className={`q-field${field.inline ? ' inline' : ''}${error ? ' has-error' : ''}`}>
      <label className="q-label" htmlFor={field.key}>
        {field.label}
      </label>
      <Hint id={`${field.key}-hint`} text={field.hint} />
      <select
        ref={inputRef}
        className="q-input"
        id={field.key}
        name={field.key}
        autoComplete={field.autoComplete}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(field, error)}
        required={field.required}
      >
        <option value="">Select…</option>
        {field.options.map((o) => (
          <option value={o} key={o}>
            {o}
          </option>
        ))}
      </select>
      <ErrorLine id={`${field.key}-error`} text={error} />
    </div>
  )
}

export function TextArea({ field, value, onChange }) {
  return (
    <div className="q-field">
      <label className="q-label" htmlFor={field.key}>
        {field.label}
        <span className="q-optional"> (optional)</span>
      </label>
      <textarea
        className="q-input"
        id={field.key}
        name={field.key}
        rows={field.rows ?? 3}
        placeholder={field.placeholder}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
