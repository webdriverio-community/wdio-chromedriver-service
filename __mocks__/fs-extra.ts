import { vi } from 'vitest'

export default {
    createWriteStream: vi.fn(),
    ensureFile: vi.fn(),
    existsSync: vi.fn().mockReturnValue(true)
}
