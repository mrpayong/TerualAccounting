import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { DM_Sans, Ysabeau } from "next/font/google";

const provinceOptions = [
    "Abra",
    "Agusan del Norte",
    "Agusan del Sur",
    "Aklan",
    "Albay",
    "Antique",
    "Apayao",
    "Aurora",
    "Basilan",
    "Bataan",
    "Batanes",
    "Batangas",
    "Benguet",
    "Biliran",
    "Bohol",
    "Bukidnon",
    "Bulacan",
    "Cagayan",
    "Camarines Norte",
    "Camarines Sur",
    "Camiguin",
    "Capiz",
    "Catanduanes",
    "Cavite",
    "Cebu",
    "Cotabato (North Cotabato)",
    "Davao de Oro",
    "Davao del Norte",
    "Davao del Sur",
    "Davao Occidental",
    "Davao Oriental",
    "Dinagat Islands",
    "Eastern Samar",
    "Guimaras",
    "Ifugao",
    "Ilocos Norte",
    "Ilocos Sur",
    "Iloilo",
    "Isabela",
    "Kalinga",
    "La Union",
    "Laguna",
    "Lanao del Norte",
    "Lanao del Sur",
    "Leyte",
    "Maguindanao del Norte",
    "Maguindanao del Sur",
    "Marinduque",
    "Masbate",
    "Misamis Occidental",
    "Misamis Oriental",
    "Mountain Province",
    "Negros Occidental",
    "Negros Oriental",
    "Northern Samar",
    "Nueva Ecija",
    "Nueva Vizcaya",
    "Occidental Mindoro",
    "Oriental Mindoro",
    "Palawan",
    "Pampanga",
    "Pangasinan",
    "Quezon",
    "Quirino",
    "Rizal",
    "Romblon",
    "Samar (Western Samar)",
    "Sarangani",
    "Siquijor",
    "Sorsogon",
    "South Cotabato",
    "Southern Leyte",
    "Sultan Kudarat",
    "Sulu",
    "Surigao del Norte",
    "Surigao del Sur",
    "Tarlac",
    "Tawi-Tawi",
    "Zambales",
    "Zamboanga del Norte",
    "Zamboanga del Sur",
    "Zamboanga Sibugay",
  ];

const fontDmSans = DM_Sans({
  subsets: ['latin'],
  weight: ["400", "500", "700"]
})

const fontYsabeau = Ysabeau({
  subsets: ['latin'],
  weight: ['400', "500", '600', "700"]
})

const ProvinceSelector = ({ register, setValue, errors, initialValue }) => {
  const [query, setQuery] = useState(""); // Query for filtering
  const [selectedProvince, setSelectedProvince] = useState(""); // Selected province

    useEffect(() => {
      setSelectedProvince(initialValue || "");
    }, [initialValue]);

  const filteredProvinces =
    query === ""
      ? provinceOptions
      : provinceOptions.filter((province) =>
          province.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div>
      <label htmlFor="province" className={`${fontYsabeau.className} text-lg font-normal`}>
        Province<span className="text-red-600">*</span>
      </label>
      <div className="relative">
        <Input
          id="province"
          type="text"
          placeholder="Province"
          value={selectedProvince} // Use query for the input value
          onChange={(e) => {
            const inputValue = e.target.value;
            setQuery(inputValue); // Update the query for filtering
            setSelectedProvince(inputValue); // Update the selected province
            setValue("province", inputValue); // Update the form value
          }}
          className={`${fontDmSans.className} font-medium w-full !text-base border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none`}
          // {...register("province", { required: "Province is required" })}
        />
        {query && (
          <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            {filteredProvinces.length === 0 ? (
              <li className={`${fontDmSans.className} font-medium w-full !text-base cursor-default select-none py-2 px-4 text-gray-700`}>
                No results found.
              </li>
            ) : (
              filteredProvinces.map((province) => (
                <li
                  key={province}
                  onClick={() => {
                    setSelectedProvince(province); // Set the selected province
                    setQuery(""); // Update the query to match the selected province
                    setValue("province", province); // Update the form value
                  }}
                  className={`${fontDmSans.className} font-medium w-full !text-base cursor-pointer select-none py-2 px-4 hover:bg-primary hover:text-white`}
                >
                  {province}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      {errors.province && (
        <p className={`${fontYsabeau.className} font-medium text-base text-red-500`}>{errors.province.message}</p>
      )}
    </div>
  );
};
  
  export default ProvinceSelector;