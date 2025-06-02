import { useState } from "react";

const FormELement: React.FC = () => {
    const [pageName] = useState('Form Elements');
    const [isOptionSelected, setIsOptionSelected] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSelectChange = () => {
        setIsOptionSelected(true);
    };

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };
    return (
        <div className="mx-auto max-w-[--breakpoint-2xl] p-4 md:p-6">
            {/* Breadcrumb Start */}
            <div>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold text-gray-800 white:text-white/90">
                        {pageName}
                    </h2>

                    <nav>
                        <ol className="flex items-center gap-1.5">
                            <li>
                                <a
                                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 white:text-gray-400"
                                    href="index.html"
                                >
                                    Home
                                    <svg
                                        className="stroke-current"
                                        width="17"
                                        height="16"
                                        viewBox="0 0 17 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                                            stroke=""
                                            strokeWidth="1.2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </a>
                            </li>
                            <li className="text-sm text-gray-800 white:text-white/90">
                                {pageName}
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>
            {/* Breadcrumb End */}
            {/* Form Elements Section Start */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-6">
                    <div className="rounded-2xl border border-gray-200 bg-white white:border-gray-800 white:bg-white/[0.03]">
                        <div className="px-5 py-4 sm:px-6 sm:py-5">
                            <h3 className="text-base font-medium text-gray-800 white:text-white/90">Default Inputs</h3>
                        </div>
                        <div className="space-y-6 border-t border-gray-100 p-5 sm:p-6 white:border-gray-800">
                            {/* Input */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 white:text-gray-400">Input</label>
                                <input
                                    type="text"
                                    className="white:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 white:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden white:border-gray-700 white:bg-gray-900 white:text-white/90 white:placeholder:text-white/30"
                                />
                            </div>

                            {/* Input with Placeholder */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 white:text-gray-400">
                                    Input with Placeholder
                                </label>
                                <input
                                    type="text"
                                    placeholder="info@gmail.com"
                                    className="white:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 white:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden white:border-gray-700 white:bg-gray-900 white:text-white/90 white:placeholder:text-white/30"
                                />
                            </div>

                            {/* Select Input */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 white:text-gray-400">Select Input</label>
                                <div className="relative z-20 bg-transparent">
                                    <select
                                        className={`white:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 white:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden white:border-gray-700 white:bg-gray-900 white:text-white/90 white:placeholder:text-white/30 ${isOptionSelected ? "text-gray-800 white:text-white/90" : ""
                                            }`}
                                        onChange={handleSelectChange}
                                    >
                                        <option value="" className="text-gray-700 white:bg-gray-900 white:text-gray-400">
                                            Select Option
                                        </option>
                                        <option value="marketing" className="text-gray-700 white:bg-gray-900 white:text-gray-400">
                                            Marketing
                                        </option>
                                        <option value="template" className="text-gray-700 white:bg-gray-900 white:text-gray-400">
                                            Template
                                        </option>
                                        <option value="development" className="text-gray-700 white:bg-gray-900 white:text-gray-400">
                                            Development
                                        </option>
                                    </select>
                                    <span className="pointer-events-none absolute top-1/2 right-4 z-30 -translate-y-1/2 text-gray-500 white:text-gray-400">
                                        <svg className="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path
                                                d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </span>
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 white:text-gray-400">Password Input</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="white:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 white:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 pl-4 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden white:border-gray-700 white:bg-gray-900 white:text-white/90 white:placeholder:text-white/30"
                                    />
                                    <span onClick={handleShowPassword} className="absolute top-1/2 right-4 z-30 -translate-y-1/2 cursor-pointer">
                                        {showPassword ? (
                                            <svg className="fill-gray-500 white:fill-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M4.63803 3.57709C4.34513 3.2842 3.87026 3.2842 3.57737 3.57709C3.28447 3.86999 3.28447 4.34486 3.57737 4.63775L4.85323 5.91362C3.74609 6.84199 2.89363 8.06395 2.4155 9.45936C2.3615 9.61694 2.3615 9.78801 2.41549 9.94558C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C11.255 15.3619 12.4422 15.0737 13.4994 14.5598L15.3625 16.4229C15.6554 16.7158 16.1302 16.7158 16.4231 16.4229C16.716 16.13 16.716 15.6551 16.4231 15.3622L4.63803 3.57709Z"
                                                />
                                            </svg>
                                        ) : (
                                            <svg className="fill-gray-500 white:fill-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M10.0002 13.8619C7.23361 13.8619 4.86803 12.1372 3.92328 9.70241C4.86804 7.26761 7.23361 5.54297 10.0002 5.54297C12.7667 5.54297 15.1323 7.26762 16.0771 9.70243C15.1323 12.1372 12.7667 13.8619 10.0002 13.8619ZM10.0002 4.04297C6.48191 4.04297 3.49489 6.30917 2.4155 9.4593C2.3615 9.61687 2.3615 9.78794 2.41549 9.94552C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C13.5184 15.3619 16.5055 13.0957 17.5849 9.94555C17.6389 9.78797 17.6389 9.6169 17.5849 9.45932C16.5055 6.30919 13.5184 4.04297 10.0002 4.04297ZM9.99151 7.84413C8.96527 7.84413 8.13333 8.67606 8.13333 9.70231C8.13333 10.7286 8.96527 11.5605 9.99151 11.5605H10.0064C11.0326 11.5605 11.8646 10.7286 11.8646 9.70231C11.8646 8.67606 11.0326 7.84413 10.0064 7.84413H9.99151Z"
                                                />
                                            </svg>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Date Picker */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 white:text-gray-400">Date Picker</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        placeholder="Select date"
                                        className="white:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 white:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 pl-4 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden white:border-gray-700 white:bg-gray-900 white:text-white/90 white:placeholder:text-white/30"
                                    />
                                    {/* <span className="pointer-events-none absolute top-1/2 right-4 z-30 -translate-y-1/2">
                                        <svg className="fill-gray-500 white:fill-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M5.83325 2.5C5.83325 2.04175 6.20868 1.66675 6.66675 1.66675C7.1248 1.66675 7.50025 2.04175 7.50025 2.5V3.33342H12.5002V2.5C12.5002 2.04175 12.8752 1.66675 13.3332 1.66675C13.7912 1.66675 14.1667 2.04175 14.1667 2.5V3.33342H15.0002C16.3809 3.33342 17.5002 4.45275 17.5002 5.83342V15.0001C17.5002 16.3808 16.3809 17.5001 15.0002 17.5001H5.00025C3.61958 17.5001 2.50025 16.3808 2.50025 15.0001V5.83342C2.50025 4.45275 3.61958 3.33342 5.00025 3.33342H5.83325V2.5ZM15.0002 4.99925H5.00025C4.53933 4.99925 4.16675 5.37183 4.16675 5.83342V15.0001C4.16675 15.4617 4.53933 15.8343 5.00025 15.8343H15.0002C15.4618 15.8343 15.8334 15.4617 15.8334 15.0001V5.83342C15.8334 5.37183 15.4618 4.99925 15.0002 4.99925Z"
                                            />
                                        </svg>
                                    </span> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
};

export default FormELement;