"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Mail, Phone, User, MapPin, Landmark, Loader2 } from "lucide-react";
import CitySelector from "@/components/CitySelector";
import ProvinceSelector from "@/components/ProvinceSelector";
import RDOSelector from "@/components/RDOselector";
import RegionSelector from "@/components/RegionSelector";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/use-fetch";
import { updateClientInfo } from "@/actions/accounts";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema } from "@/app/lib/schema";
import { BarLoader } from "react-spinners";
import { useRouter } from "next/navigation";
import { Zen_Kaku_Gothic_Antique } from "next/font/google";


const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: ["400", "500", "700", "900"],
})

// Type options
const INDIVIDUAL_TYPES = [
  { value: "FREELANCE", label: "Freelance" },
  { value: "PROFESSIONAL", label: "Professional" },
  { value: "SOLEPROPRIETORSHIP", label: "Sole Proprietorship" },
  { value: "OTHERS", label: "Others" },
];
const NON_INDIVIDUAL_TYPES = [
  { value: "INCORPORATION", label: "Incorporation" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "COOPERATIVE", label: "Cooperative" },
  { value: "ASSOCIATION", label: "Association" },
  { value: "CORPORATION", label: "Corporation" },
  { value: "OTHERS", label: "Others" },
];

const accountTypeLabel = (type) => {
  switch (type) {
    case "CORPORATION":
      return "Corporation"
    case "INCORPORATION":
      return "Incorporation";
    case "PARTNERSHIP":
      return "Partnership";
    case "COOPERATIVE":
      return "Cooperative";
    case "ASSOCIATION":
      return "Association";
    case "FREELANCE":
      return "Freelance";
    case "PROFESSIONAL":
      return "Professional";
    case "SOLEPROPRIETORSHIP":
      return "Sole Proprietorship";
    default:
      return "Other";
  }
};

const getDefaultType = (isIndividual) =>
  isIndividual ? INDIVIDUAL_TYPES[0].value : NON_INDIVIDUAL_TYPES[0].value;


