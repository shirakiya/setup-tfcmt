import { describe, expect, test } from "vitest"

import {
  mapPlatform,
  mapArch,
  getBuildURL,
  specifyReleaseVersion,
} from "./setup"

describe("mapPlatform", () => {
  const tt: {
    name: string
    platform: string
    expected: string
  }[] = [
    {
      name: "returns 'darwin' if darwin",
      platform: "darwin",
      expected: "darwin",
    },
    {
      name: "returns 'linux' if linux",
      platform: "linux",
      expected: "linux",
    },
  ]

  for (const t of tt) {
    test(t.name, () => {
      expect(mapPlatform(t.platform)).toBe(t.expected)
    })
  }

  test("throws if unknown platform", () => {
    expect(() => {
      mapPlatform("unknown")
    }).toThrow()
  })
})

describe("mapArch", () => {
  const tt: {
    name: string
    arch: string
    expected: string
  }[] = [
    {
      name: "returns 'amd64' if x64",
      arch: "x64",
      expected: "amd64",
    },
    {
      name: "returns 'arm64' if arm64",
      arch: "arm64",
      expected: "arm64",
    },
  ]

  for (const t of tt) {
    test(t.name, () => {
      expect(mapArch(t.arch)).toBe(t.expected)
    })
  }

  test("throws if unknown architecture", () => {
    expect(() => {
      mapPlatform("unknown")
    }).toThrow()
  })
})

describe("specifyReleaseVersion", () => {
  test("select latest one if passed version is empty", () => {
    const got = specifyReleaseVersion("")
    expect(got).toStrictEqual("v4.14.14")
  })

  test("select a matched version if passed version is specified", () => {
    const got = specifyReleaseVersion("v4.2.0")
    expect(got).toStrictEqual("v4.2.0")
  })

  test("throws error if passed version does not contain in released versions", () => {
    expect(() => specifyReleaseVersion("v9.9.9")).toThrow()
  })
})

describe("getBuildURL", () => {
  test("success case 0", () => {
    expect(getBuildURL("v4.3.0", "darwin", "arm64")).toBe(
      "https://github.com/suzuki-shunsuke/tfcmt/releases/download/v4.3.0/tfcmt_darwin_arm64.tar.gz",
    )
  })
  test("success case 1", () => {
    expect(getBuildURL("v4.2.0", "linux", "amd64")).toBe(
      "https://github.com/suzuki-shunsuke/tfcmt/releases/download/v4.2.0/tfcmt_linux_amd64.tar.gz",
    )
  })
})
