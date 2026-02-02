import React, { useEffect, useState } from "react";
import { Trash2, Save, Plus } from "lucide-react";
import { post, get, del } from "../../../ApiWrapper/apiwrapper";
import { toast } from "react-toastify";

function Irs6627form98({ activeItem, irsReturnId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [odcOptions, setOdcOptions] = useState([]);

  const shouldShowTable = activeItem?.item?.irsNo === "98";

  useEffect(() => {
    if (shouldShowTable) {
      fetchOdcOptions();
      fetchEntries();
    }
  }, [activeItem, shouldShowTable]);

  const fetchOdcOptions = async () => {
    try {
      const res = await get("/api/v1/lookups/odcs?page=0&size=20");
      const data = res?.data?.content || [];
      setOdcOptions(data);
    } catch (err) {
      console.error("Failed to load ODC options", err);
      toast.error("Failed to load ODC options");
    }
  };

  const fetchEntries = async () => {
    setLoading(true);

    try {
      const res = await get(
        `/api/v1/irs6627/part4/odc-trans?returnId=${irsReturnId}&page=0&size=20`
      );

      const data = res?.data?.content || [];

      if (data.length === 0) {
        setEntries([createEmptyEntry()]);
      } else {
        setEntries(
          data.map((row) => ({
            id: row.part4Id || `existing_${Date.now()}`,
            part4Id: row.part4Id,
            transactionDate: row.transactionDate || "",
            odcId: row.odcId || "",
            pounds: row.pounds ?? "",
            ratePerPound: row.ratePerPound ?? 0,
            taxAmount: row.taxAmount ?? 0,
            isNew: false,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load ODC transaction data", err);
      setEntries([createEmptyEntry()]);
    } finally {
      setLoading(false);
    }
  };

  const createEmptyEntry = () => ({
    id: `new_${Date.now()}`,
    part4Id: null,
    transactionDate: "",
    odcId: "",
    pounds: "",
    ratePerPound: 0,
    taxAmount: 0,
    isNew: true,
  });

  const addEntry = () => setEntries([...entries, createEmptyEntry()]);

  const handleInputChange = (id, field, value) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;

        const updatedEntry = { ...entry, [field]: value };

        // If ODC is changed, update the rate per pound
        if (field === "odcId") {
          const selectedOdc = odcOptions.find(
            (odc) => odc.odcId === Number(value)
          );
          updatedEntry.ratePerPound = selectedOdc?.taxPerPound || 0;
        }

        // Recalculate tax amount when pounds or rate changes
        if (field === "pounds" || field === "odcId") {
          const pounds = field === "pounds" ? Number(value) || 0 : Number(updatedEntry.pounds) || 0;
          const rate = updatedEntry.ratePerPound || 0;
          updatedEntry.taxAmount = (pounds * rate).toFixed(2);
        }

        return updatedEntry;
      })
    );
  };

  const handleDeleteEntry = async (id) => {
    const entry = entries.find((e) => e.id === id);
    if (entry.isNew || !entry.part4Id) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Entry removed");
      return;
    }
    try {
      await del(`/api/v1/irs6627/part4/odc-trans/${entry.part4Id}`);
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

    // Validate that all entries have required fields
    const hasInvalidEntries = entries.some(
      (entry) => !entry.transactionDate || !entry.odcId || !entry.pounds
    );

    if (hasInvalidEntries) {
      toast.error("Please fill in all required fields (Date, ODC, Pounds)");
      return;
    }

    try {
      const payloads = entries.map((entry) => ({
        part4Id: entry.isNew ? null : entry.part4Id,
        returnId: Number(irsReturnId),
        odcId: Number(entry.odcId),
        transactionDate: entry.transactionDate,
        pounds: Number(entry.pounds) || 0,
        ratePerPound: Number(entry.ratePerPound) || 0,
        taxAmount: Number(entry.taxAmount) || 0,
        election: "string",
        createdAt: entry.isNew ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      }));

      await post(
       `/api/v1/irs6627/part4/odc-trans/bulk/${irsReturnId}/${activeItem.item.irsItemId}`,
        payloads
      );

      toast.success("All ODC entries saved successfully ✅");
      fetchEntries();
    } catch (error) {
      console.error("Save failed", error);
      toast.error("Failed to save ODC entries");
    }
  };

  const calculateTotalTax = () =>
    entries.reduce((s, e) => s + (Number(e.taxAmount) || 0), 0).toFixed(2);

  if (!shouldShowTable) return null;

  if (loading) {
    return (
      <div className="p-5 text-center text-gray-500">
        Loading ODC transaction data...
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
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-16">
            #
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
            Tax Date
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[250px]">
            ODC Name
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[150px]">
            No of Pounds
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
                <select
                  value={entry.odcId}
                  onChange={(e) =>
                    handleInputChange(entry.id, "odcId", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select ODC</option>
                  {odcOptions.map((odc) => (
                    <option key={odc.odcId} value={odc.odcId}>
                      {odc.odcCode} - {odc.notes}
                    </option>
                  ))}
                </select>
              </td>

              <td className="px-4 py-3">
                <input
                  type="number"
                  placeholder="0"
                  value={entry.pounds}
                  onChange={(e) =>
                    handleInputChange(entry.id, "pounds", e.target.value)
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
                    value={entry.ratePerPound}
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
                    readOnly
                    value={entry.taxAmount}
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
            <td colSpan="6" className="px-4 py-4 text-right text-gray-800">
              Total Tax:
              <span className="ml-3 text-xl font-bold text-green-600">
                ${calculateTotalTax()}
              </span>
            </td>
            <td className="px-4 py-4">
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

export default Irs6627form98;