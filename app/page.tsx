import HomeFAQ from '@/components/HomeFAQ';
import 'animate.css'; // add this import

export default function Home() {
  return (
    <>
    <div
        className="
          bg-[url('/hero.jpg')] 
          bg-cover 
          bg-center
          h-screen
          flex
          flex-col
          items-center
          justify-center
        "
      >
        <div className="absolute inset-0 bg-black bg-opacity-85"></div>
       
        <div className="text-center px-4">
          <h1
            className="
            text-white
              drop-shadow-lg
              text-5xl 
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
              text-lg
              max-w-2xl
              mx-auto
              mb-8 
              animate__animated 
              animate__fadeInDown 
              animate__delay-1s
            "
          >
            Join the brightest minds in quantitative finance to connect, learn, and grow your network with industry experts.
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
          py-8
        "
      >
        <HomeFAQ />
      </div>
      </>
  );
}
