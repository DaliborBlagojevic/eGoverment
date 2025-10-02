import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/footer";
import Header from "../components/header";

const MainPage: React.FC = () => {
  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Top bar */}
      <Header />


      <MainPage />
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainPage;
