import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { bookingsApi, patientsApi, servicesApi } from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface BookingModalProps {
  caregiver: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ caregiver, isOpen, onClose }: BookingModalProps) {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  
  const [patientId, setPatientId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      patientsApi.list().then(setPatients).catch(console.error);
      servicesApi.list().then(setServices).catch(console.error);
    }
  }, [isOpen]);

  // Set defaults
  useEffect(() => {
    if (patients.length > 0 && !patientId) setPatientId(patients[0]._id);
    if (services.length > 0 && !serviceId) setServiceId(services[0]._id);
  }, [patients, services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caregiver || !patientId || !serviceId || !date || !startTime || !endTime) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    try {
      await bookingsApi.create({
        caregiverId: caregiver._id,
        patientId,
        serviceId,
        bookingDate: date,
        startTime,
        endTime,
        bookingType: "Hourly",
        familyMemberId: user?._id
      });
      toast.success("Booking request sent successfully");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Book {caregiver?.userId?.name || caregiver?.name || "Caregiver"}</DialogTitle>
            <DialogDescription>
              Set up an appointment. We'll notify them to review your request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {patients.length !== 1 && (
              <div className="space-y-2">
                <Label>Select Patient</Label>
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(p => (
                      <SelectItem key={p._id} value={p._id}>{p.patientName}</SelectItem>
                    ))}
                    {patients.length === 0 && <SelectItem value="none" disabled>No patients found</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Service Required</Label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(s => (
                    <SelectItem key={s._id} value={s._id}>{s.serviceName} - ₹{s.price}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Booking
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
