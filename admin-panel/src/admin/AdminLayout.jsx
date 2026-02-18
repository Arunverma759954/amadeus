import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
            {/* <!-- ===== Page Wrapper Start ===== --> */}
            <div className="flex h-screen overflow-hidden">
                {/* <!-- ===== Sidebar Start ===== --> */}
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                {/* <!-- ===== Sidebar End ===== --> */}

                {/* <!-- ===== Content Area Start ===== --> */}
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    {/* <!-- ===== Header Start ===== --> */}
                    <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    {/* <!-- ===== Header End ===== --> */}

                    {/* <!-- ===== Main Content Start ===== --> */}
                    <main className="min-w-0">
                        <div className="mx-auto max-w-screen-2xl w-full p-4 sm:p-6 md:p-8 2xl:p-12">
                            <Outlet />
                        </div>
                    </main>
                    {/* <!-- ===== Main Content End ===== --> */}
                </div>
                {/* <!-- ===== Content Area End ===== --> */}
            </div>
            {/* <!-- ===== Page Wrapper End ===== --> */}
        </div>
    );
};

export default AdminLayout;
