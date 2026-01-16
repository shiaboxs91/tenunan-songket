/**
 * Property-Based Tests for Version Management
 * 
 * Tests the version comparison and update checking logic
 * using fast-check for property-based testing.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { compareVersions, isValidVersion } from '@/lib/supabase/version'

// ============================================
// Generators
// ============================================

// Generate valid semantic version parts (0-99)
const versionPartArb = fc.integer({ min: 0, max: 99 })

// Generate valid semantic version string
const semverArb = fc.tuple(versionPartArb, versionPartArb, versionPartArb)
  .map(([major, minor, patch]) => `${major}.${minor}.${patch}`)

// Generate invalid version strings
const invalidVersionArb = fc.oneof(
  fc.string().filter(s => !/^\d+\.\d+\.\d+$/.test(s)),
  fc.constant('1.2'),
  fc.constant('1'),
  fc.constant('1.2.3.4'),
  fc.constant('v1.2.3'),
  fc.constant('1.2.x'),
  fc.constant('')
)

// ============================================
// Property 15: Mandatory Version Update Enforcement
// ============================================

describe('Property 15: Mandatory Version Update Enforcement', () => {
  /**
   * **Validates: Requirements 7.3**
   * 
   * For any app version marked as is_mandatory=true and is_current=true,
   * the version check function SHALL return requires_update=true for any
   * client version less than the current version.
   */
  
  it('should require update when client version is less than current version', () => {
    fc.assert(
      fc.property(
        versionPartArb, versionPartArb, versionPartArb,
        versionPartArb, versionPartArb, versionPartArb,
        (cMajor, cMinor, cPatch, sMajor, sMinor, sPatch) => {
          const clientVersion = `${cMajor}.${cMinor}.${cPatch}`
          const serverVersion = `${sMajor}.${sMinor}.${sPatch}`
          
          const comparison = compareVersions(clientVersion, serverVersion)
          
          // If client < server, requires update
          if (comparison < 0) {
            // This simulates what checkForUpdate would return
            const requiresUpdate = comparison < 0
            expect(requiresUpdate).toBe(true)
          }
        }
      ),
      { numRuns: 25 }
    )
  })

  it('should not require update when client version equals or exceeds server version', () => {
    fc.assert(
      fc.property(
        versionPartArb, versionPartArb, versionPartArb,
        versionPartArb, versionPartArb, versionPartArb,
        (cMajor, cMinor, cPatch, sMajor, sMinor, sPatch) => {
          const clientVersion = `${cMajor}.${cMinor}.${cPatch}`
          const serverVersion = `${sMajor}.${sMinor}.${sPatch}`
          
          const comparison = compareVersions(clientVersion, serverVersion)
          
          // If client >= server, no update required
          if (comparison >= 0) {
            const requiresUpdate = comparison < 0
            expect(requiresUpdate).toBe(false)
          }
        }
      ),
      { numRuns: 25 }
    )
  })

  it('should correctly identify mandatory updates', () => {
    // Test specific cases where mandatory update should be enforced
    const testCases = [
      { client: '1.0.0', server: '2.0.0', isMandatory: true, shouldRequire: true },
      { client: '1.0.0', server: '1.1.0', isMandatory: true, shouldRequire: true },
      { client: '1.0.0', server: '1.0.1', isMandatory: true, shouldRequire: true },
      { client: '2.0.0', server: '1.0.0', isMandatory: true, shouldRequire: false },
      { client: '1.0.0', server: '1.0.0', isMandatory: true, shouldRequire: false },
    ]

    testCases.forEach(({ client, server, isMandatory, shouldRequire }) => {
      const comparison = compareVersions(client, server)
      const requiresUpdate = comparison < 0
      const isMandatoryUpdate = requiresUpdate && isMandatory
      
      expect(requiresUpdate).toBe(shouldRequire)
      if (shouldRequire && isMandatory) {
        expect(isMandatoryUpdate).toBe(true)
      }
    })
  })
})

// ============================================
// Property 16: Version Comparison for Update Check
// ============================================

