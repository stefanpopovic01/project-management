import "./Contact.css";
import { useState } from "react";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(import.meta.env.VITE_FORMSPREE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setSubmitted(true);
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        const data = await response.json();
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
    <div className="hero-grid-bg" />
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <span className="contact-label"></span>
          <h1 className="contact-title">Get in touch</h1>
          <p className="contact-subtitle">
            Have a question or feedback? Fill out the form and we'll get back to
            you as soon as we can.
          </p>
        </div>
      </section>

      <section className="contact-body">
        <div className="contact-layout">

          <div className="contact-info">
            <div className="contact-info-item">
              <div className="contact-info-icon">
                <i className="fa-solid fa-envelope"></i>
              </div>
              <div>
                <p className="contact-info-label">Email</p>
                <p className="contact-info-value">support@flowly.com</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <i className="fa-solid fa-clock"></i>
              </div>
              <div>
                <p className="contact-info-label">Response time</p>
                <p className="contact-info-value">Within 24 hours</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <div>
                <p className="contact-info-label">Based in</p>
                <p className="contact-info-value">Serbia</p>
              </div>
            </div>
          </div>

          <div className="contact-form-wrap">
            {submitted ? (
              <div className="contact-success">
                <i className="fa-solid fa-circle-check"></i>
                <h3>Message sent!</h3>
                <p>Thanks for reaching out. We'll get back to you shortly.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                {error && <div className="contact-error" style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
                <div className="contact-row">
                  <div className="contact-field">
                    <label htmlFor="name">Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="contact-field">
                  <label htmlFor="subject">Subject</label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="What's this about?"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="Write your message here..."
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="contact-submit" disabled={submitting}>
                  {submitting ? "Sending..." : "Send message"}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>
    </div>
  );
};

export default Contact;