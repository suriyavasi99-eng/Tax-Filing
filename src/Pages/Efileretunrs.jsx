import React, { useRef, useState, useEffect } from "react";
import Header from "../components/Header/header"
import Efilereturnlist from "../components/Efile-returns/Efilereturnlist"
import { useLocation } from "react-router-dom";

function Efilereturnlistpage(){
     const location = useLocation();
  const efileListRef = useRef(null);
    useEffect(() => {
    if (location.state?.openModal) {
      efileListRef.current?.openModalWithFiler(
        location.state.filerId,
        location.state.businessName
      );
    }
  }, [location]);

    return(
        <>
         <div className="min-h-screen bg-gray-50">
                <Header  />
                <div className="pt-17 px-6 pb-6">
                <Efilereturnlist ref={efileListRef} />
                </div>
        </div>

        </>
    )
}

export default Efilereturnlistpage