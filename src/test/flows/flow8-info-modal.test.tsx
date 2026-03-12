import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "@/test/renderApp";
import { clearAllStorage } from "@/test/helpers/storage";
import Index from "@/pages/Index";

describe("Flow 8 — Info modal", () => {
  beforeEach(() => clearAllStorage());
  afterEach(() => clearAllStorage());

  async function openInfoModal() {
    renderApp(<Index />);
    await waitFor(() => {
      expect(screen.getByText("YANIV")).toBeInTheDocument();
    });
    const infoButton = screen.getByRole("button", { name: "הסבר על המערכת" });
    await userEvent.click(infoButton);
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  }

  it("opens info modal when info button is clicked", async () => {
    await openInfoModal();
    // Dialog title
    expect(screen.getByRole("heading", { name: "הסבר על המערכת" })).toBeInTheDocument();
  });

  it("displays correct body text content", async () => {
    await openInfoModal();
    expect(screen.getByText("ברוכים הבאים למרכז המשימות וההתראות!")).toBeInTheDocument();
    expect(screen.getByText(/המערכת מרכזת עבורכם את כל המשימות והאישורים/)).toBeInTheDocument();
  });

  it("displays all three system names in the list", async () => {
    await openInfoModal();
    expect(screen.getByText("SNOW")).toBeInTheDocument();
    expect(screen.getByText("ERP")).toBeInTheDocument();
    expect(screen.getByText("אישור מסמכים")).toBeInTheDocument();
  });

  it("system names are bold", async () => {
    await openInfoModal();
    const snowEl = screen.getByText("SNOW");
    expect(snowEl.tagName).toBe("SPAN");
    expect(snowEl.classList.contains("font-bold")).toBe(true);
  });

  it("has dual buttons: שלחו משוב and סגירה", async () => {
    await openInfoModal();
    const dialog = screen.getByRole("dialog");
    expect(dialog.querySelector("button")?.textContent).toBeTruthy();
    // Find by text within dialog
    expect(screen.getByText("שלחו משוב")).toBeInTheDocument();
    expect(screen.getByText("סגירה")).toBeInTheDocument();
  });

  it("closes modal when סגירה button is clicked", async () => {
    await openInfoModal();
    await userEvent.click(screen.getByText("סגירה"));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("closes modal when X button is clicked", async () => {
    await openInfoModal();
    const dialog = screen.getByRole("dialog");
    // First button inside dialog content is the custom X close
    const buttons = dialog.querySelectorAll("button");
    await userEvent.click(buttons[0]);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("opens feedback modal when שלחו משוב is clicked", async () => {
    await openInfoModal();
    await userEvent.click(screen.getByText("שלחו משוב"));
    await waitFor(() => {
      expect(screen.getByText("נשמח לשמוע ממך")).toBeInTheDocument();
    });
  });

  it("only one dialog is open after switching to feedback", async () => {
    await openInfoModal();
    await userEvent.click(screen.getByText("שלחו משוב"));
    await waitFor(() => {
      expect(screen.getByText("נשמח לשמוע ממך")).toBeInTheDocument();
    });
    const dialogs = screen.getAllByRole("dialog");
    expect(dialogs).toHaveLength(1);
  });
});
