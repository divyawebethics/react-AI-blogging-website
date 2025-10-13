import type { LayoutProps } from "../Interface/interface";

const MainLayout:React.FC<LayoutProps> = ({title, children}) => {
    return(
        <>
        <div className="min-h-screen text-gray-100 flex items-center justify-center p-4 font-inter">
            <div className="w-full max-w-md bg-[#d69eec] rounded-2xl shadow-2xl p-8 space-y-6">
                <h1 className="text-3xl font-bold text-center text-violet-700">{title}</h1>
                {children}
            </div>
        </div>
        </>
    )
}

export default MainLayout;