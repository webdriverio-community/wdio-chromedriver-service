import { vi } from 'vitest'

export default {
    createWriteStream: vi.fn(),
    ensureFileSync: vi.fn(),
    existsSync: vi.fn().mockReturnValue(true)
}