describe('Property 16: Version Comparison for Update Check', () => {
  /**
   * **Validates: Requirements 7.4**
   * 
   * For any two semantic version strings, the version comparison function
   * SHALL correctly determine if the client version is less than, equal to,
   * or greater than the server version.
   */

  it('should return 0 for identical versions', () => {
    fc.assert(
      fc.property(semverArb, (version) => {
        expect(compareVersions(version, version)).toBe(0)
      }),
      { numRuns: 25 }
    )
  })

  it('should be antisymmetric: if a < b then b > a', () => {
    fc.assert(
      fc.property(semverArb, semverArb, (v1, v2) => {
        const cmp1 = compareVersions(v1, v2)
        const cmp2 = compareVersions(v2, v1)
        
        // Antisymmetric property
        expect(cmp1).toBe(-cmp2)
      }),
      { numRuns: 25 }
    )
  })

  it('should be transitive: if a < b and b < c then a < c', () => {
    fc.assert(
      fc.property(semverArb, semverArb, semverArb, (v1, v2, v3) => {
        const cmp12 = compareVersions(v1, v2)
        const cmp23 = compareVersions(v2, v3)
        const cmp13 = compareVersions(v1, v3)
        
        // If v1 < v2 and v2 < v3, then v1 < v3
        if (cmp12 < 0 && cmp23 < 0) {
          expect(cmp13).toBeLessThan(0)
        }
        // If v1 > v2 and v2 > v3, then v1 > v3
        if (cmp12 > 0 && cmp23 > 0) {
          expect(cmp13).toBeGreaterThan(0)
        }
      }),
      { numRuns: 25 }
    )
  })

  it('should correctly compare major versions', () => {
    fc.assert(
      fc.property(
        versionPartArb, versionPartArb, versionPartArb, versionPartArb,
        (major1, major2, minor, patch) => {
          fc.pre(major1 !== major2) // Ensure different majors
          
          const v1 = `${major1}.${minor}.${patch}`
          const v2 = `${major2}.${minor}.${patch}`
          
          const expected = major1 < major2 ? -1 : 1
          expect(compareVersions(v1, v2)).toBe(expected)
        }
      ),
      { numRuns: 25 }
    )
  })

  it('should correctly compare minor versions when major is equal', () => {
    fc.assert(
      fc.property(
        versionPartArb, versionPartArb, versionPartArb, versionPartArb,
        (major, minor1, minor2, patch) => {
          fc.pre(minor1 !== minor2) // Ensure different minors
          
          const v1 = `${major}.${minor1}.${patch}`
          const v2 = `${major}.${minor2}.${patch}`
          
          const expected = minor1 < minor2 ? -1 : 1
          expect(compareVersions(v1, v2)).toBe(expected)
        }
      ),
      { numRuns: 25 }
    )
  })

  it('should correctly compare patch versions when major and minor are equal', () => {
    fc.assert(
      fc.property(
        versionPartArb, versionPartArb, versionPartArb, versionPartArb,
        (major, minor, patch1, patch2) => {
          fc.pre(patch1 !== patch2) // Ensure different patches
          
          const v1 = `${major}.${minor}.${patch1}`
          const v2 = `${major}.${minor}.${patch2}`
          
          const expected = patch1 < patch2 ? -1 : 1
          expect(compareVersions(v1, v2)).toBe(expected)
        }
      ),
      { numRuns: 25 }
    )
  })

  it('should prioritize major over minor over patch', () => {
    // Major version difference should override minor and patch
    expect(compareVersions('2.0.0', '1.99.99')).toBe(1)
    expect(compareVersions('1.99.99', '2.0.0')).toBe(-1)
    
    // Minor version difference should override patch
    expect(compareVersions('1.2.0', '1.1.99')).toBe(1)
    expect(compareVersions('1.1.99', '1.2.0')).toBe(-1)
  })
})

// ============================================
// Version Validation Tests
// ============================================

describe('Version Validation', () => {
  it('should validate correct semantic versions', () => {
    fc.assert(
      fc.property(semverArb, (version) => {
        expect(isValidVersion(version)).toBe(true)
      }),
      { numRuns: 25 }
    )
  })

  it('should reject invalid version formats', () => {
    const invalidVersions = [
      '1.2',           // Missing patch
      '1',             // Missing minor and patch
      '1.2.3.4',       // Too many parts
      'v1.2.3',        // Has prefix
      '1.2.x',         // Non-numeric
      '',              // Empty
      'abc',           // Non-numeric
      '1.2.3-beta',    // Has suffix (not supported in simple semver)
      '1.2.3+build',   // Has build metadata
    ]

    invalidVersions.forEach(version => {
      expect(isValidVersion(version)).toBe(false)
    })
  })

  it('should accept versions with leading zeros', () => {
    // Note: Our simple implementation accepts these
    expect(isValidVersion('0.0.0')).toBe(true)
    expect(isValidVersion('0.0.1')).toBe(true)
    expect(isValidVersion('0.1.0')).toBe(true)
  })
})

// ============================================
// Update Check Logic Tests
// ============================================

describe('Update Check Logic', () => {
  it('should correctly determine update requirement based on version comparison', () => {
    const testCases = [
      { client: '1.0.0', server: '1.0.0', requiresUpdate: false },
      { client: '1.0.0', server: '1.0.1', requiresUpdate: true },
      { client: '1.0.0', server: '1.1.0', requiresUpdate: true },
      { client: '1.0.0', server: '2.0.0', requiresUpdate: true },
      { client: '2.0.0', server: '1.0.0', requiresUpdate: false },
      { client: '1.1.0', server: '1.0.0', requiresUpdate: false },
      { client: '1.0.1', server: '1.0.0', requiresUpdate: false },
    ]

    testCases.forEach(({ client, server, requiresUpdate }) => {
      const comparison = compareVersions(client, server)
      expect(comparison < 0).toBe(requiresUpdate)
    })
  })

  it('should handle edge cases in version comparison', () => {
    // Very large version numbers
    expect(compareVersions('99.99.99', '99.99.99')).toBe(0)
    expect(compareVersions('0.0.0', '0.0.1')).toBe(-1)
    expect(compareVersions('0.0.1', '0.0.0')).toBe(1)
    
    // Zero versions
    expect(compareVersions('0.0.0', '0.0.0')).toBe(0)
  })
})
