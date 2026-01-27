import Header from "../components/Header/header"
import Efilereturnlist from "../components/Efile-returns/Efilereturnlist"

function Efilereturnlistpage(){

    return(
        <>
         <div className="min-h-screen bg-gray-50">
                <Header  />
                <div className="pt-17 px-6 pb-6">
                <Efilereturnlist/>
                </div>
        </div>

        </>
    )
}

export default Efilereturnlistpage