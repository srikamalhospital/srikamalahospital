import React from 'react';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import PageHero from '../components/PageHero';
import Doctors from '../components/Doctors';

const DoctorsPage = () => (
  <AnimatedPage>
    <PageHero
      variant="primary"
      eyebrow="Our clinical team"
      title="వైద్య నిపుణులు"
      subtitle="Consult with Dr. D. Kiran — General Medicine. Book OP or chat with the AI assistant for preliminary guidance."
      icon={Users}
    >
      <Link to="/book" className="hero-btn-primary">
        Book appointment
      </Link>
    </PageHero>
    <Doctors />
  </AnimatedPage>
);

export default DoctorsPage;
