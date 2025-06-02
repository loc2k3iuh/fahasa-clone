import { PriorityEnum } from "../../services/calendarService"; // Điều chỉnh đường dẫn phù hợp
import { useState } from "react";

interface CalendarModalProps {
  title: string;
  eventTitle: string;
  eventStartDate: string;
  eventEndDate: string;
  eventPriority: PriorityEnum;
  onClose: () => void;
  onSubmit: (eventData: {
    title: string;
    start: string;
    end: string;
    priority: PriorityEnum;
  }) => void;
  onDelete?: () => void;
  onChange: (field: string, value: string) => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({
  title,
  eventTitle,
  eventStartDate,
  eventEndDate,
  eventPriority,
  onClose,
  onSubmit,
  onDelete,
  onChange,
}) => {
  const [errors, setErrors] = useState<{
    title?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  // Format date for datetime-local input
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Adjust for timezone offset
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  // Convert local datetime to UTC
  const convertToUTC = (localDateTime: string): string => {
    const date = new Date(localDateTime);
    return date.toISOString();
  };

  const validateForm = (): boolean => {
    const newErrors: {
      title?: string;
      startDate?: string;
      endDate?: string;
    } = {};

    if (!eventTitle.trim()) {
      newErrors.title = "Title is required";
    }

    if (!eventStartDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!eventEndDate) {
      newErrors.endDate = "End date is required";
    } else {
      const startDate = new Date(eventStartDate);
      const endDate = new Date(eventEndDate);
      
      if (endDate < startDate) {
        newErrors.endDate = "End date must be equal to or after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        title: eventTitle,
        start: convertToUTC(eventStartDate),
        end: convertToUTC(eventEndDate),
        priority: eventPriority,
      });
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 z-10">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Event Title</label>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => onChange("title", e.target.value)}
              className={`w-full px-4 py-2 text-sm text-gray-300 bg-gray-700 border ${
                errors.title ? "border-red-500" : "border-gray-600"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Start Date</label>
            <input
              type="datetime-local"
              value={formatDateForInput(eventStartDate)}
              onChange={(e) => onChange("startDate", e.target.value)}
              className={`w-full px-4 py-2 text-sm text-gray-300 bg-gray-700 border ${
                errors.startDate ? "border-red-500" : "border-gray-600"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">End Date</label>
            <input
              type="datetime-local"
              value={formatDateForInput(eventEndDate)}
              onChange={(e) => onChange("endDate", e.target.value)}
              className={`w-full px-4 py-2 text-sm text-gray-300 bg-gray-700 border ${
                errors.endDate ? "border-red-500" : "border-gray-600"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Priority</label>
            <div className="flex flex-wrap items-center gap-4">
              {Object.values(PriorityEnum).map((priority) => (
                <div key={priority} className="flex items-center">
                  <input
                    type="radio"
                    id={`priority-${priority}`}
                    name="eventPriority"
                    value={priority}
                    checked={eventPriority === priority}
                    onChange={() => onChange("priority", priority)}
                    className="sr-only"
                  />
                  <label
                    htmlFor={`priority-${priority}`}
                    className={`flex items-center text-sm text-gray-400 cursor-pointer ${
                      eventPriority === priority ? "text-blue-500" : ""
                    }`}
                  >
                    <span className="w-5 h-5 mr-2 border border-gray-600 rounded-full flex items-center justify-center">
                      {eventPriority === priority && (
                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                      )}
                    </span>
                    {priority}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-500"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendarModal;