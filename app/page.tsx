import HomeFAQ from '@/components/HomeFAQ';
import Timer from '@/components/Timer';
import 'animate.css'; // add this import

export default function Home() {
  return (
    <>
    <div
        className="
          bg-[url('/hero.jpg')] 
          bg-cover 
          bg-center
          h-[calc(100vh-20vh)]
          flex
          flex-col
          items-center
          justify-center
        "
      >
        <div className="absolute inset-0 bg-black bg-opacity-75 h-[calc(100vh-20vh)]"></div>
       
        <div className="text-center px-4">
          <h1
            className="
            text-white
              drop-shadow-lg
              text-5xl 
              font-montserrat
              font-bold 
              mb-6 
              animate__animated 
              animate__fadeInDown
            "
          >
            Welcome to the 2025 MIG Quant Conference
          </h1>
          <p
            className="
              text-white
              drop-shadow-lg
              text-2xl
              font-medium
              max-w-2xl
              mx-auto
              mb-8 
              animate__animated 
              animate__fadeInDown 
              animate__delay-1s
            "
          >
            Join us March 16th at the University of Michigan to connect, learn, and grow with industry experts.
          </p>

          <a
            href="https://forms.gle/WTdQdMp8XVGQuywM9"
            className="
              inline-block 
              bg-white
              text-black
              drop-shadow-lg
              px-3 
              py-2 
              rounded-md 
              text-lg
              hover:bg-yellow-700 
              animate__animated
              animate__fadeInDown
              animate__delay-2s
            "
          >
            Sign Up Now
          </a>
        </div>
      </div>
      <div 
        className="
          flex
          justify-center
          items-center
          bg-gray-100
          w-screen
          h-auto
        "
      >
       <div className='flex flex-col justify-center items-center'>
        <HomeFAQ />
       </div>
      </div>
      </>
  );
}
