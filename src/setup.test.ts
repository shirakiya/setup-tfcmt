import { rest } from "msw"
import { setupServer } from "msw/node"

import {
  mapPlatform,
  mapArch,
  getBuildURL,
  getAvailableReleaseVersions,
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

describe("getAvailableReleaseVersions", () => {
  const server = setupServer(
    rest.get("http://dummy-domain.com/dummy_0", (_, res, ctx) => {
      return res(
        ctx.json([
          { tag_name: "v4.3.0" },
          { tag_name: "v4.2.0" },
          { tag_name: "v4.1.0" },
        ]),
      )
    }),
    rest.get("http://dummy-domain.com/dummy_1", (_, res, ctx) => {
      return res(ctx.status(500), ctx.json({}))
    }),
  )

  beforeAll(() => {
    server.listen()
  })

  afterAll(() => {
    server.close()
  })

  test("can get versions array if it got valid response", async () => {
    const got = await getAvailableReleaseVersions(
      "http://dummy-domain.com/dummy_0",
    )
    expect(got).toStrictEqual(["v4.3.0", "v4.2.0", "v4.1.0"])
  })

  test("throw error if it got invalid response", async () => {
    await expect(
      getAvailableReleaseVersions("http://dummy-domain.com/dummy_1"),
    ).rejects.toThrow()
  })
})

describe("specifyReleaseVersion", () => {
  const testURL = "http://dummy-domain.com/dummy"
  const server = setupServer(
    rest.get(testURL, (_, res, ctx) => {
      return res(
        ctx.json([
          { tag_name: "v4.3.0" },
          { tag_name: "v4.2.0" },
          { tag_name: "v4.1.0" },
        ]),
      )
    }),
  )

  beforeAll(() => {
    server.listen()
  })

  afterAll(() => {
    server.close()
  })

  test("select latest one if passed version is empty", async () => {
    const got = await specifyReleaseVersion("", testURL)
    expect(got).toStrictEqual("v4.3.0")
  })

  test("select a matched version if passed version is specified", async () => {
    const got = await specifyReleaseVersion("v4.2.0", testURL)
    expect(got).toStrictEqual("v4.2.0")
  })

  test("throws error if passed version does not contain in released versions", async () => {
    await expect(specifyReleaseVersion("v9.9.9", testURL)).rejects.toThrow()
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
