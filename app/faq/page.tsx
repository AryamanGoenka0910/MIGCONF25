"use client"

import BackgroundGlow from '@/components/background-glow';
import PageHeader from '@/components/page-header';
import HomeFAQ from '@/components/HomeFAQ';

export default function FAQ() {
  return (
    <div className="relative min-h-screen overflow-hidden pt-12 md:pt-24">
      <BackgroundGlow />
      
      <div className="relative mx-auto max-w-6xl px-6 py-8">
        <PageHeader 
          page="FAQ" 
          title="The Mig Quant Conference on" 
          titleSecondary="March 15th 2026" 
          subtitle="Applications for the 2026 conference are now open at the link above. Please contact mig.board@umich.edu with any questions." 
        />
      </div>
      
      <div className='flex flex-col justify-center items-center pb-8'>
        <HomeFAQ />
      </div>
    </div>
  );
}
