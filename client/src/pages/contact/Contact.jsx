import React, { useState } from 'react';
import Footer from '../../components/Footer';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './Contact.scss';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Here you would typically send the data to your backend
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-container">
      {/* Back Button */}
      <div className="back-button-container">
        <Link to="/" className="back-button">
          <span className="back-icon">←</span>
          Back to Home
        </Link>
      </div>

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-content">
          <h1>Contact Us</h1>
          <p>
            Have questions about FarmConnect? We're here to help! Reach out to us
            and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-content">
            {/* Contact Form */}
            <div className="contact-form">
              <h2>Send us a Message</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What's this about?"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    rows="6"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="contact-info">
              <h2>Get in Touch</h2>

              <div className="info-cards">
                <div className="info-card">
                  <div className="info-icon">📧</div>
                  <h3>Email Us</h3>
                  <p>abukeryimer979@gmail.com</p>
                  <a href="mailto:abukeryimer979@gmail.com" className="info-link">
                    Send Email →
                  </a>
                </div>

                <div className="info-card">
                  <div className="info-icon">📞</div>
                  <h3>Call Us</h3>
                  <p>+251 909 791 303</p>
                  <p>Mon-Fri: 9AM - 6PM EST</p>
                  <a href="tel:+251909791303" className="info-link">
                    Call Now →
                  </a>
                </div>

                <div className="info-card">
                  <div className="info-icon">📍</div>
                  <h3>Visit Us</h3>
                  <p>123 Farm Road</p>
                  <p>Agricity, AC 12345</p>
                  <a href="#map" className="info-link">
                    View Map →
                  </a>
                </div>

                <div className="info-card">
                  <div className="info-icon">💬</div>
                  <h3>Live Chat</h3>
                  <p>Available 24/7</p>
                  <p>Instant support</p>
                  <button className="info-link chat-btn">
                    Start Chat →
                  </button>
                </div>
              </div>

              {/* Social Media */}
              <div className="social-section">
                <h3>Follow Us</h3>
                <div className="social-links">
                  <a href="#" className="social-link" aria-label="Facebook">
                    📘 Facebook
                  </a>
                  <a href="#" className="social-link" aria-label="Twitter">
                    🐦 Twitter
                  </a>
                  <a href="#" className="social-link" aria-label="Instagram">
                    📷 Instagram
                  </a>
                  <a href="#" className="social-link" aria-label="LinkedIn">
                    💼 LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>How do I become a seller on FarmConnect?</h3>
              <p>
                To become a seller, register as a farmer on our platform. Once your account is verified,
                you can start listing your products and managing your farm's online presence.
              </p>
            </div>

            <div className="faq-item">
              <h3>What are your delivery options?</h3>
              <p>
                We offer same-day delivery in select areas and standard delivery within 2-3 business days.
                All deliveries are tracked and insured for your peace of mind.
              </p>
            </div>

            <div className="faq-item">
              <h3>How do you ensure product quality?</h3>
              <p>
                We work directly with certified organic farms and conduct regular quality inspections.
                All products are fresh, sustainably grown, and meet our high standards.
              </p>
            </div>

            <div className="faq-item">
              <h3>What if I receive damaged products?</h3>
              <p>
                If you receive damaged products, contact our support team within 24 hours.
                We'll arrange for a replacement or full refund at no extra cost.
              </p>
            </div>

            <div className="faq-item">
              <h3>Do you offer bulk ordering?</h3>
              <p>
                Yes! We offer bulk ordering for restaurants, schools, and other organizations.
                Contact our sales team for special pricing and arrangements.
              </p>
            </div>

            <div className="faq-item">
              <h3>How do I track my order?</h3>
              <p>
                Once your order is confirmed, you'll receive a tracking number via email and SMS.
                You can also track your order status in your account dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section" id="map">
        <div className="container">
          <h2>Find Us</h2>
          <div className="map-container">
            <div className="map-placeholder">
              <div className="map-icon">🗺️</div>
              <h3>Interactive Map Coming Soon</h3>
              <p>123 Farm Road, Agricity, AC 12345</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;