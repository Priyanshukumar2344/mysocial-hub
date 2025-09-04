import { db, type UserData } from "./db"

// Save user password and update status to active
export const saveUserPassword = async (collegeId: string, hashedPassword: string): Promise<boolean> => {
  try {
    const users = db.get("users") || []
    const userIndex = users.findIndex((u: UserData) => u.collegeId === collegeId)

    if (userIndex === -1) {
      return false
    }

    // Update the user with the password and change status to active
    users[userIndex] = {
      ...users[userIndex],
      password: hashedPassword,
      status: "active", // Change status from pending to active
      lastLogin: new Date().toISOString(),
    }

    db.set("users", users)
    return true
  } catch (error) {
    console.error("Error saving user password:", error)
    return false
  }
}

// Verify user against uploaded data (for bulk registration)
export const verifyUserAgainstUploadedData = (collegeId: string): boolean => {
  // In a real implementation, this would check against the uploaded data
  // For now, we'll just return true since the feature is disabled
  return true
}

// Get user verification status
export const getUserVerificationStatus = (collegeId: string): boolean => {
  const users = db.get("users") || []
  const user = users.find((u: UserData) => u.collegeId === collegeId)
  return user ? user.isVerified || false : false
}

// Set user verification status
export const setUserVerificationStatus = (collegeId: string, isVerified: boolean): boolean => {
  try {
    const users = db.get("users") || []
    const userIndex = users.findIndex((u: UserData) => u.collegeId === collegeId)

    if (userIndex === -1) {
      return false
    }

    users[userIndex] = {
      ...users[userIndex],
      isVerified,
    }

    db.set("users", users)
    return true
  } catch (error) {
    console.error("Error setting user verification status:", error)
    return false
  }
}

export const verifyUserDetails = (setupData: any): { isValid: boolean; message: string; user?: UserData } => {
  const users = db.get("users") || []
  const user = users.find((u: UserData) => u.collegeId === setupData.collegeId)

  if (!user) {
    return { isValid: false, message: "User not found. Please contact your administrator." }
  }

  // Add more checks here against uploaded data if needed
  return { isValid: true, message: "User details verified", user }
}
