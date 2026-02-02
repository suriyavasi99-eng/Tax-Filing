import React, { useEffect, useState } from "react";
import { Trash2, Save, Plus } from "lucide-react";
import { post, get, del } from "../../../ApiWrapper/apiwrapper";
import { toast } from "react-toastify";

const TAX_RATE = 0.18;

function Irs6627form53({ activeItem, irsReturnId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const shouldShowTable = activeItem?.item?.irsNo === "53";

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
            id: row.part1Id,
            part1Id: row.part1Id,
            transactionDate: row.transactionDate || "",
            crudeOilReceivedBbl: row.crudeOilReceivedBbl ?? "",
            crudeOilPreTaxedBbl: row.crudeOilPreTaxedBbl ?? "",
            crudeOilUsedBeforeTaxBbl: row.crudeOilUsedBeforeTaxBbl ?? "",
            importedProductsBbl: row.importedProductsBbl ?? "",
            taxAmount: row.taxAmount ?? 0,
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
    part1Id: null,
    transactionDate: "",
    crudeOilReceivedBbl: "",
    crudeOilPreTaxedBbl: "",
    crudeOilUsedBeforeTaxBbl: "",
    importedProductsBbl: "",
    taxAmount: 0,
    isNew: true,
  });

  const addEntry = () => setEntries([...entries, createEmptyEntry()]);

  const handleInputChange = (entryId, field, value) => {
    setEntries(
      entries.map((entry) => {
        if (entry.id !== entryId) return entry;

        const updated = { ...entry, [field]: value };

        const received = Number(updated.crudeOilReceivedBbl) || 0;
        const preTaxed = Number(updated.crudeOilPreTaxedBbl) || 0;
        const usedBeforeTax = Number(updated.crudeOilUsedBeforeTaxBbl) || 0;

        // Validate: Crude Oil Received must be >= Crude Oil Pre-Taxed
        if (preTaxed > received) {
          setValidationErrors(prev => ({
            ...prev,
            [entryId]: "Crude Oil Received must be greater than or equal to Crude Oil Pre-Taxed"
          }));
          updated.taxAmount = 0;
        } else {
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[entryId];
            return newErrors;
          });

          const taxableCrude = Math.max(received - preTaxed, 0);

          updated.taxAmount = (
            taxableCrude * TAX_RATE +
            usedBeforeTax * TAX_RATE
          ).toFixed(2);
        }

        return updated;
      })
    );
  };

  const handleSaveAll = async () => {
    if (!activeItem) return;

    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix validation errors before saving ❌");
      return;
    }

    try {
      const payloads = entries.map((entry) => ({
        part1Id: entry.isNew ? null : entry.part1Id,
        returnId: Number(irsReturnId),
        irsItemId: activeItem.item.irsItemId,
        transactionDate: entry.transactionDate,
        crudeOilReceivedBbl: Number(entry.crudeOilReceivedBbl) || 0,
        crudeOilPreTaxedBbl: Number(entry.crudeOilPreTaxedBbl) || 0,
        crudeOilUsedBeforeTaxBbl:
          Number(entry.crudeOilUsedBeforeTaxBbl) || 0,
        importedProductsBbl: Number(entry.importedProductsBbl) || 0,
        taxAmount: Number(entry.taxAmount) || 0,
        createdAt: entry.isNew ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      }));

      await post(
        `/api/v1/irs6627/part1/petroleum/bulk/${irsReturnId}/${activeItem.item.irsItemId}`,
        payloads
      );

      toast.success("All petroleum entries saved successfully ✅");
      fetchEntries();
    } catch (error) {
      console.error("Save failed", error);
      toast.error("Failed to save petroleum entries ❌");
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      if (!String(entryId).startsWith("new_")) {
        await del(`/api/v1/irs6627/part1/petroleum/${entryId}`);
      }
      setEntries(entries.filter((e) => e.id !== entryId));
      toast.success("Entry deleted successfully ✅");
    } catch (err) {
      console.error("Failed to delete entry", err);
      toast.error("Failed to delete entry ❌");
    }
  };

  const calculateTotalTax = () =>
    entries.reduce((s, e) => s + (Number(e.taxAmount) || 0), 0).toFixed(2);

  const showCrudeOilUsedColumn = true;

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
 

      <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
        <div className="overflow-x-scroll scrollbar-hide" style={{ maxHeight: '500px', overflowY: 'auto' }}>
               <table className="w-full border-collapse table-auto">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-16">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
                Transaction Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
                Crude Oil Received (Bbl)
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
                Crude Oil Pre-Taxed (Bbl)
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
                Crude Oil Used Before Tax (Bbl)
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
              <React.Fragment key={entry.id}>
                <tr className="border-b transition hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-600">
                    {index + 1}
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={entry.transactionDate}
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
                    <div>
                      <input
                        type="number"
                        placeholder="0"
                        value={entry.crudeOilReceivedBbl}
                        onChange={(e) =>
                          handleInputChange(
                            entry.id,
                            "crudeOilReceivedBbl",
                            e.target.value
                          )
                        }
                        className={`w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:outline-none border-gray-300 focus:ring-blue-500"
                        `}
                      />
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div>
                      <input
                        type="number"
                        placeholder="0"
                        value={entry.crudeOilPreTaxedBbl}
                        onChange={(e) =>
                          handleInputChange(
                            entry.id,
                            "crudeOilPreTaxedBbl",
                            e.target.value
                          )
                        }
                        className={`w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:outline-none ${
                          validationErrors[entry.id]
                            ? "border-red-500 focus:ring-red-500 bg-red-50"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                      />
                      {validationErrors[entry.id] && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Must be lesser then Received
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      placeholder="0"
                      value={entry.crudeOilUsedBeforeTaxBbl}
                      onChange={(e) =>
                        handleInputChange(
                          entry.id,
                          "crudeOilUsedBeforeTaxBbl",
                          e.target.value
                        )
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
              </React.Fragment>
            ))}
          </tbody>

          {entries.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50 font-bold border-t-2">
                <td colSpan="7" className="px-4 py-4 text-right text-gray-800">
                  Total Tax:
                  <span className="ml-3 text-xl font-bold text-green-600">
                    ${calculateTotalTax()}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-3">
                         <button
        onClick={addEntry}
        className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg text-sm font-medium transition border-gray-400 text-gray-600 hover:border-gray-600 hover:bg-blue-50"
      >
        <Plus size={16} />
        Add
      </button>

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

export default Irs6627form53;