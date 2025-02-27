
const HomeFAQ = () => {
  return (
    <section id="faq" className="max-w-4xl mx-auto px-6 py-12">
      {/* Title Section */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
        The Mig Quant Conference March 16th 2025
      </h1>
      <p className="text-lg text-gray-600 text-center mt-2">
        Applications for the 2025 conference are now open at the link above. Please contact mig.board@umich.edu with any questions.
      </p>

      <div className="mt-10 space-y-8">

        {/* Rules Section */}
        <div className="bg-gray-100 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900">When + Where?</h2>
          <p className="text-gray-700 mt-2">
            The conference will be held on March 16th, 2025 at the University of Michigan, Ross School of Business 
            from 12:00 pm EST to 5:00 pm EST. All attendees will be provided with company swag and food
          </p>
        </div>


        {/* Prizes Section */}
        <div className="bg-gray-100 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900">What are Quant Games</h2>
          <p className="text-gray-700 mt-2">
            All attendees will have the opportunity to particpate in Quant Foucused Games
            that are meant to educate and mimic the world of Quant ie. Market Making Games.
            Winners of these games are eligble to win prizes in addition to their company swag.
          </p>
        </div>

        {/* Attendance Section */}
        <div className="bg-gray-100 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900">
            Who Can Attend the Competition?
          </h2>
          <p className="text-gray-700 mt-2">
            The event is open to all undergraduate students
            interested in quantitative trading. The event is targeted to
            students studying <strong>Computer Science</strong>,{" "}
            <strong>Business</strong>, <strong>Mathematics</strong>,{" "}
            <strong>Data Science</strong>, <strong>Statistics</strong>,{" "}
            <strong>Economics</strong>, <strong>Finance</strong>, or related
            fields.
          </p>
          <p className="text-gray-700 mt-2">
            No Prior Experience with anything quant related is Required, just a genuine curiosity to learn!
          </p>
        </div>
      </div>
    </section>
  )
}

export default HomeFAQ