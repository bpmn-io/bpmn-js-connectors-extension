# Changelog

All notable changes to [bpmn-js-connectors-extension](https://github.com/bpmn-io/bpmn-js-connectors-extension) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 0.4.6

* `DOCS`: various documentation updates

## 0.4.5

* `FIX`: key replace menu entries by ID ([#55](https://github.com/bpmn-io/bpmn-js-connectors-extension/pull/55))

## 0.4.4

* `FIX`: revert [`6189a49`](https://github.com/bpmn-io/bpmn-js-connectors-extension/commit/6189a499522250582584475bfc82ea6a0c544c50) due to [#54](https://github.com/bpmn-io/bpmn-js-connectors-extension/issues/54)

## 0.4.3

* `FIX`: force create mode when appending boundary event ([#52](https://github.com/bpmn-io/bpmn-js-connectors-extension/pull/52))
* `DEPS`: bump modeling dependencies

## 0.4.2

* `DEPS`: bump modeling dependencies

## 0.4.1

* `FIX`: always upper case `Connector`

## 0.4.0

* `FEAT`: only offer latest template versions for selection ([#38](https://github.com/bpmn-io/bpmn-js-connectors-extension/issues/38))
* `FIX`: gracefully handle missing template `category` ([#43](https://github.com/bpmn-io/bpmn-js-connectors-extension/issues/43))
* `FIX`: prevent appending templates to connections ([#46](https://github.com/bpmn-io/bpmn-js-connectors-extension/issues/46))
* `FIX`: do not trigger append on external labels ([#39](https://github.com/bpmn-io/bpmn-js-connectors-extension/issues/39))
* `FIX`: complete direct editing when opening popup menu ([#40](https://github.com/bpmn-io/bpmn-js-connectors-extension/issues/40))

## 0.3.1

* `FIX`: handle missing target in replace options ([`cba23f08`](https://github.com/bpmn-io/bpmn-js-connectors-extension/commit/cba23f084cfca854436da305dcf647dc782c94c7))

## 0.3.0

* `FEAT`: insert unlink entry late ([#35](https://github.com/bpmn-io/bpmn-js-connectors-extension/pull/35))

## 0.2.0

* `FEAT`: allow unlink of template via replace menu ([#32](https://github.com/bpmn-io/bpmn-js-connectors-extension/issues/32))

## 0.1.1

* `FIX`: make entry ids for menu actions unique

## 0.1.0

* `FEAT`: require official [template icon renderer](https://github.com/bpmn-io/element-templates-icons-renderer)

### Breaking Change

* Rendering of template icons on the canvas is now a concern outside this library.

## 0.0.13

* `FIX`: correctly handle missing `appendAnything` feature toggle

## 0.0.12

* `FEAT`: support template icons ([#26](https://github.com/bpmn-io/bpmn-js-connectors-extension/pull/26))
* `FEAT`: support categories and search ([#18](https://github.com/bpmn-io/bpmn-js-connectors-extension/pull/18))
* `FEAT`: improve mixed mouse + keyboard selection ([#19](https://github.com/bpmn-io/bpmn-js-connectors-extension/pull/19))
* `FEAT`: improve existing tools integration ([#17](https://github.com/bpmn-io/bpmn-js-connectors-extension/pull/17))
* `FEAT`: visually hide search if less than five elements ([#16](https://github.com/bpmn-io/bpmn-js-connectors-extension/pull/16))
* `FEAT`: optionally support create/append anything ([#14](https://github.com/bpmn-io/bpmn-js-connectors-extension/pull/14))
* `FEAT`: add append (`a`), replace (`r`) and create (`n`) keyboard bindings ([#15](https://github.com/bpmn-io/bpmn-js-connectors-extension/pull/15))
* `FIX`: correct muted entry sizing ([#24](https://github.com/bpmn-io/bpmn-js-connectors-extension/pull/24))
* `FIX`: correct scroll into on Firefox ([#23](https://github.com/bpmn-io/bpmn-js-connectors-extension/pull/23))
* `FIX`: correct pass through of `documentationRef` ([#28](https://github.com/bpmn-io/bpmn-js-connectors-extension/pull/28))
* `FIX`: prevent click-through on documentation ref ([#28](https://github.com/bpmn-io/bpmn-js-connectors-extension/pull/28))
* `FIX`: prevent ENTER propagation on append

## 0.0.11

* `CHORE`: remove debug logging ([#13](https://github.com/bpmn-io/bpmn-js-connectors-extension/pull/13))

## 0.0.10

* `FEAT`: integrate with other editing components ([#10](https://github.com/bpmn-io/bpmn-js-connectors-extension/pull/10))
* `FEAT`: support create anywhere from append menu ([#11](https://github.com/bpmn-io/bpmn-js-connectors-extension/pull/11))

## 0.0.9

* `FEAT`: move keyboard selected entries into viewport ([`87fd87fe`](https://github.com/bpmn-io/bpmn-js-connectors-extension/commit/87fd87feca03a4d0e40c1e69c2c7001df67ced98))
* `FEAT`: show docs link based on `documentationRef` ([`1fb704bb`](https://github.com/bpmn-io/bpmn-js-connectors-extension/commit/1fb704bb55e345114e6dee68f3bab48ccc9e632b))
* `CHORE`: position element template chooser based on available height ([`ec5c9055`](https://github.com/bpmn-io/bpmn-js-connectors-extension/commit/ec5c90550418b043faf3c2a257d4e2872d499884))

## ...

Check `git log` for earlier history.
