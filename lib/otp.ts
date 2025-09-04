// In a real application, use a proper SMS service
export const sendOTP = async (mobile: string, otp: string) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log(`Sending OTP ${otp} to ${mobile}`)
  return true
}

export const generateOTP = () => {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const verifyOTP = (inputOTP: string, storedOTP: string) => {
  return inputOTP === storedOTP
}

export const hashPassword = async (password: string) => {
  // In a real application, use a proper password hashing library
  return btoa(password)
}
