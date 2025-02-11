
const HomeFAQ = ({titleofFAQ, textofFAQ} : {titleofFAQ:string, textofFAQ:string}) => {
  return (
    <div 
        className="
            flex
            flex-col
            items-center
            justify-center
            p-6 
            rounded-lg 
            shadow-md
            gap-y-4
            text-black
            border
        "
    >
      <h2 className="text-start">titleofFAQ</h2>
      <p>{textofFAQ}</p>
    </div>
  )
}

export default HomeFAQ