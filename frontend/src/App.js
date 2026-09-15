import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./components/dashboard/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Notes
import Notes from "./pages/modules/Notes";
import UploadNote from "./pages/modules/UploadNote";
import NoteDetail from "./pages/modules/NoteDetail";

// Hackathons
import Hackathons from "./pages/modules/Hackathons";
import HackathonDetail from "./pages/modules/HackathonDetail";
import CreateHackathon from "./pages/modules/CreateHackathon";
import MyHackathons from "./pages/modules/MyHackathons";

// Tech Issues
import TechIssuesList from "./pages/modules/tech-issues/TechIssuesList";
import CreateTechIssue from "./pages/modules/tech-issues/CreateTechIssue";
import TechIssueDetails from "./pages/modules/tech-issues/TechIssueDetails";
import MyIssues from "./pages/modules/tech-issues/MyIssues";

// Events
import Events from "./pages/modules/Events";
import EventDetails from "./pages/modules/EventDetails";
import CreateEvent from "./pages/modules/CreateEvent";
import MyCreatedEvents from "./pages/modules/MyCreatedEvents";

// Community
import CommunityFeed from "./pages/modules/community/CommunityFeed";

// Careers
import CareersLayout from "./pages/modules/careers/CareersLayout";
import InternshipsPage from "./pages/modules/careers/InternshipsPage";
import InternshipDetail from "./pages/modules/careers/InternshipDetail";
import PostInternship from "./pages/modules/careers/PostInternship";
import MyApplications from "./pages/modules/careers/MyApplications";
import ManageApplicants from "./pages/modules/careers/ManageApplicants";
import InternshipChat from "./pages/modules/careers/InternshipChat";
import ReferralsPage from "./pages/modules/careers/ReferralsPage";
import CareersHome from "./pages/modules/careers/CareersHome";

import AIInterviewPrep from "./pages/modules/AIInterviewPrep";
import CompanyPlacementMocks from "./pages/modules/CompanyPlacementMocks";

function App() {
  const token = localStorage.getItem("campusconnect_token");

  return (
    <Router>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Landing />} />

        {/* Auth */}
        <Route
          path="/login"
          element={token ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/" /> : <Register />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />

        {/* AI Interview Prep & Company Mocks */}
        <Route path="/interview-prep" element={<AIInterviewPrep />} />
        <Route path="/company-mocks" element={<CompanyPlacementMocks />} />

        {/* Notes */}
        <Route path="/notes" element={<Notes />} />
        <Route path="/notes/upload" element={<UploadNote />} />
        <Route path="/notes/:id" element={<NoteDetail />} />

        {/* Hackathons */}
        <Route path="/hackathons" element={<Hackathons />} />
        <Route path="/hackathons/create" element={<CreateHackathon />} />
        <Route path="/hackathons/my" element={<MyHackathons />} />
        <Route path="/hackathons/:id" element={<HackathonDetail />} />

        {/* Tech Issues */}
        <Route path="/tech-issues" element={<TechIssuesList />} />
        <Route path="/tech-issues/create" element={<CreateTechIssue />} />
        <Route path="/tech-issues/:id" element={<TechIssueDetails />} />
        <Route path="/tech-issues/my" element={<MyIssues />} />

        {/* Events */}
        <Route path="/events" element={<Events />} />
        <Route path="/events/create" element={<CreateEvent />} />
        <Route path="/events/my" element={<MyCreatedEvents />} />
        <Route path="/events/:eventId" element={<EventDetails />} />

        {/* Community */}
        <Route path="/community" element={<CommunityFeed />} />

        {/* Careers & Internships */}
        <Route path="/careers" element={<CareersLayout />}>
          <Route index element={<CareersHome />} />
          <Route path="internships" element={<InternshipsPage />} />
          <Route path="referrals" element={<ReferralsPage />} />
          <Route path="my-applications" element={<MyApplications />} />
          <Route path="chat" element={<InternshipChat />} />
          <Route path="chat/:chatId" element={<InternshipChat />} />
        </Route>
        <Route path="/careers/internships/:id" element={<InternshipDetail />} />
        <Route path="/careers/internships/:id/applicants" element={<ManageApplicants />} />
        <Route path="/careers/post" element={<PostInternship />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
