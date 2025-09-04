"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, IndianRupee, CheckCircle, AlertCircle, Shield, Lock } from "lucide-react"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resource: {
    id: string
    title: string
    price: number
    thumbnailUrl?: string
  }
  onPaymentComplete: () => void
}

export function PaymentDialog({ open, onOpenChange, resource, onPaymentComplete }: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">("card")
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  })
  const [upiId, setUpiId] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "verification" | "success" | "error">(
    "idle",
  )
  const [verificationCode, setVerificationCode] = useState("")
  const [expectedVerificationCode, setExpectedVerificationCode] = useState("")

  const handlePayment = () => {
    setIsProcessing(true)
    setPaymentStatus("processing")

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)

      // Generate a random verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      setExpectedVerificationCode(code)

      // In a real app, this would be sent to the user's phone or email
      console.log("Verification code:", code)

      setPaymentStatus("verification")
    }, 2000)
  }

  const handleVerification = () => {
    if (verificationCode === expectedVerificationCode) {
      setPaymentStatus("success")

      // Reset form after successful payment
      setTimeout(() => {
        onPaymentComplete()
        setPaymentStatus("idle")
        setCardDetails({
          number: "",
          name: "",
          expiry: "",
          cvv: "",
        })
        setUpiId("")
        setVerificationCode("")
      }, 2000)
    } else {
      setPaymentStatus("error")
    }
  }

  const isFormValid = () => {
    if (paymentMethod === "card") {
      return (
        cardDetails.number.length >= 16 &&
        cardDetails.name.trim() !== "" &&
        cardDetails.expiry.length >= 5 &&
        cardDetails.cvv.length >= 3
      )
    } else {
      return upiId.includes("@")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Purchase</DialogTitle>
          <DialogDescription>Pay securely to access premium content</DialogDescription>
        </DialogHeader>

        {paymentStatus === "success" ? (
          <div className="py-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium">Payment Successful!</h3>
            <p className="text-muted-foreground mt-2">Your resource is now available to read</p>
          </div>
        ) : paymentStatus === "error" ? (
          <div className="py-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium">Verification Failed</h3>
            <p className="text-muted-foreground mt-2">The verification code you entered is incorrect</p>
            <Button variant="outline" className="mt-4" onClick={() => setPaymentStatus("verification")}>
              Try Again
            </Button>
          </div>
        ) : paymentStatus === "verification" ? (
          <div className="py-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium">Verification Required</h3>
            <p className="text-muted-foreground mt-2">
              We've sent a verification code to your registered mobile number
            </p>
            <div className="mt-4 space-y-2">
              <Label htmlFor="verification-code">Enter Verification Code</Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="6-digit code"
                maxLength={6}
              />
              <Button onClick={handleVerification} disabled={verificationCode.length !== 6} className="w-full mt-2">
                Verify and Complete Payment
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-4">
              {resource.thumbnailUrl && (
                <img
                  src={resource.thumbnailUrl || "/placeholder.svg"}
                  alt={resource.title}
                  className="w-16 h-16 object-cover rounded-md"
                />
              )}
              <div>
                <h3 className="font-medium">{resource.title}</h3>
                <p className="text-lg font-bold text-amber-500">₹{resource.price}</p>
              </div>
            </div>

            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <Lock className="h-3 w-3" />
                Secure Payment
              </div>
            </div>

            <Tabs value={paymentMethod} onVolumeChange={(value: "card" | "upi") => setPaymentMethod(value)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="card" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Card
                </TabsTrigger>
                <TabsTrigger value="upi" className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  UPI
                </TabsTrigger>
              </TabsList>

              <TabsContent value="card" className="mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-name">Cardholder Name</Label>
                      <Input
                        id="card-name"
                        placeholder="John Doe"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="upi" className="mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="upi-id">UPI ID</Label>
                      <Input
                        id="upi-id"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-4 flex justify-end">
              <Button onClick={handlePayment} disabled={!isFormValid() || isProcessing} className="w-full">
                {isProcessing ? "Processing..." : `Pay ₹${resource.price}`}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
