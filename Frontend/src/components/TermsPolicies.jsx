import '../styles/TermsPolicies.css';

export default function TermsPolicies() {
  return (
    <main className="terms-container">
      <header className="terms-hero">
        <p className="terms-kicker">Koma Terms And Policies</p>
        <h1>Community Rules, Content Policy, And Account Guidelines</h1>
        <p>
          These rules help keep Koma safe, respectful, and useful for everyone. By using Koma,
          users agree to follow these terms.
        </p>
      </header>

      <section className="terms-grid" aria-label="Terms and policy sections">
        <article className="terms-card">
          <h2>1. Account Rules</h2>
          <ul>
            <li>Use accurate and non-misleading account information.</li>
            <li>You are responsible for activity performed from your account.</li>
            <li>Impersonation of another person or brand is not allowed.</li>
          </ul>
        </article>

        <article className="terms-card">
          <h2>2. Content Rules</h2>
          <ul>
            <li>No hate speech, harassment, violent threats, or abusive content.</li>
            <li>No illegal, explicit, exploitative, or unsafe material.</li>
            <li>Do not post spam, scams, or deceptive promotions.</li>
          </ul>
        </article>

        <article className="terms-card">
          <h2>3. Copyright And Ownership</h2>
          <ul>
            <li>Upload content only if you own it or have rights to share it.</li>
            <li>Respect creator ownership, credits, and licensing requirements.</li>
            <li>Repeated copyright violations may result in account restrictions.</li>
          </ul>
        </article>

        <article className="terms-card">
          <h2>4. Platform Enforcement</h2>
          <ul>
            <li>Admins can remove content that violates rules.</li>
            <li>Accounts may be warned, limited, or suspended for repeated violations.</li>
            <li>Serious violations can lead to immediate removal.</li>
          </ul>
        </article>

        <article className="terms-card">
          <h2>5. Privacy And Safety</h2>
          <ul>
            <li>Do not share private personal data without consent.</li>
            <li>Avoid posting sensitive data such as phone numbers, addresses, or passwords.</li>
            <li>Report suspicious behavior to support for review.</li>
          </ul>
        </article>

        <article className="terms-card">
          <h2>6. Product Status</h2>
          <ul>
            <li>Followers and Following features are now available.</li>
            <li>The next major feature in progress is the chat system.</li>
            <li>Policies can be refined as platform capabilities evolve.</li>
          </ul>
        </article>
      </section>

      <footer className="terms-footer">
        <p>
          Need help or want to report abuse: <a href="mailto:support@koma.app">support@koma.app</a>
        </p>
      </footer>
    </main>
  );
}
