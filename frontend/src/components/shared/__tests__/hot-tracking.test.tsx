// @ts-nocheck


import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { useLocalStorage } from "@/hooks/use-storage";
import { HotTracking } from "../hot-tracking";

vi.mock("@/hooks/use-storage", () => ({
    useLocalStorage: vi.fn(),
}));


describe("HotTracking Component", () => {
    let setValueMock: vi.Mock;
    let getValueMock: vi.Mock;

    beforeEach(() => {
        setValueMock = vi.fn();
        getValueMock = vi.fn();

        (useLocalStorage as vi.Mock).mockReturnValue({
            setValue: setValueMock,
            getValue: getValueMock,
        });
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it("renders the consent banner when there is no stored consent", () => {
        getValueMock.mockReturnValue(undefined);

        render(<HotTracking showTracking={true} />);

        expect(
            screen.getByText("About the information we collect")
        ).toBeInTheDocument();
    });

    it("does not render the banner if consent is already given", () => {
        getValueMock.mockReturnValue("true");

        render(<HotTracking showTracking={true} />);

        expect(
            screen.queryByText("About the information we collect")
        ).not.toBeInTheDocument();
    });

    it("renders the banner but moves it below the viewport when showTracking is false", () => {
        getValueMock.mockReturnValue(undefined);
        render(<HotTracking showTracking={false} />);
        // Grab the parent div of the banner
        const banner = screen.queryByText("About the information we collect")?.parentNode?.parentNode?.parentNode;
        expect(banner).toHaveClass("translate-y-full");
    });

    it("renders the banner and keeps it visible when showTracking is true", () => {
        getValueMock.mockReturnValue(undefined);
        render(<HotTracking showTracking={true} />);
        // Grab the parent div of the banner
        const banner = screen.queryByText("About the information we collect")?.parentNode?.parentNode?.parentNode;
        expect(banner).toHaveClass("translate-y-0");
    });

    it("clicking 'I Agree' inject Matomo script, sets consent and hides banner", () => {
        getValueMock.mockReturnValue(undefined);
        render(<HotTracking showTracking={true} />);
        const agreeButton = screen.getByText("I Agree");
        fireEvent.click(agreeButton);
        expect(setValueMock).toHaveBeenCalledWith(expect.any(String), "true");
        expect(screen.queryByText("About the information we collect")).not.toBeInTheDocument();
    });

    it("clicking 'I Do Not Agree' injects Matomo script, sets consent to false and hides banner", () => {
        getValueMock.mockReturnValue(undefined);
        render(<HotTracking showTracking={true} />);
        const disagreeButton = screen.getByText("I Do Not Agree");
        fireEvent.click(disagreeButton);
        expect(setValueMock).toHaveBeenCalledWith(expect.any(String), "false");
        expect(screen.queryByText("About the information we collect")).not.toBeInTheDocument();
    });
});
