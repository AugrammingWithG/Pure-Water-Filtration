export default function Header({ title, subtitle }) {
  return (
    <header>
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <button className="browse-btn">Browse plans</button>
    </header>
  )
}
