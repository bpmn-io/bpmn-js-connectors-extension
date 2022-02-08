# Connectors Modeling Demo

[![CI](https://github.com/bpmn-io/connectors-modeling-demo/actions/workflows/CI.yml/badge.svg)](https://github.com/bpmn-io/connectors-modeling-demo/actions/workflows/CI.yml)

This demo showcases the in-the-works connectors modeling experience. To be integrated into the Camunda [Web](https://github.com/camunda/web-modeler) and [Desktop](https://github.com/camunda/camunda-modeler) Modeler apps.

[![screenshot](./resources/screenshot.png)](https://potential-winner-9f6a854d.pages.github.io/)


## Features

* General [C8 element template support](https://docs.camunda.io/docs/components/modeler/camunda-modeler/element-templates/camunda-modeler-element-templates/)
* Create connector tasks during modeling
* Upgrade task to connector tasks
* Visually distinguish connector tasks from standard BPMN tasks


## Use Extension

The [`connectors-extension`](./connectors-extension) is all that is needed to extend [bpmn-js](https://github.com/bpmn-io/bpmn-js) for connectors.


## Run locally

To run the demo application, execute:

```
npm start
```
