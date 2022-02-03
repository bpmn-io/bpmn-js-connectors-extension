import inherits from 'inherits';

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  isLabel
} from 'bpmn-js/lib/util/LabelUtil';

import {
  getStrokeColor
} from 'bpmn-js/lib/draw/BpmnRenderUtil';


export default function ConnectorTaskRenderer(
    config,
    eventBus,
    bpmnRenderer) {

  this._bpmnRenderer = bpmnRenderer;
  this._config = config || {};

  BaseRenderer.call(this, eventBus, 1250);
}

inherits(ConnectorTaskRenderer, BaseRenderer);

ConnectorTaskRenderer.$inject = [
  'config.bpmnRenderer',
  'eventBus',
  'bpmnRenderer'
];

function getElementTemplate(element) {
  return !isLabel(element) && is(element, 'bpmn:Activity') && getBusinessObject(element).get('zeebe:modelerTemplate');
}

ConnectorTaskRenderer.prototype.canRender = function(element) {
  return !!getElementTemplate(element);
};

const connectorTaskIcons = {
  'io.camunda.connectors.EmailConnector-s2': [
    'm 11.504082,24.374985 h 9.305414 V 22.249272 H 14.020232 V 18.06292 h 5.574572 V 15.937208 H 14.020232 V 12.31482 h 6.572355 v -2.12571 h -9.088505 z'
  ],
  'io.camunda.connectors.RestConnector-s1': [
    'm 10.896735,24.374985 h 2.51615 v -5.552881 h 2.125711 l 3.036732,5.552881 h 2.841515 l -3.383788,-5.921627 c 1.691894,-0.585656 2.819823,-1.908804 2.819823,-4.056207 0,-3.166877 -2.27755,-4.208042 -5.227517,-4.208042 h -4.728626 z m 2.51615,-7.548447 v -4.620172 h 1.952185 c 1.952184,0 3.015041,0.563965 3.015041,2.190785 0,1.605131 -1.062857,2.429387 -3.015041,2.429387 z'
  ]
};

ConnectorTaskRenderer.prototype.drawShape = function(parentGfx, element) {
  const renderer = this._bpmnRenderer.handlers['bpmn:Task'];

  const gfx = renderer(parentGfx, element);

  const paths = connectorTaskIcons[getElementTemplate(element)];

  for (const path of paths) {
    this._bpmnRenderer._drawPath(parentGfx, path, {
      fill: getStrokeColor(element, this._config.defaultStrokeColor),
      stroke: 'none'
    });
  }

  return gfx;
};
