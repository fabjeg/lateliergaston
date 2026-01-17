import './Contact.css'

function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Merci pour votre message ! Nous vous répondrons bientôt.')
  }

  return (
    <div className="contact">
      <h1>Contactez-nous</h1>
      <div className="contact-content">
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="name">Nom</label>
            <input type="text" id="name" name="name" required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Sujet</label>
            <input type="text" id="subject" name="subject" required />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" rows="5" required></textarea>
          </div>

          <button type="submit">Envoyer</button>
        </form>

        <div className="contact-info">
          <h2>Informations de contact</h2>
          <p><strong>Email:</strong> contact@lateliergaston.fr</p>
          <p><strong>Téléphone:</strong> +33 6 18 01 42 57</p>
          <p><strong>Adresse:</strong> Crach 56950</p>
        </div>
      </div>
    </div>
  )
}

export default Contact
