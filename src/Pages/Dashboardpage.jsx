import Dashboard from "../components/Dashboard/Dashboard";
import Header from "../components/Header/header";
function DashboardPage(){
    return(
        <>
        <div className="relative min-h-screen">
            <Header/>
            <div className="pt-17 fixed h-[60%] w-full px-6 pb-6">
                <Dashboard />
            </div>
        </div>

        </>
    )
}
export default DashboardPage;