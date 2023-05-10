import * as core from "@actions/core"
import * as tc from "@actions/tool-cache"

import VERSIONS from "./versions.json"

export const CMD_NAME = "tfcmt"

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

export const specifyReleaseVersion = (version: string): string => {
  const availableReleaseVersions = VERSIONS
  core.debug(
    `available release versions: ${availableReleaseVersions.join(", ")}`,
  )

  if (!version) {
    // Select latest and no pre-release version as default.

    const latestVersion = availableReleaseVersions.find((v) => {
      // `-` is included in the version of pre-release.
      // Ex.) "v4.3.0-1"
      return !v.includes("-")
    })
    if (!latestVersion) {
      throw new Error("latest version is not found")
    }

    return latestVersion
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
  const version = specifyReleaseVersion(inputVersion)
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
    CMD_NAME,
    version,
    arch,
  )
  core.debug(`cached tfcmt path is ${cachedPath}`)

  return {
    path: cachedPath,
    url: buildURL,
  }
}
