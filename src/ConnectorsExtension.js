const appendPath = `
<path d="M1.3 3.4c.3 0 .5-.2.5-.5s-.2-.4-.5-.4c-.2 0-.4.1-.4.4 0 .3.2.5.4.5zM3 3.4c.2 0 .4-.2.4-.5s-.2-.4-.4-.4c-.3 0-.5.1-.5.4 0 .3.2.5.5.5zM4.6 3.4c.2 0 .4-.2.4-.5s-.2-.4-.4-.4c-.3 0-.5.1-.5.4 0 .3.2.5.5.5z"/>
`;

const appendConnectorSvg = `
<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M15.8125 11.0069C14.7767 11.0079 13.7689 11.343 12.9388 11.9625L10.0375 9.06127C10.6643 8.2372 11.0026 7.22976 11 6.19439C11.0056 3.96215 9.47542 2.01909 7.30408 1.50118C5.13274 0.983268 2.89029 2.02648 1.88772 4.02092C0.885144 6.01536 1.38567 8.43742 3.09667 9.87109C4.80766 11.3048 7.27994 11.3737 9.06813 10.0375L11.9625 12.9388C10.6267 14.7264 10.6952 17.1979 12.1278 18.9089C13.5605 20.6199 15.9814 21.1216 17.976 20.1207C19.9706 19.1199 21.0155 16.8791 20.5 14.7079C19.9846 12.5366 18.0441 11.0045 15.8125 11.0069ZM2.75001 6.19439C2.75001 4.29591 4.28903 2.75689 6.18751 2.75689C8.08599 2.75689 9.62501 4.29591 9.62501 6.19439C9.62501 8.09287 8.08599 9.63189 6.18751 9.63189C4.28903 9.63189 2.75001 8.09287 2.75001 6.19439Z" fill="#22242A"/>
</svg>
`;

const appendConnectorImageUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(appendConnectorSvg);

const appendSvg = `
<svg width="22" height="22" viewBox="0 0 5.82 5.82" xmlns="http://www.w3.org/2000/svg">
  ${appendPath}
</svg>
`;

const appendImageUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(appendSvg);

const createSvg = `
<svg width="46" height="46" viewBox="-2 -2 9.82 9.82" xmlns="http://www.w3.org/2000/svg">
  ${appendPath}
</svg>
`;

const createImageUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(createSvg);

// workaround for
// https://github.com/camunda/camunda-bpmn-js/issues/87
const LOWER_PRIORITY = 499;


export default function ConnectorsExtension(
    config,
    injector, create,
    contextPad, translate,
    elementTemplatesLoader,
    replaceMenu, appendMenu,
    createMenu, palette) {

  this._create = create;
  this._contextPad = contextPad;
  this._translate = translate;
  this._elementTemplatesLoader = elementTemplatesLoader;
  this._replaceMenu = replaceMenu;
  this._appendMenu = appendMenu;
  this._createMenu = createMenu;

  this._autoPlace = injector.get('autoPlace', false);

  this._config = config;

  contextPad.registerProvider(LOWER_PRIORITY, this);

  if (this._isAppendAnything()) {
    palette.registerProvider(LOWER_PRIORITY, this);
  }
}

ConnectorsExtension.$inject = [
  'config.connectorsExtension',
  'injector', 'create',
  'contextPad', 'translate',
  'elementTemplatesLoader',
  'replaceMenu', 'appendMenu',
  'createMenu', 'palette'
];

ConnectorsExtension.prototype.loadTemplates = function(templates) {
  this._elementTemplatesLoader.setTemplates(templates);
};

ConnectorsExtension.prototype._isAppendAnything = function() {
  return this._config && this._config.appendAnything || false;
};

ConnectorsExtension.prototype._getReplaceMenuPosition = function(element) {

  var Y_OFFSET = 5;

  var pad = this._contextPad.getPad(element).html;

  var padRect = pad.getBoundingClientRect();

  var pos = {
    x: padRect.left,
    y: padRect.bottom + Y_OFFSET
  };

  return pos;
};

