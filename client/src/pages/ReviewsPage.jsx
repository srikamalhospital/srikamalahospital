import React from 'react';
import { Star } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import PageHero from '../components/PageHero';
import PatientReviews from '../components/PatientReviews';

const ReviewsPage = () => (
  <AnimatedPage wide>
    <PageHero
      variant="secondary"
      eyebrow="Patient voices"
      title="రోగి అభిప్రాయాలు"
      subtitle="Read experiences from our patients and share your own. Featured reviews also appear on Google."
      icon={Star}
    />
    <PatientReviews showSubmitForm />
  </AnimatedPage>
);

export default ReviewsPage;
