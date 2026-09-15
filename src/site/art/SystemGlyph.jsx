/**
 * One line drawing per system, for the service cards: the whole-house
 * manifold with its three canisters, the under-sink unit beneath a bench with
 * its own tap, and the rainwater tank feeding a UV chamber. Same stroke as
 * the cutaway so the three read as one set.
 */
const ART = {
  whole: (
    <>
      {/* inlet manifold */}
      <path d="M20 44h200" className="sg-pipe" />
      <path d="M20 44h200" className="sg-flow" />
      {/* three canisters, the polish one paler */}
      <rect x="52" y="52" width="36" height="92" rx="10" className="sg-shell" />
      <rect x="102" y="52" width="36" height="92" rx="10" className="sg-shell" />
      <rect x="152" y="52" width="36" height="92" rx="10" className="sg-shell" />
      <rect x="60" y="66" width="20" height="60" rx="5" className="sg-media sg-media-dark" />
      <rect x="110" y="66" width="20" height="60" rx="5" className="sg-media sg-media-dark" />
      <rect x="160" y="66" width="20" height="60" rx="5" className="sg-media" />
      <path d="M70 44v8M120 44v8M170 44v8" className="sg-pipe" />
      {/* the little heads */}
      <rect x="58" y="40" width="24" height="12" rx="4" className="sg-head" />
      <rect x="108" y="40" width="24" height="12" rx="4" className="sg-head" />
      <rect x="158" y="40" width="24" height="12" rx="4" className="sg-head" />
    </>
  ),
  undersink: (
    <>
      {/* bench with its cupboard face cut away */}
      <path d="M16 70h208" className="sg-bench" />
      <path d="M32 70v84h176V70" className="sg-shell" />
      {/* drinking tap on the bench */}
      <path d="M120 70v-30a10 10 0 0110-10h2" className="sg-tap" />
      <path d="M132 30h10" className="sg-tap" />
      <path d="M144 32v14" className="sg-flow-drip" />
      {/* the unit: two canisters and a small tank */}
      <rect x="60" y="88" width="24" height="56" rx="7" className="sg-shell" />
      <rect x="92" y="88" width="24" height="56" rx="7" className="sg-shell" />
      <rect x="66" y="98" width="12" height="36" rx="3" className="sg-media sg-media-dark" />
      <rect x="98" y="98" width="12" height="36" rx="3" className="sg-media" />
      <rect x="136" y="92" width="52" height="52" rx="12" className="sg-shell" />
      <path d="M60 84h56M116 96h20" className="sg-pipe" />
      <path d="M120 70v14" className="sg-pipe" />
    </>
  ),
  rain: (
    <>
      {/* the tank */}
      <path d="M28 46h104v98a8 8 0 01-8 8H36a8 8 0 01-8-8z" className="sg-shell" />
      <ellipse cx="80" cy="46" rx="52" ry="10" className="sg-shell" />
      <path d="M40 92h80M40 112h80" className="sg-inner" />
      {/* outlet to the UV chamber */}
      <path d="M132 124h28" className="sg-pipe" />
      <path d="M132 124h28" className="sg-flow" />
      {/* prefilter canister then UV lamp */}
      <rect x="160" y="100" width="22" height="48" rx="7" className="sg-shell" />
      <rect x="166" y="110" width="10" height="30" rx="3" className="sg-media sg-media-dark" />
      <path d="M182 124h12" className="sg-pipe" />
      <rect x="194" y="60" width="24" height="88" rx="8" className="sg-shell" />
      <path d="M206 70v68" className="sg-uv" />
      <path d="M206 70v68" className="sg-uv-glow" />
      {/* rain into the tank */}
      <path d="M60 14v10M80 8v14M100 14v10" className="sg-rain" />
    </>
  ),
}

export default function SystemGlyph({ kind }) {
  return (
    <svg className={`system-glyph system-glyph-${kind}`} viewBox="0 0 240 160" aria-hidden="true">
      {ART[kind]}
    </svg>
  )
}
