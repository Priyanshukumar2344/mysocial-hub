"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/db"
import { toast } from "@/components/ui/use-toast"
import {
  CreditCard,
  IndianRupee,
  Wallet,
  BarChart4,
  DollarSign,
  TrendingUp,
  Save,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BookOpen,
} from "lucide-react"

export default function PaymentSettingsPage() {
  const { user, isSuperAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState("bank")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const [bankDetails, setBankDetails] = useState({
    accountName: "AITD Institute",
    accountNumber: "1234567890",
    ifscCode: "SBIN0001234",
    bankName: "State Bank of India",
    branch: "Main Branch, Delhi",
  })

  const [upiDetails, setUpiDetails] = useState({
    upiId: "aitd@sbi",
    displayName: "AITD Institute",
    isEnabled: true,
  })

  const [paymentSettings, setPaymentSettings] = useState({
    currency: "INR",
    minPrice: 49,
    maxPrice: 9999,
    commissionRate: 10,
    allowInstallments: false,
    allowRefunds: true,
    refundPeriodDays: 7,
  })

  const [salesData, setSalesData] = useState({
    totalSales: 45600,
    totalTransactions: 128,
    averageOrderValue: 356.25,
    topSellingResource: "Data Structures and Algorithms",
    topSellingCategory: "Computer Science",
    recentTransactions: [
      { id: "tx1", user: "Rahul Sharma", amount: 299, date: "2024-03-10", resource: "Data Structures and Algorithms" },
      { id: "tx2", user: "Priya Patel", amount: 499, date: "2024-03-09", resource: "Digital Electronics Fundamentals" },
      { id: "tx3", user: "Amit Kumar", amount: 599, date: "2024-03-08", resource: "Quantum Computing Basics" },
      { id: "tx4", user: "Sneha Gupta", amount: 299, date: "2024-03-07", resource: "Machine Learning Fundamentals" },
      { id: "tx5", user: "Vikram Singh", amount: 199, date: "2024-03-06", resource: "Web Development Essentials" },
    ],
    monthlyData: [
      { month: "Jan", sales: 12500 },
      { month: "Feb", sales: 15800 },
      { month: "Mar", sales: 17300 },
    ],
    categoryData: [
      { category: "Computer Science", sales: 22500 },
      { category: "Electronics", sales: 12800 },
      { category: "Mechanical", sales: 10300 },
    ],
  })

  // Load saved settings on component mount
  useEffect(() => {
    const savedBankDetails = db.get("bankDetails")
    const savedUpiDetails = db.get("upiDetails")
    const savedPaymentSettings = db.get("paymentSettings")

    if (savedBankDetails) setBankDetails(savedBankDetails)
    if (savedUpiDetails) setUpiDetails(savedUpiDetails)
    if (savedPaymentSettings) setPaymentSettings(savedPaymentSettings)
  }, [])

  const handleSaveAndApply = async () => {
    setIsLoading(true)
    try {
      // In a real app, save to backend
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Save all settings at once
      db.set("bankDetails", bankDetails)
      db.set("upiDetails", upiDetails)
      db.set("paymentSettings", paymentSettings)

      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)

      toast({
        title: "Success",
        description: "Payment settings updated and applied successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate month-over-month growth
  const calculateGrowth = () => {
    const currentMonth = salesData.monthlyData[salesData.monthlyData.length - 1].sales
    const previousMonth = salesData.monthlyData[salesData.monthlyData.length - 2].sales
    const growth = ((currentMonth - previousMonth) / previousMonth) * 100
    return growth.toFixed(1)
  }

  const growth = calculateGrowth()
  const isPositiveGrowth = Number.parseFloat(growth) >= 0

  if (!isSuperAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Only super administrators can access payment settings.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure payment methods, bank accounts, and transaction settings</CardDescription>
            </div>
            <Button
              onClick={handleSaveAndApply}
              disabled={isLoading}
              className={isSaved ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : isSaved ? "Saved & Applied" : "Save & Apply"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="bank" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Bank Account
              </TabsTrigger>
              <TabsTrigger value="upi" className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                UPI
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart4 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Bank Account Tab */}
            <TabsContent value="bank" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Account Holder Name</Label>
                    <Input
                      id="accountName"
                      value={bankDetails.accountName}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ifscCode">IFSC Code</Label>
                    <Input
                      id="ifscCode"
                      value={bankDetails.ifscCode}
                      onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Input
                      id="branch"
                      value={bankDetails.branch}
                      onChange={(e) => setBankDetails({ ...bankDetails, branch: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* UPI Tab */}
            <TabsContent value="upi" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Enable UPI Payments</Label>
                    <p className="text-sm text-muted-foreground">Allow users to pay using UPI</p>
                  </div>
                  <Switch
                    checked={upiDetails.isEnabled}
                    onCheckedChange={(checked) => setUpiDetails({ ...upiDetails, isEnabled: checked })}
                  />
                </div>

                {upiDetails.isEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input
                        id="upiId"
                        value={upiDetails.upiId}
                        onChange={(e) => setUpiDetails({ ...upiDetails, upiId: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={upiDetails.displayName}
                        onChange={(e) => setUpiDetails({ ...upiDetails, displayName: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={paymentSettings.currency}
                      onValueChange={(value) => setPaymentSettings({ ...paymentSettings, currency: value })}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                    <Input
                      id="commissionRate"
                      type="number"
                      min="0"
                      max="100"
                      value={paymentSettings.commissionRate}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          commissionRate: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minPrice">Minimum Price (₹)</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      min="0"
                      value={paymentSettings.minPrice}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          minPrice: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxPrice">Maximum Price (₹)</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      min="0"
                      value={paymentSettings.maxPrice}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          maxPrice: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Allow Installments</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable payment in installments for expensive resources
                      </p>
                    </div>
                    <Switch
                      checked={paymentSettings.allowInstallments}
                      onCheckedChange={(checked) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          allowInstallments: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Allow Refunds</Label>
                      <p className="text-sm text-muted-foreground">Enable refunds for purchased resources</p>
                    </div>
                    <Switch
                      checked={paymentSettings.allowRefunds}
                      onCheckedChange={(checked) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          allowRefunds: checked,
                        })
                      }
                    />
                  </div>

                  {paymentSettings.allowRefunds && (
                    <div className="space-y-2">
                      <Label htmlFor="refundPeriodDays">Refund Period (days)</Label>
                      <Input
                        id="refundPeriodDays"
                        type="number"
                        min="1"
                        max="30"
                        value={paymentSettings.refundPeriodDays}
                        onChange={(e) =>
                          setPaymentSettings({
                            ...paymentSettings,
                            refundPeriodDays: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Sales</p>
                        <h3 className="text-2xl font-bold flex items-center">
                          <DollarSign className="h-5 w-5 text-green-500 mr-1" />₹{salesData.totalSales.toLocaleString()}
                        </h3>
                        <div
                          className={`flex items-center text-sm mt-1 ${isPositiveGrowth ? "text-green-500" : "text-red-500"}`}
                        >
                          {isPositiveGrowth ? (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          )}
                          {growth}% from last month
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Transactions</p>
                        <h3 className="text-2xl font-bold flex items-center">
                          <Wallet className="h-5 w-5 text-blue-500 mr-1" />
                          {salesData.totalTransactions}
                        </h3>
                        <div className="flex items-center text-sm mt-1 text-green-500">
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          12% from last month
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Average Order</p>
                        <h3 className="text-2xl font-bold flex items-center">
                          <IndianRupee className="h-5 w-5 text-amber-500 mr-1" />₹
                          {salesData.averageOrderValue.toFixed(2)}
                        </h3>
                        <div className="flex items-center text-sm mt-1 text-green-500">
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          5% from last month
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Trend */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Monthly Sales Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-60 flex items-end justify-between gap-2">
                    {salesData.monthlyData.map((item, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="bg-blue-500 w-16 rounded-t-md"
                          style={{
                            height: `${(item.sales / 20000) * 100}%`,
                            maxHeight: "80%",
                            minHeight: "10%",
                          }}
                        ></div>
                        <div className="mt-2 text-sm">{item.month}</div>
                        <div className="text-xs text-muted-foreground">₹{(item.sales / 1000).toFixed(1)}k</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Recent Transactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {salesData.recentTransactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">{tx.user}</p>
                            <p className="text-sm text-muted-foreground">{tx.resource}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{tx.amount}</p>
                            <p className="text-sm text-muted-foreground">{tx.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Top Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {salesData.categoryData.map((cat, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">{cat.category}</span>
                            <span className="text-sm font-medium">₹{(cat.sales / 1000).toFixed(1)}k</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(cat.sales / 25000) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <Button variant="outline">Download Full Report</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
