import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <main className="min-h-screen bg-ink text-cream px-6 py-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <Link to="/" className="text-xs font-display tracking-[0.2em] text-gold hover:opacity-80">
            BACK TO HOME
          </Link>
          <h1 className="font-display font-black text-4xl md:text-6xl mt-4">Privacy Policy</h1>
          <p className="text-cream/60 mt-3">Last updated: May 25, 2026</p>
        </div>

        <div className="space-y-8 text-cream/80 leading-relaxed">
          <section>
            <h2 className="font-display text-2xl text-gold mb-2">What We Collect</h2>
            <p>We collect contact details you submit through forms, project requirements, and analytics data used to improve site performance.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-gold mb-2">How We Use Data</h2>
            <p>We use data to respond to project requests, provide design support, improve user experience, and maintain service security.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-gold mb-2">Advertising and Cookies</h2>
            <p>Advertising technologies may use cookies for measurement and personalization where consent is provided. Ads are only enabled on content-rich pages.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-gold mb-2">Your Rights</h2>
            <p>You can request access, correction, or deletion of your personal data by contacting us through our official communication channels.</p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
