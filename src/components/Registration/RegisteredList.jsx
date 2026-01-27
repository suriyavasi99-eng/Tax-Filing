import React, { useEffect, useState,useRef } from "react";
import {
  Building2,
  Hash,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Users,
  Key,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  ChevronsRight,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle
} from "lucide-react";
import { get, del } from "../../ApiWrapper/apiwrapper";
import { toast } from "react-toastify";
import EfileReturns from "../Efile-returns/Efilereturns";
import Efileretunrlist from "../Efile-returns/Efilereturnlist";
import { Plus } from "lucide-react";
function RegisteredList({ onEdit }) {
  const [filers, setFilers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filerToDelete, setFilerToDelete] = useState(null);
  const [showEfile,setShowEfile] = useState(false)
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedFiler, setSelectedFiler] = useState(null);
  const efileListRef = useRef(null);
 const efilereturnlistRef = useRef(null);
  const [efileModal, setEfileModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);

  const handleAddReturn = () => {
    setSelectedReturn(null);
    setEfileModal(true);
  };
   const handleEditReturn = (returnData) => {
    setSelectedReturn(returnData); // pass data → edit mode
    setEfileModal(true);
  };
  const fetchFilers = async () => {
    try {
      setLoading(true);
      const res = await get(`/api/v1/filers`);

      setFilers(res?.data?.content || []);
      setTotalPages(res?.data?.totalPages || 0);
      setTotalElements(res?.data?.totalElements || 0);
    } catch (error) {
      console.error("Error fetching filers:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilers();
  }, []);
// const handleEditReturn = async (id) => {
//   try {
//     const res = await get(`/api/v1/efile/returns/${id}`);
//     setSelectedReturn(res.data);
//     setEfileModal(true);
//   } catch (error) {
//     toast.error("Failed to fetch return data");
//   }
// };
  const handleDelete = async (id) => {
    try {
      await del(`/api/v1/filers/${id}`);
      toast.success("Deleted successfully");
      fetchFilers();
    } catch {
      toast.error("Delete failed");
    } finally {
      setShowDeleteModal(false);
      setFilerToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading filers...</p>
        </div>
      </div>
    );
  }

  // if (!filers.length) {
  //   return (
  //     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
  //       <div className="flex flex-col items-center justify-center text-center">
  //         <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
  //           <Building2 className="w-10 h-10 text-blue-600" />
  //         </div>
  //         <h3 className="text-xl font-semibold text-gray-800 mb-2">No Registered Filers Yet</h3>
  //         <p className="text-gray-600 max-w-md">
  //           Get started by clicking the "Register" button in the header to add your first business filer
  //         </p>
  //       </div>
  //       <button></button>
  //     </div>
  //   );
  // }

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
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>

      <div className="space-y-6 font-[Instrument Sans]">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Building2 className="w-7 h-7 text-blue-600" />
               Business Details
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Total of <span className="font-semibold text-blue-600">{totalElements}</span> business filers
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, EIN, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Header */}
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Hash size={14} /> S.No
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} /> Business Name
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Hash size={14} /> EIN
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User size={14} /> Contact
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Mail size={14} /> Email
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Phone size={14} /> Phone
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} /> Signing Authority
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Users size={14} /> Third Party
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Phone size={14} /> TP Phone
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Key size={14} /> TP PIN
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {filers.map((filer, index) => (
                  <tr
                    key={filer.id}
                    className="hover:bg-blue-50 transition-colors duration-150 animate-slide-in"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-700">
                        {page * size + index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">
                            {filer.businessNameLine1}
                          </div>
                          {filer.businessNameLine2 && (
                            <div className="text-xs text-gray-500">
                              {filer.businessNameLine2}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">
                        {filer.ein}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {filer.inCareOfName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {filer.email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {filer.phoneCountryCode} {filer.phoneNumber}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-800">
                        {filer.signingAuthorityName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {filer.signingAuthorityTitle}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {filer.hasThirdPartyDesignee ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                          <CheckCircle size={14} /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                          <XCircle size={14} /> No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {filer.hasThirdPartyDesignee
                        ? `${filer.thirdPartyDesigneePhoneCountryCode} ${filer.thirdPartyDesigneePhone}`
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {filer.hasThirdPartyDesignee ? (
                        <span className="font-mono text-xs bg-gray-100 px-2.5 py-1.5 rounded border border-gray-200">
                          {filer.thirdPartyDesigneePin}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onEdit(filer)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-all hover:scale-105"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setFilerToDelete(filer);
                            setShowDeleteModal(true);
                          }}

                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all hover:scale-105"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                    {/* <button
  onClick={() => {
    setSelectedFiler(filer);
    setSelectedReturn(null);
    setEfileModal(true);
  }}
      

  className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-all hover:scale-105"
  title="File"
>
  <FileText size={16} />
</button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            
          </div>

          {/* Pagination Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-800">{page * size + 1}</span> to{" "}
                <span className="font-semibold text-gray-800">
                  {Math.min(page * size + filers.length, totalElements)}
                </span>{" "}
                of <span className="font-semibold text-gray-800">{totalElements}</span> results
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(0)}
                  className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="First page"
                >
                  <ChevronsLeft size={18} />
                </button>
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    if (
                      totalPages <= 7 ||
                      i === 0 ||
                      i === totalPages - 1 ||
                      (i >= page - 1 && i <= page + 1)
                    ) {
                      return (
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
                      );
                    } else if (i === page - 2 || i === page + 2) {
                      return <span key={i} className="px-2 text-gray-400">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  disabled={page === totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  <ChevronRight size={18} />
                </button>
                <button
                  disabled={page === totalPages - 1}
                  onClick={() => setPage(totalPages - 1)}
                  className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Last page"
                >
                  <ChevronsRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>   
      </div>

      {/* Delete Modal */}
      {showDeleteModal && filerToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-in">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-800">
                  {filerToDelete.businessNameLine1}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(filerToDelete.id)}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

  {/* <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">E-File Returns</h2>  
      </div>
      <Efileretunrlist ref={efilereturnlistRef} onEdit={handleEditReturn} />
      {efileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
        <EfileReturns
  returnData={selectedReturn}
  filerId={selectedFiler?.id}
  onClose={() => setEfileModal(false)}
  onSuccess={() => efilereturnlistRef.current?.refresh()}
/>
          </div>
        </div>
      )}
    </div> */}
    </>
  );
}

export default RegisteredList;