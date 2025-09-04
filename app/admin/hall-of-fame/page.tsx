"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { Award, Crown, Edit, Medal, Plus, Star, Trash2, Trophy, Search, ArrowUpDown, Sparkles } from "lucide-react"

// Types for Hall of Fame
type BadgeType = "Rising Star" | "Elite Achiever" | "College Connect Legend"

type HallOfFameStudent = {
  id: string
  name: string
  avatar?: string
  rank: number
  category: string
  title?: string
  adminNote: string
  badges: BadgeType[]
  stats: {
    tasksCompleted: number
    currentStreak: number
    longestStreak: number
    teacherFeedback: string
  }
  reactions: {
    clap: number
    fire: number
    hundred: number
    heart: number
  }
  hasStreak: boolean
  winCount: number
}

type HallOfFameCategory = {
  id: string
  name: string
  description: string
  students: HallOfFameStudent[]
}

// Mock data for Hall of Fame
const mockHallOfFameData: HallOfFameCategory[] = [
  {
    id: "academic",
    name: "Academic Excellence",
    description: "Top performers in academics this week",
    students: [
      {
        id: "1",
        name: "Rahul Sharma",
        avatar: "/placeholder.svg",
        rank: 1,
        category: "academic",
        title: "The Mastermind",
        adminNote: "Consistently top performer in all subjects!",
        badges: ["College Connect Legend"],
        stats: {
          tasksCompleted: 28,
          currentStreak: 8,
          longestStreak: 12,
          teacherFeedback: "Exceptional understanding of complex concepts. Always goes beyond what's required.",
        },
        reactions: { clap: 24, fire: 18, hundred: 12, heart: 8 },
        hasStreak: true,
        winCount: 7,
      },
      {
        id: "2",
        name: "Priya Patel",
        avatar: "/placeholder.svg",
        rank: 2,
        category: "academic",
        title: "Problem Solver",
        adminNote: "Excellent analytical skills!",
        badges: ["Elite Achiever"],
        stats: {
          tasksCompleted: 25,
          currentStreak: 5,
          longestStreak: 7,
          teacherFeedback: "Shows remarkable problem-solving abilities. Very methodical approach.",
        },
        reactions: { clap: 18, fire: 12, hundred: 8, heart: 15 },
        hasStreak: true,
        winCount: 4,
      },
      {
        id: "3",
        name: "Arjun Singh",
        avatar: "/placeholder.svg",
        rank: 3,
        category: "academic",
        title: "Rising Star",
        adminNote: "Most improved student this month!",
        badges: ["Rising Star"],
        stats: {
          tasksCompleted: 22,
          currentStreak: 3,
          longestStreak: 3,
          teacherFeedback: "Shows tremendous improvement. Keep up the good work!",
        },
        reactions: { clap: 22, fire: 9, hundred: 5, heart: 11 },
        hasStreak: false,
        winCount: 1,
      },
    ],
  },
  {
    id: "technical",
    name: "Technical Innovation",
    description: "Students with outstanding technical projects",
    students: [
      {
        id: "4",
        name: "Neha Gupta",
        avatar: "/placeholder.svg",
        rank: 1,
        category: "technical",
        title: "Tech Wizard",
        adminNote: "Created an impressive AI project!",
        badges: ["Elite Achiever"],
        stats: {
          tasksCompleted: 18,
          currentStreak: 6,
          longestStreak: 6,
          teacherFeedback: "Exceptional technical skills and innovative thinking. Project was beyond expectations.",
        },
        reactions: { clap: 28, fire: 22, hundred: 15, heart: 10 },
        hasStreak: true,
        winCount: 3,
      },
      {
        id: "5",
        name: "Vikram Mehta",
        avatar: "/placeholder.svg",
        rank: 2,
        category: "technical",
        title: "Code Master",
        adminNote: "Solved complex programming challenges!",
        badges: ["Rising Star"],
        stats: {
          tasksCompleted: 16,
          currentStreak: 4,
          longestStreak: 4,
          teacherFeedback: "Excellent coding skills. Consistently delivers clean, efficient code.",
        },
        reactions: { clap: 15, fire: 18, hundred: 7, heart: 5 },
        hasStreak: true,
        winCount: 1,
      },
    ],
  },
  {
    id: "cultural",
    name: "Cultural Contribution",
    description: "Students who excel in cultural activities",
    students: [
      {
        id: "6",
        name: "Ananya Desai",
        avatar: "/placeholder.svg",
        rank: 1,
        category: "cultural",
        title: "Creative Genius",
        adminNote: "Outstanding performance in the cultural fest!",
        badges: ["College Connect Legend"],
        stats: {
          tasksCompleted: 20,
          currentStreak: 7,
          longestStreak: 10,
          teacherFeedback: "Natural talent and dedication to the arts. A true inspiration to peers.",
        },
        reactions: { clap: 32, fire: 25, hundred: 18, heart: 22 },
        hasStreak: true,
        winCount: 6,
      },
    ],
  },
]

