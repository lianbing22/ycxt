import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import UploadPanel from "../src/components/UploadPanel";

const globalAny = global as typeof global & {
  fetch: jest.Mock;
  XMLHttpRequest: jest.Mock;
};

describe("UploadPanel", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    globalAny.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it("loads and displays upload history", async () => {
    globalAny.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: "1",
          filename: "existing.csv",
          status: "completed",
          record_count: 3,
          created_at: new Date("2023-01-01T00:00:00Z").toISOString(),
        },
      ],
    });

    render(<UploadPanel />);

    await waitFor(() => {
      expect(screen.getByText("existing.csv")).toBeInTheDocument();
    });
  });

  it("uploads a file and refreshes history", async () => {
    const fetchMock = globalAny.fetch;
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "u1",
            filename: "data.csv",
            status: "completed",
            record_count: 2,
            created_at: new Date("2023-01-01T00:00:00Z").toISOString(),
          },
        ],
      });

    const openSpy = jest.fn();
    const sendSpy = jest.fn(function (this: XMLHttpRequest) {
      this.status = 201;
      this.responseText = JSON.stringify({
        upload: {
          id: "u1",
          filename: "data.csv",
          status: "completed",
          record_count: 2,
          created_at: new Date("2023-01-01T00:00:00Z").toISOString(),
        },
        job: {
          id: "job-u1",
          status: "completed",
          record_count: 2,
        },
      });
      if (this.onload) {
        this.onload(new ProgressEvent("load"));
      }
    });

    class MockXHR {
      upload = {
        onprogress: null as ((event: ProgressEvent<EventTarget>) => void) | null,
      };
      status = 0;
      responseText = "";
      onload: ((event: ProgressEvent<EventTarget>) => void) | null = null;
      onerror: (() => void) | null = null;
      open = openSpy;
      send = sendSpy;
      setRequestHeader = jest.fn();
    }

    globalAny.XMLHttpRequest = jest.fn(() => new MockXHR());

    render(<UploadPanel />);

    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    const file = new File(["name,age\n1,2"], "data.csv", { type: "text/csv" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(sendSpy).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByText("data.csv")).toBeInTheDocument();
    });
  });
});
