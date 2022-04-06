import * as replaceOptions from 'bpmn-js/lib/features/replace/ReplaceOptions';
import { isDifferentType } from 'bpmn-js/lib/features/popup-menu/util/TypeUtil';

const ALL_OPTIONS = Object.values(replaceOptions).flat();
const REPLACE_MENU_PROVIDER = 'bpmn-replace';
const HIGH_PRIORITY = 2000;

export default function UnlinkEntryProvider(elementTemplates, popupMenu, translate) {
  this._elementTemplates = elementTemplates;
  this._translate = translate;

  popupMenu.registerProvider(REPLACE_MENU_PROVIDER, HIGH_PRIORITY, this);
}

/**
 * Creates a option to replace a templated task with a plain task of the same
 * type. Uses `replaceOptions` for label and icon of the entry.
 *
 * @param {djs.model.Base} element
 *
 * @return {Array<Object>} a list of menu entry items
 */
UnlinkEntryProvider.prototype.getEntries = function(element) {
  const elementTemplates = this._elementTemplates,
        translate = this._translate;

  const currentTemplate = elementTemplates.get(element);

  if (!currentTemplate) {
    return [];
  }

  const isSameType = (element, option) => !isDifferentType(element)(option);

  const option = ALL_OPTIONS.find(option => isSameType(element, option));

  const entry = {
    id: 'unlink-element-template',
    action: () => {
      elementTemplates.applyTemplate(element, null);
    },
    label: translate(option.label),
    className: option.className
  };

  return [entry];
};

UnlinkEntryProvider.$inject = [
  'elementTemplates',
  'popupMenu',
  'translate'
];
