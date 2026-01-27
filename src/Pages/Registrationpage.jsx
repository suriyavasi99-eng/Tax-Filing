import React, { useState } from "react";
import Header from "../components/Header/header";
import Registerform from "../components/Registration/Registration";
import RegisteredList from "../components/Registration/RegisteredList";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Registrationpage(){
    const [refreshKey, setRefreshKey] = useState(0);
    const [editingFiler, setEditingFiler] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleFilerAdded = () => {
        setRefreshKey(prev => prev + 1);
    };

    const handleEditFiler = (filer) => {
        setEditingFiler(filer);
        setShowEditModal(true);
    };

    const handleEditSuccess = () => {
        setShowEditModal(false);
        setEditingFiler(null);
        setRefreshKey(prev => prev + 1);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingFiler(null);
    };

    return(
        <>
            <div className="min-h-screen bg-gray-50">
                <Header onFilerAdded={handleFilerAdded} />
                
                {/* Main Content Area - Add padding top to account for fixed header */}
                <div className="pt-24 px-6 pb-6">
                    <div className="max-w-7xl mx-auto">
                        <RegisteredList 
                            key={refreshKey} 
                            onEdit={handleEditFiler}
                        />
                    </div>
                </div>

                {/* Edit Modal */}
                {showEditModal && editingFiler && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                        <div className="bg-white rounded-xl shadow-lg w-[640px] h-[90vh] flex flex-col relative">
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                                <h3 className="text-[15px] font-medium text-[#4A4A4A]">
                                    Edit Business Information
                                </h3>
                                <button
                                    onClick={handleCloseEditModal}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <Registerform 
                                    existingFiler={editingFiler}
                                    onSuccess={handleEditSuccess}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    pauseOnHover
                />
            </div>
        </>
    )
}

export default Registrationpage;