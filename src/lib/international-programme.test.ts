import { describe, expect, it } from "vitest";
import { countryCurrencies, displayFee, feeSchema, internationalServices, indiaRegistrationOptions } from "./international-programme";

describe("International programme rules", () => {
  it("offers India registration at 2999 for up to two persons with 18 percent GST", () => {
    expect(indiaRegistrationOptions[0]).toEqual({ amount: 2999, maxPersons: 2, gstPercent: 18 });
  });
  it("offers India registration at 1499 for up to one person with 18 percent GST", () => {
    expect(indiaRegistrationOptions[1]).toEqual({ amount: 1499, maxPersons: 1, gstPercent: 18 });
  });
  it("offers exactly the four overseas services", () => {
    expect(internationalServices.map(s => s.title)).toEqual(["Research & Strategy", "Business Fundings & Grants", "Manpower Services", "Mentorship"]);
  });
  it("shows the requested USA USD 169 fee without conversion", () => {
    expect(displayFee(feeSchema.parse({ country: "usa", currency: "USD", amount: 169 }))).toBe("USD 169");
  });
  it("does not invent fees for unspecified countries", () => {
    for (const country of ["uk", "uae", "canada", "singapore", "europe", "australia"] as const) {
      expect(feeSchema.parse({ country, currency: countryCurrencies[country], amount: null }).amount).toBeNull();
    }
  });
  it("requires the country's own currency and a positive amount", () => {
    expect(feeSchema.safeParse({ country: "usa", currency: "INR", amount: 169 }).success).toBe(false);
    expect(feeSchema.safeParse({ country: "usa", currency: "USD", amount: 0 }).success).toBe(false);
  });
});