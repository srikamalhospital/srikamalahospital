import React from 'react';
import { Calendar, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import PageHero from '../components/PageHero';
import BookingForm from '../components/BookingForm';

const BookingPage = () => (
  <AnimatedPage maxWidth="max-w-5xl">
    <PageHero
      variant="booking"
      eyebrow="Sri Kamala Hospital · Appointments"
      title="అపాయింట్‌మెంట్ బుకింగ్"
      subtitle="General Medicine daily · Cardiology Thursdays only. Book OP online and pay at reception."
      icon={Calendar}
    >
      <a href="tel:+919948076665" className="hero-btn-ghost">
        <Phone size={16} /> 99480 76665
      </a>
      <Link to="/doctors" className="hero-btn-ghost">
        View doctors
      </Link>
    </PageHero>
    <BookingForm />
  </AnimatedPage>
);

export default BookingPage;
