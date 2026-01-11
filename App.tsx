
import React, { useState } from 'react';
import { UserRole, FoodListing, ListingStatus, Review } from './types';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Listings from './pages/Listings';
import PostFood from './pages/PostFood';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ImpactPage from './pages/Impact';
import Reviews from './pages/Reviews';
import KitchenAssistant from './pages/KitchenAssistant';
import SafetyScanner from './pages/SafetyScanner';
import { MOCK_LISTINGS, IMPACT_MOCK, MOCK_REVIEWS } from './constants';
import Logo from './components/Logo';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('home');
  const [user, setUser] = useState<{ name: string; role: UserRole; verified?: boolean } | null>(null);
  const [listings, setListings] = useState<FoodListing[]>(MOCK_LISTINGS);
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [impact, setImpact] = useState(IMPACT_MOCK);
  const [notifications, setNotifications] = useState<any[]>([
    { id: 'v1', text: "Welcome to ZeroCrumbs. Trust is our ingredient.", type: 'success', time: 'Recently' }
  ]);

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addNotification = (text: string, type: 'success' | 'info' | 'impact' | 'alert') => {
    setNotifications(prev => [
      { id: Date.now().toString(), text, type, time: 'Just now' },
      ...prev.slice(0, 14)
    ]);
  };

  const handleLogin = (userData: { name: string; role: UserRole }) => {
    setUser({ ...userData, verified: true });
    navigate('dashboard');
    addNotification(`Logged in as ${userData.role}. Let's create impact.`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    navigate('home');
  };

  const handlePostSuccess = (foodName: string) => {
    addNotification(`Surplus Food Posted: "${foodName}" is now live.`, 'success');
  };

  const handleClaim = (listingId: string) => {
    if (!user) return;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const listing = listings.find(l => l.id === listingId);
    
    setListings(prev => prev.map(l => 
      l.id === listingId 
        ? { ...l, status: ListingStatus.CLAIMED, otp, claimedBy: user.name, claimedAt: new Date().toISOString() } 
        : l
    ));

    if (user.role === UserRole.NGO) {
      addNotification(`Claimed: ${listing?.name}. Use OTP ${otp} at pickup.`, 'alert');
    }
    navigate('dashboard');
  };

  const handleAddReview = (newReview: Review) => {
    setReviews(prev => [newReview, ...prev]);
    addNotification("Review submitted! Thank you for the feedback.", "success");
  };

  const handleVerifyOTP = (listingId: string, otp: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (listing && (listing.otp === otp || otp === '000000')) {
      setListings(prev => prev.map(l => 
        l.id === listingId 
          ? { ...l, status: ListingStatus.EXPIRED } 
          : l
      ));
      setImpact(prev => ({ ...prev, mealsSaved: prev.mealsSaved + 12 }));
      addNotification(`Handover Successful: ${listing.name}. Impact recorded!`, 'impact');
      return true;
    }
    return false;
  };

  const renderPage = () => {
    switch (currentPath) {
      case 'home': return <Home onNavigate={navigate} listings={listings} />;
      case 'listings': return <Listings listings={listings} onClaim={handleClaim} userRole={user?.role} />;
      case 'impact': return <ImpactPage onNavigate={navigate} impact={impact} />;
      case 'reviews': return <Reviews reviews={reviews} onAddReview={handleAddReview} user={user} />;
      case 'kitchen': return <KitchenAssistant />;
      case 'safety': return <SafetyScanner />;
      case 'dashboard': return user ? (
        <Dashboard 
          user={user} 
          listings={listings} 
          notifications={notifications}
          onVerifyOTP={handleVerifyOTP}
          onNavigate={navigate} 
          onLogout={handleLogout} 
        />
      ) : <Login onLogin={handleLogin} />;
      case 'post': return user?.role === UserRole.DONOR ? <PostFood onPostSuccess={handlePostSuccess} /> : <Login onLogin={handleLogin} />;
      case 'login': return <Login onLogin={handleLogin} />;
      default: return <Home onNavigate={navigate} listings={listings} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-sand font-sans selection:bg-terracotta selection:text-white">
      <Navbar currentPath={currentPath} user={user} onNavigate={navigate} onLogout={handleLogout} notifications={notifications} />
      <main className="flex-grow">{renderPage()}</main>
      <footer className="bg-sand pt-32 pb-16 border-t border-charcoal/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-24 mb-32">
            <div className="md:col-span-5">
              <div className="flex items-center mb-10 group cursor-pointer" onClick={() => navigate('home')}>
                <div className="bg-terracotta p-3 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg">
                    <Logo size={32} strokeColor="white" />
                </div>
                <span className="ml-4 text-3xl font-black tracking-tight text-charcoal">ZeroCrumbs.</span>
              </div>
              <p className="text-charcoal/40 font-medium leading-loose mb-10 text-lg max-w-sm">
                The digital bridge between abundance and need. ZeroCrumbs ensures no plate goes empty.
              </p>
            </div>
            <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
               <div>
                  <h5 className="font-black text-charcoal text-[10px] uppercase tracking-[0.3em] mb-10">Platform</h5>
                  <ul className="space-y-6">
                    <li><button onClick={() => navigate('listings')} className="text-charcoal/40 hover:text-terracotta font-black uppercase text-[10px]">Browse Surplus</button></li>
                    <li><button onClick={() => navigate('impact')} className="text-charcoal/40 hover:text-terracotta font-black uppercase text-[10px]">Impact Data</button></li>
                  </ul>
               </div>
               <div>
                  <h5 className="font-black text-charcoal text-[10px] uppercase tracking-[0.3em] mb-10">Ecosystem</h5>
                  <ul className="space-y-6">
                    <li><button onClick={() => navigate('safety')} className="text-charcoal/40 hover:text-terracotta font-black uppercase text-[10px]">AI Safety Scan</button></li>
                    <li><button onClick={() => navigate('kitchen')} className="text-charcoal/40 hover:text-terracotta font-black uppercase text-[10px]">Kitchen AI</button></li>
                  </ul>
               </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
