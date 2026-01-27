import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Edit, FileText, Calendar, Hash, Plus, File } from "lucide-react";
import { get } from "../../ApiWrapper/apiwrapper";
import { toast } from "react-toastify";
import EfileReturns from "./Efilereturns";
import { useNavigate } from "react-router-dom";


const Efilereturnlist = forwardRef(({ onEdit }, ref) => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [filers, setFilers] = useState([]);
  const navigate = useNavigate();


  const fetchReturns = async (pageNumber = 0) => {
    try {
      setLoading(true);
      const res = await get(`/api/v1/efile/returns?page=${pageNumber}&size=${size}`);
      setReturns(res?.data?.content || []);
      console.log("business date",res?.data?.content);
      setTotalPages(res?.data?.totalPages || 0);
      setTotalElements(res?.data?.totalElements || 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load E-File returns");
    } finally {
      setLoading(false);
    }
  };

   useImperativeHandle(ref, () => ({
    refresh: () => fetchReturns(page),
    // Add this new method
    openModalWithFiler: (filerId, businessName) => {
      setSelectedReturn({ filerId, businessName });
      setShowModal(true);
    }
  }));
  useEffect(() => {
    fetchReturns(page);
  }, [page]);

  const handleViewDashboard = (id) => {
  navigate(`/dashboard/${id}`);
};


  const handleAddReturn = () => {
    setSelectedReturn(null);
    setShowModal(true);
  };

  const handleEditReturn = (returnData) => {
    setSelectedReturn(returnData);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReturn(null);
  };

  const handleSuccess = () => {
    fetchReturns(page);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading E-File returns...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {/* <FileText className="w-7 h-7 text-blue-600" />  */}
              File Returns Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Total of <span className="font-semibold text-blue-600">{totalElements}</span> returns filed
            </p>
          </div>
          <button
            onClick={handleAddReturn}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2c7eea] text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md font-medium"
          >
            <Plus size={18} />
            Add File
          </button>
        </div>

        {returns.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 mx-auto">
              <FileText className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No E-File Returns Yet</h3>
            <p className="text-gray-600 mb-6">Get started by filing your first tax return</p>
            <button
              onClick={handleAddReturn}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Add Your First Return
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#2c7eea]">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Hash size={14} /> S.No
                      </div>
                    </th>
                    {/* <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FileText size={14} /> Document
                      </div>
                    </th> */}
                      <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FileText size={14} /> Business Name
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} /> Tax Year
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} /> Quarter
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {returns.map((r, index) => (
                    <tr key={r.id} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-700">
                          {page * size + index + 1}
                        </span>
                      </td>
                      {/* <td className="px-4 py-4">
                        <span className="text-sm font-medium text-gray-800">{r.documentId}</span>
                      </td> */}
                       <td className="px-4 py-4">
                        <span className="text-sm font-medium text-gray-800">{r.businessName}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{r.taxYr}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{r.quarterEnding}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditReturn(r)}
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-all hover:scale-105"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                       <button
  onClick={() => handleViewDashboard(r.id)}
  className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-all hover:scale-105"
  title="View Dashboard"
>
  File
</button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-800">{page * size + 1}</span> to{" "}
                  <span className="font-semibold text-gray-800">{Math.min(page * size + returns.length, totalElements)}</span>{" "}
                  of <span className="font-semibold text-gray-800">{totalElements}</span> results
                </div>
                <div className="flex justify-center gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                  >
                    Prev
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        page === i
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages - 1}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0  bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in">
            <EfileReturns
              returnData={selectedReturn}
              onClose={handleCloseModal}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
});

export default Efilereturnlist;