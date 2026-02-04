
import React, { useEffect, useState } from "react";
import { Trash2, Save, Plus } from "lucide-react";
import { post, get, del } from "../../../ApiWrapper/apiwrapper";
import { toast } from "react-toastify";
import Select from "react-select";
import { useRef } from "react";


function Irs6627form54({ activeItem, irsReturnId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chemicals, setChemicals] = useState([]);
  const shouldShowTable = activeItem?.item?.irsNo === "54";
  const hasFetchedEntries = useRef(false);
  const hasFetchedChemicals = useRef(false);



useEffect(() => {
  if (
    shouldShowTable &&
    chemicals.length > 0 &&
    irsReturnId &&
    !hasFetchedEntries.current
  ) {
    hasFetchedEntries.current = true;
    fetchEntries();
  }
}, [shouldShowTable, chemicals, irsReturnId]);


useEffect(() => {
  if (hasFetchedChemicals.current) return;
  hasFetchedChemicals.current = true;
  fetchChemicals();
}, []);

const fetchChemicals = async () => {
  try {
    const res = await get("/api/v1/chemical-lookups"); 
    setChemicals(res?.data?.content || []);
    console.log("chemical lookups",res);
    
  } catch (err) {
    console.error("Failed to load chemicals", err);
    toast.error("Failed to load chemical list");
  }
};

 const fetchEntries = async () => {
  if (!irsReturnId) return;
  setLoading(true);
  try {
    const res = await get(
      `/api/v1/irs6627/part2/chemicals?returnId=${irsReturnId}&page=0&size=20`
    );
    const data = res?.data?.content || [];
    if (data.length === 0) {
      setEntries([createEmptyEntry()]);
      return;
    }
    const mappedEntries = data.map((row) => {
      const chemical = chemicals.find(
        (c) => c.chemicalId === row.chemicalId
      );
      return {
        id: row.part2Id,          
        chemicalId: String(row.chemicalId),
        transactionDate: row.transactionDate
          ? row.transactionDate.split("T")[0]
          : "",
        quantityTons: row.quantityTons ?? "",
        taxRatePerTon:
          row.taxRatePerTon ?? chemical?.taxRate ?? "",
        taxAmount:
          row.taxAmount ??
          ((row.quantityTons || 0) *
            (row.taxRatePerTon || chemical?.taxRate || 0)),
        isNew: false,
      };
    });

    setEntries(mappedEntries);
  } catch (err) {
    console.error("Failed to load chemical data", err);
    setEntries([createEmptyEntry()]);
  } finally {
    setLoading(false);
  }
};


  const createEmptyEntry = () => ({
    id: `new_${Date.now()}`,
    chemicalId: "",
    transactionDate: "",
    quantityTons: "",
    taxRatePerTon: "",
    taxAmount: 0,
    isNew: true,
  });

  const addEntry = () => {
    setEntries([...entries, createEmptyEntry()]);
  };

  // Calculate tax for each entry
  const calculateTaxForEntry = (entry) => {
    const quantity = parseFloat(entry.quantityTons) || 0;
    const rate = parseFloat(entry.taxRatePerTon) || 0;
    
    const totalTax = quantity * rate;
    return parseFloat(totalTax.toFixed(2));
  };

  const handleInputChange = (entryId, field, value) => {
    setEntries(
      entries.map((entry) => {
        if (entry.id === entryId) {
          const updatedEntry = { ...entry, [field]: value };
          if (field === "quantityTons" || field === "taxRatePerTon") {
            updatedEntry.taxAmount = calculateTaxForEntry(updatedEntry);
          }
          
          return updatedEntry;
        }
        return entry;
      })
    );
  };

const handleSaveAll = async () => {
  if (!activeItem) return;
  const invalidEntries = entries.filter(entry => 
    entry.chemicalId === "" || entry.chemicalId === null || entry.chemicalId === undefined
  );
  if (invalidEntries.length > 0) {
    console.log("Invalid entries:", invalidEntries);
    toast.error("Please select a chemical for all entries before saving");
    return;
  }

  try {
  const payloads = entries.map((entry) => ({
  part2Id: entry.isNew ? null : entry.id,
  returnId: parseInt(irsReturnId),
  chemicalId: parseInt(entry.chemicalId),
  transactionDate: entry.transactionDate,
  quantityTons: parseFloat(entry.quantityTons) || 0,
  taxRatePerTon: parseFloat(entry.taxRatePerTon) || 0,
  taxAmount: parseFloat(entry.taxAmount) || 0,
}));

    console.log("Saving payloads:", payloads);

    await post(
      `/api/v1/irs6627/part2/chemicals/bulk/${irsReturnId}`,
      payloads
    );
    toast.success("All chemical entries saved successfully");

    await fetchEntries();
  } catch (error) {
    console.error("Save failed", error);
    toast.error("Failed to save chemical entries");
  }
};

//   const handleDeleteEntry = async (entryId) => {
//     try {
//       if (!String(entryId).startsWith("new_")) {
//         await del(`/api/v1/irs6627/part2/chemical/${entryId}`);
//       }
//       setEntries(entries.filter((entry) => entry.id !== entryId));
//       toast.success("Entry deleted successfully");
//     } catch (err) {
//       console.error("Failed to delete entry", err);
//       toast.error("Failed to delete entry");
//     }
//   };

  const calculateTotalTax = () => {
    return entries
      .reduce((sum, e) => sum + (parseFloat(e.taxAmount) || 0), 0)
      .toFixed(2);
  };

  if (!shouldShowTable) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-5 text-center text-gray-500">
        Loading chemical data...
      </div>
    );
  }

  return (
    <div className="p-5">
      {/* Add Entry Button */}
      <div className="flex justify-end">
             <button
        onClick={addEntry}
        className="mb-4 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-md text-sm font-medium transition border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
      >
        <Plus size={16} />
        Add Another Entry
      </button>

      </div>
 

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-16">
                #
              </th>
               <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[180px]">
                Transaction Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
                Chemical Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
                Quantity (Tons)
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
                Tax Rate (per Ton)
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
                Tax Amount
                <span className="block text-xs font-normal text-gray-500">(Auto-calculated)</span>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 w-32">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr
                key={entry.id}
                className="border-b transition hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-600">
                  {index + 1}
                </td>
                  <td className="px-4 py-3">
                  <input
                    type="date"
                    value={entry.transactionDate || ""}
                    onChange={(e) =>
                      handleInputChange(
                        entry.id,
                        "transactionDate",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </td>
<td className="px-4 py-3">
  <div className="relative">
    <select
      value={entry.chemicalId || ""}
      onChange={(e) => {
        const selectedChemicalId = e.target.value;
        
        if (selectedChemicalId) {
          // Find the selected chemical
          const selectedChemical = chemicals.find(
            c => c.chemicalId === parseInt(selectedChemicalId)
          );
          
          // Update both chemicalId and taxRatePerTon at once
          setEntries(entries.map(ent => {
            if (ent.id === entry.id) {
              const updatedEntry = {
                ...ent,
                chemicalId: selectedChemicalId,
                taxRatePerTon: selectedChemical ? selectedChemical.taxRate : ""
              };
              // Recalculate tax amount
              updatedEntry.taxAmount = calculateTaxForEntry(updatedEntry);
              return updatedEntry;
            }
            return ent;
          }));
        } else {
          // Handle empty selection
          setEntries(entries.map(ent => {
            if (ent.id === entry.id) {
              return {
                ...ent,
                chemicalId: "",
                taxRatePerTon: "",
                taxAmount: 0
              };
            }
            return ent;
          }));
        }
      }}
      className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '1.25rem'
      }}
    >
      <option value="" disabled className="text-gray-400">
        Select Chemical...
      </option>
      {chemicals.map((c) => (
        <option 
          key={c.chemicalId} 
          value={c.chemicalId}
          className="py-2 text-gray-800"
        >
          {c.chemicalName} ({c.generalFormula})
        </option>
      ))}
    </select>
  </div>
</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={entry.quantityTons || ""}
                    onChange={(e) =>
                      handleInputChange(entry.id, "quantityTons", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={entry.taxRatePerTon || ""}
                      onChange={(e) =>
                        handleInputChange(entry.id, "taxRatePerTon", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                      placeholder="0.00"
                      value={entry.taxAmount || ""}
                      readOnly
                      className="w-full border border-gray-300 rounded pl-7 pr-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center">
                    <button
                    //   onClick={() => handleDeleteEntry(entry.id)}
                      className="p-2 rounded-full transition-all text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
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
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={handleSaveAll}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all shadow-md active:scale-95"
                  >
                    <Save size={18} />
                    Save
                  </button>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

export default Irs6627form54;