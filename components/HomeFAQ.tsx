
const HomeFAQ = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Title Section */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
        The Mig Quant Conference March 16th 2025
      </h1>
      <p className="text-lg text-gray-600 text-center mt-2">
        Applications for the 2025 conference will open soon. Please contact mig.board@umich.edu with any questions.
      </p>

      <div className="mt-10 space-y-8">
        {/* Prizes Section */}
        <div className="bg-gray-100 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900">Prizes</h2>
          <p className="text-gray-700 mt-2">
            The prize pool is <span className="font-semibold">$2,000</span> in
            prizes. Top scoring individuals among all games will each win a 
            prize. In addition, top players from each game will also win a 
            prize.
          </p>
          <p className="text-gray-700 mt-2">
            Participants will also have a chance to win special swag and other
            prizes.
          </p>
        </div>

        {/* Attendance Section */}
        <div className="bg-gray-100 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900">
            Who Can Attend the Competition?
          </h2>
          <p className="text-gray-700 mt-2">
            The event is open to all undergraduate and graduate students
            interested in quantitative trading. The event is targeted to
            students studying <strong>Computer Science</strong>,{" "}
            <strong>Statistics</strong>, <strong>Mathematics</strong>,{" "}
            <strong>Data Science</strong>, <strong>Physics</strong>,{" "}
            <strong>Economics</strong>, <strong>Finance</strong>, or related
            fields.
          </p>
          <p className="text-gray-700 mt-2">
            We aim to spark interest in a wide range of quantitative strategies
            and trading skills as well as create a real-time trading
            environment for future quants and traders.
          </p>
        </div>
      </div>
    </div>
  )
}

export default HomeFAQ