import { CTA, WHY_US } from '../data/constants'
import { PhoneIcon } from './icons'

/**
 * The site's "why families choose us" reasons, with the phone number the
 * site pairs with every call to action. The one card that takes clicks,
 * since the number is a real link.
 */
export default function WhyCard() {
  return (
    <div className="float-card card-why">
      <div className="fc-label">Why Pure Water Filtration</div>
      {WHY_US.map(({ value, text }) => (
        <div key={value} className="fact-row">
          <b>{value}</b>
          <span>{text}</span>
        </div>
      ))}
      <a className="phone-link" href={CTA.phone.href}>
        <PhoneIcon />
        Call {CTA.phone.label}
      </a>
    </div>
  )
}
