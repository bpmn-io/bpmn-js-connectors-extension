
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

  keyboard.addListener(context => {
    var event = context.keyEvent;

    if (keyboard.hasModifier(event)) {
      return;
    }

    var mouseEvent = mouse.getLastMoveEvent();

    if (keyboard.isKey(['r', 'R'], event) && selection.get().length === 1) {
      connectorsExtension.replaceAnything(mouseEvent, selection.get()[0]);

      return true;
    }

    if (keyboard.isKey(['n', 'N'], event)) {
      connectorsExtension.createAnything(mouseEvent);

      return true;
    }

    if (keyboard.isKey(['a', 'A'], event)) {

      if (selection.get().length === 1) {
        connectorsExtension.appendAnything(mouseEvent, selection.get()[0]);
      } else {
        connectorsExtension.createAnything(mouseEvent);
      }

      return true;
    }
  });
};