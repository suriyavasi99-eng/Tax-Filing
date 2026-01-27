// SignUp.jsx
import React, { useState } from "react";
import {
  ArrowLeft,
  Mail,
  User,
  LockKeyhole,
  Eye,
  EyeOff,
  CircleCheck,
  CircleX,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { post } from "../../ApiWrapper/apiwrapper";

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const passwordChecks = {
    length: (p) => p.length >= 8,
    uppercase: (p) => /[A-Z]/.test(p),
    lowercase: (p) => /[a-z]/.test(p),
    number: (p) => /\d/.test(p),
    special: (p) => /[!@#$%^&*]/.test(p),
  };

  const isEmailValid = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isPasswordValid = (password) =>
    Object.values(passwordChecks).every((check) => check(password));

  const isFormValid = () =>
    form.name.trim() &&
    isEmailValid(form.email) &&
    isPasswordValid(form.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinue = async () => {
    if (!isFormValid()) {
      toast.warning("Please ensure all fields are valid");
      return;
    }

    try {
      setLoading(true);
      const res = await post("/auth/signup", form);

      if (res.status === 200 || res.data?.success) {
        toast.success("Signup successful! Please login.");
        navigate("/login");
      } else {
        toast.error(res.data?.message || "Signup failed");
      }
    } catch {
      toast.error("Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-[Instrument Sans]">
      <div className="bg-white rounded-xl shadow-lg w-[540px] max-h-[90vh] overflow-y-auto flex flex-col">

        {/* Header */}
        <div className="relative px-6 py-4 border-b border-gray-200">
          <button
            onClick={() => navigate("/login")}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-center text-lg font-medium text-[#4A4A4A]">
            Signup
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">

          {/* Name */}
          <div>
            <label className="text-sm text-[#454A53]">
              Name <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="pl-10 w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="Your name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-[#454A53]">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="pl-10 w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="Email address"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-[#454A53]">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="pl-10 pr-10 w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="Strong password"
              />
             <span
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors duration-200"
>
  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
</span>

            </div>

            {/* Password Rules */}
            {form.password && (
              <div className="mt-3 space-y-1 text-sm text-gray-500">
                {Object.entries(passwordChecks).map(([key, check]) => (
                  <div key={key} className="flex items-center gap-2">
                    {check(form.password) ? (
                      <CircleCheck className="text-green-500" size={16} />
                    ) : (
                      <CircleX className="text-gray-400" size={16} />
                    )}
                    <span>{key}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Button */}
          <button
            onClick={handleContinue}
            disabled={!isFormValid() || loading}
            className={`w-full py-3 rounded-lg text-white ${
              isFormValid()
                ? "bg-[#00ACF6] hover:bg-[#0095d9]"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Creating account..." : "Continue"}
          </button>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default SignUp;
