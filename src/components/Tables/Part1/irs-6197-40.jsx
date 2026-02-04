import React, { useState, useEffect } from "react";
import { Trash2, Save, Plus } from "lucide-react";
import { post, get, del, put } from "../../../ApiWrapper/apiwrapper";
import { toast } from "react-toastify";

function Irs6197Form40({ activeItem, irsReturnId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fuelEconomyOptions, setFuelEconomyOptions] = useState([]);

  useEffect(() => {
    fetchFuelEconomyOptions();
    fetchEntries();
  }, [activeItem]);

  const fetchFuelEconomyOptions = async () => {
    try {
      const res = await get(`/api/v1/auto-fuel/rates?page=0&size=20`);
      const data = res?.data?.content || [];
      setFuelEconomyOptions(data);
    } catch (err) {
      console.error("Failed to load fuel economy options", err);
      toast.error("Failed to load fuel economy options");
    }
  };

// Update fetchEntries function (around line 28)
const fetchEntries = async () => {
  setLoading(true);
  try {
    const res = await get(
      `/api/v1/auto-fuel/trans/gas-guzzler/${irsReturnId}?returnId=${irsReturnId}&page=0&size=20`
    );

    const data = res?.data?.content || [];

    if (data.length === 0) {
      setEntries([createEmptyEntry()]);
    } else {
      setEntries(
        data.map((row) => ({
          id: row.transId || `existing_${Date.now()}`,
          transId: row.transId,
          taxableEventDate: row.taxableEventDate || "",
          modelName: row.modelName || "",
          modelYear: row.modelYear || "",
          make: row.make || "",
          rateId: row.rateId || "",
          fuelEconomyMpg: "",
          numberOfAutomobiles: row.numVehiclesSold || "",
          taxPerCar: 0,
          calculatedTaxAmount: row.calculatedTax || 0,
          isNew: false,
        }))
      );
    }
  } catch (err) {
    console.error("Failed to load transaction data", err);
    setEntries([createEmptyEntry()]);
  } finally {
    setLoading(false);
  }
};

  const createEmptyEntry = () => ({
    id: `new_${Date.now()}`,
    transId: null,
    taxableEventDate: "",
    modelName: "",
    modelYear: "",
    make: "",
    rateId: "",
    fuelEconomyMpg: "",
    numberOfAutomobiles: "",
    taxPerCar: 0,
    calculatedTaxAmount: 0,
    isNew: true,
  });

  const addEntry = () => setEntries([...entries, createEmptyEntry()]);

  const handleInputChange = (id, field, value) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;

        const updatedEntry = { ...entry, [field]: value };

        if (field === "rateId") {
          const selectedOption = fuelEconomyOptions.find(
            (option) => option.rateId === Number(value)
          );
          updatedEntry.taxPerCar = selectedOption?.taxPerCar || 0;
          updatedEntry.fuelEconomyMpg = selectedOption?.mpgRange || "";
        }

        if (field === "numberOfAutomobiles" || field === "rateId") {
          const automobiles = field === "numberOfAutomobiles" ? Number(value) || 0 : Number(updatedEntry.numberOfAutomobiles) || 0;
          const taxPerCar = updatedEntry.taxPerCar || 0;
          updatedEntry.calculatedTaxAmount = Number((automobiles * taxPerCar).toFixed(2));
        }

        return updatedEntry;
      })
    );
  };

 // Update the handleDeleteEntry function (around line 107)
const handleDeleteEntry = async (id) => {
  const entry = entries.find((e) => e.id === id);
  if (entry.isNew || !entry.transId) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast.success("Entry removed");
    return;
  }
  try {
    // Use DELETE method with transId in the URL
    await del(`/api/v1/auto-fuel/trans/${entry.transId}`);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast.success("Entry deleted successfully");
  } catch (error) {
    console.error("Delete failed", error);
    toast.error("Failed to delete entry");
  }
};

