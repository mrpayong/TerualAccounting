"use client";
import React, { useEffect, useRef, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {Loader2, Search, Shield, CheckCircle, Users, UserX, LaptopMinimalCheck, UserRoundPlus, UserRound, MoreHorizontal, Trash, X, Bolt, Pen, Check, Mail } from 'lucide-react';
import useFetch from '@/hooks/use-fetch';
import { createUser, deleteUser, getUser, getUserForSysAdmin, updateUser, updateUserEmail, updateUserRole } from '@/actions/settings';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema } from '@/app/lib/schema';
import Swal from 'sweetalert2';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { BarLoader } from 'react-spinners';
import { Divider, Skeleton } from '@mui/material';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useUser } from '@clerk/nextjs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, useCarousel } from "@/components/ui/carousel";



function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

const roles = [
  {
    name: "STAFF",
    icon: <UserRound className="lg:w-6 lg:h-6 sm:w-5 sm:h-5 text-blue-500" />,
    description: "Staff can manage and analyze data for their assigned client accounts. They have access to client dashboards, can create transactions, and manage cashflow statements.",
    accesses: [
      "Dashboard with analytics for assigned client",
      "Clickable client cards to access account pages",
      "Create transactions (AI-powered receipt scanning)",
      "View and edit transactions",
      "Edit Cashflow Statements (CFS)",
      "Access Disbursement & Cash Receipt Books",
      "Download Cashflow Statement as PDF"
    ]
  },
  {
    name: "ADMIN",
    icon: <Shield className="lg:w-6 lg:h-6 sm:w-5 sm:h-5 text-green-600" />,
    description: "Admins have access to decision support tools, advanced analytics, and user management. They can forecast, schedule tasks, and oversee all client and user activity.",
    accesses: [
      "Decision Support System (DSS) with analytics",
      "AI-powered forecasting & task scheduling",
      "Create and manage tasks",
      "Admin portal dashboard (recent reports)",
      "View all activity logs",
      "Access all client information",
      "View user list and change user roles"
    ]
  },
  {
    name: "SYSTEM ADMIN",
    icon: <LaptopMinimalCheck className="lg:w-6 lg:h-6 sm:w-5 sm:h-5 text-yellow-600" />,
    description: "System Admins have the highest level of access, focusing on system-wide user and session management.",
    accesses: [
      "System Admin portal dashboard (recent reports)",
      "View all user session logs",
      "Manage user list (create and delete users)"
    ]
  }
];

function CarouselDots() {
  const { selectedIndex, slideCount, api } = useCarousel()
  if (!slideCount) return null
  return (
    <div className="flex justify-center mt-2 gap-2">
      {Array.from({ length: slideCount }).map((_, idx) => (
        <button
          key={idx}
          className={`h-2 w-2 rounded-full transition-colors duration-200 ${
            idx === selectedIndex ? 'bg-zinc-300' : 'bg-neutral-200'
          }`}
          aria-label={`Go to slide ${idx + 1}`}
          onClick={() => api && api.scrollTo(idx)}
          type="button"
        />
      ))}
    </div>
  )
}

