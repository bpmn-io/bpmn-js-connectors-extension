import inherits from 'inherits';

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import {
  isLabel
} from 'bpmn-js/lib/util/LabelUtil';

import {
  create as svgCreate,
  appendTo as svgAppendTo
} from 'tiny-svg';

import {
  sanitizeImageUrl
} from './utils';


export default function ConnectorTaskRenderer(
    config,
    eventBus,
    bpmnRenderer,
    elementTemplates) {

  this._bpmnRenderer = bpmnRenderer;
  this._elementTemplates = elementTemplates;
  this._config = config || {};

  BaseRenderer.call(this, eventBus, 1250);
}

inherits(ConnectorTaskRenderer, BaseRenderer);

ConnectorTaskRenderer.$inject = [
  'config.bpmnRenderer',
  'eventBus',
  'bpmnRenderer',
  'elementTemplates'
];

ConnectorTaskRenderer.prototype._getImageUrl = function(element) {
  const template = this._elementTemplates.get(element);

  return template && template.icon && sanitizeImageUrl(template.icon.contents);
};

ConnectorTaskRenderer.prototype.canRender = function(element) {
  if (isLabel(element)) {
    return false;
  }

  return !isLabel(element) && this._getImageUrl(element);
};

ConnectorTaskRenderer.prototype.drawShape = function(parentGfx, element) {
  const renderer = this._bpmnRenderer.handlers['bpmn:Task'];

  const gfx = renderer(parentGfx, element);

  const img = svgCreate('image', {
    x: 4,
    y: 4,
    width: 18,
    height: 18,
    href: this._getImageUrl(element)
  });

  svgAppendTo(img, parentGfx);

  return gfx;
};
