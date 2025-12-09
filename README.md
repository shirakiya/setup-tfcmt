# setup-tfcmt
This [shirakiya/setup-tfcmt](https://github.com/shirakiya/setup-tfcmt) action is a JavaScript action on GitHub Actions
that sets up [suzuki-shunsuke/tfcmt](https://github.com/suzuki-shunsuke/tfcmt) command in your GitHub Actions workflow.

- Downloading a specific version of tfcmt and adding it to the PATH.
- Can be run on `ubuntu-latest`, `windows-latest`, `macos-latest` GitHub Actions runner.


## Usage

See [action.yml](action.yml)

The default configuration installs the latest version of tfcmt binary.

```yaml
- uses: shirakiya/setup-tfcmt@v3
```

A specific version of tfcmt can be installed:

```yaml
- uses: shirakiya/setup-tfcmt@v3
  with:
    # Version Spec of to use. See tfcmt releases
    # https://github.com/suzuki-shunsuke/tfcmt/releases
    version: v4.3.0
```

## Inputs

The action supports the following inputs:

- `version`: (optional) The version of tfcmt to install. Examples are `v4.3.0`, `v4.2.0`.
  All of available versions can be refered from tfcmt releases. https://github.com/suzuki-shunsuke/tfcmt/releases


## Outputs

None. This action does not output any values.


## LICENCE

The scripts and documentation in this project are released under the [MIT License](LICENSE)


## Acknowledgments

This Action is published with permission of [suzuki-shunsuke](https://github.com/suzuki-shunsuke), the author
of [suzuki-shunsuke/tfcmt](https://github.com/suzuki-shunsuke/tfcmt). Thank suzuki-shunsuke for granting me
permission.
