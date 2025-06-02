import React from 'react';

const SideBanner: React.FC = () => {
  return (
    <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 bg-[#c92127] lg:grid">
      <div className="relative flex items-center justify-center z-1">
        <div className="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px]">
          <img src="/images/grid-01.svg" alt="grid" />
        </div>
        <div className="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px]">
          <img src="/images/grid-01.svg" alt="grid" />
        </div>
        <div className="flex flex-col items-center max-w-xs">
          <a href="#" className="block mb-4">
            <img
              src="/logo_v2.png"
              alt="Vuvia Logo"
              width={231}
              height={48}
            />
          </a>
          <p className="text-center text-white/80">
            Bringing knowledge to everyone!!!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SideBanner;
