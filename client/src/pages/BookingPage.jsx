import React from 'react';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import PageHero from '../components/PageHero';
import BookingForm from '../components/BookingForm';
import SafePhoneLink from '../components/SafePhoneLink';
import useSiteConfig from '../hooks/useSiteConfig';

const BookingPage = () => {
  const { config, hospitalPhoneMasked } = useSiteConfig();
  return (
  <AnimatedPage maxWidth="max-w-5xl">
    <PageHero
      variant="booking"
      eyebrow="Sri Kamala Hospital · Appointments"
      title="అపాయింట్‌మెంట్ బుకింగ్"
      subtitle="General Medicine daily · Cardiology Thursdays only. Book OP online and pay at reception."
      icon={Calendar}
    >
      <SafePhoneLink phone={config.hospitalPhone} className="hero-btn-ghost" showIcon iconSize={16}>
        {hospitalPhoneMasked}
      </SafePhoneLink>
      <Link to="/doctors" className="hero-btn-ghost">
        View doctors
      </Link>
    </PageHero>
    <BookingForm />
  </AnimatedPage>
  );
};

export default BookingPage;
