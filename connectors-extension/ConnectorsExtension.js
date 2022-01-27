import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

const restImageSvg = `
<svg width="22" height="22" viewBox="0 0 52.92 52.92" xmlns="http://www.w3.org/2000/svg">
  <path style="stroke:#000;stroke-width:.524999;stroke-linecap:round;stroke-linejoin:round;stop-color:#000" d="M4.32 5.55H48.6a3 3 0 0 1 3 3V44.9a3 3 0 0 1-3 3H4.32a3 3 0 0 1-3-3V8.55a3 3 0 0 1 3-3z"/>
  <path style="fill:#fff;stroke:#000;stroke-width:.524999;stroke-linecap:round;stroke-linejoin:round;stop-color:#000" d="M6.02 7.95h41.13a2.4 2.4 0 0 1 2.41 2.41v33.2a2.4 2.4 0 0 1-2.41 2.4H6.02a2.4 2.4 0 0 1-2.41-2.4v-33.2a2.4 2.4 0 0 1 2.41-2.41z"/>
  <g style="font-size:31.8344px;line-height:1.25;font-family:'Source Code Pro';-inkscape-font-specification:'Source Code Pro, Normal';letter-spacing:0;word-spacing:0;stroke-width:.264583">
    <path d="m21.04 33.52-4.5-8h-2.7v8H9.27V12.55h7.68q4.1 0 6.14 1.6t2.04 4.62q0 2.13-1.15 3.62-1.15 1.5-3.2 2.1l5.43 9.03zm-.54-14.56q0-1.47-.96-2.15-.97-.7-3.08-.7h-2.61v5.85h2.73q3.92 0 3.92-3z" style="font-weight:700;font-family:'Liberation Mono';-inkscape-font-specification:'Liberation Mono, Bold'" aria-label="R"/>
  </g>
</svg>
`;

const restImagePaletteSvg = `
<svg width="30" height="46" viewBox="0 0 52.92 52.92" xmlns="http://www.w3.org/2000/svg">
  <path style="stroke:#000;stroke-width:.524999;stroke-linecap:round;stroke-linejoin:round;stop-color:#000" d="M4.32 5.55H48.6a3 3 0 0 1 3 3V44.9a3 3 0 0 1-3 3H4.32a3 3 0 0 1-3-3V8.55a3 3 0 0 1 3-3z"/>
  <path style="fill:#fff;stroke:#000;stroke-width:.524999;stroke-linecap:round;stroke-linejoin:round;stop-color:#000" d="M6.02 7.95h41.13a2.4 2.4 0 0 1 2.41 2.41v33.2a2.4 2.4 0 0 1-2.41 2.4H6.02a2.4 2.4 0 0 1-2.41-2.4v-33.2a2.4 2.4 0 0 1 2.41-2.41z"/>
  <g style="font-size:31.8344px;line-height:1.25;font-family:'Source Code Pro';-inkscape-font-specification:'Source Code Pro, Normal';letter-spacing:0;word-spacing:0;stroke-width:.264583">
    <path d="m21.04 33.52-4.5-8h-2.7v8H9.27V12.55h7.68q4.1 0 6.14 1.6t2.04 4.62q0 2.13-1.15 3.62-1.15 1.5-3.2 2.1l5.43 9.03zm-.54-14.56q0-1.47-.96-2.15-.97-.7-3.08-.7h-2.61v5.85h2.73q3.92 0 3.92-3z" style="font-weight:700;font-family:'Liberation Mono';-inkscape-font-specification:'Liberation Mono, Bold'" aria-label="R"/>
  </g>
</svg>
`;
const restImageUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(restImageSvg);

const restImagePaletteUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(restImagePaletteSvg);

// workaround for
// https://github.com/camunda/camunda-bpmn-js/issues/87
const LOWER_PRIORITY = 499;


export default function ConnectorsExtension(injector, create, elementFactory, bpmnFactory, contextPad, palette, translate) {
  this._create = create;
  this._elementFactory = elementFactory;
  this._bpmnFactory = bpmnFactory;
  this._contextPad = contextPad;
  this._translate = translate;

  this._autoPlace = injector.get('autoPlace', false);

  contextPad.registerProvider(LOWER_PRIORITY, this);
  palette.registerProvider(LOWER_PRIORITY, this);
}

ConnectorsExtension.$inject = ['injector', 'create', 'elementFactory', 'bpmnFactory', 'contextPad', 'palette', 'translate'];

ConnectorsExtension.prototype._createElement = function() {

  const elementFactory = this._elementFactory;
  const bpmnFactory = this._bpmnFactory;

  const element = elementFactory.createShape({ type: 'bpmn:ServiceTask' });

  /**
   * On creation, scaffold the following moddle (XML representation):
   *
   * <bpmn:serviceTask zeebe:modelerTemplate="io.camunda.connectors.RestConnector-s1">
   *  <bpmn:extensionElements>
   *    <zeebe:taskDefinition type="http" />
   *    <zeebe:taskHeaders>
   *      <zeebe:header key="method" value="get" />
   *      <zeebe:header key="url" value="" />
   *     </zeebe:taskHeaders>
   *     <zeebe:ioMapping>
   *       <zeebe:input source="" target="body" />
   *       <zeebe:output source="= body" target="" />
   *     </zeebe:ioMapping>
   *   </bpmn:extensionElements>
   * </bpmn:serviceTask>
   */

  const businessObject = getBusinessObject(element);

  const taskDefinition = bpmnFactory.create('zeebe:TaskDefinition', {
    type: 'http'
  });

  const taskHeaders = bpmnFactory.create('zeebe:TaskHeaders', {
    values: [
      bpmnFactory.create('zeebe:Header', {
        key: 'method',
        value: 'get'
      }),
      bpmnFactory.create('zeebe:Header', {
        key: 'url',
        value: ''
      })
    ]
  });

  const ioMapping = bpmnFactory.create('zeebe:IoMapping', {
    inputParameters: [
      bpmnFactory.create('zeebe:Input', {
        source: '',
        target: 'body'
      })
    ],
    outputParameters: [
      bpmnFactory.create('zeebe:Output', {
        source: '= body',
        target: ''
      })
    ]
  });

  const extensionElements = bpmnFactory.create('bpmn:ExtensionElements', {
    values: [
      taskDefinition,
      taskHeaders,
      ioMapping
    ]
  });

  businessObject.set('extensionElements', extensionElements);

  businessObject.set('zeebe:modelerTemplate', 'io.camunda.connectors.RestConnector-s1');

  return element;
};


ConnectorsExtension.prototype.getPaletteEntries = function() {

  const title = this._translate('Create REST Connector');

  const self = this;

  function createListener(event) {
    self._create.start(event, self._createElement());
  }

  return {
    'create-rest-connector': {
      group: 'activity',
      imageUrl: restImagePaletteUrl,
      title,
      action: {
        dragstart: createListener,
        click: createListener
      }
    }
  };
};

ConnectorsExtension.prototype.getContextPadEntries = function(element) {
  const title = this._translate('Append REST Task');

  var self = this;

  return (entries) => {

    // only allow when appending task is allowed, too
    if (!entries['append.append-task']) {
      return entries;
    }

    function appendStart(event, shape) {
      self._create.start(event, self._createElement(), {
        source: shape
      });
    }

    var append = self._autoPlace
      ? function(event, shape) {
        self._autoPlace.append(shape, self._createElement());
      }
      : appendStart;

    return {
      ...entries,
      'append-rest-task': {
        group: 'model',
        title,
        imageUrl: restImageUrl,
        action: {
          dragstart: appendStart,
          click: append
        }
      }
    };
  };
};