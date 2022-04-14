import { isDifferentType } from 'bpmn-js/lib/features/popup-menu/util/TypeUtil';
import { getReplaceOptions } from './util/ReplaceOptionsUtil';

const REPLACE_MENU_PROVIDER = 'bpmn-replace';
const VERY_LOW_PRIORITY = 100;


/**
 * Injects an unlink entry into the properties panel to turn a
 * template task into a plain BPMN task.
 *
 * @param {ElementTemplates} elementTemplates
 * @param {PopupMenu} popupMenu
 * @param {Function} translate
 */
export default function UnlinkEntryProvider(elementTemplates, popupMenu, translate) {
  this._elementTemplates = elementTemplates;
  this._translate = translate;

  popupMenu.registerProvider(REPLACE_MENU_PROVIDER, VERY_LOW_PRIORITY, this);
}

/**
 * Returns the unlink option to insert at a specific position.
 *
 * @param {djs.model.Base} element
 *
 * @return { [ index, option ] } unlinkOption
 */
UnlinkEntryProvider.prototype._getUnlinkEntry = function(element, entries) {

  const elementTemplates = this._elementTemplates;
  const translate = this._translate;

  const currentTemplate = elementTemplates.get(element);

  if (!currentTemplate) {
    return;
  }

  const options = getReplaceOptions();

  const isSameType = (element, option) => option.target && !isDifferentType(element)(option);

  const optionIndex = options.findIndex(option => isSameType(element, option));

  if (optionIndex === -1) {
    return;
  }

  const option = options[optionIndex];

  const unlinkEntry = {
    id: 'replace-unlink-element-template',
    action: () => {
      elementTemplates.applyTemplate(element, null);
    },
    label: translate(option.label),
    className: option.className
  };

  // insert after previous option, if it exists
  const previousOption = options[optionIndex - 1];
  const previousEntry = previousOption && entries.find(([key]) => key === previousOption.actionName);

  if (previousEntry) {
    return [
      entries.indexOf(previousEntry) + 1,
      unlinkEntry
    ];
  }

  // insert before next option, if it exists
  const nextOption = options[optionIndex + 1];
  const nextEntry = nextOption && entries.find(([key]) => key === nextOption.actionName);

  if (nextEntry) {
    return [
      entries.indexOf(nextEntry),
      unlinkEntry
    ];
  }

  // fallback to insert at start
  return [
    0,
    unlinkEntry
  ];
};


UnlinkEntryProvider.prototype.getPopupMenuEntries = function(element) {

  return (entries) => {

    // convert our entries into something sortable
    const entrySet = Object.entries(entries);

    // retrieve insert entry
    const unlinkOption = this._getUnlinkEntry(element, entrySet);

    if (!unlinkOption) {
      return entries;
    }

    const [
      insertIndex,
      unlinkEntry
    ] = unlinkOption;

    // insert unlink entry
    entrySet.splice(insertIndex, 0, [ unlinkEntry.id, unlinkEntry ]);

    // convert back to object
    return entrySet.reduce((entries, [ key, value ]) => {
      entries[key] = value;

      return entries;
    }, {});
  };

};

UnlinkEntryProvider.$inject = [
  'elementTemplates',
  'popupMenu',
  'translate'
];
