import { vi } from 'vitest'
export default {
    waitUntilUsed: vi.fn().mockReturnValue(Promise.resolve()),
    waitUntilFree: vi.fn().mockReturnValue(Promise.resolve())
}
