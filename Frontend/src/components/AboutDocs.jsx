import '../styles/AboutDocs.css';

export default function AboutDocs() {
  return (
    <main className="aboutdocs-container">
      <header className="aboutdocs-hero">
        <p className="aboutdocs-kicker">About Koma</p>
        <h1>What This Platform Is, How It Is Built, And The Ground Rules</h1>
        <p>
          Koma is a social platform for sharing thoughts through written posts and video blogs.
          It is currently evolving, and some social features are still in progress.
        </p>
      </header>

      <section className="aboutdocs-grid" aria-label="Platform documentation sections">
        <article className="aboutdocs-card">
          <h2>How Koma Is Created</h2>
          <ul>
            <li>Frontend: React + Vite</li>
            <li>Backend: Flask REST APIs</li>
            <li>Database: MongoDB collections for users, posts, videos, likes, and profiles</li>
            <li>Media: Cloudinary signed uploads for images and videos</li>
            <li>Auth: JWT token based login/signup flow</li>
          </ul>
        </article>

        <article className="aboutdocs-card">
          <h2>Current Features</h2>
          <ul>
            <li>Create, edit, and delete written posts</li>
            <li>Upload and watch video blogs</li>
            <li>Like and comment on videos</li>
            <li>Profile page with custom profile photo</li>
            <li>Responsive feed and dashboard UI</li>
          </ul>
        </article>

        <article className="aboutdocs-card">
          <h2>Rules And Regulations (Draft)</h2>
          <ul>
            <li>No hate speech, harassment, or abusive content</li>
            <li>No explicit or illegal material</li>
            <li>Do not impersonate other users</li>
            <li>Respect copyright and content ownership</li>
            <li>Spam, scams, and misleading promotions are not allowed</li>
            <li>Repeated violations may lead to content removal or account restriction</li>
          </ul>
        </article>

        <article className="aboutdocs-card">
          <h2>In Progress</h2>
          <ul>
            <li>Followers and following system</li>
            <li>Stronger moderation and reporting workflow</li>
            <li>More profile and community discovery features</li>
            <li>Policy pages with finalized legal text</li>
          </ul>
        </article>
      </section>

      <footer className="aboutdocs-footer">
        <p>
          Note: This documentation is an evolving project draft and will be refined as features are finalized.
        </p>
      </footer>
    </main>
  );
}
