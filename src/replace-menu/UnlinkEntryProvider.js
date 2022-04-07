import * as replaceOptions from 'bpmn-js/lib/features/replace/ReplaceOptions';
import { isDifferentType } from 'bpmn-js/lib/features/popup-menu/util/TypeUtil';

const ALL_OPTIONS = Object.values(replaceOptions).flat();
const REPLACE_MENU_PROVIDER = 'bpmn-replace';
const VERY_LOW_PRIORITY = 100;

export default function UnlinkEntryProvider(elementTemplates, popupMenu, translate) {
  this._elementTemplates = elementTemplates;
  this._translate = translate;

  popupMenu.registerProvider(REPLACE_MENU_PROVIDER, VERY_LOW_PRIORITY, this);
}

/**
 * Creates a option to replace a templated task with a plain task of the same
 * type. Uses `replaceOptions` for label and icon of the entry.
 *
 * @param {djs.model.Base} element
 *
 * @return {Array<Object>} a list of menu entry items
 */
UnlinkEntryProvider.prototype._getUnlinkEntry = function(element) {
  const elementTemplates = this._elementTemplates,
        translate = this._translate;

  const currentTemplate = elementTemplates.get(element);

  if (!currentTemplate) {
    return;
  }

  const isSameType = (element, option) => !isDifferentType(element)(option);

  const option = ALL_OPTIONS.find(option => isSameType(element, option));

  const entry = {
    action: () => {
      elementTemplates.applyTemplate(element, null);
    },
    label: translate(option.label),
    className: option.className
  };

  return entry;
};


UnlinkEntryProvider.prototype.getPopupMenuEntries = function(element) {

  const newEntry = this._getUnlinkEntry(element);

  return function(entries) {

    if (!newEntry) {
      return entries;
    }

    entries['replace-unlink-element-template'] = newEntry;

    for (const entry in entries) {
      entries[entry].priority = VERY_LOW_PRIORITY;
    }
    return entries;
  };

};

UnlinkEntryProvider.$inject = [
  'elementTemplates',
  'popupMenu',
  'translate'
];