function formatManilaDate(date) {
  if (!date) return "";
  // Accepts Date object or string
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


const ClientInfoCard = ({ accountProfile }) => {
  // Initialize state from prop
  const [editMode, setEditMode] = useState(false);
  const tinArr = Array(4)
    .fill("")
    .map((_, i) =>
      accountProfile?.tin?.[i] !== undefined && accountProfile?.tin?.[i] !== null
        ? String(accountProfile.tin[i])
        : ""
    );
  
  const birthDateStr = accountProfile.birthDate
    ? new Date(accountProfile.birthDate).toISOString().slice(0, 10)
    : "";
  
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: accountProfile.name,
      type: accountProfile.type || getDefaultType(accountProfile.isIndividual),
      isIndividual: !!accountProfile.isIndividual,
      street: accountProfile.street,
      buildingNumber: accountProfile.buildingNumber,
      town: accountProfile.town,
      city: accountProfile.city,
      zip: accountProfile.zip,
      province: accountProfile.province,
      region: accountProfile.region,
      businessLine: accountProfile.businessLine,
      tin: tinArr.map((t) => (t ? String(t) : "")),
      RDO: accountProfile.RDO,
      birthDate: birthDateStr,
      contactNumber: accountProfile.contactNumber,
      email: accountProfile.email,
      isHeadOffice: !!accountProfile.isHeadOffice,
      branchCount: accountProfile.branchCount ?? 0,
      owner: accountProfile.owner,
    },
  });

  // Keep state in sync with prop if prop changes
  useEffect(() => {
    if (!editMode) {
      reset({
        name: accountProfile.name || "",
        type: accountProfile.type || getDefaultType(accountProfile.isIndividual),
        isIndividual: !!accountProfile.isIndividual,
        street: accountProfile.street || "",
        buildingNumber: accountProfile.buildingNumber || "",
        town: accountProfile.town || "",
        city: accountProfile.city || "",
        zip: accountProfile.zip || "",
        province: accountProfile.province || "",
        region: accountProfile.region || "",
        businessLine: accountProfile.businessLine || "",
        tin: tinArr,
        RDO: accountProfile.RDO || "",
        birthDate: birthDateStr,
        contactNumber: accountProfile.contactNumber || "",
        email: accountProfile.email || "",
        isHeadOffice: !!accountProfile.isHeadOffice,
        branchCount: accountProfile.branchCount ?? 0,
        owner: accountProfile.owner || "",
      });
    }
    // eslint-disable-next-line
  }, [accountProfile, editMode]);

  const isIndividual = watch("isIndividual");
  const type = watch("type");
  const isHeadOffice = watch("isHeadOffice");

  const typeOptions = isIndividual ? INDIVIDUAL_TYPES : NON_INDIVIDUAL_TYPES;

  // Correlate type and isIndividual
  useEffect(() => {
    // If type is not in the current group, reset to default
    const validTypes = typeOptions.map((t) => t.value);
    if (!validTypes.includes(type)) {
      setValue("type", getDefaultType(isIndividual));
    }
    // eslint-disable-next-line
  }, [isIndividual]);


  // Correlate isIndividual when type changes
  useEffect(() => {
    if (INDIVIDUAL_TYPES.some((t) => t.value === type)) {
      setValue("isIndividual", true);
    } else if (NON_INDIVIDUAL_TYPES.some((t) => t.value === type)) {
      setValue("isIndividual", false);
    }
    // eslint-disable-next-line
  }, [type]);

  // Correlate branchCount and isHeadOffice
  useEffect(() => {
    if (!isHeadOffice) {
      setValue("branchCount", 0);
    }
    // eslint-disable-next-line
  }, [isHeadOffice]);



  // Type options based on isIndividual

  const {
    loading: updateLoading,
    fn: udpateInfoFn,
    data: udpatedClientInfo,
    error: udpateError,
  } = useFetch(updateClientInfo);

  // Submit handler
  const onSubmit = async (data) => {
    // Convert birthDate to Date object for Zod
    data.birthDate = new Date(data.birthDate);
    await udpateInfoFn(data, accountProfile.id);
  };

  useEffect(() => {
    if(udpatedClientInfo && !updateLoading){
      setEditMode(false);
      toast.success("Updated client information.");
    }
  }, [udpatedClientInfo, updateLoading])

  useEffect(() => {
    if(udpateError && !updateLoading){
      toast.error("Failed to update.");
    }
  }, [udpateError, updateLoading])

  const tinFields = watch("tin");
  const route = useRouter()







  const [isReturnLoad, setIsReturnLoad] = useState(false);
  const handleLoading = () => {
    setIsReturnLoad(true);
    route.push(`/account/${accountProfile.id}`);
  }






















  return (
 <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className={`${fontZenKaku.className} flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-2 sm:px-4 pt-6`}>
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-blue-900 mb-1">{accountProfile.name}</h1>
          <p className="text-gray-500 text-sm font-normal tracking-wide"> Created On: {formatManilaDate(accountProfile.createdAt)}.{" "}Edited Last: {formatManilaDate(accountProfile.updatedAt)}.</p>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditMode(false);
                  reset();
                }}
                disabled={isSubmitting}
                className="bg-white hover:bg-rose-400 hover:shadow-lg hover:shadow-rose-400/20
                  text-slate-800 hover:text-white font-medium hover:font-normal !text-base 
                  border border-rose-400 hover:border-0"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="client-info-form"
                className="
                  bg-white hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-400/20
                  text-slate-800 hover:text-white font-medium hover:font-normal !text-base 
                  border border-emerald-400 hover:border-0
                  px-6 py-2 rounded-lg shadow transition"
                disabled={updateLoading}
              >
                Save
              </Button>
            </>
          ) : (<>
            <Button
              className="
            bg-white hover:bg-blue-400 hover:shadow-lg hover:shadow-blue-400/20
              text-slate-800 hover:text-white font-medium hover:font-normal !text-base
              border border-blue-400 hover:border-0 px-6 py-2 
              rounded-lg shadow transition w-full md:w-auto"
              disabled={isReturnLoad}
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </Button>
            <Button
              className="
            bg-white hover:bg-blue-400 hover:shadow-lg hover:shadow-blue-400/20
              text-slate-800 hover:text-white font-medium hover:font-normal !text-base
              border border-blue-400 hover:border-0 px-6 py-2 
              rounded-lg shadow transition w-full md:w-auto"
              onClick={handleLoading}
              disabled={isReturnLoad}
            >
              {isReturnLoad
                ? (<><Loader2 className="animate-spin h-4 w-4"/> Back</>)
                : "Back"
              }
            </Button>
            </>
          )}
        </div>
      </div>

      {updateLoading && (
        <div className="w-full flex justify-center py-2">
          <BarLoader width="100%" color="#09090b" />
        </div>
      )}

      {/* Main Grid */}
      <form
        id="client-info-form"
        onSubmit={handleSubmit(onSubmit)}
        className={`${fontZenKaku.className} contents`}
        autoComplete="off"
      >
        <fieldset disabled={updateLoading || isSubmitting} style={{ opacity: updateLoading || isSubmitting ? 0.6 : 1 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2 sm:px-4 pb-8">
          {/* Basic Information */}
          <section className="bg-white rounded-2xl shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <User className="h-7 w-7 text-blue-600 bg-blue-100 rounded-lg p-1" />
              <h2 className="font-bold text-lg">Basic Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Account Name */}
              <div>
                <label className="block font-medium !text-base text-gray-500 mb-1">Account Name</label>
                {editMode ? (
                  <>
                    <Input {...register("name")} />
                    {errors.name && <p className="font-medium !text-base text-red-500">Account name is Required.</p>}
                  </>
                ) : (
                  <div className="rounded-lg bg-gray-50 px-3 py-2 font-medium !text-base">{accountProfile.name}</div>
                )}
              </div>
              {/* Account Type */}
              <div>
                <label className="block font-medium !text-base text-gray-500 mb-1">Business Type</label>
                {editMode ? (
                  <>
                    <Select
                      value={type}
                      onValueChange={(v) => setValue("type", v, { shouldValidate: true })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {typeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="font-medium !text-base text-red-500">Business type is required.</p>}
                  </>
                ) : (
                  <Badge className={
                      accountProfile.isIndividual
                        ? "bg-violet-100 text-violet-700 px-3 py-1 rounded-lg font-medium !text-base hover:bg-violet-50 hover:text-violet-700 hover:border-violet-700"
                        : "bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-medium !text-base hover:bg-blue-50 hover:text-blue-700 hover:border-blue-700"
                         }>
                    {accountTypeLabel(accountProfile.type)}
                  </Badge>
                )}
              </div>
              {/* Owner */}
              <div>
                <label className="block font-medium !text-base text-gray-500 mb-1">Owner</label>
                {editMode ? (
                  <>
                    <Input {...register("owner")} />
                    {errors.owner && <p className="font-medium !text-base text-red-500">Owner's name is required.</p>}
                  </>
                ) : (
                  <div className="rounded-lg bg-gray-50 px-3 py-2 font-medium !text-base">{accountProfile.owner}</div>
                )}
              </div>
              {/* Business Line */}
              <div>
                <label className="block font-medium !text-base text-gray-500 mb-1">Business Line</label>
                {editMode ? (
                  <>
                    <Input {...register("businessLine")} />
                    {errors.businessLine && (
                      <p className="font-medium !text-base text-red-500">Business line is requied.</p>
                    )}
                  </>
                ) : (
                  <div className="rounded-lg bg-gray-50 px-3 py-2 font-medium !text-base">{accountProfile.businessLine}</div>
                )}
              </div>
              {/* Birth Date */}
              <div>
                <label className="block font-medium !text-base text-gray-500 mb-1">Birth Date</label>
                {editMode ? (
                  <>
                    <Input
                      type="date"
                      {...register("birthDate")}
                      max={new Date().toISOString().slice(0, 10)}
                    />
                    {errors.birthDate && (
                      <p className="font-medium !text-base text-red-500">Birth date is required.</p>
                    )}
                  </>
                ) : (
                  <div className="rounded-lg bg-gray-50 px-3 py-2 font-medium !text-base">
                    {accountProfile.birthDate
                      ? new Date(accountProfile.birthDate).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : ""}
                  </div>
                )}
              </div>
              {/* Individual Account */}
              <div>
                <label className="block font-medium !text-base text-gray-500 mb-1">Business Category</label>
                {editMode ? (
                 <div className="flex items-center gap-2">
                  <Switch
                    checked={isIndividual}
                    onCheckedChange={(v) => setValue("isIndividual", v, { shouldValidate: true })}
                  />
                  <span className="font-medium !text-base text-slate-900">
                    {isIndividual ? "Individual" : "Non-Individual"}
                  </span>
                </div>
                ) : (
                  <Badge
                    className={
                      accountProfile.isIndividual
                        ? "bg-violet-100 text-violet-700 font-medium !text-base hover:bg-violet-50 hover:text-violet-700 hover:border-violet-700"
                        : "bg-blue-100 text-blue-700 font-medium !text-base hover:bg-blue-50 hover:text-blue-700 hover:border-blue-700"
                    }
                  >
                    {accountProfile.isIndividual ? "Individual" : "Non-Individual"}
                  </Badge>
                )}
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-white rounded-2xl shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <Phone className="h-7 w-7 text-green-600 bg-green-100 rounded-lg p-1" />
              <h2 className="font-bold text-lg">Contact Information</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {/* Email */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email Address</label>
                {editMode ? (
                  <>
                    <Input {...register("email")} />
                    {errors.email && <p className="text-xs text-red-500">Email address is required.</p>}
                  </>
                ) : (
                  <div className="rounded-lg bg-gray-50 px-3 py-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {accountProfile.email}
                  </div>
                )}
              </div>
              {/* Contact Number */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Contact Number</label>
                {editMode ? (
                  <>
                    <Input {...register("contactNumber")} />
                    {errors.contactNumber && (
                      <p className="text-xs text-red-500">Contact number is required.</p>
                    )}
                  </>
                ) : (
                  <div className="rounded-lg bg-gray-50 px-3 py-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {accountProfile.contactNumber}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Address Information */}
          <section className="bg-white rounded-2xl shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-7 w-7 text-purple-600 bg-purple-100 rounded-lg p-1" />
              <h2 className="font-bold text-lg">Address Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Street */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Street</label>
                {editMode ? (
                  <>
                    <Input {...register("street")} />
                    {errors.street && <p className="text-xs text-red-500">Street is required</p>}
                  </>
                ) : (
                  <div className="rounded-lg bg-gray-50 px-3 py-2">{accountProfile.street}</div>
                )}
              </div>
              {/* Building Number */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Building Number</label>
                {editMode ? (
                  <>
                    <Input {...register("buildingNumber")} />
                    {errors.buildingNumber && (
                      <p className="text-xs text-red-500">Building number is required</p>
                    )}
                  </>
                ) : (
                  <div className="rounded-lg bg-gray-50 px-3 py-2">{accountProfile.buildingNumber}</div>
                )}
              </div>
              {/* Town */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Barangay</label>
                {editMode ? (
                  <>
                    <Input {...register("town")} />
                    {errors.town && <p className="text-xs text-red-500">Barangay is required.</p>}
                  </>
                ) : (
                  <div className="rounded-lg bg-gray-50 px-3 py-2">{accountProfile.town}</div>
                )}
              </div>
              {/* City */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">City</label>
                {editMode ? (
                  <CitySelector
                    register={register}
                    setValue={setValue}
                    errors={errors}
                    initialValue={watch("city")}
                  />
                ) : (
                  <div className="rounded-lg bg-gray-50 px-3 py-2">{accountProfile.city}</div>
                )}
              </div>
              {/* ZIP */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">ZIP Code</label>
                {editMode ? (
                  <>
                    <Input 
                      type="text"
                      inputMode="numeric"
                      pattern="\d{4}"
                      maxLength={4} 
                      {...register("zip")} 
                        value={watch("zip") ?? ""}
                      onChange={e => {
                        // Only allow digits, max 4
                        let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                        setValue("zip", val, { shouldValidate: true });
                      }}
                      placeholder="0000"
                      required/>
                    {errors.zip && <p className="text-xs text-red-500">Zip code is required.</p>}
                  </>
                ) : (
                  <div className="rounded-lg bg-gray-50 px-3 py-2">{accountProfile.zip}</div>
                )}
              </div>
              {/* Province */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Province</label>
                {editMode ? (
                  <ProvinceSelector
                    register={register}
                    setValue={setValue}
                    errors={errors}
                    initialValue={watch("province")}
                  />
                ) : (
                  <div className="rounded-lg bg-gray-50 px-3 py-2">{accountProfile.province}</div>
                )}
              </div>
              {/* Region */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Region</label>
                {editMode ? (
                  <RegionSelector
                    register={register}
                    setValue={setValue}
                    errors={errors}
                    initialValue={watch("region")}
                  />
                ) : (
                  <div className="rounded-lg bg-gray-50 px-3 py-2">{accountProfile.region}</div>
                )}
              </div>
            </div>
          </section>

          {/* Tax & Business Information */}
          <section className="bg-white rounded-2xl shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <Landmark  className="h-7 w-7 text-orange-600 bg-orange-100 rounded-lg p-1" />
              <h2 className="font-bold text-lg">Tax & Business Information</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {/* TIN Numbers */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">TIN Numbers</label>
                <div className="flex flex-wrap gap-2">
                  {editMode
                    ? tinFields.map((t, i) => (
                        <Input
                          key={i}
                          type="text"
                          // inputMode="numeric"
                          pattern="\d*"
                          value={t}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            // Limit length: first 3 fields = 3 digits, last = 5 digits
                            if (i < 3) val = val.slice(0, 3);
                            else val = val.slice(0, 5);
                            const arr = [...tinFields];
                            arr[i] = val;
                            setValue("tin", arr, { shouldValidate: true });
                          }}
                          className="w-20 text-center"
                          maxLength={i < 3 ? 3 : 5}
                          minLength={i < 3 ? 3 : 5}
                          placeholder={i < 3 ? "000" : "00000"}
                          required
                        />
                      ))
                    : (accountProfile.tin || []).map((t, i) => (
                        <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm">
                          {t}
                        </span>
                      ))}
                </div>
                {errors.tin && <p className="text-xs text-red-500">TIN is required.</p>}
              </div>
              {/* RDO */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">RDO</label>
                {editMode ? (
                  <RDOSelector
                    register={register}
                    setValue={setValue}
                    errors={errors}
                    initialValue={watch("RDO")}
                  />
                ) : (
                  <div className="rounded-lg bg-gray-50 px-3 py-2">{accountProfile.RDO}</div>
                )}
              </div>
              {/* Head Office */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Head Office</label>
                {editMode ? (
                 <div className="flex items-center gap-2">
                  <Switch
                    checked={isHeadOffice}
                    onCheckedChange={(v) => setValue("isHeadOffice", v, { shouldValidate: true })}
                  />
                  <span className="text-xs text-slate-900">
                    {isHeadOffice ? "Head Office Account" : "Not Head Office"}
                  </span>
                </div>
                ) : (
                  <Badge
                    className={
                      accountProfile.isHeadOffice
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }
                  >
                    {accountProfile.isHeadOffice ? "Yes" : "No"}
                  </Badge>
                )}
              </div>
              {/* Branch Count */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Branch Count</label>
                {editMode ? (
                  <>
                    <Input
                      type="number"
                      {...register("branchCount")}
                      disabled={!isHeadOffice}
                      min={0}
                    />
                    {errors.branchCount && (
                      <p className="text-xs text-red-500">{errors.branchCount.message}</p>
                    )}
                  </>
                ) : (
                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    {accountProfile.branchCount} branches
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
        </fieldset>
      </form>
    </div>
  );
};

export default ClientInfoCard;