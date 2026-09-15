// src/modules/careers/CareersPage.jsx

import InternshipSection from "./InternshipSection";
import ReferralSection from "./ReferralSection";

const CareersPage = () => {
  // DEMO USER
  const user = {
    name: "Bhavesh",
    year: 3
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">
        Internships & Referrals
      </h1>

      <InternshipSection user={user} />
      <ReferralSection />
    </div>
  );
};

export default CareersPage;