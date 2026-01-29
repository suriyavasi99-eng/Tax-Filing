import React, { useEffect, useState } from "react";
import { Trash2, Save, Plus } from "lucide-react";
import { post, get, del } from "../../../ApiWrapper/apiwrapper";
import { toast } from "react-toastify";

function Irs6627form53({ activeItem, irsReturnId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [taxRate] = useState(0.18);

  const shouldShowTable = activeItem?.item?.irsNo === "53";

  useEffect(() => {
    if (shouldShowTable) {
      fetchEntries();
    }
  }, [activeItem, shouldShowTable]);

  const createEmptyEntry = () => ({
    id: `new_${Date.now()}`,
    part1Id: null,
    oilType: "",
    transactionDate: "",
    crudeOilReceivedBbl: "",
    crudeOilPreTaxedBbl: "",
    crudeOilUsedBeforeTaxBbl: "",
    importedProductsBbl: "",
    taxAmount: 0,
    isNew: true,
  });

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
            oilType:
              row.crudeOilUsedBeforeTaxBbl > 0
                ? "CRUDE_OIL_USED_US"
                : "TAXABLE_CRUDE_OIL",
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

  const addEntry = () => {
    setEntries([...entries, createEmptyEntry()]);
  };

const handleInputChange = (entryId, field, value) => {
  setEntries(
    entries.map((entry) => {
      if (entry.id === entryId) {
        const updated = { ...entry, [field]: value };

        const received = Number(updated.crudeOilReceivedBbl) || 0;        // Line 1
        const preTaxed = Number(updated.crudeOilPreTaxedBbl) || 0;        // Line 2
        const usedBeforeTax = Number(updated.crudeOilUsedBeforeTaxBbl) || 0; // Line 4
        const rate = taxRate; // $0.18 per barrel

        let taxLine3 = 0; // Line 3(c)
        let taxLine4 = 0; // Line 4(c)

        /* -----------------------------------------
           LINE 3 – Taxable crude oil
           (Line 1 − Line 2) × 0.18
        ------------------------------------------ */
        if (received > 0 || preTaxed > 0) {
          const taxableCrude = received - preTaxed; // Line 3(a)
          taxLine3 = taxableCrude * rate;           // Line 3(c)
        }

        /* -----------------------------------------
           LINE 4 – Crude oil used in the U.S.
           Used Before Tax × 0.18
        ------------------------------------------ */
        if (updated.oilType === "CRUDE_OIL_USED_US") {
          taxLine4 = usedBeforeTax * rate; // Line 4(c)
        }

        /* -----------------------------------------
           LINE 5 – Total domestic petroleum tax
           Add Line 3(c) + Line 4(c)
        ------------------------------------------ */
        updated.taxAmount = (taxLine3 + taxLine4).toFixed(2);

        return updated;
      }
      return entry;
    })
  );
};



  const handleSaveAll = async () => {
    if (!activeItem) return;

    try {
      const payloads = entries.map((entry) => ({
        part1Id: entry.isNew ? null : entry.part1Id,
        returnId: Number(irsReturnId),
        irsItemId: activeItem.item.irsItemId,
        oilType: entry.oilType,
        transactionDate: entry.transactionDate,
        crudeOilReceivedBbl: Number(entry.crudeOilReceivedBbl) || 0,
        crudeOilPreTaxedBbl: Number(entry.crudeOilPreTaxedBbl) || 0,
        crudeOilUsedBeforeTaxBbl: Number(entry.crudeOilUsedBeforeTaxBbl) || 0,
        importedProductsBbl: Number(entry.importedProductsBbl) || 0,
        taxAmount: Number(entry.taxAmount) || 0,
        createdAt: entry.isNew ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      }));

      await post(
        `/api/v1/irs6627/part1/petroleum/bulk/${irsReturnId}/${activeItem.item.irsItemId}`,
        payloads
      );

      toast.success("All petroleum entries saved successfully");
      fetchEntries();
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
      setEntries(entries.filter((e) => e.id !== entryId));
      toast.success("Entry deleted successfully");
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete entry");
    }
  };

  const calculateTotalTax = () =>
    entries.reduce((s, e) => s + (Number(e.taxAmount) || 0), 0).toFixed(2);

  const showCrudeOilUsedColumn = entries.some(
    (e) => e.oilType === "CRUDE_OIL_USED_US"
  );

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
      <button
        onClick={addEntry}
        className="mb-4 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-md text-sm font-medium transition border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
      >
        <Plus size={16} />
        Add Another Entry
      </button>

      <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-16">
                #
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[180px]">
                Oil Type
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
                Transaction Date
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
                Crude Oil Received (Bbl)
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
                Crude Oil Pre-Taxed (Bbl)
              </th>

              {showCrudeOilUsedColumn && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[180px]">
                  Crude Oil Used Before Tax (Bbl)
                </th>
              )}

              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[120px]">
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
              <tr
                key={entry.id}
                className="border-b transition hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-600">
                  {index + 1}
                </td>

                <td className="px-4 py-3">
                  <select
                    value={entry.oilType}
                    onChange={(e) =>
                      handleInputChange(entry.id, "oilType", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select</option>
                    <option value="TAXABLE_CRUDE_OIL">
                      Taxable crude oil
                    </option>
                    <option value="CRUDE_OIL_USED_US">
                      Crude oil used in the U.S
                    </option>
                  </select>
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
                  <input
                    type="number"
                    placeholder="0"
                    value={entry.crudeOilReceivedBbl || ""}
                    onChange={(e) =>
                      handleInputChange(
                        entry.id,
                        "crudeOilReceivedBbl",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </td>

                <td className="px-4 py-3">
                  <input
                    type="number"
                    placeholder="0"
                    value={entry.crudeOilPreTaxedBbl || ""}
                    onChange={(e) =>
                      handleInputChange(
                        entry.id,
                        "crudeOilPreTaxedBbl",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </td>

                {showCrudeOilUsedColumn && (
                  <td className="px-4 py-3">
                    {entry.oilType === "CRUDE_OIL_USED_US" ? (
                      <input
                        type="number"
                        placeholder="0"
                        value={entry.crudeOilUsedBeforeTaxBbl || ""}
                        onChange={(e) =>
                          handleInputChange(
                            entry.id,
                            "crudeOilUsedBeforeTaxBbl",
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    ) : (
                      <div className="flex items-center justify-center text-gray-400 text-sm">
                        —
                      </div>
                    )}
                  </td>
                )}

                <td className="px-4 py-3">
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      value={taxRate}
                      readOnly
                      placeholder="0.18"
                      className="w-full border border-gray-300 rounded pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
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
                      onChange={(e) =>
                        handleInputChange(
                          entry.id,
                          "taxAmount",
                          e.target.value
                        )
                      }
                      readOnly={entry.oilType === "TAXABLE_CRUDE_OIL" || entry.oilType === "CRUDE_OIL_USED_US"}
                      className={`w-full border border-gray-300 rounded pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                        (entry.oilType === "TAXABLE_CRUDE_OIL" || entry.oilType === "CRUDE_OIL_USED_US") ? "bg-gray-50" : ""
                      }`}
                    />
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-2 rounded-full transition-all text-red-500 hover:text-red-700 hover:bg-red-50"
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
                <td colSpan={showCrudeOilUsedColumn ? "8" : "7"} className="px-4 py-4 text-right text-gray-800">
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

export default Irs6627form53;