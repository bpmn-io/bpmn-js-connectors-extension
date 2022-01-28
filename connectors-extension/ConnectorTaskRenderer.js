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

ConnectorTaskRenderer.prototype.canRender = function(element) {
  return !isLabel(element) && is(element, 'bpmn:Activity') && !!getBusinessObject(element).get('zeebe:modelerTemplate');
};

ConnectorTaskRenderer.prototype.drawShape = function(parentGfx, element) {
  const renderer = this._bpmnRenderer.handlers['bpmn:Task'];

  const gfx = renderer(parentGfx, element);

  const paths = [
    'm21.04 33.52-4.5-8h-2.7v8H9.27V12.55h7.68q4.1 0 6.14 1.6t2.04 4.62q0 2.13-1.15 3.62-1.15 1.5-3.2 2.1l5.43 9.03zm-.54-14.56q0-1.47-.96-2.15-.97-.7-3.08-.7h-2.61v5.85h2.73q3.92 0 3.92-3z'
  ];

  for (const path of paths) {
    const p = this._bpmnRenderer._drawPath(parentGfx, path, {
      fill: getStrokeColor(element, this._config.defaultStrokeColor),
      stroke: 'none'
    });

    p.style.transform = 'scale(0.5) translate(7px, 7px)';
  }

  return gfx;
};
