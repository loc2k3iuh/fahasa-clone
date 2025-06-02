import React, { createContext, useContext, useState } from "react";

interface Discount {
  id: number;
  discountName: string;
  discountPercentage: number;
  discountAmount: number;
  startDate: string;
  endDate: string;
  status: string;
}

interface GlobalContextType {
    discounts: Discount[];
    setDiscounts: React.Dispatch<React.SetStateAction<Discount[]>>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

    export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const [discounts, setDiscounts] = useState<Discount[]>([]);

    
    return (
        <GlobalContext.Provider value={{ discounts, setDiscounts}}>
        {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
const context = useContext(GlobalContext);
if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
}
return context;
};