function RoleInfoTab() {
   const isSmallScreen = useMediaQuery("(max-width: 1080px)");
   
  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-2 sm:px-4">
      <h2 className="text-3xl font-bold pb-1 text-gray-900">Roles & Access</h2>
      <Divider className='w-auto'/>
      <span className="text-gray-400 text-sm *:pt-1">
        Information of each role and their accesses. This helps clarify permissions for each role.
      </span>
      {isSmallScreen ? (
        <Carousel className="mt-4">
          <CarouselContent>
            {roles.map((role) => (
              <CarouselItem key={role.name} className="p-2">
                <Card className={
                  isSmallScreen
                    ? `flex flex-col h-auto ${role.name === "SYSTEM ADMIN"
                        ? "bg-gradient-to-r from-white to-yellow-300/35"
                        : role.name === "ADMIN"
                          ? "bg-gradient-to-r from-white to-green-300/35"
                          : "bg-gradient-to-r from-white to-blue-500/35"
                        }`
                    : "flex flex-col h-auto"
                }>
                  <CardHeader className="flex justify-evenly gap-2 p-4">
                    <div className="flex flex-col gap-1 m-0 p-0 h-36">
                      <div className='flex flex-row items-start justify-start gap-2'>
                        <div className="flex-shrink-0">{role.icon}</div>
                        <CardTitle className="text-xl">{role.name}</CardTitle>
                      </div>
                      <CardDescription className="text-gray-500">{role.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <ul className="list-disc pl-5 space-y-1 text-gray-800 text-sm">
                      {role.accesses.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselDots/>
        </Carousel>
        ) : (
        <div className="grid grid-cols-1 pt-4 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card key={role.name} className={
                  role.name
                    ? `flex flex-col h-auto ${role.name === "SYSTEM ADMIN"
                        ? "bg-gradient-to-r from-white to-yellow-300/35"
                        : role.name === "ADMIN"
                          ? "bg-gradient-to-r from-white to-green-300/35"
                          : "bg-gradient-to-r from-white to-blue-500/35"
                        }`
                    : "flex flex-col h-auto"
                }>
              <CardHeader className="flex justify-evenly gap-2 p-4">
                <div className="flex flex-col gap-1 m-0 p-0 h-36">
                  <div className='flex flex-row items-center justify-start gap-2'>
                    <div className="flex-shrink-0">{role.icon}</div>
                    <CardTitle className="lg:text-xl">{role.name}</CardTitle>
                  </div>
                  <CardDescription className="text-gray-500">{role.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="list-disc pl-5 space-y-1 text-gray-800 text-sm">
                  {role.accesses.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}



const SettingsForm = () => {
    const [userSearch, setUserSearch] = useState("");
const isSmallScreen = useMediaQuery("(max-width: 1080px)");

// ADD MORE ROLE TO DROPDOWN MENU

    const {
        loading: fetchingUsers,
        fn: fetchUsers,
        data: usersData,
        error: usersError,
    } = useFetch(getUser)

    const {
        loading: updatingRole,
        fn: updateRole,
        data: updateRoleResult,
        error: updateRoleError,
    } = useFetch(updateUserRole)

    const {
    loading: createUserLoading,
    fn: createUserFn,
    data: createUserResult,
    error: createUserError,
  } = useFetch(createUser);


    // error handler
    useEffect(() => {
        if(usersError){
            toast.error(`Failed to load users`);
        }
        if(updateRoleError){
            toast.error(`Failed to update user role: ${updateRoleError.message}`);
        }
    },[usersError, updateRoleError])

    useEffect(() => {
        fetchUsers();
    },[])

    // success handler
    useEffect(() => {
       if(updateRoleResult?.success){
        toast.success("User role has been updated.");
        fetchUsers();
       }
    },[updateRoleResult])

    const filteredUsers = usersData?.success
        ? usersData.data.filter((user) => 
            user.Fname?.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.Lname?.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.email?.toLowerCase().includes(userSearch.toLowerCase())
        )
        : [];
    


const handleChangeUserRole = async (role) => {
  if (!userToChangeRole) return;
  await updateRole(userToChangeRole.id, role);
  setChangeRoleDialog(false);
};

const [createUserDialog, setCreateUserDialog] = useState(false);


  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      Fname: "",
      Lname: "",
      email: "",
      role: "",
      username: "",
    },
  });

const handleCreateUser = async (data) => {
  if (data && data.email && data.username && data.Fname && data.Lname && data.role){
    
    await createUserFn(data);
  }else {
    toast.error("Incomplete inputs.")
  }
  return;
};

useEffect(() => {
  if (createUserResult?.success && !createUserLoading) {
    toast.success("User created successfully!");
    setCreateUserDialog(false);
    reset();
    fetchUsers();
  }
}, [createUserResult, reset, createUserLoading]);



  useEffect(() => {
    if (createUserError && !createUserLoading) {
      console.log(createUserError)
          reset({
      ...watch(),
      email: "",
      username: "",
    });
    }
  },[createUserError, createUserLoading])

  const {
    loading: userDeleteLoading,
    fn: userDeleteFn,
    data: userDeleted,
    error: userDeleteError
  } = useFetch(deleteUser);



    const handleSingleDelete = async (userIdDelete, deleteClerkId) => {
      const result = await Swal.fire({
        title: `Delete this user?`,
        text: `This action cannot be undone.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
      });
  
      if (result.isConfirmed) {
        console.log("deleting...: ", userIdDelete, deleteClerkId)
        await userDeleteFn(userIdDelete, deleteClerkId);
      }
    };

    useEffect(() => {
      if (userDeleted && !userDeleteLoading){
        toast.success("User has been deleted.", {icon: <Trash className='text-green-500 h-4 w-4'/>})
        console.log("Success Deleting user")
        fetchUsers();
      }
    }, [userDeleted, userDeleteLoading])

    useEffect(() => {
      if(userDeleteError && !userDeleteLoading){
        console.log("error user deletion")
        toast.error("Error deleting user.")
      }
    }, [userDeleteError, userDeleteLoading])

    const [changeRoleDialog, setChangeRoleDialog] = useState(false)
    const [userToChangeRole, setUserToChangeRole] = useState(null);


    const {
      loading: updateUserLoading,
      fn: updateUserFn,
      data: updateUserData,
      error: updateUserError,
    } = useFetch(updateUser);

    const [userNewName, setUserNewName] = useState("");
    const [userNewFname, setUserNewFname] = useState("");
    const [userNewLname, setUserNewLname] = useState("");
    const [udpateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [userToUpdataId, setUserToUpdateId] = useState("")


    const handleUpdateData = (user) => {
      if (!user) return;
      setUserToUpdateId(user.id)
      setUpdateDialogOpen(true)
      setUserNewName(user.username);
      setUserNewFname(user.Fname);
      setUserNewLname(user.Lname);  
      setEmailUpdate(user.email)
    }


    const handleUpdateUser = async () => {
 
        await updateUserFn(userToUpdataId, userNewFname, userNewLname, userNewName);
   
    }

    useEffect(() => {
      if(updateUserData && !updateUserLoading){
        if(updateUserData === 200){
          setUpdateDialogOpen(false);
          fetchUsers();
          toast.success("User updated.")
       }
      }
    }, [updateUserData, updateUserLoading])

    useEffect(() => {
      if(updateUserError && !updateUserLoading){
        setUpdateDialogOpen(true);
        console.log("Error occured", updateUserError)
      }
    }, [updateUserError, updateUserLoading])


    const [RoleButtonClick, setRoleButtonClick] = useState(false);
    const [RoleButtonClickId, setRoleButtonClickId] = useState("");




    const [confirmRole, setConfirmRole] = useState(null);


    const {
      loading: updateEmailLoading,
      fn: udpateEmailFn,
      data: updatedEmail,
      error: udpateError,
    } = useFetch(updateUserEmail)
    
    const [emailUpdate, setEmailUpdate] = useState("")
    const [userToUpdateEmailId, setUserToUpdateEmailId] = useState("");
    const [openEmailDialog, setOpenEmailDialog] = useState(false);
    const [originalEmail, setOriginalEmail] = useState("");

    const handleActiveEmailUpdate = (user) => {
      setOpenEmailDialog(true)
      setUserToUpdateEmailId(user.id);
      setEmailUpdate(user.email);
      setOriginalEmail(user.email);
    }

    const handleCancelEmailUpdate = () => {
      setOpenEmailDialog(false)
      setUserToUpdateEmailId("");
      setEmailUpdate("");
    }

    const handleEmailUpdate = () => {
      if(!userToUpdateEmailId && !emailUpdate){
        toast.error("Please fill the blank.");
      }
      console.log(userToUpdateEmailId, emailUpdate)
      udpateEmailFn(userToUpdateEmailId, emailUpdate);
    }

    useEffect(() => {
      if(updatedEmail && !updateEmailLoading){
        if(updatedEmail.status === 200){
          fetchUsers();
          setOpenEmailDialog(false)
          toast.success("User updated.")
          setUserToUpdateEmailId("");
          setEmailUpdate("");
        }
      }
    }, [updatedEmail, updateEmailLoading])

    useEffect(() => {
      if(udpateError && !updateEmailLoading){
        setOpenEmailDialog(true)
        setEmailUpdate(originalEmail);
        console.log("Error occured", udpateError)
      }
    }, [udpateError, updateEmailLoading, originalEmail])


  const { user } = useUser();
  const currentClerkUserId = user?.id;













  return (
  <div className='space-y-6'>
    <Tabs defaultValue="admins">
      <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden py-2 space-x-2 h-auto">
        <TabsTrigger value="Something">
            <LaptopMinimalCheck className='h-4 w-4 mr-2'/>
            Role information & accesses tab
        </TabsTrigger>
        <TabsTrigger value="admins">
            <Shield className='h-4 w-4 mr-2'/>
            Users tab
        </TabsTrigger>
      </TabsList>
      <TabsContent 
          value="Something"
          className="space-y-6 mt-6">
              <RoleInfoTab />
      </TabsContent>




      <Dialog open={createUserDialog} >
        <DialogContent className="[&>button]:hidden rounded-xl">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Fill out the form to create a new user.
            </DialogDescription>
          </DialogHeader>
            <form onSubmit={handleSubmit(handleCreateUser)} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@email.com"
                  className="w-full"
                  {...register("email")}
                  required
                  disabled={createUserLoading}
                />
                {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
              </div>

              
              <div className="flex flex-col gap-1">
                <label htmlFor="username" className="text-sm font-medium text-gray-700">Username</label>
                <Input
                  id="username"
                  placeholder="username"
                  className="w-full"
                  {...register("username")}
                  required
                  disabled={createUserLoading}
                />
                {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
              </div>

              
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex flex-col gap-1 w-full">
                  <label htmlFor="Fname" className="text-sm font-medium text-gray-700">First Name</label>
                  <Input
                    id="Fname"
                    placeholder="First Name"
                    className="w-full"
                    {...register("Fname")}
                    required
                    disabled={createUserLoading}
                  />
                  {errors.Fname && <span className="text-red-500 text-xs">{errors.Fname.message}</span>}
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <label htmlFor="Lname" className="text-sm font-medium text-gray-700">Last Name</label>
                  <Input
                    id="Lname"
                    placeholder="Last Name"
                    className="w-full"
                    {...register("Lname")}
                    required
                    disabled={createUserLoading}
                  />
                  {errors.Lname && <span className="text-red-500 text-xs">{errors.Lname.message}</span>}
                </div>
              </div>

              
              <div className="flex flex-col gap-1">
                <label htmlFor="role" className="text-sm font-medium text-gray-700">Role</label>
                <select
                  id="role"
                  className={`w-full border rounded px-2 py-2 bg-neutral-50 ${watch("role") ? "text-black" : "text-neutral-400"}`}
                  {...register("role")}
                  onChange={e => setValue("role", e.target.value)}
                  value={watch("role")}
                  required
                  disabled={createUserLoading}
                >
                  <option className="text-gray-400" value="">Select role</option>
                  <option className="text-blue-500" value="STAFF">Staff</option>
                  <option className="text-green-500" value="ADMIN">Admin</option>
                  <option className='text-yellow-400' value="SYSADMIN">System Admin</option>
                </select>
                {errors.role && <span className="text-red-500 text-xs">{errors.role.message}</span>}
              </div>

              
              <DialogFooter className="flex flex-col-reverse md:flex-row gap-2 md:justify-end">
              <DialogClose asChild>
                <Button
                type="button"
                variant="ghost"
                onClick={() => setCreateUserDialog(false)}
                disabled={createUserLoading}
                className="w-full md:w-auto hover:bg-rose-600 hover:text-white"
                >
                Cancel
              </Button>
              </DialogClose>

              <Button type="submit" disabled={createUserLoading} 
                className="w-full md:w-auto
                  bg-black hover:bg-white 
                  text-white hover:text-black
                  border-0 hover:border hover:border-black hover:shadow-lg
              ">
                {createUserLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating
                  </>
                ) : (
                  "Create"
                )}
              </Button>
              </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

      <Dialog open={udpateDialogOpen || openEmailDialog} onOpenChange={setUpdateDialogOpen || setOpenEmailDialog}> 
        <DialogContent className="[&>button]:hidden">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Edit information of this user
            </DialogDescription>
          </DialogHeader>
            <form 
              onSubmit={e => {
                e.preventDefault();
                openEmailDialog
                ? handleEmailUpdate()
                : handleUpdateUser(userToUpdataId, userNewFname, userNewLname, userNewName);
              }}
              className="flex flex-col gap-4">
            
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={emailUpdate}
                  onChange={(e) => setEmailUpdate(e.target.value)}
                  className="w-full"
                  disabled={updateEmailLoading || udpateDialogOpen}
                />
              </div>

            
              <div className="flex flex-col gap-1">
                <label htmlFor="username" className="text-sm font-medium text-gray-700">Username</label>
                <Input
                  id="username"
                  placeholder="username"
                  value={userNewName}
                  className="w-full"
                  required
                  onChange={(e) => setUserNewName(e.target.value)}
                  disabled={updateUserLoading || openEmailDialog}
                />
              </div>

            
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex flex-col gap-1 w-full">
                  <label htmlFor="Fname" className="text-sm font-medium text-gray-700">First Name</label>
                  <Input
                    id="Fname"
                    placeholder="First Name"
                    className="w-full"
                    required
                    onChange={(e) => setUserNewFname(e.target.value)}
                    value={userNewFname}
                    disabled={updateUserLoading || openEmailDialog}
                  />
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <label htmlFor="Lname" className="text-sm font-medium text-gray-700">Last Name</label>
                  <Input
                    id="Lname"
                    placeholder="Last Name"
                    className="w-full"
                    required
                    onChange={(e) => setUserNewLname(e.target.value)}
                    value={userNewLname}
                    disabled={updateUserLoading || openEmailDialog}
                  />
                </div>
              </div>

              
              <DialogFooter className="flex flex-col-reverse md:flex-row gap-2 md:justify-end">
              <DialogClose asChild>
                <Button
                type="button"
                variant="outline"
                onClick={ openEmailDialog
                  ? () => handleCancelEmailUpdate()
                  : () => setUpdateDialogOpen(false)
                  }
                disabled={updateUserLoading || updateEmailLoading}
                className="w-full md:w-auto
                border-red-500 hover:border-0 hover:bg-red-500 hover:text-white"
                >
                Cancel
              </Button>
              </DialogClose>

              <Button 
              type="submit" 
              disabled={updateUserLoading || updateEmailLoading} 
              variant="outline"
              // onClick={() => handleUpdateUser(userToUpdataId, userNewFname, userNewLname, userNewName)}
              className="w-full md:w-auto border-green-500 hover:border-0 hover:bg-green-500 hover:text-white">
                {updateUserLoading || updateEmailLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying
                  </>
                ) : (
                  "Apply Changes"
                )}
              </Button>
              </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>



      <TabsContent value="admins" className="space-y-6 mt-6">
        <Card className="bg-gradient-to-r from-white via-indigo-300/65 to-white">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>User Table</CardTitle>
              <CardDescription>
                Manage your users in here.
              </CardDescription>
            </div>
            <Button variant="outline" className="h-10 border border-black bg-opacity-35 hover:bg-white/25" onClick={() => setCreateUserDialog(true)}>
                { isSmallScreen
                  ? (<><UserRoundPlus className="h-4 w-4 items-center" /> </>)
                  : (<><UserRoundPlus className="mr-2 h-4 w-4" /> Create User </>)
                }
            </Button>
          </CardHeader>


          <CardContent>
            <div className="mb-6 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search name or email"
                className="pl-9 w-full"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            {fetchingUsers ? (
              <div className="space-y-4 overflow-x-auto lg:overflow-x-hidden">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 w-full animate-pulse"
                  >
                    {/* Avatar */}
                    <Skeleton
                      animation="wave"
                      variant="circular"
                      width={40}
                      height={40}
                      className="!w-10 !h-10"
                    />
                    {/* Name */}
                    <Skeleton
                      animation="wave"
                      variant="text"
                      width="20%"
                      height={32}
                      className="!w-1/5 !min-w-[80px] !h-8"
                    />
                    {/* Email */}
                    <Skeleton
                      animation="wave"
                      variant="text"
                      width="30%"
                      height={32}
                      className="!w-1/3 !min-w-[120px] !h-8"
                    />
                    {/* Actions */}
                    <Skeleton
                      animation="wave"
                      variant="text"
                      width="15%"
                      height={32}
                      className="!w-[15%] !min-w-[60px] !h-8 ml-auto"
                    />
                  </div>
                ))}
              </div>
            ) : usersData?.success && filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="hidden sm:table-cell">Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-center">Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                              {user.imageUrl ? (
                                <img
                                  src={user.imageUrl}
                                  alt={user.name || "User"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <UserRound className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            <span>{`${user.Fname} ${user.Lname}`|| "Unnamed User"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={
                              user.role === "ADMIN"
                                ? "bg-green-800"
                                : user.role === "SYSADMIN"
                                  ? "bg-yellow-500"
                                  : "bg-blue-800"
                            }
                          >
                            {user.role
                              ? user.role === "ADMIN"
                                ? "Admin"
                                : user.role === "SYSADMIN"
                                  ? "System Admin"
                                  : "Staff"  
                              : "No Role...Immidiate Database check"
                            }
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right flex items-center justify-end gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline"
                                className="px-2 py-1 h-8 w-8 flex items-center justify-center"
                                aria-label="Open user actions">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent 
                              align="end"
                              className="w-56 max-w-xs sm:max-w-sm md:max-w-md p-4 rounded-xl shadow-lg bg-white"
                              sideOffset={8}>

                              <div className="flex flex-col gap-2">
                              <Button 
                                variant="outline" 
                                className="flex items-center gap-2 border-yellow-300 hover:bg-yellow-300 hover:text-white hover:border-0"
                                onClick={() => handleUpdateData(user)}>
                                  <span className="flex items-center">
                                  <Pen className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" aria-hidden="true" />
                                  <span className="ml-2 text-xs sm:text-sm md:text-base font-medium">
                                    Edit
                                  </span>
                                </span>
                              </Button>
                                {user.clerkUserId !== currentClerkUserId && (
                                  <>
                                    <Button
                                      variant="outline"
                                      className="flex items-center gap-2 border-rose-600 hover:bg-rose-600 hover:text-white hover:border-0"
                                      onClick={() => handleSingleDelete(user.id, user.clerkUserId)}
                                    >
                                      <span className="flex items-center">
                                        <Trash className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" aria-hidden="true" />
                                        <span className="ml-2 text-xs sm:text-sm md:text-base font-medium">Delete</span>
                                      </span>
                                    </Button>
                                    {/* Change Role Button */}
                                    <Button
                                      variant="outline"
                                      className="flex items-center gap-2 border-black hover:bg-black hover:text-white hover:border-0"
                                      onClick={() => {
                                        setUserToChangeRole(user);
                                        setChangeRoleDialog(true);
                                      }}
                                    >
                                      <span className="flex items-center">
                                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" aria-hidden="true" />
                                        <span className="ml-2 text-xs sm:text-sm md:text-base font-medium">Change Role</span>
                                      </span>
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="outline"
                                  className="flex items-center gap-2 border-violet-500 hover:bg-violet-500 hover:text-white hover:border-0"
                                  onClick={() => handleActiveEmailUpdate(user)}
                                >
                                  <span className="flex items-center">
                                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" aria-hidden="true" />
                                    <span className="ml-2 text-xs sm:text-sm md:text-base font-medium">Edit Email</span>
                                  </span>
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>

                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No users found
                </h3>
                <p className="text-gray-500">
                  {userSearch
                    ? "No users match your search criteria"
                    : "There are no users registered yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={changeRoleDialog}
            onOpenChange={(open) => {
            setChangeRoleDialog(open);
            if (!open) setConfirmRole(null);
          }}>
          <DialogContent className="[&>button]:hidden max-w-md w-full p-0 rounded-2xl overflow-hidden">
            <div className="bg-blue-50 px-6 pt-6 pb-4">
              <DialogHeader>
                <DialogTitle>Change User Role</DialogTitle>
                <DialogDescription>
                    {confirmRole && (
                      <>Are you sure you want to change the role of{" "}
                      <span className="font-semibold">{userToChangeRole.Fname} {userToChangeRole.Lname}{" "}</span>to
                      <span className="font-semibold">{" "}{confirmRole}</span>?</>
                    )}
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="bg-white flex flex-col gap-2 px-4 py-4 sm:flex-row sm:gap-4 min-w-0">
              <Button
                onClick={() => {
                  if (confirmRole === "STAFF") {
                    handleChangeUserRole("STAFF");
                    setConfirmRole(null);
                  } else {
                    setConfirmRole("STAFF");
                  }
                }}
                disabled={updatingRole || userToChangeRole?.role === "STAFF"}
                className={`flex-1 basis-1/4 min-w-0 flex flex-col items-center justify-center rounded-xl border border-blue-100 shadow-none transition-all duration-200 hover:scale-105 h-20
                  ${confirmRole === "STAFF" 
                    ? " border-green-200 group hover:bg-green-300" 
                    : "hover:bg-blue-300"}
                `}
                variant="ghost"
              >
                  <UserRound className={`mb-1 h-6 w-6 
                    ${confirmRole === "STAFF" 
                      ? "text-green-400 group-hover:text-white" 
                      : "text-blue-500"}` //unclicked
                      } />
                  <span className={`font-medium text-sm ${confirmRole === "STAFF" ? "text-white" : "text-blue-700"}`}>
                    {confirmRole === "STAFF" 
                      ? (<><Check className="text-green-400 group-hover:text-white"/>
                        <label className="text-green-400 group-hover:text-white">Yes</label></>)
                      : "Staff"}
                  </span>
              </Button>
              <Button
                onClick={() => {
                  if (confirmRole === "ADMIN") {
                    handleChangeUserRole("ADMIN");
                    setConfirmRole(null);
                  } else {
                    setConfirmRole("ADMIN");
                  }
                }}
                disabled={updatingRole || userToChangeRole?.role === "ADMIN"}
                className={`flex-1 basis-1/4 min-w-0 flex flex-col items-center justify-center rounded-xl border border-purple-100 shadow-none transition-all duration-200 hover:scale-105 h-20
                  ${confirmRole === "ADMIN"
                    ?  " border-green-200 group hover:bg-green-300" 
                    : "hover:bg-purple-300"}
                `}
                variant="ghost"
              >
                <Shield className={`mb-1 h-6 w-6
                  ${confirmRole === "ADMIN"
                    ? "text-green-400 group-hover:text-white"
                    : "text-purple-500"}
                `} />
                <span className={`font-medium text-sm ${confirmRole === "ADMIN" ? "text-white" : "text-purple-700"}`}>
                  {confirmRole === "ADMIN"
                    ? (<><Check className="text-green-400 group-hover:text-white"/>
                      <label className="text-green-400 group-hover:text-white">Yes</label></>)
                    : "Admin"}
                </span>
              </Button>
              <Button
                onClick={() => {
                  if (confirmRole === "SYSADMIN") {
                    handleChangeUserRole("SYSADMIN");
                    setConfirmRole(null);
                  } else {
                    setConfirmRole("SYSADMIN");
                  }
                }}
                disabled={updatingRole || userToChangeRole?.role === "SYSADMIN"}
                className={`flex-1 basis-1/4 min-w-0 flex flex-col items-center justify-center rounded-xl border border-indigo-100 shadow-none transition-all duration-200 hover:scale-105 h-20
                  ${confirmRole === "SYSADMIN"
                    ?  " border-green-200 group hover:bg-green-300" 
                    : "hover:bg-indigo-300"}
                `}
                variant="ghost"
              >
                <Bolt className={`mb-1 h-6 w-6
                  ${confirmRole === "SYSADMIN"
                    ? "text-green-400 group-hover:text-white"
                    : "text-indigo-500"}
                `} />
                <span className={`font-medium text-sm ${confirmRole === "SYSADMIN" ? "text-white" : "text-indigo-700"}`}>
                  {confirmRole === "SYSADMIN"
                    ? (<><Check className="text-green-400 group-hover:text-white"/>
                      <label className="text-green-400 group-hover:text-white">Yes</label></>)
                    : <>System<br />Admin</>}
                </span>
              </Button>
              <Button
                onClick={() => {
                  setChangeRoleDialog(false);
                  setConfirmRole(null); 
                }}
                disabled={updatingRole}
                className="flex-1 basis-1/4 min-w-0 flex flex-col items-center 
                justify-center rounded-xl border border-gray-100 shadow-none 
                hover:bg-gray-300 transition-all duration-200 hover:scale-105 h-20"
                variant="ghost"
              >
                <X className="mb-1 h-6 w-6 text-gray-500" />
                <span className="text-gray-700 font-medium text-sm">Cancel</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>



      </TabsContent>
  </Tabs>

  </div>
  )
}

export default SettingsForm
