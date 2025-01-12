# Change log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The HugeRTE React component 1.0.0 is based on the TinyMCE React component 6.0.0-rc. Unreleased changes from Tiny since 5.1.0 are included in the 1.0.0 changelog.

## 1.0.0 - 2025-01-10

### Added
- Added `cdnVersion` prop.

### Changed
- Moved ~~tinymce~~ (now hugerte) dependency to peerDependencies, as well as making it optional.
- Renamed `tinymceScriptSrc` prop to `hugerteScriptSrc` and restrict its type to a string.

### Removed
- Removed `apiKey` prop.
- Removed `licenseKey` prop.
- Removed `cloudChannel` prop.

### Improved
- Updated dependencies.
