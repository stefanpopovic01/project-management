import "./About.css";

const AboutUs = () => {

  return (
    <div className="about-page">
    <div className="hero-grid-bg" />
      <section className="about-hero">
        <div className="about-hero-inner">
          <span className="about-label"></span>
          <h1 className="about-title">Built for teams that get things done</h1>
          <p className="about-subtitle">
            We created a simple, focused project management tool for people who
            want to spend less time managing and more time building.
          </p>
        </div>
      </section>

      <section className="about-mission">
        <div className="about-mission-inner">
          <h2 className="about-mission-title">Our mission</h2>
          <p className="about-mission-text">
            Too many tools get in the way of the work itself. We believe project
            management software should be invisible — something that quietly
            keeps your team aligned without demanding constant attention. That's
            what we set out to build.
          </p>
          <p className="about-mission-text">
            Whether you're a small team shipping a product or an individual
            managing personal goals, our tool adapts to how you work — not the
            other way around.
          </p>
        </div>
      </section>

      <section className="about-stats">
        <div className="about-stats-grid">
          <div className="about-stat">
            <span className="about-stat-number">10k+</span>
            <span className="about-stat-label">Tasks completed</span>
          </div>
          <div className="about-stat">
            <span className="about-stat-number">500+</span>
            <span className="about-stat-label">Active projects</span>
          </div>
          <div className="about-stat">
            <span className="about-stat-number">200+</span>
            <span className="about-stat-label">Teams onboard</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;