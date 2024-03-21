import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="hero-section">
        <h2 className="landing-page-title">Welcome to your Personal Finance Tracker</h2>
        <p>Track your transactions and budgets effortlessly!</p>
	<Link to="/login" className="button">Get Started</Link>
    </div>

      <div className="about-section">
        <div className="bio-section">
          <h3>About - Developer</h3>
          <p>
            Hi there! I am Grace, the developer behind this Personal Finance Tracker. As someone passionate about personal finance and technology, I created this project to help individuals manage their finances more effectively.
          </p>
          <p>
            I believe with the right tools, one can achieve their financial goals. Whether in tracking daily expenses or planning long-term budgets, this application is designed to simplify the process and provide valuable insights into your financial habits.
          </p>
        </div>
        <div className="project-section">
          <h3>About - Project</h3>
          <p>
            TrackIt was inspired by the need for a simple and intuitive tool to manage personal finances. 
            It was born out of my own experience with budgeting and tracking expenses. 
            I wanted to create a solution that could streamline this process for others, making it easier to stay on top of their finances.
            This project is part of my Portfolio Projects for Holberton School.
          </p>
          <h4>Project Reference</h4>
          <p>
            Check out my GitHub repository for the project: <a href="https://github.com/GLetiwa/finance_tracker.git" target="_blank" rel="noopener noreferrer">Project Repository</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
