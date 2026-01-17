import { useNavigate } from 'react-router-dom'
import './BackButton.css'

function BackButton({ to, label = 'Retour' }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (to) {
      navigate(to)
    } else {
      navigate(-1)
    }
  }

  return (
    <button className="back-button" onClick={handleClick}>
      <span className="back-arrow">&#8249;</span>
      <span>{label}</span>
    </button>
  )
}

export default BackButton
