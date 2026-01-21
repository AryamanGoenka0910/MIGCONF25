
const HomeFAQ = () => {
  const cardStyles = "rounded-xl border border-border bg-card/80 p-6 shadow-lg animate-fade-in-up opacity-0";
  const cardTitleStyles = "text-2xl font-semibold text-foreground";
  const cardBodyStyles = "mt-2 text-muted-foreground leading-relaxed";
  const strongStyles = "font-semibold text-foreground";

  const faqs = [
    {
      title: "What is the Conference?",
      body: (
        <>
          <p className={cardBodyStyles}>
            The MIG Quant Conference is an annual event hosted by the Michigan Investment Group at the University of
            Michigan, designed for students interested in{" "}
            <strong className={strongStyles}>quantitative finance, trading, and technology.</strong>
          </p>
          <p className={cardBodyStyles}>
            The conference features quant games, networking with top sponsors like{" "}
            <strong className={strongStyles}>IMC, Old Mission, Jane Street, and more</strong>, and insightful discussions with industry
            leaders. Attendees will have the opportunity to play in Quant Games designed by MIG members to{" "}
            <strong className={strongStyles}>compete for prizes</strong> totaling over <strong className={strongStyles}>$6,000</strong>.
          </p>
        </>
      ),
    },
    {
      title: "Teams",
      body: (
        <p className={cardBodyStyles}>
          The conference is a team event of <strong className={strongStyles}>3-4 students</strong>. 
          You can apply with a team of peers, but also solo and we will match you with a team after acceptance to the conference.
          Prizes will be awarded to the top teams at the end of the day.
        </p>
      ),
    },
    {
      title: "Travel",
      body: (
        <p className={cardBodyStyles}>
          For students traveling from out of state, we will travel reimbursement based on distance. 
          All reimbursements will be provided after acceptance to the conference, so please wait until acceptance to book flights.
        </p>
      ),
    },
    {
      title: "When + Where?",
      body: (
        <p className={cardBodyStyles}>
          The conference will be held on <strong className={strongStyles}>March 15th, 2026</strong> at the University of Michigan, Ross School of Business from
          <strong className={strongStyles}> 10:30 am EST to 5:30 pm EST</strong>. All attendees will be provided with company swag and food
        </p>
      ),
    },
    {
      title: "Who Can Attend the Competition?",
      body: (
        <>
          <p className={cardBodyStyles}>
            The event is open to all undergraduate students interested in quantitative trading. The event is targeted to
            students studying <strong className={strongStyles}>Computer Science</strong>,{" "}
            <strong className={strongStyles}>Business</strong>, <strong className={strongStyles}>Mathematics</strong>,{" "}
            <strong className={strongStyles}>Data Science</strong>, <strong className={strongStyles}>Statistics</strong>,{" "}
            <strong className={strongStyles}>Economics</strong>, <strong className={strongStyles}>Finance</strong>, or
            related fields.
          </p>
          <p className={cardBodyStyles}>
            No Prior Experience with anything quant related is Required, just a genuine curiosity to learn!
          </p>
        </>
      ),
    },
    {
      title: "Are meals provided?",
      body: (
        <p className={cardBodyStyles}>
          Yes, breakfast and lunch are included for all attendees. Breakfast service begins when doors open, and lunch is
          served with a range of hot and cold options to keep you fueled through the afternoon sessions. For special dietary restrictions please contact the event organizers using the email below.
        </p>
      ),
    },
    {
      title: "Contact",
      body: (
        <p className={cardBodyStyles}>
          Please contact at mig.board@umich.edu with any questions.
        </p>
      ),
    },
  ];

  return (
     
      <div className="space-y-8 mx-auto max-w-6xl px-6">
        {faqs.map((item, idx) => (
          <div key={item.title} className={cardStyles} style={{ animationDelay: `${idx * 120}ms` }}>
            <h2 className={cardTitleStyles}>{item.title}</h2>
            {item.body}
          </div>
        ))}
      </div>
  )
}

export default HomeFAQ