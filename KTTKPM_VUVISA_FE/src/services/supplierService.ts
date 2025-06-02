import axios from "axios";
import API_BASE_URL from "../config/apiConfig";

export interface Supplier {
    id: number;
    supplierName: string;
    description: string;
}

export const getSuppliers = async() : Promise<Supplier[]> => {
    try{
        const response=await axios.get(`${API_BASE_URL}/suppliers/all`);
        const data = response.data;

        if(!Array.isArray(data)){
            throw new Error("Invalid response structure");
        }

        return data.map((item: Supplier) => ({
            id: item.id,
            supplierName: item.supplierName,
            description: item.description,
        }));
    }catch(error){
        console.error("Error fetching suppliers:", error);
        throw new Error("Failed to fetch suppliers");
    }

}

