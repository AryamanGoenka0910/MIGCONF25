import 'animate.css'; // add this import

export default function Home() {
  return (
    <div
        className="
          bg-[url('/hero.jpg')]  /* Change to the actual image name */
          bg-cover 
          bg-center
          h-screen
          flex
          flex-col
          items-center
          justify-center
        "
      >
        {/* Overlay (optional): remove if you want the image fully visible */}
        
        <div className="absolute inset-0 bg-black bg-opacity-65"></div>
       

        {/* Content container, with relative positioning if you use an overlay */}
        <div className="text-center px-4">
          <h1
            className="
            text-yellow-200 
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
              text-yellow-200 
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

          {/* Button leading to the signup page */}
          <a
            href="https://forms.gle/WTdQdMp8XVGQuywM9"
            className="
              inline-block 
              bg-white
              text-black
              drop-shadow-lg
              px-6 
              py-3 
              rounded-md 
              text-lg
              hover:bg-yellow-200 
              animate__animated
              animate__fadeInDown
              animate__delay-2s
            "
          >
            Sign Up Now
          </a>
        </div>
      </div>
  );
}
