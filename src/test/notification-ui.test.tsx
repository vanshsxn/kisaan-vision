import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Uploads from "@/pages/Uploads";

const mockNotifications = [
  {
    id: "notif-1",
    timestamp: Date.now(),
    plantName: "Apple leaf",
    disease: "Apple scab",
    isHealthy: false,
    read: false,
    scanId: "scan-1",
  },
  {
    id: "notif-2",
    timestamp: Date.now() - 1000,
    plantName: "Healthy corn",
    disease: "",
    isHealthy: true,
    read: false,
    scanId: "scan-2",
  },
];

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(async () => ({ data: { session: null } })),
      signOut: vi.fn(),
    },
  },
}));

const fetchNotificationsMock = vi.fn();
const markAllNotificationsReadMock = vi.fn(async () => undefined);
const markNotificationReadMock = vi.fn(async () => undefined);
const clearAllNotificationsMock = vi.fn(async () => undefined);

vi.mock("@/lib/notifications", () => ({
  fetchNotifications: (...args: unknown[]) => fetchNotificationsMock(...args),
  markAllNotificationsRead: (...args: unknown[]) => markAllNotificationsReadMock(...args),
  markNotificationRead: (...args: unknown[]) => markNotificationReadMock(...args),
  clearAllNotifications: (...args: unknown[]) => clearAllNotificationsMock(...args),
}));

describe("notification UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchNotificationsMock.mockResolvedValue(mockNotifications);
    localStorage.clear();
  });

  it("updates the unread badge instantly when marking all as read", async () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId("notification-unread-badge")).toHaveTextContent("2"));

    fireEvent.click(screen.getByLabelText("Notifications"));
    fireEvent.click(await screen.findByTestId("mark-all-read-button"));

    await waitFor(() => {
      expect(screen.queryByTestId("notification-unread-badge")).not.toBeInTheDocument();
    });
    expect(markAllNotificationsReadMock).toHaveBeenCalledTimes(1);
  });

  it("opens the exact scan detail and highlights the predicted plant name from a deep-link after refresh", async () => {
    localStorage.setItem(
      "kv_diagnosis_history_v1",
      JSON.stringify([
        {
          id: "scan-1",
          timestamp: Date.now(),
          plantName: "Apple leaf",
          disease: "Apple scab",
          isHealthy: false,
          thumbnail: "data:image/png;base64,test",
          imageDataUrl: "data:image/png;base64,test",
          diagnosis: {
            plantName: "Apple leaf",
            scientificName: "Malus domestica",
            disease: "Apple scab",
            diseaseScientific: "Venturia inaequalis",
            confidence: 92,
            severity: "Moderate",
            isHealthy: false,
            healthScore: 46,
            affectedArea: 28,
            spreadRisk: "Medium",
            symptoms: ["Spots"],
            treatment: ["Spray"],
            prevention: ["Prune"],
            visualCues: [],
          },
        },
      ])
    );

    render(
      <MemoryRouter initialEntries={["/uploads?scan=scan-1&highlight=Apple%20leaf"]}>
        <Routes>
          <Route path="/uploads" element={<Uploads />} />
        </Routes>
      </MemoryRouter>
    );

    const title = await screen.findByTestId("scan-result-plant-name");
    expect(title).toHaveTextContent("Apple leaf");
    expect(screen.getByText("Apple scab")).toBeInTheDocument();
  });
});