import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import UserProfile from './components/UserProfile';
import AdminDashboard from './Admin/AdminDashboard';
import AdminHeader from './Admin/AdminHeader';
import UserManagement from './Admin/UserManagement';
import Birthday from './components/Birthday';
import VenueSelection from './components/VenueBirthday';
import AddVenue from './Admin/AddVenueForBirthday';
import AddService from './Admin/Addservices';
import BirthdayInfo from './Admin/BirthdayInfo';
import OrganizerDashboard from './Organizer/OrganizerDashboard';
import EventCategories from './Organizer/EventCategories';
import EventViewDetail from './components/EventViewDetail';
import Allevent from './components/Allevent';
import AdminAllViewEvent from './Admin/AdminAllViewEvent';
import ManageOrgnizer from './Admin/ManageOrgnizer';
import Addeventbyadmin from './Admin/Addeventbyadmin';
import RegisteredEvents from './components/RegisteredEvents';
import BookedEvents from "./components/BookedEvents";
import AdminAbout from "./Admin/AdminAbout";
import AdminPayments from "./Admin/AdminPayments";
import BirthdayEventDetail from "./components/BirthdayEventDetail";
import PaymentDetail from './components/PaymentDetail';
import ManageTeam from './Admin/ManageTeam';
import ManageProfile from './Admin/ManageProfile';
import Admin from './Admin/Admin';
import ContactManagement   from './Admin/ContactManagement';
import ManageFeedback from './Organizer/ManageFeedback';
import BirthdayPayment from './Admin/BirthdayPayments';

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>

          {/* USER ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/" element={<Header />} />
          <Route path="/" element={<Footer />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/birthdayevent" element={<Birthday />} />
          <Route path="/venue" element={<VenueSelection />} />
          <Route path="/event-detail/:eventId" element={<EventViewDetail />} />
          <Route path="/alleventview" element={<Allevent />} />
          <Route path="/registered-events" element={<RegisteredEvents />} />
          <Route path="/book-event" element={<BookedEvents />} />
          <Route path="/birthday-event-detail/:id" element={<BirthdayEventDetail />} />
          <Route path="/payment-detail/:paymentId" element={<PaymentDetail />} />






          {/* ADMIN ROUTES */}



          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/adminheader" element={<AdminHeader />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/add-venue" element={<AddVenue />} />
          <Route path="/admin/add-service" element={<AddService />} />
          <Route path="/admin/birthdayinfo" element={<BirthdayInfo />} />
          <Route path="/admin/events/all" element={<AdminAllViewEvent />} />
          <Route path="/admin/manageorgnizer" element={<ManageOrgnizer />} />
          <Route path="/admin/events/add" element={<Addeventbyadmin />} />
          <Route path="/admin/settings/about" element={<AdminAbout />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/settings/manage-team" element={<ManageTeam />} />
          <Route path="/admin/settings/manage-carousel" element={<Admin />} />
          <Route path="/admin/settings/manage-profile" element={<ManageProfile />} />
          <Route path="/admin/contacts" element={<ContactManagement />} />
          <Route path="/admin/feedback" element={<ManageFeedback />} />
          <Route path="/admin/birthday-payments" element={<BirthdayPayment />} />






          {/* ORGANIZER ROUTES */}


          <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
          <Route path="/organizer/add" element={<EventCategories />} />
         

        </Routes>
      </div>

    </BrowserRouter>
  );
}

export default App;
