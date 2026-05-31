import {
  AlertCircle,
  Bell,
  Clock,
  Info,
  UserCheck,
  UserMinus,
  UserX,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface Notification {
  title: string;
  message: string;
  isError: boolean;
}

const DocStatus = () => {
  // Status options
  const STATUS = {
    AVAILABLE: "available",
    OFF_DUTY: "off-duty",
    DND: "do-not-disturb",
  };

  // State
  const [currentStatus, setCurrentStatus] = useState(STATUS.AVAILABLE);
  const [isDuringWorkHours, setIsDuringWorkHours] = useState(true);
  const [hasUrgentCases, setHasUrgentCases] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  // Simulated work hours (in a real app, this would come from an API or settings)
  const workHours = {
    start: "09:00",
    end: "17:00",
  };

  // Custom notification function (replacement for useToast)
  const showNotification = useCallback(
    (title: string, message: string, isError = false) => {
      setNotification({ title, message, isError });

      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    },
    [],
  );

  // For demo purposes, let's simulate checking if current time is within work hours
  useEffect(() => {
    // In a real app, this would be more robust and use actual schedule data
    const checkWorkHours = () => {
      const now = new Date();
      const currentHour = now.getHours();

      // Simple check if current hour is between 9 AM and 5 PM
      const isWorkHours = currentHour >= 9 && currentHour < 17;

      // If work hours changed from off to on, set status to available
      if (isWorkHours && !isDuringWorkHours) {
        setCurrentStatus(STATUS.AVAILABLE);
        showNotification(
          "Work hours started",
          "Your status has been set to Available.",
        );
      }

      setIsDuringWorkHours(isWorkHours);
    };

    // Check work hours initially and every minute
    checkWorkHours();
    const interval = setInterval(checkWorkHours, 60000);

    return () => clearInterval(interval);
  }, [isDuringWorkHours, STATUS.AVAILABLE, showNotification]);

  // Toggle urgent cases simulation for demo
  const toggleUrgentCases = () => {
    setHasUrgentCases(!hasUrgentCases);
  };

  // Status change handler
  const changeStatus = (newStatus: string) => {
    // Business logic for status changes
    if (isDuringWorkHours && newStatus !== STATUS.AVAILABLE) {
      showNotification(
        "Cannot change status during work hours",
        "You must remain Available during scheduled work hours.",
        true,
      );
      return;
    }

    // Set the new status
    setCurrentStatus(newStatus);

    // Show notification of status change
    showNotification(
      "Status Updated",
      `Your status is now ${newStatus.replace(/-/g, " ")}`,
    );
  };

  // Status card design and content
  const getStatusCard = (status: string) => {
    const isActive = currentStatus === status;
    let icon: React.ReactNode,
      title: string,
      description: string,
      bgColor: string,
      textColor: string;

    switch (status) {
      case STATUS.AVAILABLE:
        icon = <UserCheck size={24} />;
        title = "Available";
        description = "You are available for appointments and consultations";
        bgColor = isActive ? "bg-green-100" : "";
        textColor = isActive ? "text-green-800" : "";
        break;
      case STATUS.OFF_DUTY:
        icon = <UserMinus size={24} />;
        title = "Off Duty";
        description =
          "You are not seeing regular patients but may receive urgent cases";
        bgColor = isActive ? "bg-amber-100" : "";
        textColor = isActive ? "text-amber-800" : "";
        break;
      case STATUS.DND:
        icon = <UserX size={24} />;
        title = "Do Not Disturb";
        description = "You are completely unavailable for any appointments";
        bgColor = isActive ? "bg-red-100" : "";
        textColor = isActive ? "text-red-800" : "";
        break;
      default:
        return null;
    }

    return (
      <Card className={`${isActive ? "border-2 border-blue-500" : ""} h-full`}>
        <CardHeader className={`flex flex-row items-center gap-2 ${bgColor}`}>
          <div className={textColor}>{icon}</div>
          <div>
            <h3 className={`font-bold ${textColor}`}>{title}</h3>
            <p className="text-sm mt-1 text-gray-500">{description}</p>
          </div>
        </CardHeader>
        <CardFooter className="pt-4">
          <Button
            variant={isActive ? "secondary" : "outline"}
            className="w-full"
            onClick={() => changeStatus(status)}
            disabled={isDuringWorkHours && status !== STATUS.AVAILABLE}
          >
            {isActive ? "Current Status" : `Set to ${title}`}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Simple notification system */}
      {notification && (
        <div
          className={`p-4 rounded-lg ${notification.isError ? "bg-red-100 border-red-200" : "bg-blue-100 border-blue-200"} border`}
        >
          <div className="flex items-center gap-2">
            {notification.isError ? (
              <AlertCircle className="text-red-600" size={20} />
            ) : (
              <Bell className="text-blue-600" size={20} />
            )}
            <h4 className="font-medium">{notification.title}</h4>
          </div>
          <p className="mt-1 text-sm">{notification.message}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-medium">Current Status</h3>
          <p className="text-gray-500">
            Manage your availability for appointments
          </p>
        </div>
        <Badge
          variant="outline"
          className={`${
            currentStatus === STATUS.AVAILABLE
              ? "bg-green-100 text-green-800"
              : currentStatus === STATUS.OFF_DUTY
                ? "bg-amber-100 text-amber-800"
                : "bg-red-100 text-red-800"
          } px-3 py-1 text-sm`}
        >
          {currentStatus === STATUS.AVAILABLE
            ? "Available"
            : currentStatus === STATUS.OFF_DUTY
              ? "Off Duty"
              : "Do Not Disturb"}
        </Badge>
      </div>

      {/* Status information */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-blue-600" />
          <div>
            <p className="font-medium">Work Hours</p>
            <p className="text-sm text-gray-500">
              {workHours.start} - {workHours.end}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isDuringWorkHours ? "default" : "outline"}
            className="whitespace-nowrap"
          >
            {isDuringWorkHours ? "In Work Hours" : "Outside Work Hours"}
          </Badge>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {getStatusCard(STATUS.AVAILABLE)}
        {getStatusCard(STATUS.OFF_DUTY)}
        {getStatusCard(STATUS.DND)}
      </div>

      {/* Emergency cases simulation */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info size={18} />
            <h3 className="font-bold">Emergency Cases Simulation</h3>
          </div>
          <p className="text-sm text-gray-500">
            For demonstration purposes only. In a real application, this would
            be managed automatically.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Urgent Cases Available</p>
              <p className="text-sm text-gray-500">
                {hasUrgentCases
                  ? "There are urgent cases requiring attention"
                  : "No urgent cases at the moment"}
              </p>
            </div>
            {/* Custom toggle button instead of Switch */}
            <Button
              variant={hasUrgentCases ? "destructive" : "outline"}
              onClick={toggleUrgentCases}
              className="min-w-25"
            >
              {hasUrgentCases ? "Active" : "Inactive"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alert for urgent cases */}
      {hasUrgentCases && currentStatus !== STATUS.DND && (
        <div className="p-4 bg-red-100 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600" />
            <h4 className="font-medium">Urgent Cases Require Attention</h4>
          </div>
          <p className="mt-2 text-sm">
            There are urgent cases that require your attention. Please check the
            appointments tab.
            {currentStatus === STATUS.OFF_DUTY &&
              " You will receive these notifications because you are Off Duty but not in Do Not Disturb mode."}
          </p>
        </div>
      )}
    </div>
  );
};

export default DocStatus;