ConnectorsExtension.prototype._getAppendMenuPosition = function(element) {

  var X_OFFSET = 5;

  var pad = this._contextPad.getPad(element).html;

  var padRect = pad.getBoundingClientRect();

  var pos = {
    x: padRect.right + X_OFFSET,
    y: padRect.top
  };

  return pos;
};

ConnectorsExtension.prototype.appendAnything = function(event, element) {

  const appendMenu = this._appendMenu;

  if (appendMenu.isEmpty(element)) {
    return;
  }

  const position = {
    ...(this._getAppendMenuPosition(element)),
    cursor: event && { x: event.x, y: event.y }
  };

  return appendMenu.open(element, position).then(result => {

    if (!result) {
      return;
    }

    const {
      event,
      newElement,
      dragstart = false
    } = result;

    const createStart = (event, source, newElement) => {
      this._create.start(event, newElement, {
        source
      });
    };

    const append = !dragstart && this._autoPlace
      ? (event, source, newElement) => {
        this._autoPlace.append(source, newElement);
      }
      : createStart;

    append(event, element, newElement);
  }).catch(error => {
    if (error !== 'user-canceled') {
      console.error('append-anything :: error', error);
    }
  });
};

ConnectorsExtension.prototype.replaceAnything = function(event, element) {

  const replaceMenu = this._replaceMenu;

  if (replaceMenu.isEmpty(element)) {
    return;
  }

  const position = {
    ...(this._getReplaceMenuPosition(element)),
    cursor: event && { x: event.x, y: event.y }
  };

  return replaceMenu.open(element, position).catch(error => {
    if (error !== 'user-canceled') {
      console.error('replace-anything :: error', error);
    }
  });
};

ConnectorsExtension.prototype.createAnything = function(event, position) {

  return this._createMenu.open(event, position).then(result => {

    const {
      event: _event,
      newElement
    } = result;

    this._create.start(
      _event instanceof MouseEvent ? _event : event,
      newElement
    );
  }).catch(error => {
    if (error !== 'user-canceled') {
      console.error('create-anything :: error', error);
    }
  });
};

ConnectorsExtension.prototype.getContextPadEntries = function(element) {

  const replaceMenu = this._replaceMenu;
  const translate = this._translate;

  if (element.labelTarget) {
    return null;
  }

  return (entries) => {

    // hook up new replace menu

    // clear replace menu
    if (replaceMenu.isEmpty(element)) {
      const {
        replace,
        ...restEntries
      } = entries;

      entries = restEntries;
    } else {

      entries = { ...entries };

      entries['replace'] = {
        group: 'edit',
        className: 'bpmn-icon-screw-wrench',
        title: translate('Change type'),
        action: {
          click: (event, element) => {
            this.replaceAnything(event, element);
          }
        }
      };
    }

    // only allow when appending task is allowed, too
    if (entries['append.append-task']) {

      entries = { ...entries };

      const appendAnything = this._isAppendAnything();

      if (appendAnything) {
        entries['append-anything'] = {
          group: 'model',
          imageUrl: appendImageUrl,
          title: translate('Append anything'),
          action: {
            click: (event, element) => {
              this.appendAnything(event, element);
            }
          }
        };
      } else {
        entries['append-connector'] = {
          group: 'model',
          imageUrl: appendConnectorImageUrl,
          title: translate('Append Connector'),
          action: {
            click: (event, element) => {
              this.appendAnything(event, element);
            }
          }
        };
      }
    }

    return entries;
  };
};

ConnectorsExtension.prototype.getPaletteEntries = function() {

  return {
    'create-anything': {
      group: 'anything',
      imageUrl: createImageUrl,
      title: this._translate('Create anything'),
      action: {
        click: (event) => {

          const cursor = event && { x: event.x, y: event.y };

          const position = event && {
            x: cursor.x + 35,
            y: cursor.y + 10,
            cursor
          };

          this.createAnything(event, position);
        }
      }
    }
  };
};