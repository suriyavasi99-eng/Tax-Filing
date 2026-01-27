import React from "react";
import { motion } from "framer-motion";
import Login from "../components/Login/login";
import loginimage from "../Asset/Tax-bro.png";
import Header from "../components/Header/header";
import Footer from "../components/Footer/Footer";

function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header/>

      <div className="flex flex-1 mt-16">
        <motion.div
          initial={{ x: -150, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden md:block md:w-1/2"
          style={{
            backgroundImage: `url(${loginimage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <motion.div
          initial={{ x: 150, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full md:w-1/2 flex items-center justify-center px-10 py-8"
        >
          <Login />
        </motion.div>

      </div>
        <Footer/>

    </div>
  );
}

export default LoginPage;