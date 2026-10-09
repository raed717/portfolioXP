import { describe, expect, it } from "vitest";
import { DEMOS, demoFor, isAllowed, isVideoUrl } from "./browser";
import { projects } from "@/data";

describe("Web Voyager browser library", () => {
  it("includes projects with liveUrl or videoUrl in DEMOS", () => {
    const smartown = projects.find((p) => p.title.includes("SmarTown"));
    expect(smartown).toBeDefined();
    expect(smartown?.liveUrl).toBe("https://smartown.net/");
    expect(smartown?.videoUrl).toBe(
      "https://res.cloudinary.com/dfytfu2jq/video/upload/v1791537471/smartown-tour_xcddi6.mp4",
    );

    const smartownDemo = DEMOS.find((d) => d.slug === smartown?.slug);
    expect(smartownDemo).toBeDefined();
    expect(smartownDemo?.liveUrl).toBe(smartown?.liveUrl);
    expect(smartownDemo?.videoUrl).toBe(smartown?.videoUrl);
  });

  it("finds the demo by either liveUrl or videoUrl with demoFor", () => {
    const smartown = projects.find((p) => p.title.includes("SmarTown"));
    expect(smartown).toBeDefined();

    const byLive = demoFor(smartown!.liveUrl!);
    expect(byLive).toBeDefined();
    expect(byLive?.slug).toBe(smartown?.slug);

    const byVideo = demoFor(smartown!.videoUrl!);
    expect(byVideo).toBeDefined();
    expect(byVideo?.slug).toBe(smartown?.slug);
  });

  it("allows both liveUrl and videoUrl in isAllowed", () => {
    const smartown = projects.find((p) => p.title.includes("SmarTown"));
    expect(isAllowed(smartown!.liveUrl!)).toBe(true);
    expect(isAllowed(smartown!.videoUrl!)).toBe(true);
    expect(isAllowed("https://not-allowed-site.com")).toBe(false);
  });

  it("correctly identifies video urls with isVideoUrl", () => {
    expect(isVideoUrl("https://example.com/video.mp4")).toBe(true);
    expect(isVideoUrl("https://example.com/video.webm")).toBe(true);
    expect(
      isVideoUrl("https://res.cloudinary.com/dfytfu2jq/video/upload/v1791537471/smartown-tour.mp4"),
    ).toBe(true);
    expect(isVideoUrl("https://smartown.net/")).toBe(false);
  });
});
