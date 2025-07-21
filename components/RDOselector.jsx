import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { DM_Sans, Ysabeau } from "next/font/google";

const rdoOptions = [
    "RDO 001",
    "RDO 002",
    "RDO 003",
    "RDO 004",
    "RDO 005",
    "RDO 006",
    "RDO 007",
    "RDO 008",
    "RDO 009",
    "RDO 010",
    "RDO 011",
    "RDO 012",
    "RDO 013",
    "RDO 014",
    "RDO 015",
    "RDO 016",
    "RDO 17A",
    "RDO 17B",
    "RDO 018",
    "RDO 019",
    "RDO 020",
    "RDO 21A",
    "RDO 21B",
    "RDO 022",
    "RDO 23A",
    "RDO 23B",
    "RDO 024",
    "RDO 25A",
    "RDO 25B",
    "RDO 026",
    "RDO 027",
    "RDO 028",
    "RDO 029",
    "RDO 030",
    "RDO 031",
    "RDO 032",
    "RDO 033",
    "RDO 034",
    "RDO 035",
    "RDO 036",
    "RDO 037",
    "RDO 038",
    "RDO 039",
    "RDO 040",
    "RDO 041",
    "RDO 042",
    "RDO 043",
    "RDO 044",
    "RDO 045",
    "RDO 046",
    "RDO 047",
    "RDO 048",
    "RDO 049",
    "RDO 050",
    "RDO 051",
    "RDO 052",
    "RDO 53A",
    "RDO 53B",
    "RDO 54A",
    "RDO 54B",
    "RDO 055",
    "RDO 056",
    "RDO 057",
    "RDO 058",
    "RDO 059",
    "RDO 060",
    "RDO 061",
    "RDO 062",
    "RDO 063",
    "RDO 064",
    "RDO 065",
    "RDO 066",
    "RDO 067",
    "RDO 068",
    "RDO 069",
    "RDO 070",
    "RDO 071",
    "RDO 072",
    "RDO 073",
    "RDO 074",
    "RDO 075",
    "RDO 076",
    "RDO 077",
    "RDO 078",
    "RDO 079",
    "RDO 080",
    "RDO 081",
    "RDO 082",
    "RDO 083",
    "RDO 084",
    "RDO 085",
    "RDO 086",
    "RDO 087",
    "RDO 088",
    "RDO 089",
    "RDO 090",
    "RDO 091",
    "RDO 092",
    "RDO 93A",
    "RDO 93B",
    "RDO 094",
    "RDO 095",
    "RDO 096",
    "RDO 097",
    "RDO 098",
    "RDO 099",
    "RDO 100",
    "RDO 101",
    "RDO 102",
    "RDO 103",
    "RDO 104",
    "RDO 105",
    "RDO 106",
    "RDO 107",
    "RDO 108",
    "RDO 109",
    "RDO 110",
    "RDO 111",
    "RDO 112",
    "RDO 113A",
    "RDO 113B",
    "RDO 114",
    "RDO 115",
  ];

const fontDmSans = DM_Sans({
  subsets: ['latin'],
  weight: ["400", "500", "700"]
})

const fontYsabeau = Ysabeau({
  subsets: ['latin'],
  weight: ['400', "500", '600', "700"]
})

const RDOSelector = ({ register, setValue, errors, initialValue }) => {
    const [query, setQuery] = useState("");
    const [selectedRDO, setSelectedRDO] = useState("");
  
  useEffect(() => {
    setSelectedRDO(initialValue || "");
  }, [initialValue]);

    const filteredRDOs =
      query === ""
        ? rdoOptions
        : rdoOptions.filter((rdo) =>
            rdo.toLowerCase().includes(query.toLowerCase())
          );

  return (
    <div>
      <label htmlFor="rdo" className={`${fontYsabeau.className} text-lg font-normal`}>
        Revenue District Office (RDO)<span className="text-red-600">*</span>
      </label>
      <div className="relative">
        <Input
          id="rdo"
          type="text"
          placeholder="RDO code"
          value={selectedRDO}
          onChange={(e) => {
            const inputValue = e.target.value;
            setQuery(inputValue);
            setSelectedRDO(inputValue);
            setValue("RDO", inputValue);
          }}
          className={`${fontDmSans.className} font-medium w-full !text-base border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none`}
        //   {...register("rdo", { required: "RDO is required" })}
        />
        {query && (
          <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            {filteredRDOs.length === 0 ? (
              <li className={`${fontDmSans.className} font-medium w-full !text-base cursor-default select-none py-2 px-4 text-gray-700`}>
                No results found.
              </li>
            ) : (
              filteredRDOs.map((rdo) => (
                <li
                  key={rdo}
                  onClick={() => {
                    setSelectedRDO(rdo);
                    setQuery("");
                    setValue("RDO", rdo);
                  }}
                  className={`${fontDmSans.className} font-medium w-full !text-base cursor-pointer select-none py-2 px-4 hover:bg-primary hover:text-white`}
                >
                  {rdo}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      {errors.RDO && (
        <p className={`${fontYsabeau.className} font-medium text-base text-red-500`}>{errors.RDO.message}</p>
      )}
    </div>
  );
};

export default RDOSelector;