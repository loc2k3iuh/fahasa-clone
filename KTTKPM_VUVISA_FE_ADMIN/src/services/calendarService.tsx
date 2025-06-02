import API_BASE_URL from "../config/apiConfig";
import apiClient from "./apiClient";

export enum PriorityEnum {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface CalendarEventResponse {
  id?: number;
  title: string;
  description?: string;
  startTime: string; //  format "yyyy-MM-dd HH:mm:ss"
  endTime: string;   // format "yyyy-MM-dd HH:mm:ss"
  allDay?: boolean;
  priority: PriorityEnum;
  createdBy?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateCalendarEventRequest {
  title: string;
  description?: string;
  startTime: string; //  format "yyyy-MM-dd HH:mm:ss"
  endTime: string;   //  format "yyyy-MM-dd HH:mm:ss"
  allDay?: boolean;
  priority: PriorityEnum;
}

// function format (yyyy-MM-dd HH:mm:ss)
const formatDate = (date: string): string => {
  const dateObj = new Date(date);
  const pad = (num: number) => num.toString().padStart(2, '0');
  // getMonth() + 1 => 0-11
  return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())} ` +
         `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`;
};

//  Tạo sự kiện mới
export const createCalendarEvent = async (eventData: CreateCalendarEventRequest): Promise<CalendarEventResponse> => {
  try {
    const formattedEventData = {
      ...eventData,
      startTime: formatDate(eventData.startTime),
      endTime: formatDate(eventData.endTime),
    };

    const response = await apiClient.post(`${API_BASE_URL}/calendar-events`, formattedEventData);
    return response.data.result;
  } catch (error) {
    console.error("Error creating calendar event:", error);
    throw new Error("Failed to create calendar event");
  }
};

// Cập nhật sự kiện theo ID
export const updateCalendarEvent = async (id: number, eventData: CreateCalendarEventRequest): Promise<CalendarEventResponse> => {
  try {
    const formattedEventData = {
      ...eventData,
      startTime: formatDate(eventData.startTime),
      endTime: formatDate(eventData.endTime),
    };

    const response = await apiClient.put(`${API_BASE_URL}/calendar-events/${id}`, formattedEventData);
    return response.data.result;
  } catch (error) {
    console.error(`Error updating calendar event with ID ${id}:`, error);
    throw new Error("Failed to update calendar event");
  }
};

export const deleteCalendarEvent = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${API_BASE_URL}/calendar-events/${id}`);
  } catch (error) {
    console.error(`Error deleting calendar event with ID ${id}:`, error);
    throw new Error("Failed to delete calendar event");
  }
};

// 
export const getCalendarEventById = async (id: number): Promise<CalendarEventResponse> => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/calendar-events/${id}`);
    return response.data.result;
  } catch (error) {
    console.error(`Error fetching calendar event with ID ${id}:`, error);
    throw new Error("Failed to fetch calendar event");
  }
};


export const getAllCalendarEvents = async (): Promise<CalendarEventResponse[]> => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/calendar-events`);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching all calendar events:", error);
    throw new Error("Failed to fetch calendar events");
  }
};