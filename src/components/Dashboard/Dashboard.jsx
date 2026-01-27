import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, Edit, Save, X } from "lucide-react";
import { get, post, del } from "../../ApiWrapper/apiwrapper";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const { id: irsReturnId } = useParams();
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await get("/api/v1/tax-categories/getAllMenus");
        setCategories(res?.data || []);
      } catch (err) {
        console.error("Failed to load menus", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, []);

  const toggleCategory = (categoryId) => {
    setActiveCategoryId(activeCategoryId === categoryId ? null : categoryId);
  };

  const selectItem = async (category, item) => {
    setActiveItem({ category, item });
    setLoading(true);
    setEditingEntryId(null);
    setEditData({});

    try {
      const res = await get(
        `/api/v1/irs720/communication-air/irs-item/${irsReturnId}/${item.irsItemId}?page=0&size=200`
      );

      const data = res?.data?.content || [];
      setEntries(
        data.map((row) => ({
          id: row.id,
          txnDate: row.txnDate,
          amount: row.amount,
          isNew: false,
        }))
      );
    } catch (err) {
      console.error("Failed to load item data", err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = () => {
    const newEntry = {
      id: `new_${Date.now()}`,
      txnDate: "",
      amount: "",
      isNew: true,
    };
    setEntries([...entries, newEntry]);
    setEditingEntryId(newEntry.id);
    setEditData({ txnDate: "", amount: "" });
  };

  const handleEditEntry = (entry) => {
    setEditingEntryId(entry.id);
    setEditData({
      txnDate: entry.txnDate,
      amount: entry.amount,
    });
  };

  const handleCancelEdit = () => {
    // If it's a new entry, remove it from the list
    if (editingEntryId && String(editingEntryId).startsWith("new_")) {
      setEntries(entries.filter((entry) => entry.id !== editingEntryId));
    }
    setEditingEntryId(null);
    setEditData({});
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

const handleSaveEntry = async () => {
  if (!activeItem || !editingEntryId) return;

  try {
    const currentEntry = entries.find((e) => e.id === editingEntryId);
    
    const payload = {
      id: currentEntry.isNew ? null : currentEntry.id,
      returnId: parseInt(irsReturnId) || 0,
      irsItemId: activeItem.item.irsItemId,
      methodType: "Direct",
      amount: parseFloat(editData.amount) || 0,
      txnDate: editData.txnDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await post("/api/v1/irs720/communication-air/irs-item", [payload]);
    toast.success("Entry saved successfully ✅");

    await selectItem(activeItem.category, activeItem.item);

    setEditingEntryId(null);
    setEditData({});
  } catch (error) {
    console.error("Save/Edit failed", error);
    toast.error("Failed to save entry ❌");
  }
};


const handleDeleteEntry = async (entryId) => {
  try {
    if (!String(entryId).startsWith("new_")) {
      await del(`/api/v1/irs720/communication-air/${entryId}`);
    }
    setEntries(entries.filter((entry) => entry.id !== entryId));

    if (editingEntryId === entryId) {
      setEditingEntryId(null);
      setEditData({});
    }

    toast.success("Entry deleted successfully ✅");
  } catch (err) {
    console.error("Failed to delete entry", err);
    toast.error("Failed to delete entry ❌");
  }
};

  const calculateTax = (amount) => {
    return (parseFloat(amount) || 0).toFixed(2);
  };

  const calculateTotalTax = () => {
    return entries
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
      .toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading tax categories...
      </div>
    );
  }

  return (
    <>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="flex h-screen font-sans">
        {/* <ToastContainer /> */}

        {/* Sidebar */}
        <aside className="w-80 border border-gray-200 rounded-lg shadow-lg overflow-y-auto scrollbar-hide bg-white">
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
            <h1 className="text-xl font-bold text-gray-800">Form 720</h1>
            <p className="text-sm text-gray-600">
              Quarterly Federal Excise Tax Return
            </p>
          </div>

          <div className="p-4 space-y-2">
            {categories.map((category) => (
              <div key={category.categoryId}>
                <button
                  onClick={() => toggleCategory(category.categoryId)}
                  className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-gray-100 font-semibold text-sm transition"
                >
                  {category.categoryName}
                  {activeCategoryId === category.categoryId ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>

                {activeCategoryId === category.categoryId && (
                  <div className="ml-3 mt-1 space-y-1">
                    {category.items.length ? (
                      category.items.map((item) => (
                        <button
                          key={item.irsItemId}
                          onClick={() => selectItem(category, item)}
                          className={`w-full text-left p-2 rounded text-sm transition ${
                            activeItem?.item?.irsItemId === item.irsItemId
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          <div className="flex gap-2">
                            <span className="text-xs text-gray-400">
                              {item.irsNo}
                            </span>
                            <span>{item.itemName}</span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-xs text-gray-400 px-2 py-1">
                        No items
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide bg-gray-50">
          {activeItem ? (
            <div className="p-6">
              <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="p-5 border-b bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="px-2 py-0.5 bg-gray-100 rounded font-mono">
                      {activeItem.item.irsNo}
                    </span>
                    <span>•</span>
                    <span>{activeItem.category.categoryName}</span>
                  </div>

                  <h2 className="font-bold text-gray-800">
                    {activeItem.item.itemName}
                  </h2>
                </div>

                {/* Add Entry Button */}
                <button
                  onClick={addEntry}
                  disabled={editingEntryId !== null}
                  className={`mt-4 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-md text-sm font-medium transition ${
                    editingEntryId !== null
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <Plus size={16} />
                  Add Another Entry
                </button>

                {/* Table */}
                <div className="p-5">
                  <div className="overflow-x-auto border rounded-lg shadow-lg">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-16">
                            #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                            Calculated Tax
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 w-32">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                              No entries yet. Click "Add Another Entry" to get started.
                            </td>
                          </tr>
                        ) : (
                          entries.map((entry, index) => {
                            const isEditing = editingEntryId === entry.id;
                            return (
                              <tr
                                key={entry.id}
                                className={`border-b transition ${
                                  isEditing ? "bg-blue-50" : "hover:bg-gray-50"
                                }`}
                              >
                                <td className="px-4 py-3 text-sm font-medium text-gray-600">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-3">
                                  {isEditing ? (
                                    <input
                                      type="date"
                                      value={editData.txnDate || ""}
                                      onChange={(e) =>
                                        handleInputChange("txnDate", e.target.value)
                                      }
                                      className="w-full border border-blue-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                  ) : (
                                    <span className="text-sm text-gray-700">
                                      {entry.txnDate || "-"}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      placeholder="0.00"
                                      value={editData.amount || ""}
                                      onChange={(e) =>
                                        handleInputChange("amount", e.target.value)
                                      }
                                      className="w-full border border-blue-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                  ) : (
                                    <span className="text-sm text-gray-700">
                                      ${parseFloat(entry.amount || 0).toFixed(2)}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-base font-bold text-blue-600">
                                    ${calculateTax(isEditing ? editData.amount : entry.amount)}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-center gap-2">
                                    {isEditing ? (
                                      <>
                                        <button
                                          onClick={handleSaveEntry}
                                          className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-all hover:scale-105"
                                          title="Save"
                                        >
                                          <Save size={16} />
                                        </button>
                                        <button
                                          onClick={handleCancelEdit}
                                          className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-all hover:scale-105"
                                          title="Cancel"
                                        >
                                          <X size={16} />
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => handleEditEntry(entry)}
                                          disabled={editingEntryId !== null}
                                          className={`p-2 rounded-lg border transition-all ${
                                            editingEntryId !== null
                                              ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
                                              : "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 hover:scale-105"
                                          }`}
                                          title="Edit"
                                        >
                                          <Edit size={16} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteEntry(entry.id)}
                                          disabled={editingEntryId !== null}
                                          className={`p-2 rounded transition-all ${
                                            editingEntryId !== null
                                              ? "text-gray-300 cursor-not-allowed"
                                              : "text-red-500 hover:text-red-700 hover:bg-red-50"
                                          }`}
                                          title="Delete"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>

                      {/* Total Row */}
                      {entries.length > 0 && (
                        <tfoot>
                          <tr className="bg-green-50 border-t-2 border-green-300">
                            <td colSpan="4" className="px-4 py-3 text-right font-bold text-gray-800">
                              Total Tax:
                              <span className="ml-3 text-xl font-bold text-green-600">
                                ${calculateTotalTax()}
                              </span>
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg font-medium">
                  Select a tax item from the sidebar
                </p>
                <p className="text-sm mt-2">Choose a category to begin</p>
              </div>
            </div>
          )}
        </main>
        <ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="colored"
   style={{ top: "100px" }}
/>

      </div>
    </>
  );
};

export default Dashboard;