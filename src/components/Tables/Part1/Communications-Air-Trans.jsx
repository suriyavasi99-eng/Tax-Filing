// CommunicationsTable.jsx
import React from "react";
import { Trash2, Save, Plus } from "lucide-react";

function CommunicationsTable({
  entries,
  activeItem,
  onAddEntry,
  onInputChange,
  onDeleteEntry,
  onSaveAll,
  calculateTotalTax,
}) {
  const shouldShowTable = activeItem?.category?.categoryId === 2;

  if (!shouldShowTable) {
    return null;
  }

  // Determine master checkbox state based on all entries
  const allChecked = entries.length > 0 && entries.every(entry => entry.checked);
  const someChecked = entries.some(entry => entry.checked) && !allChecked;

  // Handle master checkbox toggle - applies to all rows
  const handleMasterCheckboxChange = (checked) => {
    entries.forEach(entry => {
      onInputChange(entry.id, "checked", checked);
    });
  };

  return (
    <div className="p-5">
      <div className="mb-4 flex items-center justify-end gap-4">
       

        {/* Master Checkbox with Label */}
        <div className="flex items-center gap-3 p-3 rounded-lg">
          <input 
            type="checkbox"
            checked={allChecked}
            onChange={(e) => handleMasterCheckboxChange(e.target.checked)}
            className="h-5 w-5 accent-blue-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-16">
                #
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[200px]">
                Collected Date
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[200px]">
                Billed Date
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[200px]">
                Tax Amount
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 w-32">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {entries.map((entry, index) => {
              const isChecked = entry.checked || false;

              return (
                <tr
                  key={entry.id}
                  className="border-b transition hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-600">
                    {index + 1}
                  </td>

                  {/* Collected Date - Read-only when unchecked (Alternative), Editable when checked (Regular) */}
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={entry.collectedDate || ""}
                      onChange={(e) =>
                        onInputChange(entry.id, "collectedDate", e.target.value)
                      }
                      disabled={!isChecked}
                      className={`w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                        !isChecked ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    />
                  </td>

                  {/* Billed Date - Editable when unchecked (Alternative), Disabled when checked (Regular) */}
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={entry.billedDate || ""}
                      onChange={(e) =>
                        onInputChange(entry.id, "billedDate", e.target.value)
                      }
                      disabled={isChecked}
                      className={`w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                        isChecked ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    />
                  </td>

                  <td className="px-4 py-3">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500 text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={entry.amount || ""}
                        onChange={(e) =>
                          onInputChange(entry.id, "amount", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="p-2 rounded-full transition-all text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {entries.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50 font-bold border-t-2">
                <td colSpan="4" className="px-4 py-4 text-right text-gray-800">
                  Total Tax:
                  <span className="ml-3 text-xl font-bold text-green-600">
                    ${calculateTotalTax()}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-3">
 {/* Add Entry Button */}
        <button
          onClick={onAddEntry}
          className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-md text-sm font-medium transition border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
        >
          <Plus size={16} />
          Add
        </button>

         <button
                    onClick={onSaveAll}
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

export default CommunicationsTable;