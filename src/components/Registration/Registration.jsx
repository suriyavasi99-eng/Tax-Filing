import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { post, put } from "../../ApiWrapper/apiwrapper";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom'; 

function Registerform({ onSuccess, existingFiler }) {
  const [form, setForm] = useState({
    businessNameControl: "",
    businessNameLine1: "",
    businessNameLine2: "",
    ein: "",
    inCareOfName: "",
    email: "",
    businessPhone: "",
    signingAuthorityName: "",
    signingAuthorityTitle: "",
    signingAuthorityPhone: "",
    hasThirdPartyDesignee: false,
    thirdPartyDesigneeName: "",
    thirdPartyDesigneePhone: "",
    thirdPartyDesigneePin: "",
  });
const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [userId, setUserId] = useState("");
  const userDatas = sessionStorage.getItem("user");
  const userData = userDatas ? JSON.parse(userDatas) : null;
 console.log("email",userData.token);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser.userId || "5");
    }
  }, []);

  useEffect(() => {
    if (existingFiler) {
      setForm({
        businessNameControl: existingFiler.businessNameControl || "",
        businessNameLine1: existingFiler.businessNameLine1 || "",
        businessNameLine2: existingFiler.businessNameLine2 || "",
        ein: existingFiler.ein || "",
        inCareOfName: existingFiler.inCareOfName || "",
        email: existingFiler.email || "",
        businessPhone: `${existingFiler.phoneCountryCode || ""}${existingFiler.phoneNumber || ""}`,
        signingAuthorityName: existingFiler.signingAuthorityName || "",
        signingAuthorityTitle: existingFiler.signingAuthorityTitle || "",
        signingAuthorityPhone: `${existingFiler.signingAuthorityPhoneCountryCode || ""}${existingFiler.signingAuthorityPhone || ""}`,
        hasThirdPartyDesignee: existingFiler.hasThirdPartyDesignee || false,
        thirdPartyDesigneeName: existingFiler.thirdPartyDesigneeName || "",
        thirdPartyDesigneePhone: `${existingFiler.thirdPartyDesigneePhoneCountryCode || ""}${existingFiler.thirdPartyDesigneePhone || ""}`,
        thirdPartyDesigneePin: existingFiler.thirdPartyDesigneePin || "",
      });
    }
  }, [existingFiler]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.businessNameLine1) newErrors.businessNameLine1 = "Business Name is required";
    if (!form.ein) newErrors.ein = "EIN is required";
    if (!form.inCareOfName) newErrors.inCareOfName = "In Care Of Name is required";
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is invalid";
    if (!form.businessPhone) newErrors.businessPhone = "Business phone is required";
    if (!form.signingAuthorityName) newErrors.signingAuthorityName = "Signing Authority Name is required";
    if (!form.signingAuthorityTitle) newErrors.signingAuthorityTitle = "Signing Authority Title is required";
    if (!form.signingAuthorityPhone) newErrors.signingAuthorityPhone = "Signing Authority Phone is required";
    if (form.hasThirdPartyDesignee) {
      if (!form.thirdPartyDesigneeName) newErrors.thirdPartyDesigneeName = "Designee Name is required";
      if (!form.thirdPartyDesigneePhone) newErrors.thirdPartyDesigneePhone = "Designee Phone is required";
      if (!form.thirdPartyDesigneePin) newErrors.thirdPartyDesigneePin = "Designee PIN is required";
      else if (!/^\d{4}$/.test(form.thirdPartyDesigneePin)) newErrors.thirdPartyDesigneePin = "PIN must be 4 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parsePhone = (phone) => {
    if (!phone) return { countryCode: "", number: "" };
    let clean = phone.replace(/\D/g, "");
    let countryCode = clean.length > 10 ? clean.slice(0, clean.length - 10) : "1";
    let number = clean.slice(-10);
    return { countryCode: "+" + countryCode, number };
  };

  const handleRegisterSave = async () => {
    if (!validate()) {
      toast.warning("Please fill the required fields");
      return;
    }
    setLoading(true);

    const businessPhoneParsed = parsePhone(form.businessPhone);
    const signingAuthorityPhoneParsed = parsePhone(form.signingAuthorityPhone);
    const thirdPartyPhoneParsed = parsePhone(form.thirdPartyDesigneePhone);

    const payload = {
      userId: userId,
      businessNameControl: form.businessNameControl || "SGCN",
      businessNameLine1: form.businessNameLine1,
      businessNameLine2: form.businessNameLine2 || "SGCN",
      ein: form.ein,
      inCareOfName: form.inCareOfName,
      email: form.email,
      phoneCountryCode: businessPhoneParsed.countryCode,
      phoneNumber: businessPhoneParsed.number,
      signingAuthorityName: form.signingAuthorityName,
      signingAuthorityTitle: form.signingAuthorityTitle,
      signingAuthorityPhoneCountryCode: signingAuthorityPhoneParsed.countryCode,
      signingAuthorityPhone: signingAuthorityPhoneParsed.number,
      hasThirdPartyDesignee: form.hasThirdPartyDesignee,
      thirdPartyDesigneeName: form.thirdPartyDesigneeName,
      thirdPartyDesigneePhoneCountryCode: thirdPartyPhoneParsed.countryCode,
      thirdPartyDesigneePhone: thirdPartyPhoneParsed.number,
      thirdPartyDesigneePin: form.thirdPartyDesigneePin,
    };

    try {
      if (existingFiler) {
        await put(`/api/v1/filers/${existingFiler.id}`, payload);
        toast.success("updated successfully");
      } else {
        await post("/api/v1/filers", payload);
        toast.success("Registration successful");
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(existingFiler ? "Failed to update" : "Failed to save ");
    } finally {
      setLoading(false);
    }
  };

    const handleSaveAndFile = async () => {
    if (!validate()) {
      toast.warning("Please fill the required fields");
      return;
    }
    setLoading(true);

    const businessPhoneParsed = parsePhone(form.businessPhone);
    const signingAuthorityPhoneParsed = parsePhone(form.signingAuthorityPhone);
    const thirdPartyPhoneParsed = parsePhone(form.thirdPartyDesigneePhone);

    const payload = {
      userId: userId,
      businessNameControl: form.businessNameControl || "SGCN",
      businessNameLine1: form.businessNameLine1,
      businessNameLine2: form.businessNameLine2 || "SGCN",
      ein: form.ein,
      inCareOfName: form.inCareOfName,
      email: form.email,
      phoneCountryCode: businessPhoneParsed.countryCode,
      phoneNumber: businessPhoneParsed.number,
      signingAuthorityName: form.signingAuthorityName,
      signingAuthorityTitle: form.signingAuthorityTitle,
      signingAuthorityPhoneCountryCode: signingAuthorityPhoneParsed.countryCode,
      signingAuthorityPhone: signingAuthorityPhoneParsed.number,
      hasThirdPartyDesignee: form.hasThirdPartyDesignee,
      thirdPartyDesigneeName: form.thirdPartyDesigneeName,
      thirdPartyDesigneePhoneCountryCode: thirdPartyPhoneParsed.countryCode,
      thirdPartyDesigneePhone: thirdPartyPhoneParsed.number,
      thirdPartyDesigneePin: form.thirdPartyDesigneePin,
    };

    try {
      let savedFiler;
      if (existingFiler) {
        savedFiler = await put(`/api/v1/filers/${existingFiler.id}`, payload);
        toast.success("Updated successfully");
      } else {
        savedFiler = await post("/api/v1/filers", payload);
        toast.success("Registration successful");
      }
      const filerId = savedFiler?.data?.id || existingFiler?.id;
      navigate('/filer', { 
        state: { 
          openModal: true, 
          filerId: filerId,
          businessName: form.businessNameLine1 
        } 
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(existingFiler ? "Failed to update" : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg flex flex-col font-[Instrument Sans]">
      <div className="overflow-y-auto flex-1 px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block mb-2 text-[14px] text-[#454A53] font-medium">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              name="businessNameLine1"
              value={form.businessNameLine1}
              onChange={handleChange}
              className={`bg-gray-50 border rounded-lg w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.businessNameLine1 ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.businessNameLine1 && <p className="text-red-500 text-sm">{errors.businessNameLine1}</p>}
          </div>

          <div>
            <label className="block mb-2 text-[14px] text-[#454A53] font-medium">
              EIN <span className="text-red-500">*</span>
            </label>
            <input
              name="ein"
              value={form.ein}
              onChange={handleChange}
              placeholder="XX-XXXXXXX"
              className={`bg-gray-50 border rounded-lg w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.ein ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.ein && <p className="text-red-500 text-sm">{errors.ein}</p>}
          </div>

          <div>
            <label className="block mb-2 text-[14px] text-[#454A53] font-medium">
              In Care Of Name <span className="text-red-500">*</span>
            </label>
            <input
              name="inCareOfName"
              value={form.inCareOfName}
              onChange={handleChange}
              className={`bg-gray-50 border rounded-lg w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.inCareOfName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.inCareOfName && <p className="text-red-500 text-sm">{errors.inCareOfName}</p>}
          </div>

          <div>
            <label className="block mb-2 text-[14px] text-[#454A53] font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`bg-gray-50 border rounded-lg w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div>
            <label className="block mb-2 text-[14px] text-[#454A53] font-medium">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <PhoneInput
              country="us"
              value={form.businessPhone}
              onChange={(value) => setForm({ ...form, businessPhone: value })}
              inputStyle={{
                width: "100%",
                height: "45px",
                borderRadius: "8px",
                border: errors.businessPhone ? "1px solid red" : "1px solid #dbd3d1ff",
                fontSize: "14px",
              }}
              buttonStyle={{ border: "", background: "transparent" }}
              dropdownStyle={{ maxHeight: "200px" }}
            />
            {errors.businessPhone && <p className="text-red-500 text-sm">{errors.businessPhone}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="md:col-span-2">
            <label className="block mb-2 text-[14px] text-[#454A53] font-medium">
              Signing Authority Name <span className="text-red-500">*</span>
            </label>
            <input
              name="signingAuthorityName"
              value={form.signingAuthorityName}
              onChange={handleChange}
              className={`bg-gray-50 border rounded-lg w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.signingAuthorityName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.signingAuthorityName && <p className="text-red-500 text-sm">{errors.signingAuthorityName}</p>}
          </div>
          <div>
            <label className="block mb-2 text-[14px] text-[#454A53] font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              name="signingAuthorityTitle"
              value={form.signingAuthorityTitle}
              onChange={handleChange}
              className={`bg-gray-50 border rounded-lg w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.signingAuthorityTitle ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.signingAuthorityTitle && <p className="text-red-500 text-sm">{errors.signingAuthorityTitle}</p>}
          </div>

          <div>
        <label className="block mb-2 text-[14px] text-[#454A53] font-medium">
          Mobile Number <span className="text-red-500">*</span>
        </label>
        <PhoneInput
          country="us"
          value={form.signingAuthorityPhone}
          onChange={(value) => setForm({ ...form, signingAuthorityPhone: value })}
          inputStyle={{
            width: "100%",
            height: "45px",
            borderRadius: "8px",
            border: errors.signingAuthorityPhone ? "1px solid red" : "1px solid #dbd3d1ff",
            fontSize: "14px",
          }}
          buttonStyle={{ border: "", background: "transparent" }}
          dropdownStyle={{ maxHeight: "200px" }}
        />
        {errors.signingAuthorityPhone && <p className="text-red-500 text-sm">{errors.signingAuthorityPhone}</p>}
      </div>
    </div>

    <h3 className="text-[15px] font-medium text-[#4A4A4A] mt-6 mb-4">
      Third Party Designee
    </h3>
    <label className="flex items-center gap-3 mb-4 text-sm text-gray-700">
      <input
        type="checkbox"
        name="hasThirdPartyDesignee"
        checked={form.hasThirdPartyDesignee}
        onChange={handleChange}
        className="w-4 h-4"
      />
      I want to appoint a third-party designee
    </label>

    {form.hasThirdPartyDesignee && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block mb-2 text-[14px] text-[#454A53] font-medium">
            Designee Name <span className="text-red-500">*</span>
          </label>
          <input
            name="thirdPartyDesigneeName"
            value={form.thirdPartyDesigneeName}
            onChange={handleChange}
            className={`bg-gray-50 border rounded-lg w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.thirdPartyDesigneeName ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.thirdPartyDesigneeName && <p className="text-red-500 text-sm">{errors.thirdPartyDesigneeName}</p>}
        </div>

        <div>
          <label className="block mb-2 text-[14px] text-[#454A53] font-medium">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <PhoneInput
            country="us"
            value={form.thirdPartyDesigneePhone}
            onChange={(value) => setForm({ ...form, thirdPartyDesigneePhone: value })}
            inputStyle={{
              width: "100%",
              height: "45px",
              borderRadius: "8px",
              border: errors.thirdPartyDesigneePhone ? "1px solid red" : "1px solid #dbd3d1ff",
              fontSize: "14px",
            }}
            buttonStyle={{ border: "", background: "transparent" }}
            dropdownStyle={{ maxHeight: "200px" }}
          />
          {errors.thirdPartyDesigneePhone && <p className="text-red-500 text-sm">{errors.thirdPartyDesigneePhone}</p>}
        </div>

        <div>
          <label className="block mb-2 text-[14px] text-[#454A53] font-medium">
            PIN <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="thirdPartyDesigneePin"
            value={form.thirdPartyDesigneePin}
            onChange={handleChange}
            placeholder="4-digit PIN"
            className={`bg-gray-50 border rounded-lg w-full p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.thirdPartyDesigneePin ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.thirdPartyDesigneePin && <p className="text-red-500 text-sm">{errors.thirdPartyDesigneePin}</p>}
        </div>
      </div>
    )}
  </div>

<div className="border-t border-gray-200 p-4 flex justify-end gap-2 bg-white">
  <button
    onClick={handleRegisterSave}
    disabled={loading}
    className={`flex items-center gap-2 px-4 py-2 rounded-md bg-[#2c7eea] text-white hover:bg-[#1f6fd6] transition shadow-sm ${
      loading ? "opacity-50 cursor-not-allowed" : ""
    }`}
  >
    {loading ? "Saving..." : existingFiler ? "Update" : "Save"}
  </button>

  <button
    onClick={handleSaveAndFile}
    disabled={loading}
    className={`flex items-center gap-2 px-4 py-2 rounded-md bg-[#2c7eea] text-white hover:bg-[#1f6fd6] transition shadow-sm ${
      loading ? "opacity-50 cursor-not-allowed" : ""
    }`}
  >
    {loading ? "Saving..." : "Save and File"}
  </button>
</div>

</div>
  );
}

export default Registerform;