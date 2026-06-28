import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "@/api/apiClient";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CreditCard, Calendar as CalendarIcon, User, Mail, Phone, CheckCircle2, Loader2, Download, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function BookingConfirmationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get("hotelId");
  const [user, setUser] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  const [formData, setFormData] = useState({
    checkIn: null,
    checkOut: null,
    guests: 1,
    rooms: 1,
    roomType: "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    specialRequests: "",
    cardNumber: "",
    cardExpiry: "",
    cardCVV: "",
    cardName: ""
  });

  const { data: hotel } = useQuery({
    queryKey: ['hotel', hotelId],
    queryFn: async () => {
      const hotels = await apiClient.entities.Hotel.find();
      return hotels.find(h => h.id === hotelId);
    },
    enabled: !!hotelId,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await apiClient.auth.me();
        setUser(currentUser);
        setFormData(prev => ({
          ...prev,
          guestName: currentUser.full_name,
          guestEmail: currentUser.email
        }));
      } catch (error) {
        navigate(createPageUrl("Hotels"));
      }
    };
    fetchUser();
  }, []);

  const calculateTotal = () => {
    if (!hotel || !formData.checkIn || !formData.checkOut) return 0;
    const nights = Math.ceil((formData.checkOut - formData.checkIn) / (1000 * 60 * 60 * 24));
    const roomPrice = formData.roomType ? 
      hotel.room_types.find(r => r.type === formData.roomType)?.price || hotel.price_per_night 
      : hotel.price_per_night;
    const subtotal = nights * formData.rooms * roomPrice;
    const tax = subtotal * 0.12;
    return subtotal + tax;
  };

  const handleBooking = async () => {
    if (!formData.checkIn || !formData.checkOut || !formData.guestName || !formData.guestEmail || !formData.cardNumber) {
      alert("Please fill in all required fields");
      return;
    }

    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const bookingRef = `BK${Date.now().toString().slice(-8)}`;
      const nights = Math.ceil((formData.checkOut - formData.checkIn) / (1000 * 60 * 60 * 24));

      const booking = await apiClient.entities.Booking.create({
        booking_type: "hotel",
        hotel_id: hotelId,
        hotel_name: hotel.name,
        check_in: format(formData.checkIn, "yyyy-MM-dd"),
        check_out: format(formData.checkOut, "yyyy-MM-dd"),
        guests: formData.guests,
        rooms: formData.rooms,
        room_type: formData.roomType || "Standard",
        total_amount: calculateTotal(),
        payment_status: "paid",
        booking_status: "confirmed",
        guest_details: {
          name: formData.guestName,
          email: formData.guestEmail,
          phone: formData.guestPhone,
          special_requests: formData.specialRequests
        },
        booking_reference: bookingRef
      });

      // Send confirmation email
      await apiClient.integrations.Core.SendEmail({
        to: formData.guestEmail,
        subject: `Booking Confirmation - ${bookingRef}`,
        body: `Dear ${formData.guestName},\n\nYour booking at ${hotel.name} has been confirmed!\n\nBooking Reference: ${bookingRef}\nCheck-in: ${format(formData.checkIn, "PPP")}\nCheck-out: ${format(formData.checkOut, "PPP")}\nRooms: ${formData.rooms}\nGuests: ${formData.guests}\nTotal: $${calculateTotal().toFixed(2)}\n\nThank you for choosing AI Power Tours!`
      });

      setBookingData({ ...booking, nights });
      setBookingComplete(true);
    } catch (error) {
      console.error("Booking error:", error);
      alert("Booking failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

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
            <p className="text-xl text-gray-600">Your reservation has been successfully completed</p>
          </motion.div>

          <Card className="shadow-2xl border-0 mb-6">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <CardTitle className="text-2xl">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-600">Booking Reference</span>
                  <span className="text-xl font-bold text-blue-600">{bookingData.booking_reference}</span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Hotel</div>
                    <div className="font-semibold text-gray-900">{bookingData.hotel_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Guest Name</div>
                    <div className="font-semibold text-gray-900">{bookingData.guest_details.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Check-in</div>
                    <div className="font-semibold text-gray-900">{format(new Date(bookingData.check_in), "PPP")}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Check-out</div>
                    <div className="font-semibold text-gray-900">{format(new Date(bookingData.check_out), "PPP")}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Nights</div>
                    <div className="font-semibold text-gray-900">{bookingData.nights}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Rooms & Guests</div>
                    <div className="font-semibold text-gray-900">{bookingData.rooms} room(s), {bookingData.guests} guest(s)</div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Total Paid</span>
                  <span className="text-green-600">${bookingData.total_amount.toFixed(2)}</span>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-900">
                    📧 A confirmation email has been sent to <strong>{bookingData.guest_details.email}</strong>
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => navigate(createPageUrl("Dashboard"))}>
                  View My Bookings
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Cancellation Policy</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Free cancellation up to 24 hours before check-in</li>
                <li>✓ 50% refund if cancelled 24-48 hours before check-in</li>
                <li>✓ No refund if cancelled within 24 hours of check-in</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle className="text-2xl">Complete Your Booking</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Dates */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Check-in Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {formData.checkIn ? format(formData.checkIn, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Calendar
                          mode="single"
                          selected={formData.checkIn}
                          onSelect={(date) => setFormData({ ...formData, checkIn: date })}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Check-out Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {formData.checkOut ? format(formData.checkOut, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Calendar
                          mode="single"
                          selected={formData.checkOut}
                          onSelect={(date) => setFormData({ ...formData, checkOut: date })}
                          disabled={(date) => !formData.checkIn || date <= formData.checkIn}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Rooms & Guests */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Rooms</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.rooms}
                      onChange={(e) => setFormData({ ...formData, rooms: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Guests</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Room Type</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border"
                      value={formData.roomType}
                      onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                    >
                      <option value="">Standard</option>
                      {hotel.room_types?.map((room, idx) => (
                        <option key={idx} value={room.type}>{room.type} - ${room.price}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Separator />

                {/* Guest Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Guest Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input
                        value={formData.guestName}
                        onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={formData.guestEmail}
                        onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.guestPhone}
                      onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Special Requests</Label>
                    <Textarea
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                      placeholder="Any special requests or preferences..."
                    />
                  </div>
                </div>

                <Separator />

                {/* Payment Details */}
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
                      maxLength="19"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Expiry Date *</Label>
                      <Input
                        value={formData.cardExpiry}
                        onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CVV *</Label>
                      <Input
                        value={formData.cardCVV}
                        onChange={(e) => setFormData({ ...formData, cardCVV: e.target.value })}
                        placeholder="123"
                        maxLength="3"
                        type="password"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleBooking}
                  disabled={processing}
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>Confirm & Pay ${calculateTotal().toFixed(2)}</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="shadow-2xl border-0 sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200"}
                    alt={hotel.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">{hotel.name}</h3>
                    <p className="text-sm text-gray-600">{hotel.location}</p>
                  </div>
                </div>

                <Separator />

                {formData.checkIn && formData.checkOut && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Check-in</span>
                        <span className="font-medium">{format(formData.checkIn, "MMM dd")}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Check-out</span>
                        <span className="font-medium">{format(formData.checkOut, "MMM dd")}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Nights</span>
                        <span className="font-medium">
                          {Math.ceil((formData.checkOut - formData.checkIn) / (1000 * 60 * 60 * 24))}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Rooms</span>
                        <span className="font-medium">{formData.rooms}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Guests</span>
                        <span className="font-medium">{formData.guests}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Room charges</span>
                        <span className="font-medium">${(calculateTotal() / 1.12).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Taxes & fees</span>
                        <span className="font-medium">${(calculateTotal() * 0.12 / 1.12).toFixed(2)}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-blue-600">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </>
                )}

                <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800">
                  ✓ Free cancellation up to 24 hours before check-in
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}