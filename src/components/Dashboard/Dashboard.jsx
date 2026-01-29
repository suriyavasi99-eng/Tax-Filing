import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, Save } from "lucide-react";
import { get, post, del } from "../../ApiWrapper/apiwrapper";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CommunicationsTable from "../Tables/Part1/Communications-Air-Trans";
import Irs6627form53 from "../Tables/Part1/Irs-6627-53";
import Irs6627Form16 from "../Tables/Part1/Irs-6627-16";
import Irs6627form54 from "../Tables/Part1/Irs-6627-54";

const Dashboard = () => {
  const { id: irsReturnId } = useParams();
  const [categories, setCategories] = useState([]);
  const [activePart, setActivePart] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);

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

  // Group categories by mainCategory (Part I, Part II, etc.)
  const groupedCategories = categories.reduce((acc, category) => {
    const part = category.mainCategory || "Other";
    if (!acc[part]) {
      acc[part] = [];
    }
    acc[part].push(category);
    return acc;
  }, {});

  const togglePart = (partName) => {
    setActivePart(activePart === partName ? null : partName);
  };

  const toggleCategory = (categoryId) => {
    setActiveCategoryId(activeCategoryId === categoryId ? null : categoryId);
  };

  const selectItem = async (category, item) => {
    setActiveItem({ category, item });
    setLoading(true);

    try {
      const res = await get(
        `/api/v1/irs720/communication-air/irs-item/${irsReturnId}/${item.irsItemId}?page=0&size=200`
      );

      console.log("Fetched data from API:", res);

      const data = res?.data?.content || [];

      console.log("Parsed content:", data);

      if (data.length === 0) {
        setEntries([createEmptyEntry()]);
      } else {
        const mappedEntries = data.map((row) => {
          // Determine checkbox state and date field based on methodType:
          // "Regular" = checked (true) -> txnDate goes to collectedDate
          // "Alternative" = unchecked (false) -> txnDate goes to billedDate
          const isRegular = row.methodType === "Regular";
          
          return {
            id: row.id,
            txnDate: row.txnDate || "",
            amount: row.amount || "",
            collectedDate: isRegular ? (row.txnDate || "") : "", // Show txnDate in collectedDate if Regular
            billedDate: !isRegular ? (row.txnDate || "") : "", // Show txnDate in billedDate if Alternative
            checked: isRegular, // true for Regular, false for Alternative
            methodType: row.methodType || "",
            isNew: false,
          };
        });

        console.log("Mapped entries for table:", mappedEntries);
        setEntries(mappedEntries);
      }
    } catch (err) {
      console.error("Failed to load item data", err);
      toast.error("Failed to load data ❌");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const createEmptyEntry = () => ({
    id: `new_${Date.now()}`,
    txnDate: "",
    amount: "",
    collectedDate: "",
    billedDate: "",
    checked: false, // Default unchecked
    isNew: true,
  });

  const addEntry = () => {
    setEntries([...entries, createEmptyEntry()]);
  };

  const getCurrentYearQuarter = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const quarter = month <= 3 ? "03" : month <= 6 ? "06" : month <= 9 ? "09" : "12";
    return `${year}-${quarter}`;
  };

  const isItemActive = (item) => {
    const currentYearQuarter = getCurrentYearQuarter();
    return item.toYearQuarter >= currentYearQuarter;
  };

  const handleInputChange = (entryId, field, value) => {
    setEntries(
      entries.map((entry) =>
        entry.id === entryId ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleSaveAll = async () => {
    if (!activeItem) return;

    try {
      const payloads = entries.map((entry) => {
        const isChecked = entry.checked || false;  
        return {
          id: entry.isNew ? null : entry.id,
          returnId: parseInt(irsReturnId) || 0,
          irsItemId: activeItem.item.irsItemId,
          methodType: isChecked ? "Regular" : "Alternative",
          amount: parseFloat(entry.amount) || 0,
          txnDate: isChecked ? entry.collectedDate : entry.billedDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      console.log("Saving payloads:", payloads);
      await post("/api/v1/irs720/communication-air/irs-item", payloads);
      toast.success("All entries saved successfully");

      await selectItem(activeItem.category, activeItem.item);
    } catch (error) {
      console.error("Save failed", error);
      toast.error("Failed to save entries ");
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      if (!String(entryId).startsWith("new_")) {
        await del(`/api/v1/irs720/communication-air/${entryId}`);
      }
      setEntries(entries.filter((entry) => entry.id !== entryId));
      toast.success("Entry deleted successfully ");
    } catch (err) {
      console.error("Failed to delete entry", err);
      toast.error("Failed to delete entry ");
    }
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
        {/* Sidebar */}
        <aside className="w-80 border border-gray-200 rounded-lg shadow-lg overflow-y-auto scrollbar-hide bg-white">
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
            <h1 className="text-xl font-bold text-gray-800">Form 720</h1>
            <p className="text-sm text-gray-600">
              Quarterly Federal Excise Tax Return
            </p>
          </div>

          <div className="p-4 space-y-2">
            {Object.keys(groupedCategories).map((partName) => (
              <div key={partName}>
                {/* Part Level (Part I, Part II, etc.) */}
                <button
                  onClick={() => togglePart(partName)}
                  className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-blue-50 font-bold text-sm transition bg-gray-50 text-blue-900"
                >
                  {partName}
                  {activePart === partName ? (
                    <ChevronDown size={18} className="text-blue-600" />
                  ) : (
                    <ChevronRight size={18} className="text-blue-600" />
                  )}
                </button>

                {/* Categories under this Part */}
                {activePart === partName && (
                  <div className="ml-2 mt-1 space-y-1">
                    {groupedCategories[partName].map((category) => (
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

                        {/* Items under this Category */}
                        {activeCategoryId === category.categoryId && (
                          <div className="ml-3 mt-1 space-y-1">
                            {category.items.filter(isItemActive).length ? (
                              category.items.filter(isItemActive).map((item) => (
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
                                No active items
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
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

                {/* Tables */}
                <CommunicationsTable
                  entries={entries}
                  activeItem={activeItem}
                  onAddEntry={addEntry}
                  onInputChange={handleInputChange}
                  onDeleteEntry={handleDeleteEntry}
                  onSaveAll={handleSaveAll}
                  calculateTotalTax={calculateTotalTax}
                />

                <Irs6627form53 
                  activeItem={activeItem}
                  irsReturnId={irsReturnId}
                />

                <Irs6627Form16 
                  activeItem={activeItem}
                  irsReturnId={irsReturnId}
                />

                <Irs6627form54 
                  activeItem={activeItem}
                  irsReturnId={irsReturnId}
                />
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