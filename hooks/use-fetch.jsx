import { useState } from "react"
import { toast } from "sonner";

// const useFetch = (cb) => {
//   const [data, setData] = useState(undefined);
//   const [loading, setLoading] = useState(null);
//   const [error, setError] = useState(null);

//   const fn = async (...args) => {
//     setLoading(true);
//     setError(null);
//     console.log("fetch hook initializing...", ...args, "The type is: ",typeof args)

//     try {
//         const response = await cb(...args);
//         setData(response);
//         setError(null);
//         console.info("DATA IN FETCH HOOK", response)
//     } catch (error) {
//         setError(error);
//         toast.error(error.message);
//     } finally{
//         setLoading(false);
//     }
//   };

//     return {
//         data, 
//         loading, 
//         error, 
//         fn, 
//         setData //if want to manipulate data from outside
//     }
// }

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  console.log("[cb]", `${cb.name}`)
  const fn = async (...args) => {
    setLoading(true);
    setError(null);
    console.log("fetch hook initializing...", ...args, "The type is: ", typeof args);

    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
      console.info("DATA IN FETCH HOOK", response);
      console.info("DATA IN FETCH HOOK[cb]",cb);
      console.info("DATA IN FETCH HOOK[cb.name]",cb.name);
      console.info("DATA IN FETCH HOOK[args]",args);
      // --- Activity Tracking Logic ---
      fetch("/api/activityLog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: `${cb.name}`,
          args,
          result: response,
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) => {
        // Optionally handle/log error, but don't block UI
        console.warn("Activity log failed:", err);
      });
      // --- End Activity Tracking ---

    } catch (error) {
      setError(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fn,
    setData //if want to manipulate data from outside
  }
}

export default useFetch






// import { useState } from "react";
// import { toast } from "sonner";

// const useFetch = (cb) => {
//   const [data, setData] = useState(undefined);
//   const [loading, setLoading] = useState(null);
//   const [error, setError] = useState(null);

//   const fn = async (...args) => {
//     setLoading(true);
//     setError(null);
  

//     try {
//       const response = await cb(...args);
//       setData(response);
//       setError(null);
     
//     } catch (error) {
//       setError(error);
//       toast.error(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { data, loading, error, fn, setData };
// };

// export default useFetch;