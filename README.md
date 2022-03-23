# bpmn-js-connectors-extension

[![CI](https://github.com/bpmn-io/bpmn-js-connectors-extension/actions/workflows/CI.yml/badge.svg)](https://github.com/bpmn-io/bpmn-js-connectors-extension/actions/workflows/CI.yml)

This module extends bpmn-js with an element templates everywhere modeling experience. 

To be integrated into the Camunda [Web](https://github.com/camunda/web-modeler) and [Desktop](https://github.com/camunda/camunda-modeler) Modeler apps for Camunda 8.

[![screenshot](./resources/screenshot.png)](https://potential-winner-9f6a854d.pages.github.io/)


## Features

* [C8 element template support](https://docs.camunda.io/docs/components/modeler/camunda-modeler/element-templates/camunda-modeler-element-templates/)
* Append connector tasks during modeling
* Upgrade task to connector tasks
* Visually distinguish connector tasks from standard BPMN tasks
* Modern replace and append menu


## Use Extension

Install via npm:

```
npm install bpmn-js-connectors-extension
```

Use in your [bpmn-js powered editor](https://github.com/bpmn-io/bpmn-js):

```javascript
import ConnectorsExtensionModule from 'bpmn-js-connectors-extension';

import 'bpmn-js-connectors-extension/dist/connectors-extension.css';

const modeler = new BpmnModeler({
  additionalModules: [
    ...,
    ConnectorsExtensionModule,
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    ZeebePropertiesProviderModule,
    ZeebeModdleModule
  ],
  moddleExtensions: {
    zeebe: ZeebeModdle
  }
});
```

See [`example`](./example) for a full featured example or [checkout the demo](https://potential-winner-9f6a854d.pages.github.io/).


## Run locally

To run the demo application, execute:

```
npm start
```
