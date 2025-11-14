import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { DM_Sans, Ysabeau } from "next/font/google";

const cityOptions = [
  "Alaminos City",
  "Angeles City",
  "Antipolo City",
  "Bacolod City",
  "Bago City",
  "Baguio City",
  "Bais City",
  "Balanga City",
  "Batac City",
  "Batangas City",
  "Bayawan City",
  "Baybay City",
  "Bayugan City",
  "Biñan City",
  "Bislig City",
  "Bogo City",
  "Borongan City",
  "Butuan City",
  "Cabadbaran City",
  "Cabanatuan City",
  "Cabuyao City",
  "Cadiz City",
  "Calamba City",
  "Calapan City",
  "Calbayog City",
  "Caloocan City",
  "Candon City",
  "Canlaon City",
  "Carcar City",
  "Catbalogan City",
  "Cauayan City",
  "Cavite City",
  "Cebu City",
  "Cotabato City",
  "Dagupan City",
  "Danao City",
  "Dapitan City",
  "Dasmariñas City",
  "Davao City",
  "Digos City",
  "Dipolog City",
  "Dumaguete City",
  "El Salvador City",
  "Escalante City",
  "Gapan City",
  "General Santos City",
  "General Trias City",
  "Gingoog City",
  "Guihulngan City",
  "Himamaylan City",
  "Ilagan City",
  "Iligan City",
  "Iloilo City",
  "Imus City",
  "Iriga City",
  "Isabela City",
  "Kabankalan City",
  "Kalibo City",
  "Kidapawan City",
  "Koronadal City",
  "La Carlota City",
  "Lamitan City",
  "Laoag City",
  "Lapu-Lapu City",
  "Legazpi City",
  "Ligao City",
  "Lipa City",
  "Lucena City",
  "Maasin City",
  "Mabalacat City",
  "Makati City",
  "Malabon City",
  "Malaybalay City",
  "Malolos City",
  "Mandaluyong City",
  "Manila City",
  "Marawi City",
  "Marikina City",
  "Masbate City",
  "Mati City",
  "Meycauayan City",
  "Muñoz City",
  "Muntinlupa City",
  "Naga City (Camarines Sur)",
  "Naga City (Cebu)",
  "Navotas City",
  "Olongapo City",
  "Ormoc City",
  "Oroquieta City",
  "Ozamiz City",
  "Pagadian City",
  "Palayan City",
  "Panabo City",
  "Parañaque City",
  "Pasay City",
  "Pasig City",
  "Passi City",
  "Puerto Princesa City",
  "Quezon City",
  "Roxas City",
  "Sagay City",
  "Samal City",
  "San Carlos City (Negros Occidental)",
  "San Carlos City (Pangasinan)",
  "San Fernando City (La Union)",
  "San Fernando City (Pampanga)",
  "San Jose City",
  "San Jose del Monte City",
  "San Juan City",
  "San Pablo City",
  "San Pedro City",
  "Santa Rosa City",
  "Santiago City",
  "Silay City",
  "Sipalay City",
  "Sorsogon City",
  "Surigao City",
  "Tabaco City",
  "Tabuk City",
  "Tacloban City",
  "Tagaytay City",
  "Tagbilaran City",
  "Taguig City",
  "Tagum City",
  "Talisay City (Cebu)",
  "Talisay City (Negros Occidental)",
  "Tanauan City",
  "Tandag City",
  "Tangub City",
  "Tarlac City",
  "Tayabas City",
  "Toledo City",
  "Trece Martires City",
  "Tuguegarao City",
  "Urdaneta City",
  "Valencia City",
  "Valenzuela City",
  "Victorias City",
  "Vigan City",
  "Zamboanga City",
];

const fontDmSans = DM_Sans({
  subsets: ['latin'],
  weight: ["400", "500", "700"]
})

const fontYsabeau = Ysabeau({
  subsets: ['latin'],
  weight: ['400', "500", '600', "700"]
})

const CitySelector = ({ register, setValue, errors, initialValue, value: controlledValue = ""}) => {
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState(controlledValue);

  useEffect(() => {
    setSelectedCity(controlledValue);
  }, [controlledValue]);

  const filteredCities =
    query === ""
      ? cityOptions
      : cityOptions.filter((city) =>
          city.toLowerCase().includes(query.toLowerCase())
        );

  return (
<div>
  <label htmlFor="city" className={`${fontYsabeau.className} text-lg font-normal`}>
    City<span className="text-red-600">*</span>
  </label>
  <div className="relative">
    <Input
      id="city"
      type="text"
      placeholder="City"
      value={selectedCity} // Controlled by state
      onChange={(e) => {
        const inputValue = e.target.value;
        setQuery(inputValue); // Update the query for filtering
        setSelectedCity(inputValue); // Update the input value
        setValue("city", inputValue); // Update the form value
      }}
      className={`${fontDmSans.className} font-medium w-full !text-base border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none`}
    />
    {query && (
      <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
        {filteredCities.length === 0 ? (
          <li className={`${fontDmSans.className} font-medium w-full !text-base cursor-default select-none py-2 px-4 text-gray-700`}>
            No results found.
          </li>
        ) : (
          filteredCities.map((city) => (
            <li
              key={city}
              onClick={() => {
                setSelectedCity(city); // Set the selected city
                setQuery(""); // Clear the query
                setValue("city", city); // Update the form value
              }}
              className={`${fontDmSans.className} font-medium w-full !text-base cursor-pointer select-none py-2 px-4 hover:bg-primary hover:text-white`}
            >
              {city}
            </li>
          ))
        )}
      </ul>
    )}
  </div>
  {errors.city && <p className={`${fontYsabeau.className} font-medium text-base text-red-500`}>{errors.city.message}</p>}
</div>
  );
};

export default CitySelector;