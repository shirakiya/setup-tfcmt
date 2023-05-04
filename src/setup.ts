import * as core from "@actions/core"
import * as httpm from "@actions/http-client"
import * as tc from "@actions/tool-cache"

export const cmdName = "tfcmt"

const releasesURL =
  "https://api.github.com/repos/suzuki-shunsuke/tfcmt/releases"

// https://nodejs.org/api/os.html#os_os_platform
export const mapPlatform = (platform: string): string => {
  const mappings = {
    darwin: "darwin",
    linux: "linux",
    win32: "windows",
  }

  if (!(platform in mappings)) {
    throw new Error(`OS platform ${platform} is not available for tfcmt`)
  }

  return mappings[platform as keyof typeof mappings]
}

// https://nodejs.org/api/os.html#os_os_arch
export const mapArch = (arch: string): string => {
  const mappings = {
    x64: "amd64",
    arm64: "arm64",
  }

  if (!(arch in mappings)) {
    throw new Error(`OS architecture ${arch} is not available for tfcmt`)
  }

  return mappings[arch as keyof typeof mappings]
}

type GitHubReleases = {
  tag_name: string
}[]

export const getAvailableReleaseVersions = async (
  url: string,
): Promise<string[]> => {
  const http = new httpm.HttpClient("setup-tfcmt", [], {
    headers: {
      // GitHub recommends.
      // https://docs.github.com/ja/rest/releases/releases?apiVersion=2022-11-28#list-releases
      Accept: "application/vnd.github+json",
    },
  })
  const res = await http.get(url)
  const body = await res.readBody()

  if (res.message.statusCode !== 200) {
    const msg = "failed to get releases from GitHub"
    core.error(`${msg}: ${body}`)
    throw new Error(msg)
  }

  const releases: GitHubReleases = JSON.parse(body)

  return releases.map((r) => r.tag_name)
}

export const specifyReleaseVersion = async (
  version: string,
  url: string = releasesURL,
): Promise<string> => {
  const availableReleaseVersions = await getAvailableReleaseVersions(url)
  core.debug(
    `available release versions: ${availableReleaseVersions.join(", ")}`,
  )

  // the default version is latest one.
  if (!version) {
    return availableReleaseVersions[0]
  }

  if (!availableReleaseVersions.includes(version)) {
    throw new Error("invalid version is passed to setup-tfcmt action")
  }

  return version
}

export const getBuildURL = (
  version: string,
  platform: string,
  arch: string,
): string => {
  return `https://github.com/suzuki-shunsuke/tfcmt/releases/download/${version}/tfcmt_${platform}_${arch}.tar.gz`
}

export const download = async (
  inputVersion: string,
  osPlatform: string,
  osArch: string,
): Promise<{
  path: string
  url: string
}> => {
  const version = await specifyReleaseVersion(inputVersion)
  core.debug(
    `the input version [${inputVersion}] identifies the release version as ${version}`,
  )

  const platform = mapPlatform(osPlatform)
  const arch = mapArch(osArch)

  core.debug(`getting build for tfcmt version ${version}: ${platform} ${arch}`)

  const buildURL = getBuildURL(version, platform, arch)

  core.info(`downloading tfcmt from ${buildURL}`)
  const pathToArchive = await tc.downloadTool(buildURL)

  core.debug(`extracting tfcmt build archive file from ${pathToArchive}`)
  const pathToExtractedDir = await tc.extractTar(pathToArchive)
  core.debug(`the build archive of tfcmt is extracted to ${pathToExtractedDir}`)

  // NOTE: This cache is available only self-hosted runner.
  // ref. https://github.com/actions/toolkit/tree/main/packages/tool-cache#cache
  const cachedPath = await tc.cacheDir(
    pathToExtractedDir,
    cmdName,
    version,
    arch,
  )
  core.debug(`cached tfcmt path is ${cachedPath}`)

  return {
    path: cachedPath,
    url: buildURL,
  }
}
