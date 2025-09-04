import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, BookOpen, Star, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { CollegeProfile } from "@/lib/types"

interface CollegeProfilePreviewProps {
  profile: CollegeProfile
}

export function CollegeProfilePreview({ profile }: CollegeProfilePreviewProps) {
  // Safely access nested properties with fallbacks
  const coverPhoto =
    profile?.coverImages?.[0]?.url ||
    profile?.coverPhotos?.[0] ||
    "/placeholder.svg?height=150&width=400&text=College+Cover"
  const logo = profile?.logo || "/placeholder.svg?height=48&width=48&text=Logo"
  const name = profile?.name || "College Name"
  const established = profile?.established || "N/A"
  const description = profile?.description || "No description available"

  // Safely access stats with fallbacks
  const stats = {
    students: profile?.stats?.students || 0,
    faculty: profile?.stats?.faculty || 0,
    courses: profile?.stats?.courses || 0,
    alumni: profile?.stats?.alumni || 0,
    placement: profile?.stats?.placement || "N/A",
  }

  // Safely access contact info with fallbacks
  const contact = {
    address: profile?.contact?.address || "Address not available",
    city: profile?.contact?.city || "City",
    state: profile?.contact?.state || "State",
    pincode: profile?.contact?.pincode || "000000",
    email: profile?.contact?.email || "email@college.edu",
    phone: profile?.contact?.phone || "+91 0000000000",
  }

  // Safely access academic programs with fallbacks
  const academicPrograms = profile?.academicPrograms || []

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Home Page Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Hero Section Preview */}
          <div className="relative h-[150px] rounded-lg overflow-hidden">
            <img src={coverPhoto || "/placeholder.svg"} alt="College Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
              <div className="flex items-center gap-2 text-white">
                <img
                  src={logo || "/placeholder.svg"}
                  alt={name}
                  className="h-12 w-12 rounded-md border-2 border-white bg-white"
                />
                <div>
                  <h1 className="text-xl font-bold">{name}</h1>
                  <p className="text-xs text-white/80">Est. {established}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Preview */}
          <div className="grid grid-cols-5 gap-2">
            <div className="bg-blue-50 p-2 rounded text-center">
              <Users className="h-4 w-4 mx-auto text-blue-600" />
              <div className="text-sm font-bold">{stats.students}</div>
              <div className="text-xs">Students</div>
            </div>
            <div className="bg-purple-50 p-2 rounded text-center">
              <GraduationCap className="h-4 w-4 mx-auto text-purple-600" />
              <div className="text-sm font-bold">{stats.faculty}</div>
              <div className="text-xs">Faculty</div>
            </div>
            <div className="bg-green-50 p-2 rounded text-center">
              <BookOpen className="h-4 w-4 mx-auto text-green-600" />
              <div className="text-sm font-bold">{stats.courses}</div>
              <div className="text-xs">Courses</div>
            </div>
            <div className="bg-amber-50 p-2 rounded text-center">
              <Users className="h-4 w-4 mx-auto text-amber-600" />
              <div className="text-sm font-bold">{stats.alumni}</div>
              <div className="text-xs">Alumni</div>
            </div>
            <div className="bg-red-50 p-2 rounded text-center">
              <Star className="h-4 w-4 mx-auto text-red-600" />
              <div className="text-sm font-bold">{stats.placement}</div>
              <div className="text-xs">Placement</div>
            </div>
          </div>

          {/* Description Preview */}
          <div>
            <h2 className="text-lg font-semibold mb-2">About the College</h2>
            <p className="text-sm line-clamp-3">{description}</p>
          </div>

          {/* Programs Preview */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Academic Programs</h2>
            <div className="space-y-2">
              {academicPrograms.length > 0 ? (
                <>
                  {academicPrograms.slice(0, 3).map((program, index) => (
                    <div
                      key={program?.id || index}
                      className="flex justify-between items-center p-2 bg-slate-50 rounded"
                    >
                      <div>
                        <div className="font-medium text-sm">{program?.name || "Program Name"}</div>
                        <div className="text-xs text-muted-foreground">{program?.duration || "Duration"}</div>
                      </div>
                      <Badge>{program?.code || "CODE"}</Badge>
                    </div>
                  ))}
                  {academicPrograms.length > 3 && (
                    <div className="text-xs text-center text-muted-foreground">
                      +{academicPrograms.length - 3} more programs
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">No academic programs available</div>
              )}
            </div>
          </div>

          {/* Contact Preview */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {contact.address}, {contact.city}, {contact.state} - {contact.pincode}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>Email: {contact.email}</div>
                <div>Phone: {contact.phone}</div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="text-center text-sm text-muted-foreground">
            This is a simplified preview. The actual home page will display the information with proper styling and
            layout.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
