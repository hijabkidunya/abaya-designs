"use client"

import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchUserProfile, updateUserProfile, changePassword } from "@/lib/features/auth/authSlice"
import { User, MapPin, Edit, Save, X, Lock, Phone, Mail, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function ProfilePage() {
  const dispatch = useDispatch()
  const { user, loading, error, passwordChangeSuccess } = useSelector((state) => state.auth)
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    addresses: [],
  })
  const [pwError, setPwError] = useState("")
  const [pwSuccess, setPwSuccess] = useState("")
  const currentRef = useRef()
  const newRef = useRef()
  const confirmRef = useRef()

  useEffect(() => {
    dispatch(fetchUserProfile())
  }, [dispatch])

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        addresses: user.addresses || [],
      })
    }
  }, [user])

  useEffect(() => {
    if (error) setPwError(error)
    else setPwError("")
  }, [error])

  useEffect(() => {
    if (typeof passwordChangeSuccess === "string") setPwSuccess(passwordChangeSuccess)
    else setPwSuccess("")
  }, [passwordChangeSuccess])

  const handleSave = async () => {
    try {
      await dispatch(updateUserProfile(profile)).unwrap()
      setIsEditing(false)
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Profile update error:", error)
      toast.error("Failed to update profile")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-muted"></div>
          <div className="h-4 w-32 mx-auto mt-4 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-500 text-center p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="font-medium">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => dispatch(fetchUserProfile())}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
        </div>
        {!isEditing ? (
          <Button size="sm" className="w-full sm:w-auto" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-xl overflow-hidden mb-6">
          <TabsTrigger value="profile">Personal Info</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="profile">
          <Card className="rounded-xl shadow-sm border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                    <User className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                    <Mail className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                      className="pl-10"
                    />
                    <Phone className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses">
          <Card className="rounded-xl shadow-sm border-muted">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MapPin className="h-5 w-5" />
                    Saved Addresses
                  </CardTitle>
                  <CardDescription>
                    Manage your shipping and billing addresses
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline" className="hidden sm:flex">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              {profile.addresses && profile.addresses.length > 0 ? (
                <div className="space-y-4">
                  {profile.addresses.map((address, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="mb-3 sm:mb-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">
                            {address.type?.charAt(0).toUpperCase() + address.type?.slice(1) || "Shipping"}
                          </div>
                          {address.isDefault && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {address.street}, {address.city}, {address.state}, {address.zipCode}, {address.country}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600">
                          <X className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-4">No saved addresses yet.</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                  </Button>
                </div>
              )}
              <Button size="sm" variant="outline" className="w-full mt-4 sm:hidden">
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="rounded-xl shadow-sm border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Lock className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>
                Update your password and manage account security
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPwError("");
                  setPwSuccess("");
                  const currentPassword = currentRef.current.value;
                  const newPassword = newRef.current.value;
                  const confirmPassword = confirmRef.current.value;

                  if (newPassword !== confirmPassword) {
                    setPwError("New passwords do not match.");
                    return;
                  }

                  try {
                    await dispatch(changePassword({ currentPassword, newPassword })).unwrap();
                    setPwSuccess("Password updated successfully.");
                    toast.success("Password changed successfully");
                    currentRef.current.value = "";
                    newRef.current.value = "";
                    confirmRef.current.value = "";
                  } catch (err) {
                    setPwError(err.message || "Failed to change password.");
                    toast.error("Failed to change password");
                  }
                }}
                className="space-y-4 max-w-md mx-auto"
              >
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type="password"
                      autoComplete="current-password"
                      required
                      ref={currentRef}
                      className="pl-10"
                    />
                    <Lock className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    ref={newRef}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    ref={confirmRef}
                  />
                </div>

                {pwError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                    {pwError}
                  </div>
                )}

                {pwSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
                    {pwSuccess}
                  </div>
                )}

                <Button type="submit" className="w-full">Change Password</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
