import { Link } from "react-router-dom";

const EditorialPolicy = () => {
  return (
    <main className="min-h-screen bg-ink text-cream px-6 py-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <Link to="/" className="text-xs font-display tracking-[0.2em] text-gold hover:opacity-80">
            BACK TO HOME
          </Link>
          <h1 className="font-display font-black text-4xl md:text-6xl mt-4">Editorial Policy</h1>
          <p className="text-cream/60 mt-3">Last updated: May 25, 2026</p>
        </div>

        <div className="space-y-8 text-cream/80 leading-relaxed">
          <section>
            <h2 className="font-display text-2xl text-gold mb-2">Original Content Standard</h2>
            <p>All published case studies, design examples, and guidance are produced by our team or shared with client permission.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-gold mb-2">Content Quality</h2>
            <p>We prioritize practical design insights, clear explanations, and portfolio context that helps users understand outcomes and process.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-gold mb-2">Commercial Transparency</h2>
            <p>Promotional placements are clearly marked. We do not publish misleading claims, auto-generated thin pages, or deceptive navigation.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-gold mb-2">Review and Corrections</h2>
            <p>We periodically review content accuracy and update pages when service details, pricing, or contact workflows change.</p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default EditorialPolicy;
