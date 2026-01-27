import React from "react";
import { motion } from "framer-motion";
import SignUp from "../components/Signup/signup";
import loginimage from "../Asset/Tax-bro.png";
import Header from "../components/Header/header";
import Footer from "../components/Footer/Footer";

function SignupPages() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header/>

      {/* Main content area with proper spacing */}
      <div className="flex flex-1 mt-16">
        {/* LEFT – SIGNUP */}
        <motion.div
          initial={{ x: -150, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full md:w-1/2 flex items-center justify-center px-10 py-8"
        >
          <SignUp />
        </motion.div>

        {/* RIGHT – FULL HEIGHT GIF */}
        <motion.div
          initial={{ x: 150, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden md:block md:w-1/2"
          style={{
            backgroundImage: `url(${loginimage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>

      <Footer />
    </div>
  );
}

export default SignupPages;