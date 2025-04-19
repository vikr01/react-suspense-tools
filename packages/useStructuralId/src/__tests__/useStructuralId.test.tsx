import type {Fiber} from 'its-fine';
import { render, renderHook } from "@testing-library/react";
import useStructuralId from "../useStructuralId";

const TestComponent = ({ children }: {children?: React.ReactNode}) => (
    <div data-testid="test-component">
        {children}
    </div>
);

describe('useStructuralId', () => {
    it('should return a structural id', () => {
        render(<TestComponent />);
        const {result} = renderHook(() => useStructuralId((fiber: Fiber<any>) => fiber.elementType === 'div', []));
        console.log('result', result.current);
    });
});
