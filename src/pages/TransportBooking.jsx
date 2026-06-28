import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "@/api/apiClient";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plane, Train, Bus, Calendar as CalendarIcon, User, Mail, CreditCard, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function TransportBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transportType = searchParams.get("type") || "flight";
  const transportId = searchParams.get("id");
  
  const [user, setUser] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [selectedTransport, setSelectedTransport] = useState(null);

  const [formData, setFormData] = useState({
    travelDate: null,
    passengers: 1,
    passengerName: "",
    passengerEmail: "",
    passengerPhone: "",
    selectedClass: "economy",
    cardNumber: "",
    cardExpiry: "",
    cardCVV: "",
    cardName: ""
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await apiClient.auth.me();
        setUser(currentUser);
        setFormData(prev => ({
          ...prev,
          passengerName: currentUser.full_name,
          passengerEmail: currentUser.email
        }));
      } catch (error) {
        navigate(createPageUrl("Transport"));
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchTransportDetails = async () => {
      if (!transportId) return;
      
      try {
        // Fetch real-time transport details
        const flights = await apiClient.entities.Flight.find();
        const transport = flights.find(f => f.id === transportId);
        setSelectedTransport(transport);
      } catch (error) {
        console.error("Error fetching transport:", error);
      }
    };
    fetchTransportDetails();
  }, [transportId]);

  const calculateTotal = () => {
    if (!selectedTransport) return 0;
    const classData = selectedTransport.classes?.find(c => c.class === formData.selectedClass);
    const basePrice = classData?.price || 500;
    const total = basePrice * formData.passengers;
    const tax = total * 0.08;
    return total + tax;
  };

  const handleBooking = async () => {
    if (!formData.travelDate || !formData.passengerName || !formData.passengerEmail || !formData.cardNumber) {
      alert("Please fill in all required fields");
      return;
    }

    setProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const bookingRef = `${transportType === "flight" ? "FL" : transportType === "train" ? "TR" : "BS"}${Date.now().toString().slice(-8)}`;

      const booking = await apiClient.entities.Booking.create({
        booking_type: transportType,
        total_amount: calculateTotal(),
        payment_status: "paid",
        booking_status: "confirmed",
        guest_details: {
          name: formData.passengerName,
          email: formData.passengerEmail,
          phone: formData.passengerPhone
        },
        booking_reference: bookingRef,
        flight_details: transportType === "flight" ? {
          ...selectedTransport,
          travel_date: format(formData.travelDate, "yyyy-MM-dd"),
          passengers: formData.passengers,
          class: formData.selectedClass
        } : null,
        train_details: transportType === "train" ? {
          travel_date: format(formData.travelDate, "yyyy-MM-dd"),
          passengers: formData.passengers
        } : null,
        bus_details: transportType === "bus" ? {
          travel_date: format(formData.travelDate, "yyyy-MM-dd"),
          passengers: formData.passengers
        } : null
      });

      await apiClient.integrations.Core.SendEmail({
        to: formData.passengerEmail,
        subject: `${transportType.toUpperCase()} Booking Confirmation - ${bookingRef}`,
        body: `Dear ${formData.passengerName},\n\nYour ${transportType} booking has been confirmed!\n\nBooking Reference: ${bookingRef}\nTravel Date: ${format(formData.travelDate, "PPP")}\nPassengers: ${formData.passengers}\nTotal: $${calculateTotal().toFixed(2)}\n\nYour e-ticket is attached.\n\nThank you for choosing AI Power Tours!`
      });

      setBookingData(booking);
      setBookingComplete(true);
    } catch (error) {
      console.error("Booking error:", error);
      alert("Booking failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const getIcon = () => {
    if (transportType === "flight") return Plane;
    if (transportType === "train") return Train;
    return Bus;
  };

  const Icon = getIcon();

  if (bookingComplete && bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
            <p className="text-xl text-gray-600">Your {transportType} has been successfully booked</p>
          </motion.div>

          <Card className="shadow-2xl border-0">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Icon className="w-6 h-6" />
                E-Ticket & Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-600">Booking Reference</span>
                  <span className="text-xl font-bold text-blue-600">{bookingData.booking_reference}</span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Passenger Name</div>
                    <div className="font-semibold text-gray-900">{bookingData.guest_details.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Travel Date</div>
                    <div className="font-semibold text-gray-900">
                      {format(formData.travelDate, "PPP")}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Passengers</div>
                    <div className="font-semibold text-gray-900">{formData.passengers}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Class</div>
                    <div className="font-semibold text-gray-900 capitalize">{formData.selectedClass}</div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Total Paid</span>
                  <span className="text-green-600">${bookingData.total_amount.toFixed(2)}</span>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-900">
                    📧 Your e-ticket has been sent to <strong>{bookingData.guest_details.email}</strong>
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button className="flex-1 bg-blue-600" onClick={() => navigate(createPageUrl("Dashboard"))}>
                  View My Bookings
                </Button>
                <Button variant="outline" className="flex-1">Download E-Ticket</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 mt-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Cancellation Policy</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Free cancellation up to 48 hours before departure</li>
                <li>✓ 50% refund if cancelled 24-48 hours before</li>
                <li>✓ No refund within 24 hours of departure</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Button variant="outline" onClick={() => navigate(createPageUrl("Transport"))} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Button>

        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Icon className="w-6 h-6" />
              Book Your {transportType.charAt(0).toUpperCase() + transportType.slice(1)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label>Travel Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {formData.travelDate ? format(formData.travelDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={formData.travelDate}
                    onSelect={(date) => setFormData({ ...formData, travelDate: date })}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Number of Passengers *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.passengers}
                  onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })}
                />
              </div>
              {transportType === "flight" && (
                <div className="space-y-2">
                  <Label>Class</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border"
                    value={formData.selectedClass}
                    onChange={(e) => setFormData({ ...formData, selectedClass: e.target.value })}
                  >
                    <option value="economy">Economy</option>
                    <option value="premium_economy">Premium Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First Class</option>
                  </select>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Passenger Information
              </h3>
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={formData.passengerName}
                  onChange={(e) => setFormData({ ...formData, passengerName: e.target.value })}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.passengerEmail}
                    onChange={(e) => setFormData({ ...formData, passengerEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.passengerPhone}
                    onChange={(e) => setFormData({ ...formData, passengerPhone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </h3>
              <div className="space-y-2">
                <Label>Cardholder Name *</Label>
                <Input
                  value={formData.cardName}
                  onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Card Number *</Label>
                <Input
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Expiry *</Label>
                  <Input
                    value={formData.cardExpiry}
                    onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                    placeholder="MM/YY"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CVV *</Label>
                  <Input
                    value={formData.cardCVV}
                    onChange={(e) => setFormData({ ...formData, cardCVV: e.target.value })}
                    placeholder="123"
                    type="password"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex justify-between items-center text-2xl font-bold mb-4">
                <span>Total Amount</span>
                <span className="text-blue-600">${calculateTotal().toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-600">Includes all taxes and fees</p>
            </div>

            <Button
              onClick={handleBooking}
              disabled={processing}
              className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Confirm & Pay ${calculateTotal().toFixed(2)}</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}