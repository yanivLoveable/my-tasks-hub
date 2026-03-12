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
    // Click the info button (has tooltip "הסבר על המערכת")
    const infoButton = screen.getByRole("button", { name: /הסבר על המערכת/i });
    await userEvent.click(infoButton);
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  }

  it("opens info modal when info button is clicked", async () => {
    await openInfoModal();
    expect(screen.getByText("הסבר על המערכת")).toBeInTheDocument();
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
    expect(screen.getByRole("button", { name: "שלחו משוב" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "סגירה" })).toBeInTheDocument();
  });

  it("closes modal when סגירה button is clicked", async () => {
    await openInfoModal();
    await userEvent.click(screen.getByRole("button", { name: "סגירה" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("closes modal when X button is clicked", async () => {
    await openInfoModal();
    // The X close button is inside the dialog
    const dialog = screen.getByRole("dialog");
    const closeButtons = dialog.querySelectorAll("button");
    // First button in dialog is custom X close
    await userEvent.click(closeButtons[0]);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("opens feedback modal when שלחו משוב is clicked", async () => {
    await openInfoModal();
    await userEvent.click(screen.getByRole("button", { name: "שלחו משוב" }));
    await waitFor(() => {
      // Feedback modal should appear with its title
      expect(screen.getByText("נשמח לשמוע ממך")).toBeInTheDocument();
    });
  });

  it("closes info modal before opening feedback modal", async () => {
    await openInfoModal();
    await userEvent.click(screen.getByRole("button", { name: "שלחו משוב" }));
    await waitFor(() => {
      expect(screen.getByText("נשמח לשמוע ממך")).toBeInTheDocument();
    });
    // Info modal title should not be visible as a dialog title anymore
    // (it may still exist in DOM as the header button tooltip, so check dialog count)
    const dialogs = screen.getAllByRole("dialog");
    expect(dialogs).toHaveLength(1);
  });
});
