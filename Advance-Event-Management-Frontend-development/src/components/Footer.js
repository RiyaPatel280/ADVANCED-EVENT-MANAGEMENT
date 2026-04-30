import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS
import '@fortawesome/fontawesome-free/css/all.min.css'; // FontAwesome icons
import './css/Footer.css';
import logo from './assets/logo2.png';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="container">
        <div className="row align-items-start">
          {/* Logo and Description */}
          <div className="col-md-3 mb-4 text-left">
            <div className="d-flex align-items-center">
              <img src={logo} alt="Logo" className="logo-image-footer me-1" />
              <h4 className="fw-bold mb-0">DreamEvent</h4>
            </div>
            <p className="footer-description mt-2">Crafting Unforgettable Experiences with Style & Elegance.</p>
          </div>

          {/* Our Services */}
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold mb-3">Our Services</h6>
            <ul className="list-unstyled">
              <li><h7 className="footer-link">Event Planning</h7></li>
              <li><h7 className="footer-link">Venue Selection</h7></li>
              <li><h7 className="footer-link">Catering Services</h7></li>
              <li><h7 className="footer-link">Decoration & Setup</h7></li>
              <li><h7 className="footer-link">Entertainment</h7></li>

              <li><h7 className="footer-link">Photography & Videography</h7></li>



            </ul>
          </div>

          {/* Quick Links */}
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
            <li><a href="/alleventview" className="footer-link">Events</a></li>
              <li><a href="/about" className="footer-link">About Us</a></li>
              {/* <li><a href="#" className="footer-link">Gallery</a></li> */}
              <li><a href="/contact" className="footer-link">Contact</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold mb-3">Contact</h6>
            <p><i className="fas fa-map-marker-alt me-2"></i>Celebration City, NY 10012, US</p>
            <p><i className="fas fa-envelope me-2"></i>support@DreamEvent.com</p>
            <p><i className="fas fa-phone me-2"></i>+01 234 567 890</p>

            <div className="d-flex">
  <a
    href="https://www.facebook.com"
    className="social-link facebook"
    aria-label="Facebook"
    target="_blank"
    rel="noopener noreferrer"
  >
    <i className="fab fa-facebook-f"></i>
  </a>
  <a
    href="https://www.twitter.com"
    className="social-link twitter"
    aria-label="Twitter"
    target="_blank"
    rel="noopener noreferrer"
  >
    <i className="fa-brands fa-x-twitter"></i>
  </a>
  <a
    href="https://www.instagram.com"
    className="social-link instagram"
    aria-label="Instagram"
    target="_blank"
    rel="noopener noreferrer"
  >
    <i className="fab fa-instagram"></i>
  </a>
</div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        © 2025 DreamEvent. Making Every Moment Shine.
      </div>
    </footer>
  );
};

export default Footer;
