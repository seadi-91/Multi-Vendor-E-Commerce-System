import React from 'react';
import { Link } from 'react-router-dom';
import './About.scss';

const About = () => {
  return (
    <div className="about-container">
      {/* Back Button */}
      <div className="back-button-container">
        <Link to="/" className="back-button">
          <span className="back-icon">←</span>
          Back to Home
        </Link>
      </div>

      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1>About FarmConnect</h1>
          <p className="hero-subtitle">
            Connecting farmers and consumers for a sustainable future
          </p>
          <div className="hero-stats">
            <div className="stat">
              <h3>10,000+</h3>
              <p>Happy Farmers</p>
            </div>
            <div className="stat">
              <h3>50,000+</h3>
              <p>Satisfied Customers</p>
            </div>
            <div className="stat">
              <h3>100+</h3>
              <p>Partner Farms</p>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Farm landscape" />
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <div className="mission-text">
              <h2>Our Mission</h2>
              <p>
                At FarmConnect, we believe in creating a direct connection between farmers and consumers,
                eliminating unnecessary middlemen and ensuring fair prices for both parties. Our platform
                empowers local farmers while providing consumers with fresh, organic produce at competitive prices.
              </p>
              <p>
                We're committed to sustainable farming practices, supporting local economies, and promoting
                healthy eating habits through transparent supply chains and quality assurance.
              </p>
            </div>
            <div className="mission-image">
              <img src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Fresh vegetables" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🌱</div>
              <h3>Sustainability</h3>
              <p>
                We promote eco-friendly farming practices and support farmers who prioritize
                environmental stewardship and biodiversity.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Transparency</h3>
              <p>
                Complete transparency in our supply chain ensures you know exactly where
                your food comes from and how it's grown.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">💚</div>
              <h3>Quality</h3>
              <p>
                We maintain the highest standards for food safety and quality,
                ensuring every product meets our rigorous criteria.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌍</div>
              <h3>Community</h3>
              <p>
                Supporting local farmers strengthens communities and creates
                sustainable economic opportunities for everyone involved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-content">
            <div className="story-image">
              <img src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Farm story" />
            </div>
            <div className="story-text">
              <h2>Our Story</h2>
              <p>
                FarmConnect was born from a simple idea: farmers deserve fair compensation for their hard work,
                and consumers deserve access to fresh, healthy food. Our founders, having witnessed the challenges
                faced by both farmers and consumers in traditional supply chains, set out to create a better way.
              </p>
              <p>
                Starting with just a few local farms, we've grown into a thriving platform that connects thousands
                of farmers with consumers who value quality, sustainability, and fair trade. Every day, we work
                towards our vision of a more connected and sustainable food system.
              </p>
              <Link to="/contact" className="cta-button">
                Join Our Mission
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Join the FarmConnect Community?</h2>
          <p>Whether you're a farmer looking to reach more customers or a consumer seeking fresh, local produce.</p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-button primary">
              Get Started Today
            </Link>
            <Link to="/contact" className="cta-button secondary">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;