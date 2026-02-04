import React, { useEffect, useState } from "react";
import { Trash2, Save, Plus } from "lucide-react";
import { post, get, del, put } from "../../../ApiWrapper/apiwrapper";
import { toast } from "react-toastify";
import Irs6197Form40 from "./irs-6197-40";

function FuelTaxesTable({ activeItem, irsReturnId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [standardRates, setStandardRates] = useState([]);
  
  // Determine category type
  const categoryName = activeItem?.category?.categoryName;
  const isFuel = categoryName === "Fuel";
  const isRetail = categoryName === "Retail";
  const isShipPassenger = categoryName === "Ship Passenger";
  const isObligation = categoryName === "Other Excise" && activeItem?.item?.irsNo === "31";
  const isForeignInsurance = categoryName === "Foreign Insurance" && activeItem?.item?.irsNo === "30";
  
  // Show checkboxes for specific fuel IRS numbers
  const showCheckboxes = isFuel && ["14", "35", "60", "62", "69", "77", "79", "111"].includes(activeItem?.item?.irsNo);
  
  // Show dropdown for specific fuel IRS numbers
  const showDropdown = isFuel && ["60", "35", "62"].includes(activeItem?.item?.irsNo);
  const isManufacturer = categoryName === "Manufacturer";
const isManufacturerPerTon = isManufacturer && ["36", "38"].includes(activeItem?.item?.irsNo);
const isManufacturerAdValorem = isManufacturer && ["37", "39"].includes(activeItem?.item?.irsNo);
const isManufacturerOther = isManufacturer && !["36", "37", "38", "39"].includes(activeItem?.item?.irsNo);
const isGasGuzzler = categoryName === "Manufacturer" && activeItem?.item?.irsNo === "40";

  
  // Show dropdown for Foreign Insurance
  const showForeignInsuranceDropdown = isForeignInsurance;
  
  // Determine if table should be shown
  const shouldShowTable = isFuel || isRetail || isShipPassenger || isObligation || isForeignInsurance || isManufacturer;

  useEffect(() => {
    if (shouldShowTable) {
      fetchStandardRates();
      fetchEntries();
    }
  }, [activeItem, shouldShowTable]);

  const fetchStandardRates = async () => {
    try {
      const res = await get(`/api/v1/fuel/standard-rates/fuel-item-id/${activeItem.item.irsItemId}?page=0&size=20`);
      const data = res?.data?.content || [];
      setStandardRates(data);
      
      // For Retail, Ship Passenger, and Obligation - automatically set the tax rate from the first item
      // For Foreign Insurance - don't auto-set, let user choose from dropdown
      if ((isRetail || isShipPassenger || isObligation) && data.length > 0) {
        const defaultRate = data[0];
        console.log("Default tax rate loaded:", defaultRate);
      }
    } catch (err) {
      console.error("Failed to load standard rates", err);
      toast.error("Failed to load standard rates");
    }
  };

  const fetchEntries = async () => {
    setLoading(true);

    try {
      const res = await get(
        `/api/v1/fuel/standard-trans/${irsReturnId}/${activeItem.item.irsItemId}?returnId=${irsReturnId}&irsItemId=${activeItem.item.irsItemId}&page=0&size=20`
      );

      const data = res?.data?.content || [];

      if (data.length === 0) {
        setEntries([createEmptyEntry()]);
      } else {
        setEntries(
          data.map((row) => {
            const entry = {
              id: row.stdTransId || `existing_${Date.now()}`,
              stdTransId: row.stdTransId,
              taxableEventDate: row.taxableEventDate || "",
              stdRateId: row.stdRateId || "",
              taxableGallons: row.taxableGallons ?? "",
              taxRateUsed: row.taxRateUsed ?? 0,
              calculatedTaxAmount: row.calculatedTaxAmount ?? 0,
              isTwoPartyExchange: row.isTwoPartyExchange ?? false,
              isReceiversExchange: row.isReceiversExchange ?? false,
              isNew: false,
            };

            // For Retail, Ship Passenger, and Obligation - ensure tax rate is set from standardRates if missing
            // For Foreign Insurance - don't auto-set, user must select from dropdown
            if ((isRetail || isShipPassenger || isObligation || isManufacturerAdValorem || isManufacturerPerTon || isManufacturerOther) && !entry.taxRateUsed && standardRates.length > 0) {
              entry.stdRateId = standardRates[0].stdRateId;
              entry.taxRateUsed = standardRates[0].taxRatePerGallon;
            }

            return entry;
          })
        );
      }
    } catch (err) {
      console.error("Failed to load transaction data", err);
      setEntries([createEmptyEntry()]);
    } finally {
      setLoading(false);
    }
  };

  const createEmptyEntry = () => {
    const entry = {
      id: `new_${Date.now()}`,
      stdTransId: null,
      taxableEventDate: "",
      stdRateId: "",
      taxableGallons: "",
      taxRateUsed: 0,
      calculatedTaxAmount: 0,
      isTwoPartyExchange: false,
      isReceiversExchange: false,
      isNew: true,
    };

    // For Retail, Ship Passenger, and Obligation - set default rate from standardRates
    // For Foreign Insurance - leave empty, user must select from dropdown
    if ((isRetail || isShipPassenger || isObligation || isManufacturerAdValorem || isManufacturerPerTon || isManufacturerOther) && standardRates.length > 0) {
      entry.stdRateId = standardRates[0].stdRateId;
      entry.taxRateUsed = standardRates[0].taxRatePerGallon;
    }

    return entry;
  };

  const addEntry = () => setEntries([...entries, createEmptyEntry()]);

  const handleInputChange = (id, field, value) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;

        const updatedEntry = { ...entry, [field]: value };

        // If stdRateId is changed, update the tax rate (for Fuel dropdown and Foreign Insurance dropdown)
        if (field === "stdRateId" && (showDropdown || showForeignInsuranceDropdown)) {
          const selectedRate = standardRates.find(
            (rate) => rate.stdRateId === Number(value)
          );
          updatedEntry.taxRateUsed = selectedRate?.taxRatePerGallon || 0;
        }

        // For fuel items without dropdown, use the first rate from standardRates
        if (isFuel && !showDropdown && standardRates.length > 0 && !updatedEntry.stdRateId) {
          updatedEntry.stdRateId = standardRates[0].stdRateId;
          updatedEntry.taxRateUsed = standardRates[0].taxRatePerGallon || 0;
        }

        // For Retail, Ship Passenger, and Obligation - automatically set the rate from standardRates
        // Foreign Insurance uses dropdown, so don't auto-set
        if ((isRetail || isShipPassenger || isObligation || isManufacturerAdValorem || isManufacturerPerTon || isManufacturerOther) && standardRates.length > 0) {
          if (!updatedEntry.stdRateId) {
            updatedEntry.stdRateId = standardRates[0].stdRateId;
          }
          updatedEntry.taxRateUsed = standardRates[0].taxRatePerGallon || 0;
        }

        // Recalculate tax amount based on category type and checkbox states
      if (
  field === "taxableGallons" ||
  field === "stdRateId" ||
  field === "isTwoPartyExchange" ||
  field === "isReceiversExchange"
) {
  const gallons =
    field === "taxableGallons"
      ? Number(value) || 0
      : Number(updatedEntry.taxableGallons) || 0;

  const rate = Number(updatedEntry.taxRateUsed) || 0;

  if (isFuel) {
    const isTwoParty =
      field === "isTwoPartyExchange"
        ? value
        : updatedEntry.isTwoPartyExchange;

    const isReceivers =
      field === "isReceiversExchange"
        ? value
        : updatedEntry.isReceiversExchange;

    if (!isTwoParty || (isTwoParty && isReceivers)) {
      // exact calculation (no rounding)
      updatedEntry.calculatedTaxAmount = Number(
        (gallons * rate).toFixed(2)
      );
    } else {
      updatedEntry.calculatedTaxAmount = Number(
        gallons.toString()
      );
    }
  } else {
    // exact calculation (no rounding)
    updatedEntry.calculatedTaxAmount = Number(
      (gallons * rate).toString()
    );
  }
}
        return updatedEntry;
      })
    );
  };

  const handleDeleteEntry = async (id) => {
    const entry = entries.find((e) => e.id === id);
    if (entry.isNew || !entry.stdTransId) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Entry removed");
      return;
    }
    try {
      await del(`/api/v1/fuel/standard-trans/${entry.stdTransId}`);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Entry deleted successfully");
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete entry");
    }
  };

  const handleSaveAll = async () => {
    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix validation errors before saving");
      return;
    }
    
    const hasInvalidEntries = entries.some(
      (entry) => !entry.taxableEventDate || !entry.stdRateId || !entry.taxableGallons
    );
    
    if (hasInvalidEntries) {
      const fieldName = isRetail ? "Selling Price" : 
                       isShipPassenger ? "Passengers" : 
                       isObligation ? "Amount of Obligations" :
                       isForeignInsurance ? "Premium Amount" : 
                       "Gallons";
      toast.error(`Please fill in all required fields (Date, Type, ${fieldName})`);
      return;
    }
    
    try {
      // Separate new and existing entries
      const newEntries = entries.filter(entry => entry.isNew);
      const existingEntries = entries.filter(entry => !entry.isNew);
      
      if (newEntries.length > 0) {
        const newPayloads = newEntries.map((entry) => ({
          stdTransId: null,
          returnId: Number(irsReturnId),
          stdRateId: Number(entry.stdRateId),
          taxableGallons: Number(entry.taxableGallons) || 0,
          taxRateUsed: Number(entry.taxRateUsed) || 0,
          calculatedTaxAmount: Number(entry.calculatedTaxAmount) || 0,
          taxableEventDate: entry.taxableEventDate,
          isTwoPartyExchange: entry.isTwoPartyExchange || false,
          isReceiversExchange: entry.isReceiversExchange || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          irsItemId: activeItem.item.irsItemId,
        }));

        await post(`/api/v1/fuel/standard-trans`, newPayloads);
      }

      // Update existing entries
      for (const entry of existingEntries) {
        const updatePayload = {
          stdTransId: entry.stdTransId,
          returnId: Number(irsReturnId),
          stdRateId: Number(entry.stdRateId),
          taxableGallons: Number(entry.taxableGallons) || 0,
          taxRateUsed: Number(entry.taxRateUsed) || 0,
          calculatedTaxAmount: Number(entry.calculatedTaxAmount) || 0,
          taxableEventDate: entry.taxableEventDate,
          isTwoPartyExchange: entry.isTwoPartyExchange || false,
          isReceiversExchange: entry.isReceiversExchange || false,
          createdAt: entry.createdAt,
          updatedAt: new Date().toISOString(),
          irsItemId: activeItem.item.irsItemId,
        };
        await put(`/api/v1/fuel/standard-trans/${entry.stdTransId}`, updatePayload);
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

  // Get dynamic column labels based on category
  const getGallonsLabel = () => {
    if (isRetail) return "Selling Price";
    if (isShipPassenger) return "No of Passengers";
    if (isObligation) return "Amount of Obligations";
    if (isForeignInsurance) return "Premium Amount";
      if (isManufacturerPerTon) return "Number of Tons";
  if (isManufacturerAdValorem) return "Sales Price";
    if (isManufacturerOther) return "Number of Tries";
    return "No of Gallons";
  };

  const getGallonsPlaceholder = () => {
    if (isRetail) return "0.00";
    if (isShipPassenger) return "0";
    if (isObligation) return "0.00";
    if (isForeignInsurance) return "0.00";
      if (isManufacturerPerTon) return "0.00";
  if (isManufacturerAdValorem) return "0.00";
    if (isManufacturerOther) return "0.00";
    return "0";
  };
  

  if (!shouldShowTable) return null;

  if (loading) {
    return (
      <div className="p-5 text-center text-gray-500">
        Loading transaction data...
      </div>
    );
  }

  if (isGasGuzzler) {
  return <Irs6197Form40 activeItem={activeItem} irsReturnId={irsReturnId} />;
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
        <div className="overflow-auto scrollbar-hide" style={{ maxHeight: '500px' }}>
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-16">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-40">
                  Tax Date
                </th>
                {(showDropdown || showForeignInsuranceDropdown) && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-64">
                    {showForeignInsuranceDropdown ? "Type of Insurance" : "Type of Use"}
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-36">
                  {getGallonsLabel()}
                </th>
                {showCheckboxes && (
                  <>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 w-40">
                      Two Party Exchange
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 w-40">
                      Receivers Exchange
                    </th>
                  </>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-32">
                  Tax Rate
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-32">
                  Tax Amount
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 w-24">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {entries.map((entry, index) => (
                <React.Fragment key={entry.id}>
                  <tr className="border-b transition hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-600">
                      {index + 1}
                    </td>

                   {/* // Update the date input field (around line 360-370) */}
<td className="px-4 py-3">
  <input
    type="date"
    value={entry.taxableEventDate}
    onChange={(e) =>
      handleInputChange(
        entry.id,
        "taxableEventDate",
        e.target.value
      )
    }
    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
    placeholder="mm/dd/yyyy"
  />
</td>

                    {(showDropdown || showForeignInsuranceDropdown) && (
                      <td className="px-4 py-3">
                        <select
                          value={entry.stdRateId}
                          onChange={(e) =>
                            handleInputChange(entry.id, "stdRateId", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="">{showForeignInsuranceDropdown ? "Select Insurance Type" : "Select Type"}</option>
                          {standardRates.map((rate) => (
                            <option key={rate.stdRateId} value={rate.stdRateId}>
                              {rate.fuelName}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}

                    <td className="px-4 py-3">
                      <div className="relative">
                        {(isRetail || isObligation || isForeignInsurance) && (
                          <span className="absolute left-3 top-2 text-gray-500 text-sm">
                            $
                          </span>
                        )}
                        <input
                          type="number"
                          placeholder={getGallonsPlaceholder()}
                          value={entry.taxableGallons}
                          onChange={(e) =>
                            handleInputChange(entry.id, "taxableGallons", e.target.value)
                          }
                          className={`w-full border border-gray-300 rounded ${(isRetail || isObligation || isForeignInsurance) ? 'pl-7' : 'px-3'} pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                        />
                      </div>
                    </td>

                    {showCheckboxes && (
                      <>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={entry.isTwoPartyExchange}
                            onChange={(e) =>
                              handleInputChange(entry.id, "isTwoPartyExchange", e.target.checked)
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={entry.isReceiversExchange}
                            onChange={(e) =>
                              handleInputChange(entry.id, "isReceiversExchange", e.target.checked)
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                      </>
                    )}

                    <td className="px-4 py-3">
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500 text-sm">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={entry.taxRateUsed}
                          readOnly
                          className="w-full border border-gray-300 bg-gray-50 rounded pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-not-allowed"
                        />
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500 text-sm">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          readOnly
                          value={entry.calculatedTaxAmount}
                          className="w-full border border-gray-300 bg-gray-50 rounded pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-not-allowed"
                        />
                      </div>
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
                </React.Fragment>
              ))}
            </tbody>

            {entries.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 font-bold border-t-2">
                  <td 
                    colSpan={
                      showCheckboxes && (showDropdown || showForeignInsuranceDropdown) ? 7 : 
                      showCheckboxes ? 6 : 
                      (showDropdown || showForeignInsuranceDropdown) ? 5 : 
                      4
                    } 
                    className="px-4 py-4 text-right text-gray-800"
                  >
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

export default FuelTaxesTable;