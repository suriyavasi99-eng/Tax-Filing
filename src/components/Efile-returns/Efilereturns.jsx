import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { get, post, put } from "../../ApiWrapper/apiwrapper";
import { toast } from "react-toastify";

const getLastThreeYears = () => {
  const currentYear = new Date().getFullYear();
  return [currentYear, currentYear - 1, currentYear - 2];
};

const quarters = [
  { label: "Jan – Mar", value: "03" },
  { label: "Apr – Jun", value: "06" },
  { label: "Jul – Sep", value: "09" },
  { label: "Oct – Dec", value: "12" }
];

function EfileReturns({ returnData, onClose, onSuccess, filerId }) {
  const [loading, setLoading] = useState(false);
  const [filers, setFilers] = useState([]);
  const [loadingFilers, setLoadingFilers] = useState(true);
const getNow = () => new Date().toISOString();

  const [formData, setFormData] = useState({
    id: "" || null,
    filerId: filerId || "",
    documentId: "doc1",
    taxYr: "",
    // businessName: businessName ||"",
    quarterEnding: "03",
    finalReturn: false,
    addressChange: false,
    createdAt: "",
    updatedAt: ""
  });

  const [errors, setErrors] = useState({});
  const documents = [
  { id: "DOC001", name: "Form 941" },
  { id: "DOC002", name: "Form 940" },
  { id: "DOC003", name: "Form W-2" }
];

  // Fetch filers from RegisteredList API
  useEffect(() => {
    const fetchFilers = async () => {
      try {
        setLoadingFilers(true);
        const res = await get(`/api/v1/filers`);
        setFilers(res?.data?.content || []);
      } catch (error) {
        console.error("Error fetching filers:", error);
        toast.error("Failed to load business names");
      } finally {
        setLoadingFilers(false);
      }
    };
    fetchFilers();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (returnData) {
      setFormData({
        id: returnData.id,
        filerId: returnData.filerId || "",
        documentId: returnData.documentId || "",
        taxYr: returnData.taxYr || "",
        quarterEnding: returnData.quarterEnding || "03",
        finalReturn: returnData.finalReturn || false,
        addressChange: returnData.addressChange || false,
        createdAt: "",
        updatedAt: ""
      });
    }
  }, [returnData]);

  // Set filerId if passed as prop
  useEffect(() => {
    if (filerId) {
      setFormData(prev => ({ ...prev, filerId }));
    }
  }, [filerId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

const validate = () => {
  const newErrors = {};
  if (!formData.filerId) newErrors.filerId = "Business name is required";
  // if (!formData.documentId) newErrors.documentId = "Document is required";
  if (!formData.taxYr) newErrors.taxYr = "Tax Year is required";
  if (!formData.quarterEnding) newErrors.quarterEnding = "Quarter Ending is required";
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

 const handleSubmit = async () => {
  if (!validate()) {
    toast.error("Please fill all mandatory fields");
    return;
  }

  setLoading(true);

  try {
    const now = getNow();

    const payload = formData.id
      ? {
          ...formData,
          updatedAt: now
        }
      : {
          ...formData,
          createdAt: now,
          updatedAt: now
        };

    if (formData.id) {
      await put(`/api/v1/efile/returns/${formData.id}`, payload);
      toast.success("E-File return updated successfully");
    } else {
      await post("/api/v1/efile/returns", payload);
      toast.success("E-File return submitted successfully");
    }

    onSuccess?.();
    onClose();
  } catch (error) {
    console.error(error);
    toast.error("Failed to submit E-File return");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="p-6">
      <div className="flex max-w-7xl mx-auto items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          {formData.id ? "Edit E-File Return" : "Add E-File Return"}
        </h3>
        <button onClick={onClose}>
          <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Business Name Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Name <span className="text-red-500">*</span>
          </label>
          {loadingFilers ? (
            <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-400">
              Loading businesses...
            </div>
          ) : (
            <select
              name="filerId"
              value={formData.filerId}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                errors.filerId ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
            >
              <option value="">Select Business</option>
              {filers.map((filer) => (
                <option key={filer.id} value={filer.id}>
                  {filer.businessNameLine1} - {filer.ein}
                </option>
              ))}
            </select>
          )}
          {errors.filerId && <p className="text-xs text-red-500 mt-1">{errors.filerId}</p>}
        </div>

        {/* <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Document <span className="text-red-500">*</span>
  </label>
  <select
    name="documentId"
    value={formData.documentId}
    onChange={handleChange}
    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
      errors.documentId ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
    }`}
  >
    <option value="">Select Document</option>
    {documents.map((doc) => (
      <option key={doc.id} value={doc.id}>
        {doc.name}
      </option>
    ))}
  </select>
  {errors.documentId && <p className="text-xs text-red-500 mt-1">{errors.documentId}</p>}
</div> */}

        {/* Tax Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tax Year <span className="text-red-500">*</span>
          </label>
          <select
            name="taxYr"
            value={formData.taxYr}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              errors.taxYr ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
            }`}
          >
            <option value="">Select Tax Year</option>
            {getLastThreeYears().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {errors.taxYr && <p className="text-xs text-red-500 mt-1">{errors.taxYr}</p>}
        </div>

        {/* Quarter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quarter Ending <span className="text-red-500">*</span>
          </label>
          <select
            name="quarterEnding"
            value={formData.quarterEnding}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              errors.quarterEnding ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
            }`}
          >
            <option value="">Select Quarter</option>
            {quarters.map((q) => (
              <option key={q.value} value={q.value}>
                {q.label}
              </option>
            ))}
          </select>
          {errors.quarterEnding && <p className="text-xs text-red-500 mt-1">{errors.quarterEnding}</p>}
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              name="finalReturn"
              checked={formData.finalReturn}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Final Return
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              name="addressChange"
              checked={formData.addressChange}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Address Change
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : formData.id ? "Update" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EfileReturns;