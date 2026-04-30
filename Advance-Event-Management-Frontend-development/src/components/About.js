import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import axios from 'axios';
import Footer from './Footer';
import Header from './Header';
import './css/About.css';

const About = () => {
  const [aboutData, setAboutData] = useState({
    title: '',
    intro: '',
    whyChooseUs: [],
    mission: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/about');
        setAboutData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching about data:', err);
        setError('Failed to load about content.');
        setLoading(false);
      }
    };
    fetchAboutData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <Header />
      <div style={{ height: '66.5px' }} />
      <div>
        <section id="about" className="about-section">
          <Container className="about-content">
            <h2 className="about-title">{aboutData.title || 'Welcome to Dream Event'}</h2>
            <p className="about-intro">
              {aboutData.intro || 'At <strong>Dream Event</strong>, we believe every event is an opportunity to inspire, connect, and create lasting memories.'}
            </p>
            <div className="about-details">
              <div className="about-item">
                <h3>Why Choose Us?</h3>
                <ul>
                  {aboutData.whyChooseUs && aboutData.whyChooseUs.length > 0 ? (
                    aboutData.whyChooseUs.map((item, index) => <li key={index}>{item}</li>)
                  ) : (
                    <>
                      <li>Personalized service tailored to your unique needs.</li>
                      <li>Experienced team dedicated to making your event a success.</li>
                      <li>Flexible packages to fit any budget and event size.</li>
                    </>
                  )}
                </ul>
              </div>
              <div className="about-item">
                <h3>Our Mission</h3>
                <p>
                  {aboutData.mission || 'Our mission is to simplify the event planning process, ensuring every event is executed flawlessly.'}
                </p>
              </div>
            </div>
          </Container>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default About;