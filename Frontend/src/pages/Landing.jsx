import React from 'react';
import Hero from '../components/Hero';
import Navbar from '../components/Navbar';
import LenisWrapper from '../components/LenisWrapper';

function Landing() {
  return (
    <LenisWrapper>
      <Navbar />
      <main>
        <Hero />
      </main>
    </LenisWrapper>
  );
}

export default Landing;
