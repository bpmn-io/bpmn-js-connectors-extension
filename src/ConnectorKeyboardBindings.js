import {
  isLabel
} from 'bpmn-js/lib/util/LabelUtil';


export default function ConnectorKeyboardBindings(
    injector, selection,
    connectorsExtension, mouse) {

  this._injector = injector;
  this._selection = selection;
  this._connectorsExtension = connectorsExtension;
  this._mouse = mouse;

  const keyboard = injector.get('keyboard', false);

  if (keyboard) {
    this.registerKeyboardBindings(keyboard);
  }
}

ConnectorKeyboardBindings.$inject = [
  'injector',
  'selection',
  'connectorsExtension',
  'mouse'
];

ConnectorKeyboardBindings.prototype.registerKeyboardBindings = function(keyboard) {

  const connectorsExtension = this._connectorsExtension;
  const selection = this._selection;
  const mouse = this._mouse;

  /**
   * Returns the element that is subject
   * to replace/append anything, if it exists.
   *
   * @return {djs.model.Shape}
   */
  function getTargetElement() {
    const selected = selection.get();

    const element = selected[0];

    if (selected.length !== 1) {
      return null;
    }

    if (isLabel(element)) {
      return null;
    }

    return element;
  }

  keyboard.addListener(context => {
    var event = context.keyEvent;

    if (keyboard.hasModifier(event)) {
      return;
    }

    var mouseEvent = mouse.getLastMoveEvent();

    var element = getTargetElement();

    if (keyboard.isKey([ 'r', 'R' ], event) && element) {
      connectorsExtension.replaceAnything(mouseEvent, element);

      return true;
    }

    if (keyboard.isKey([ 'n', 'N' ], event)) {
      connectorsExtension.createAnything(mouseEvent);

      return true;
    }

    if (keyboard.isKey([ 'a', 'A' ], event)) {

      if (element) {
        connectorsExtension.appendAnything(mouseEvent, element);
      } else {
        connectorsExtension.createAnything(mouseEvent);
      }

      return true;
    }
  });
};