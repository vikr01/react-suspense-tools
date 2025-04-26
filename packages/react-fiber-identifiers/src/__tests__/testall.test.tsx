import createFiber from "./utils/createFiber";
import * as React from "react";
import { Suspense } from "react";
import isSuspense from "../isSuspense";

describe("react-fiber-identifiers", () => {
  describe("isSuspense", () => {
    it("returns true when it's a suspense fiber", () => {
      const fiber = createFiber(<Suspense />);

      expect(isSuspense(fiber)).toBe(true);
    });

    it("returns false when it's NOT a suspense fiber", () => {
      const fiber1 = createFiber(<React.Fragment />);

      expect(fiber1).toBeNull();

      expect(isSuspense(fiber1)).toBe(false);

      const ComponentUsingSuspense = (
        props: React.ComponentProps<typeof Suspense>,
      ) => <Suspense {...props} />;

      const fiber2 = createFiber(<ComponentUsingSuspense />);

      expect(isSuspense(fiber2)).toBe(false);
    });
  });
});
