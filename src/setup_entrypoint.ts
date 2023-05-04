import * as path from "node:path"
import os from "os"

import * as core from "@actions/core"

import { cmdName, download } from "./setup"

const run = async (): Promise<{
  path: string
  url: string
}> => {
  const inputVersion = core.getInput("version")
  core.debug(`inputVersion: ${inputVersion}`)

  const osPlatform = os.platform() as string
  const osArch = os.arch()
  core.debug(`osPlatform: ${osPlatform}`)
  core.debug(`osArch: ${osArch}`)

  const result = await download(inputVersion, osPlatform, osArch)

  core.addPath(result.path)
  core.exportVariable("TFCMT_DIR_PATH", result.path)
  core.exportVariable("TFCMT_CMD_PATH", path.join(result.path, cmdName))

  return result
}

const main = async () => {
  try {
    await run()
  } catch (e) {
    console.error(e)
    if (e instanceof Error) {
      core.setFailed(e.message)
    } else {
      core.setFailed("Error. Please check the action logs.")
    }
  }
}

void main()
