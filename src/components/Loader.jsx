import './Loader.css'

function Loader({ text }) {
  return (
    <div className="loader-container">
      <div className="loader-dots">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  )
}

export default Loader
