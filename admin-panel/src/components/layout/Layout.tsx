import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout() {
    return (
        <div className="flex h-screen bg-slate-900">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar />
                <main className="flex-1 overflow-auto p-6 bg-slate-900">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}