
const HomeFAQ = () => {
  const sectionStyles = "mx-auto max-w-4xl px-6 py-12";
  const titleStyles = "text-center text-3xl font-bold text-foreground md:text-4xl";
  const subtitleStyles = "mt-2 text-center text-lg text-muted-foreground";

  const cardStyles = "rounded-xl border border-border bg-card/80 p-6 shadow-lg";
  const cardTitleStyles = "text-2xl font-semibold text-foreground";
  const cardBodyStyles = "mt-2 text-muted-foreground leading-relaxed";
  const strongStyles = "font-semibold text-foreground";

  return (
    <section id="faq" className={sectionStyles}>
      {/* Title Section */}
      <h1 className={titleStyles}>
        The Mig Quant Conference March 16th 2025
      </h1>
      <p className={subtitleStyles}>
        Applications for the 2025 conference are now open at the link above. Please contact mig.board@umich.edu with any questions.
      </p>

      <div className="mt-10 space-y-8">

        {/* Rules Section */}
        <div className={cardStyles}>
          <h2 className={cardTitleStyles}>What is the Conference?</h2>
          <p className={cardBodyStyles}>
          The MIG Quant Conference is an annual event hosted by the Michigan Investment Group
          at the University of Michigan, designed for students interested in{" "}
          <strong className={strongStyles}>quantitative finance, trading, and technology.</strong>
          </p>
          <p className={cardBodyStyles}>
          The conference features quant games, networking with top sponsors like{" "}
          <strong className={strongStyles}>IMC and Jane Street</strong>, and insightful discussions with industry leaders.
          Attendees will have the opportunity to{" "}
          <strong className={strongStyles}>compete for prizes</strong>, engage in hands-on experiences, and learn from experts in the field.
          </p>
          <p className={cardBodyStyles}>
          Open to all undergraduates in Math, CS, BBA, Statistics, Economics, and related fields, this event is the perfect way to explore career opportunities in quant finance. Apply by March 10th!
          </p>
        </div>

        {/* Rules Section */}
        <div className={cardStyles}>
          <h2 className={cardTitleStyles}>When + Where?</h2>
          <p className={cardBodyStyles}>
            The conference will be held on March 16th, 2025 at the University of Michigan, Ross School of Business 
            from 12:00 pm EST to 5:00 pm EST. All attendees will be provided with company swag and food
          </p>
        </div>


        {/* Prizes Section */}
        <div className={cardStyles}>
          <h2 className={cardTitleStyles}>What are Quant Games</h2>
          <p className={cardBodyStyles}>
            All attendees will have the opportunity to participate in Quant Foucused Games
            that are meant to educate and mimic the world of Quant ie. Market Making Games.
            Winners of these games are eligble to win prizes in addition to their company swag.
          </p>
        </div>

        {/* Attendance Section */}
        <div className={cardStyles}>
          <h2 className={cardTitleStyles}>
            Who Can Attend the Competition?
          </h2>
          <p className={cardBodyStyles}>
            The event is open to all undergraduate students
            interested in quantitative trading. The event is targeted to
            students studying <strong className={strongStyles}>Computer Science</strong>,{" "}
            <strong className={strongStyles}>Business</strong>, <strong className={strongStyles}>Mathematics</strong>,{" "}
            <strong className={strongStyles}>Data Science</strong>, <strong className={strongStyles}>Statistics</strong>,{" "}
            <strong className={strongStyles}>Economics</strong>, <strong className={strongStyles}>Finance</strong>, or related
            fields.
          </p>
          <p className={cardBodyStyles}>
            No Prior Experience with anything quant related is Required, just a genuine curiosity to learn!
          </p>
        </div>

        {/* Meals Section */}
        <div className={cardStyles}>
          <h2 className={cardTitleStyles}>Are meals provided?</h2>
          <p className={cardBodyStyles}>
            Yes, breakfast and lunch are included for all attendees. Breakfast service begins when
            doors open, and lunch is served with a range of hot and cold options to keep you fueled
            through the afternoon sessions.
          </p>
        </div>
      </div>
    </section>
  )
}

export default HomeFAQ