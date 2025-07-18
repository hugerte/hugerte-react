# Change log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The HugeRTE React component 1.0.0 is based on the TinyMCE React component 6.0.0-rc. Unreleased changes from Tiny since 5.1.0 are included in the 1.0.0 changelog.

## 2.0.1 - 2025-06-30

## Fixed
- Building a project using `@hugerte/hugerte-react` failed without manually adding `@hugerte/framework-integration-shared` as a dependency.

## 2.0.0 - 2025-06-30

### Removed
- Removed `propTypes` property on the Editor class.
- Removed `prop-types` dependency and some dev dependencies.
- Removed the storybook stuff – a new demo will be added soon.
- Removed an IE/old Edge specific fallback code.

### Changed
- Renamed the prefix of the default editor wrapper element ID from `tiny-react` to `hugerte-react`.
- Bumped some dependencies, including `hugerte`.

### Added
- Added support for React 19.x.
- Added support for `onResizeEditor` event.

## Fixed
- The onEditorChange callback was called three times when content was inserted with insertContent editor API. (Not sure if this bug did exist in 1.x, but anyway tests verify it's not present now.)

## 1.0.1 - 2025-01-11

### Fixed
- License headers were not included in the files in the `lib` directory because the build was made before including the license headers.

## 1.0.0 - 2025-01-11

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
