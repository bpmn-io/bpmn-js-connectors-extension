import { isDifferentType } from 'bpmn-js/lib/features/popup-menu/util/TypeUtil';
import { getOptionsForElement } from './util/ReplaceOptionsUtil';

const REPLACE_MENU_PROVIDER = 'bpmn-replace';
const VERY_LOW_PRIORITY = 100;

export default function UnlinkEntryProvider(elementTemplates, popupMenu, translate) {
  this._elementTemplates = elementTemplates;
  this._translate = translate;

  popupMenu.registerProvider(REPLACE_MENU_PROVIDER, VERY_LOW_PRIORITY, this);
}

/**
 * Creates an entry to replace a templated task with a plain task of the same
 * type.
 *
 * @param {djs.model.Base} element
 * @param {Array<Object>} options
 *
 * @return {Array<Object>} a list of menu entry items
 */
UnlinkEntryProvider.prototype._getUnlinkEntry = function(element, options) {
  const elementTemplates = this._elementTemplates,
        translate = this._translate;

  const currentTemplate = elementTemplates.get(element);

  if (!currentTemplate) {
    return;
  }

  const isSameType = (element, option) => !isDifferentType(element)(option);

  const optionIndex = options.findIndex(option => isSameType(element, option));
  const option = options[optionIndex];

  const entry = {
    action: () => {
      elementTemplates.applyTemplate(element, null);
    },
    label: translate(option.label),
    className: option.className,
    priority: optionIndex
  };

  return entry;
};


UnlinkEntryProvider.prototype.getPopupMenuEntries = function(element) {
  const options = getOptionsForElement(element);
  const newEntry = this._getUnlinkEntry(element, options);

  return function(entries) {

    if (!newEntry) {
      return entries;
    }

    for (const actionName in entries) {
      entries[actionName].priority = options.findIndex(option => option.actionName === actionName);
    }

    entries['replace-unlink-element-template'] = newEntry;

    return entries;
  };

};

UnlinkEntryProvider.$inject = [
  'elementTemplates',
  'popupMenu',
  'translate'
];
