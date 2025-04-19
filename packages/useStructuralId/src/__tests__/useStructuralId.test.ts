import { renderHook } from "@testing-library/react";
import useStructuralId from "../useStructuralId";

describe('useStructuralId', () => {
    it('should return a structural id', () => {
        const {result} = renderHook(() => useStructuralId(() => true, []));
        expect(result.current[0]).toBeDefined();
    });
});
