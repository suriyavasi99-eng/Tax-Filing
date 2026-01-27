import React, { useState } from "react";
import {
  ArrowLeft,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { post } from "../../ApiWrapper/apiwrapper";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlecreateaccount = () => navigate("/signup");

  const isFormValid = () => form.email.trim() && form.password.trim();

  const handleContinue = async () => {
    if (!isFormValid()) {
      toast.warning("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const res = await post("/auth/login", form);

      if (res.status === 200 || res.data?.success) {
        toast.success("Login successful");

        sessionStorage.setItem(
          "user",
          JSON.stringify({
            email: form.email,
            token: res.data?.token,
            userId: res.data?.userId,
          })
        );

        navigate("/register");
      } else {
        toast.error(res.data?.message || "Login failed");
      }
    } catch (error) {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-[Instrument Sans]">
      <div className="bg-white rounded-xl shadow-lg w-[540px] max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="relative px-6 py-4 border-b border-gray-200">
          {/* <button className="absolute top-4 left-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </button> */}
          <h2 className="text-center text-[#4A4A4A] font-medium text-lg">
            Login
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 grid grid-cols-1 gap-4">

          {/* Email */}
          <div>
            <label className="block mb-2 text-[14px] text-[#454A53]">
              Email ID <span className="text-[#e93c11ff]">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="pl-10 bg-gray-50 border rounded-lg w-full p-2.5 text-sm"
                placeholder="Enter Email ID"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-[14px] text-[#454A53]">
              Password <span className="text-[#e93c11ff]">*</span>
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="pl-10 pr-10 bg-gray-50 border rounded-lg w-full p-2.5 text-sm"
                placeholder="Enter your password"
              />
        <span
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors duration-200"
>
  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
</span>

            </div>

            <p className="text-[14px] mt-2">
              <span
                onClick={handlecreateaccount}
                className="text-[#00ACF6] cursor-pointer"
              >
                Create a new Account
              </span>
            </p>
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
            {loading ? "Logging in..." : "Continue"}
          </button>

        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Login;