export default function HallOfFameAdmin() {
  const [categories, setCategories] = useState<HallOfFameCategory[]>(mockHallOfFameData)
  const [activeTab, setActiveTab] = useState("categories")
  const [editingCategory, setEditingCategory] = useState<HallOfFameCategory | null>(null)
  const [editingStudent, setEditingStudent] = useState<HallOfFameStudent | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const handleAddCategory = () => {
    const newCategory: HallOfFameCategory = {
      id: `category-${Date.now()}`,
      name: "New Category",
      description: "Description for the new category",
      students: [],
    }
    setCategories([...categories, newCategory])
    setEditingCategory(newCategory)
  }

  const handleUpdateCategory = (updatedCategory: HallOfFameCategory) => {
    setCategories(categories.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat)))
    setEditingCategory(null)
    toast({
      title: "Category updated",
      description: "The category has been successfully updated.",
    })
  }

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(categories.filter((cat) => cat.id !== categoryId))
    toast({
      title: "Category deleted",
      description: "The category has been successfully removed.",
    })
  }

  const handleAddStudent = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    if (!category) return

    const newStudent: HallOfFameStudent = {
      id: `student-${Date.now()}`,
      name: "New Student",
      avatar: "/placeholder.svg",
      rank: category.students.length + 1,
      category: categoryId,
      adminNote: "Add a note about this student's achievement",
      badges: ["Rising Star"],
      stats: {
        tasksCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        teacherFeedback: "",
      },
      reactions: { clap: 0, fire: 0, hundred: 0, heart: 0 },
      hasStreak: false,
      winCount: 1,
    }

    const updatedCategory = {
      ...category,
      students: [...category.students, newStudent],
    }

    setCategories(categories.map((cat) => (cat.id === categoryId ? updatedCategory : cat)))
    setEditingStudent(newStudent)
  }

  const handleUpdateStudent = (updatedStudent: HallOfFameStudent) => {
    setCategories(
      categories.map((cat) => {
        if (cat.id === updatedStudent.category) {
          return {
            ...cat,
            students: cat.students.map((student) => (student.id === updatedStudent.id ? updatedStudent : student)),
          }
        }
        return cat
      }),
    )
    setEditingStudent(null)
    toast({
      title: "Student updated",
      description: "The student profile has been successfully updated.",
    })
  }

  const handleDeleteStudent = (categoryId: string, studentId: string) => {
    setCategories(
      categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            students: cat.students.filter((student) => student.id !== studentId),
          }
        }
        return cat
      }),
    )
    toast({
      title: "Student removed",
      description: "The student has been removed from the Hall of Fame.",
    })
  }

  const handleReorderStudents = (categoryId: string) => {
    setCategories(
      categories.map((cat) => {
        if (cat.id === categoryId) {
          const reorderedStudents = [...cat.students].map((student, index) => ({
            ...student,
            rank: index + 1,
          }))
          return {
            ...cat,
            students: reorderedStudents,
          }
        }
        return cat
      }),
    )
    toast({
      title: "Rankings updated",
      description: "Student rankings have been updated based on their position.",
    })
  }

  const getBadgeIcon = (badge: BadgeType) => {
    switch (badge) {
      case "Rising Star":
        return <Star className="h-4 w-4" />
      case "Elite Achiever":
        return <Medal className="h-4 w-4" />
      case "College Connect Legend":
        return <Trophy className="h-4 w-4" />
      default:
        return <Award className="h-4 w-4" />
    }
  }

  const filteredCategories = categories.map((category) => ({
    ...category,
    students: category.students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.adminNote.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Hall of Fame Management</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleAddCategory}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{category.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditingCategory(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Students: {category.students.length}</h4>
                      <Button variant="outline" size="sm" onClick={() => handleAddStudent(category.id)}>
                        <Plus className="mr-1 h-3 w-3" />
                        Add Student
                      </Button>
                    </div>
                    {category.students.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {category.students.map((student) => (
                          <div key={student.id} className="flex items-center justify-between p-2 rounded-md bg-muted">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                                {student.rank}
                              </div>
                              <span className="font-medium">{student.name}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setEditingStudent(student)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => handleReorderStudents(category.id)}
                        >
                          <ArrowUpDown className="mr-2 h-3 w-3" />
                          Update Rankings
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          {filteredCategories.map((category) => (
            <div key={category.id}>
              {category.students.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {category.students.map((student) => (
                      <Card key={student.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar>
                                  <AvatarImage src={student.avatar} />
                                  <AvatarFallback>{student.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background shadow-sm">
                                  {student.rank === 1 ? (
                                    <Crown className="h-3 w-3 text-amber-500" />
                                  ) : student.rank === 2 ? (
                                    <Medal className="h-3 w-3 text-slate-400" />
                                  ) : (
                                    <Award className="h-3 w-3 text-amber-700" />
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center gap-1">
                                  <h4 className="font-semibold">{student.name}</h4>
                                  {student.winCount >= 5 && <Sparkles className="h-3 w-3 text-amber-500" />}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {student.title || "No title"} • Rank #{student.rank}
                                </p>
                                <div className="flex gap-1 mt-1">
                                  {student.badges.map((badge) => (
                                    <Badge key={badge} variant="outline" className="text-xs">
                                      {getBadgeIcon(badge)}
                                      <span className="sr-only">{badge}</span>
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => setEditingStudent(student)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteStudent(category.id, student.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-3 text-sm">
                            <p className="line-clamp-2 italic">"{student.adminNote}"</p>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Tasks:</span> {student.stats.tasksCompleted}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Streak:</span> {student.stats.currentStreak} days
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Wins:</span> {student.winCount}x
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Reactions:</span>{" "}
                              {student.reactions.clap +
                                student.reactions.fire +
                                student.reactions.hundred +
                                student.reactions.heart}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Edit Category Dialog */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Category</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryDescription">Description</Label>
                <Textarea
                  id="categoryDescription"
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingCategory(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdateCategory(editingCategory)}>Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Dialog */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Student</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Name</Label>
                  <Input
                    id="studentName"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentRank">Rank</Label>
                  <Input
                    id="studentRank"
                    type="number"
                    min={1}
                    value={editingStudent.rank}
                    onChange={(e) => setEditingStudent({ ...editingStudent, rank: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentTitle">Title</Label>
                  <Input
                    id="studentTitle"
                    value={editingStudent.title || ""}
                    onChange={(e) => setEditingStudent({ ...editingStudent, title: e.target.value })}
                    placeholder="e.g., The Mastermind, Code Wizard"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentWins">Win Count</Label>
                  <Input
                    id="studentWins"
                    type="number"
                    min={0}
                    value={editingStudent.winCount}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, winCount: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentNote">Admin Note</Label>
                <Textarea
                  id="studentNote"
                  value={editingStudent.adminNote}
                  onChange={(e) => setEditingStudent({ ...editingStudent, adminNote: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Badges</Label>
                <div className="flex flex-wrap gap-2">
                  {["Rising Star", "Elite Achiever", "College Connect Legend"].map((badge) => (
                    <div key={badge} className="flex items-center gap-2">
                      <Switch
                        checked={editingStudent.badges.includes(badge as BadgeType)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditingStudent({
                              ...editingStudent,
                              badges: [...editingStudent.badges, badge as BadgeType],
                            })
                          } else {
                            setEditingStudent({
                              ...editingStudent,
                              badges: editingStudent.badges.filter((b) => b !== badge),
                            })
                          }
                        }}
                      />
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Stats</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tasksCompleted">Tasks Completed</Label>
                    <Input
                      id="tasksCompleted"
                      type="number"
                      min={0}
                      value={editingStudent.stats.tasksCompleted}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          stats: {
                            ...editingStudent.stats,
                            tasksCompleted: Number.parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentStreak">Current Streak (days)</Label>
                    <Input
                      id="currentStreak"
                      type="number"
                      min={0}
                      value={editingStudent.stats.currentStreak}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          stats: {
                            ...editingStudent.stats,
                            currentStreak: Number.parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longestStreak">Longest Streak (days)</Label>
                    <Input
                      id="longestStreak"
                      type="number"
                      min={0}
                      value={editingStudent.stats.longestStreak}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          stats: {
                            ...editingStudent.stats,
                            longestStreak: Number.parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hasStreak">Has Active Streak</Label>
                    <div className="flex items-center h-10">
                      <Switch
                        id="hasStreak"
                        checked={editingStudent.hasStreak}
                        onCheckedChange={(checked) =>
                          setEditingStudent({
                            ...editingStudent,
                            hasStreak: checked,
                          })
                        }
                      />
                      <Label htmlFor="hasStreak" className="ml-2">
                        {editingStudent.hasStreak ? "Yes (shows glow effect)" : "No"}
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacherFeedback">Teacher's Feedback</Label>
                <Textarea
                  id="teacherFeedback"
                  value={editingStudent.stats.teacherFeedback}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      stats: {
                        ...editingStudent.stats,
                        teacherFeedback: e.target.value,
                      },
                    })
                  }
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingStudent(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdateStudent(editingStudent)}>Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
