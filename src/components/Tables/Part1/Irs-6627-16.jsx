import React, { useEffect, useState } from "react";
import { Trash2, Save, Plus } from "lucide-react";
import { post, get, del } from "../../../ApiWrapper/apiwrapper";
import { toast } from "react-toastify";
import { data } from "react-router-dom";

const TAX_RATE = 0.18;

function Irs6627Form16({ activeItem, irsReturnId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const shouldShowTable = activeItem?.item?.irsNo === "16";

  useEffect(() => {
    if (shouldShowTable) {
      fetchEntries();
    }
  }, [activeItem, shouldShowTable]);

const fetchEntries = async () => {
  if (!activeItem?.item?.irsItemId) return;
  setLoading(true);
  try {
    const res = await get(
      `/api/v1/irs6627/part1/petroleum/${irsReturnId}/${activeItem.item.irsItemId}?returnId=${irsReturnId}&page=0&size=20`
    );
    const data = res?.data?.content || [];
    if (data.length === 0) {
      setEntries([createEmptyEntry()]);
    } else {
      setEntries(
        data.map((row) => ({
          id: row.part1Id || `existing_${row.irsItemId}_${row.transactionDate}`,
          transactionDate: row.transactionDate || "",
          importedProductsBbl: row.importedProductsBbl || "",
          taxAmount: row.taxAmount ? row.taxAmount.toFixed(2) : "0.00",
          isNew: false,
        }))
      );
    }
  } catch (err) {
    console.error("Failed to load petroleum data", err);
    setEntries([createEmptyEntry()]);
  } finally {
    setLoading(false);
  }
};

  const createEmptyEntry = () => ({
    id: `new_${Date.now()}`,
    transactionDate: "",
    importedProductsBbl: "",
    taxAmount: "0.00",
    isNew: true,
  });

  const addEntry = () => {
    setEntries([...entries, createEmptyEntry()]);
  };

  const handleInputChange = (entryId, field, value) => {
    setEntries(
      entries.map((entry) => {
        if (entry.id !== entryId) return entry;

        const updatedEntry = { ...entry, [field]: value };

        if (field === "importedProductsBbl") {
          const bbl = parseFloat(value) || 0;
          updatedEntry.taxAmount = (bbl * TAX_RATE).toFixed(2);
        }

        return updatedEntry;
      })
    );
  };

const handleSaveAll = async () => {
  if (!activeItem) return;

  try {
    const newEntries = entries.filter(entry => entry.isNew);
    const existingEntries = entries.filter(entry => !entry.isNew);
    const createPayloads = newEntries.map((entry) => ({
      part1Id: null,
      returnId: parseInt(irsReturnId) || 0,
      irsItemId: activeItem.item.irsItemId,
      transactionDate: entry.transactionDate,
      crudeOilReceivedBbl: 0,
      crudeOilPreTaxedBbl: 0,
      crudeOilUsedBeforeTaxBbl: 0,
      importedProductsBbl: parseFloat(entry.importedProductsBbl) || 0,
      taxAmount: parseFloat(entry.taxAmount) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    const updatePayloads = existingEntries.map((entry) => ({
      part1Id: entry.id,
      returnId: parseInt(irsReturnId) || 0,
      irsItemId: activeItem.item.irsItemId,
      transactionDate: entry.transactionDate,
      crudeOilReceivedBbl: 0,
      crudeOilPreTaxedBbl: 0,
      crudeOilUsedBeforeTaxBbl: 0,
      importedProductsBbl: parseFloat(entry.importedProductsBbl) || 0,
      taxAmount: parseFloat(entry.taxAmount) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Combine both create and update payloads
    const allPayloads = [...createPayloads, ...updatePayloads];

    if (allPayloads.length > 0) {
      await post(
        `/api/v1/irs6627/part1/petroleum/bulk/${irsReturnId}/${activeItem.item.irsItemId}`,
        allPayloads
      );

      toast.success("All petroleum entries saved successfully");
      await fetchEntries();
    }
  } catch (error) {
    console.error("Save failed", error);
    toast.error("Failed to save petroleum entries");
  }
};

  const handleDeleteEntry = async (entryId) => {
    try {
      if (!String(entryId).startsWith("new_")) {
        await del(`/api/v1/irs6627/part1/petroleum/${entryId}`);
      }
      setEntries(entries.filter((entry) => entry.id !== entryId));
      toast.success("Entry deleted successfully");
    } catch (err) {
      console.error("Failed to delete entry", err);
      toast.error("Failed to delete entry");
    }
  };

  const calculateTotalTax = () => {
    return entries
      .reduce((sum, e) => sum + (parseFloat(e.taxAmount) || 0), 0)
      .toFixed(2);
  };

  if (!shouldShowTable) return null;

  if (loading) {
    return (
      <div className="p-5 text-center text-gray-500">
        Loading petroleum data...
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
      <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-16">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
                Transaction Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
                No of Barrels (Bbl)
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
                Tax Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[120px]">
                Tax Amount
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 w-32">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.id} className="border-b transition hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-600">
                  {index + 1}
                </td>

                <td className="px-4 py-3">
                  <input
                    type="date"
                    value={entry.transactionDate}
                    onChange={(e) =>
                      handleInputChange(entry.id, "transactionDate", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </td>

                <td className="px-4 py-3">
                  <input
                    type="number"
                    placeholder="0"
                    value={entry.importedProductsBbl}
                    onChange={(e) =>
                      handleInputChange(entry.id, "importedProductsBbl", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </td>

                <td className="px-4 py-3">
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      value={TAX_RATE}
                      readOnly
                      className="w-full border border-gray-300 rounded pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      readOnly
                      value={entry.taxAmount}
                      className="w-full border border-gray-300 rounded pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            ))}
          </tbody>

          {entries.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50 font-bold border-t-2">
                <td colSpan="5" className="px-4 py-4 text-right text-gray-800">
                  Total Tax:
                  <span className="ml-3 text-xl font-bold text-green-600">
                    ${calculateTotalTax()}
                  </span>
                </td>
                <td className="px-4 py-4">
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
  );
}

export default Irs6627Form16;
