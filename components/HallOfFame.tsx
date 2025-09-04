import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const achievements = [
  {
    name: "John Doe",
    achievement: "Published groundbreaking research paper",
    date: "2023-03-15",
    category: "Research",
  },
  {
    name: "Jane Smith",
    achievement: "Won national debate competition",
    date: "2023-04-22",
    category: "Academics",
  },
  {
    name: "Alice Johnson",
    achievement: "Received grant for community project",
    date: "2023-05-10",
    category: "Community Service",
  },
  {
    name: "Bob Williams",
    achievement: "Invented a new sustainable energy solution",
    date: "2023-06-01",
    category: "Innovation",
  },
  {
    name: "Charlie Brown",
    achievement: "Led the team to win the robotics competition",
    date: "2023-07-18",
    category: "Technology",
  },
]

export function HallOfFame() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Hall of Fame
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Recognizing outstanding achievements and contributions from our students and faculty.
        </p>
        <Table>
          <TableCaption>A list of recent achievements.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Achievement</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {achievements.map((achievement) => (
              <TableRow key={achievement.name}>
                <TableCell className="font-medium">{achievement.name}</TableCell>
                <TableCell>{achievement.achievement}</TableCell>
                <TableCell>{achievement.date}</TableCell>
                <TableCell className="text-right">{achievement.category}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
