import './Loader.css'

function Loader({ text }) {
  return (
    <div className="loader-container">
      <span className="loader"></span>
      {text && <p className="loader-text">{text}</p>}
    </div>
  )
}

export default Loader
