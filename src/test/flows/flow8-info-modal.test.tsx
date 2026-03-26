import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { screen, waitFor,within } from "@testing-library/react";
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
      expect(screen.getByAltText("Logo")).toBeInTheDocument();
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
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByText("SNOW")).toBeInTheDocument();
    expect(within(dialog).getByText("ERP")).toBeInTheDocument();
    expect(within(dialog).getByText("אישור מסמכים")).toBeInTheDocument();
  });

  it("system names are bold", async () => {
    await openInfoModal();
    const dialog = screen.getByRole("dialog");

    const snowEl = within(dialog).getByText("SNOW", { selector: "span" });
    expect(snowEl).toHaveClass("font-bold");
  });

  it("does not display footer elements", async () => {
    await openInfoModal();
    expect(screen.queryByText("אם יש לכם שאלות או הצעות לשיפור נשמח לשמוע")).not.toBeInTheDocument();
    expect(screen.queryByText("שלחו משוב")).not.toBeInTheDocument();
    expect(screen.queryByText("סגירה")).not.toBeInTheDocument();
  });

  it("closes modal when X button is clicked", async () => {
    await openInfoModal();
    const dialog = screen.getByRole("dialog");
    const buttons = dialog.querySelectorAll("button");
    await userEvent.click(buttons[0]);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
