import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import CalendarModal from "./CalendarModal";
import { 
  PriorityEnum, 
  createCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent,
  getAllCalendarEvents,
  CreateCalendarEventRequest,
  CalendarEventResponse
} from "../../services/calendarService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CalendarEvent extends EventInput {
  extendedProps: {
    priority: PriorityEnum;
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventPriority, setEventPriority] = useState<PriorityEnum>(PriorityEnum.MEDIUM);
  const calendarRef = useRef<FullCalendar>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch events with useQuery
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["calendarEvents"],
    queryFn: async () => {
      const toastId = toast.loading("Đang tải sự kiện...");
      try {
        const apiEvents = await getAllCalendarEvents();
        toast.success("Tải sự kiện thành công!", { id: toastId });
        return apiEvents.map(event => {
          const startDate = new Date(event.startTime);
          const endDate = new Date(event.endTime);
          const allDay = !isSameDay(startDate, endDate);
          return {
            id: event.id?.toString(),
            title: event.title,
            start: event.startTime,
            end: event.endTime,
            allDay: allDay,
            extendedProps: { priority: event.priority }
          };
        });
      } catch (error) {
        toast.error("Tải sự kiện thất bại!", { id: toastId });
        return [];
      }
    }
  });

  // Add event mutation
  const addEventMutation = useMutation({
    mutationFn: async (eventData: CreateCalendarEventRequest) => {
      const toastId = toast.loading("Đang thêm sự kiện...");
      try {
        const newEvent = await createCalendarEvent(eventData);
        toast.success("Thêm sự kiện thành công!", { id: toastId });
        return newEvent;
      } catch (error) {
        toast.error("Thêm sự kiện thất bại!", { id: toastId });
        throw error;
      }
    },
    onSuccess: (newEvent) => {
      queryClient.setQueryData(["calendarEvents"], (old: any = []) => [
        ...old,
        {
          id: newEvent.id?.toString(),
          title: newEvent.title,
          start: newEvent.startTime,
          end: newEvent.endTime,
          allDay: !isSameDay(new Date(newEvent.startTime), new Date(newEvent.endTime)),
          extendedProps: { priority: newEvent.priority }
        }
      ]);
    }
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateCalendarEventRequest }) => {
      const toastId = toast.loading("Đang cập nhật sự kiện...");
      try {
        const updatedEvent = await updateCalendarEvent(id, data);
        toast.success("Cập nhật sự kiện thành công!", { id: toastId });
        return updatedEvent;
      } catch (error) {
        toast.error("Cập nhật sự kiện thất bại!", { id: toastId });
        throw error;
      }
    },
    onSuccess: (updatedEvent) => {
      queryClient.setQueryData(["calendarEvents"], (old: any = []) =>
        old.map((event: any) =>
          event.id === updatedEvent.id?.toString()
            ? {
                ...event,
                title: updatedEvent.title,
                start: updatedEvent.startTime,
                end: updatedEvent.endTime,
                allDay: !isSameDay(new Date(updatedEvent.startTime), new Date(updatedEvent.endTime)),
                extendedProps: { priority: updatedEvent.priority }
              }
            : event
        )
      );
    }
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      const toastId = toast.loading("Đang xóa sự kiện...");
      try {
        await deleteCalendarEvent(id);
        toast.success("Xóa sự kiện thành công!", { id: toastId });
      } catch (error) {
        toast.error("Xóa sự kiện thất bại!", { id: toastId });
        throw error;
      }
    },
    onSuccess: (_data, id) => {
      queryClient.setQueryData(["calendarEvents"], (old: any = []) =>
        old.filter((event: any) => event.id !== id.toString())
      );
    }
  });

  useEffect(() => {
    document.title = "Calendar";
  }, []);

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    const endDate = selectInfo.endStr || new Date(new Date(selectInfo.startStr).getTime() + 60 * 60 * 1000).toISOString();
    setEventEndDate(endDate);
    setModalOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    setEventStartDate(event.start?.toISOString() || "");
    const endDate = event.end?.toISOString() || new Date(new Date(event.start?.toISOString() || "").getTime() + 60 * 60 * 1000).toISOString();
    setEventEndDate(endDate);
    setEventPriority(event.extendedProps.priority as PriorityEnum);
    setModalOpen(true);
  };

  const handleAddOrUpdateEvent = async (eventData: {
    title: string;
    start: string;
    end: string;
    priority: PriorityEnum;
  }) => {
    const startDate = new Date(eventData.start);
    const endDate = new Date(eventData.end);

    if (endDate < startDate) {
      toast.error("End time must be equal to or after start time");
      return;
    }

    const endTime = eventData.end || new Date(new Date(eventData.start).getTime() + 60 * 60 * 1000).toISOString();
    const allDay = !isSameDay(startDate, endDate);

    const apiEventData: CreateCalendarEventRequest = {
      title: eventData.title,
      startTime: eventData.start,
      endTime: endTime,
      priority: eventData.priority,
      allDay: allDay,
    };

    if (selectedEvent && selectedEvent.id) {
      await updateEventMutation.mutateAsync({ id: parseInt(selectedEvent.id), data: apiEventData });
    } else {
      await addEventMutation.mutateAsync(apiEventData);
    }
    setModalOpen(false);
    resetModalFields();
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id) return;
    await deleteEventMutation.mutateAsync(parseInt(selectedEvent.id));
    setModalOpen(false);
    resetModalFields();
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventPriority(PriorityEnum.MEDIUM);
    setSelectedEvent(null);
  };

  return (
    <>
      <main className="relative">
        <div className="p-4 mx-auto max-w-7xl md:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white/90">Calendar</h2>
            <nav>
              <ol className="flex items-center gap-1.5">
                <li>
                  <a className="inline-flex items-center gap-1.5 text-[0.875rem] text-gray-400" href="/admin">
                    Home
                    <svg className="stroke-current" width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366" stroke="" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </a>
                </li>
                <li className="text-[0.875rem] text-white/90">
                  Calendar
                </li>
              </ol>
            </nav>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-white/[0.03]">
            <div className="custom-calendar">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next addEventButton",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                events={events}
                selectable={true}
                select={handleDateSelect}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
                customButtons={{
                  addEventButton: {
                    text: "Add Event +",
                    click: () => {
                      resetModalFields();
                      setModalOpen(true);
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <CalendarModal
          title={selectedEvent ? "Edit Event" : "Add Event"}
          eventTitle={eventTitle}
          eventStartDate={eventStartDate}
          eventEndDate={eventEndDate}
          eventPriority={eventPriority}
          onClose={() => setModalOpen(false)}
          onSubmit={handleAddOrUpdateEvent}
          onDelete={selectedEvent ? handleDeleteEvent : undefined}
          onChange={(field, value) => {
            if (field === "title") setEventTitle(value);
            if (field === "startDate") setEventStartDate(value);
            if (field === "endDate") setEventEndDate(value);
            if (field === "priority") setEventPriority(value as PriorityEnum);
          }}
        />
      )}
    </>
  );
};

const renderEventContent = (eventInfo: any) => {
  const priorityColors = {
    [PriorityEnum.LOW]: "bg-blue-500",
    [PriorityEnum.MEDIUM]: "bg-green-500",
    [PriorityEnum.HIGH]: "bg-yellow-500",
    [PriorityEnum.CRITICAL]: "bg-red-500",
  };

  const colorClass = priorityColors[eventInfo.event.extendedProps.priority as PriorityEnum] || "bg-gray-500";

  return (
    <div className={`${colorClass} flex fc-event-main p-1 rounded-sm text-white`}>
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;