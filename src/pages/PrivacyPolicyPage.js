import React from 'react';

const PrivacyPolicyPage = () => {
  return (
    <div className="legal-container container">
      <header className="page-header">
        <h1>Privacy Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </header>

      <div className="legal-content">
        <section>
          <h2>1. Introduction & Overview</h2>
          <p>
            Welcome to Dream Journal (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are deeply committed to respecting the privacy of our visitors and registered users. This Privacy Policy outlines our policies regarding the collection, use, and disclosure of information when you interact with our website, our AI dream interpretation tools, and our journaling application.
          </p>
          <p>
            We adhere strictly to data privacy standards and believe that dreams and subconscious thoughts are deeply personal. We design our systems to ensure your reflective writing remains secure and treated with the highest confidentiality.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <h3>A. Personal Information You Provide</h3>
          <p>
            When registering for an account, we collect your email address and an encrypted password hash. When using the interactive dream journal, you may submit dream titles, written descriptions, tags, mood ratings, and preferences.
          </p>
          <h3>B. Automatically Collected Technical Data</h3>
          <p>
            Like most modern web services, our servers automatically record standard log files when you visit. This may include your IP address, browser type and version, referral pages, timestamps, and page interaction data. This technical information is used solely to maintain server security, monitor service reliability, and diagnose technical errors.
          </p>
        </section>

        <section>
          <h2>3. Artificial Intelligence & Data Processing</h2>
          <p>
            When you use our dream analysis and visualizer features, the dream narrative you submit is transmitted securely via encrypted API channels to our language model processing agent to generate psychological insights, archetype detection, and visual prompts.
          </p>
          <p>
            We do not sell, rent, or trade your private dream text to third-party data brokers. Input prompts are used strictly for real-time inference to generate your requested response.
          </p>
        </section>

        <section>
          <h2>4. Cookies, Web Beacons & Third-Party Advertising</h2>
          <p>
            Our website uses cookies (small text files stored on your device) to maintain user authentication sessions, remember interface preferences (such as light or dark theme mode), and analyze traffic patterns.
          </p>
          <p>
            Third-party vendors and advertising partners may also place and read cookies on your browser, or use web beacons and IP identifiers, to collect non-personally identifiable information while serving advertisements on our website. These technologies allow advertising partners to recognize your device and serve relevant advertisements based on visits to this and other websites across the Internet.
          </p>
          <p>
            You have the right to disable or selectively turn off our cookies or third-party cookies in your browser settings, or by managing preferences in your browser’s privacy options. Note that disabling essential session cookies may affect your ability to log in and save dreams.
          </p>
        </section>

        <section>
          <h2>5. Data Security & Storage</h2>
          <p>
            We implement industry-standard cryptographic practices. User passwords are encrypted using salted one-way hashing algorithms (bcrypt) prior to database persistence. All network communications are encrypted in transit using Transport Layer Security (TLS/HTTPS).
          </p>
        </section>

        <section>
          <h2>6. Children&apos;s Privacy</h2>
          <p>
            Our service is not intended for use by children under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you become aware that a child has provided us with personal information, please contact our support team immediately so that we can remove such records.
          </p>
        </section>

        <section>
          <h2>7. Updates to This Policy</h2>
          <p>
            We may periodically update our Privacy Policy to reflect enhancements in technology, service features, or regulatory standards. Any changes will be posted on this page with an updated revision date.
          </p>
        </section>

        <section>
          <h2>8. Contact Us</h2>
          <p>
            If you have questions, feedback, or data requests regarding this Privacy Policy, please visit our <a href="/contact">Contact Page</a> or send an inquiry to our privacy team.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