// Update the handleSaveAll function (around line 120)
const handleSaveAll = async () => {
  const hasInvalidEntries = entries.some(
    (entry) =>
      !entry.taxableEventDate ||
      !entry.modelName ||
      !entry.modelYear ||
      !entry.make ||
      !entry.rateId ||
      !entry.numberOfAutomobiles
  );

  if (hasInvalidEntries) {
    toast.error("Please fill in all required fields");
    return;
  }

  try {
    const newEntries = entries.filter((entry) => entry.isNew);
    const existingEntries = entries.filter((entry) => !entry.isNew);

    if (newEntries.length > 0) {
      const newPayloads = newEntries.map((entry) => ({
        transId: null,
        returnId: Number(irsReturnId),
        irsItemId: activeItem.item.irsItemId,
        rateId: Number(entry.rateId),
        numVehiclesSold: Number(entry.numberOfAutomobiles) || 0,
        make: entry.make,
        modelName: entry.modelName,
        modelYear: Number(entry.modelYear) || 0,
        calculatedTax: Number(entry.calculatedTaxAmount) || 0,
        taxableEventDate: entry.taxableEventDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      await post(`/api/v1/auto-fuel/trans`, newPayloads);
    }

    // Update existing entries
    for (const entry of existingEntries) {
      const updatePayload = {
        returnId: Number(irsReturnId),
        irsItemId: activeItem.item.irsItemId,
        rateId: Number(entry.rateId),
        numVehiclesSold: Number(entry.numberOfAutomobiles) || 0,
        make: entry.make,
        modelName: entry.modelName,
        modelYear: Number(entry.modelYear) || 0,
        calculatedTax: Number(entry.calculatedTaxAmount) || 0,
        taxableEventDate: entry.taxableEventDate,
        updatedAt: new Date().toISOString(),
      };
      
      // Use PUT method with transId in the URL
      await put(`/api/v1/auto-fuel/trans/${entry.transId}`, updatePayload);
    }

    toast.success("All entries saved successfully");
    fetchEntries();
  } catch (error) {
    console.error("Save failed", error);
    toast.error("Failed to save entries");
  }
};

  const calculateTotalTax = () =>
    entries.reduce((s, e) => s + (Number(e.calculatedTaxAmount) || 0), 0).toFixed(2);

  if (loading) {
    return (
      <div className="p-5 text-center text-gray-500">
        Loading transaction data...
      </div>
    );
  }

  return (
    <div className="p-5">
          <div className="flex justify-end p-4 border-b bg-gray-50">
        <button
          onClick={addEntry}
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg text-sm font-medium transition border-gray-400 text-gray-600 hover:border-gray-600 hover:bg-blue-50"
        >
          <Plus size={16} />
          Add Another Entry
        </button>
      </div>
      <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
        <div className="overflow-auto scrollbar-hide" style={{ maxHeight: "500px" }}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                  Tax Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                  Model Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                  Model Year
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                  Make
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-48">
                  Fuel Economy (Mpg)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                  Number Of Automobiles
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-32">
                  Tax Amount
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry.id} className="border-b transition hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={entry.taxableEventDate}
                      onChange={(e) =>
                        handleInputChange(entry.id, "taxableEventDate", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="mm/dd/yyyy"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={entry.modelName}
                      onChange={(e) =>
                        handleInputChange(entry.id, "modelName", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={entry.modelYear}
                      onChange={(e) =>
                        handleInputChange(entry.id, "modelYear", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={entry.make}
                      onChange={(e) =>
                        handleInputChange(entry.id, "make", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <select
                      value={entry.rateId}
                      onChange={(e) =>
                        handleInputChange(entry.id, "rateId", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Select</option>
                      {fuelEconomyOptions.map((option) => (
                        <option key={option.rateId} value={option.rateId}>
                          {option.mpgRange}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={entry.numberOfAutomobiles}
                      onChange={(e) =>
                        handleInputChange(entry.id, "numberOfAutomobiles", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      step="0.01"
                      readOnly
                      value={entry.calculatedTaxAmount}
                      className="w-full border border-gray-300 bg-gray-50 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-not-allowed"
                    />
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-2 rounded-full transition-all text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {entries.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 font-bold border-t-2">
                  <td colSpan="6" className="px-4 py-4 text-right text-gray-800">
                    Total Tax:
                    <span className="ml-3 text-xl font-bold text-green-600">
                      ${calculateTotalTax()}
                    </span>
                  </td>
                  <td colSpan="2" className="px-4 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={handleSaveAll}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all shadow-md active:scale-95"
                      >
                        <Save size={18} />
                        Save
                      </button>
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

export default Irs6197Form40;