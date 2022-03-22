const appendSvg = `
<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M15.8125 11.0069C14.7767 11.0079 13.7689 11.343 12.9388 11.9625L10.0375 9.06127C10.6643 8.2372 11.0026 7.22976 11 6.19439C11.0056 3.96215 9.47542 2.01909 7.30408 1.50118C5.13274 0.983268 2.89029 2.02648 1.88772 4.02092C0.885144 6.01536 1.38567 8.43742 3.09667 9.87109C4.80766 11.3048 7.27994 11.3737 9.06813 10.0375L11.9625 12.9388C10.6267 14.7264 10.6952 17.1979 12.1278 18.9089C13.5605 20.6199 15.9814 21.1216 17.976 20.1207C19.9706 19.1199 21.0155 16.8791 20.5 14.7079C19.9846 12.5366 18.0441 11.0045 15.8125 11.0069ZM2.75001 6.19439C2.75001 4.29591 4.28903 2.75689 6.18751 2.75689C8.08599 2.75689 9.62501 4.29591 9.62501 6.19439C9.62501 8.09287 8.08599 9.63189 6.18751 9.63189C4.28903 9.63189 2.75001 8.09287 2.75001 6.19439Z" fill="#22242A"/>
</svg>
`;

const appendImageUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(appendSvg);


// workaround for
// https://github.com/camunda/camunda-bpmn-js/issues/87
const LOWER_PRIORITY = 499;

import EMAIL_TEMPLATES from './.camunda/element-templates/sendgrid-connector.json';
import REST_TEMPLATES from './.camunda/element-templates/rest-connector.json';


const TEMPLATES = [ ...EMAIL_TEMPLATES, ...REST_TEMPLATES ];


export default function ConnectorsExtension(
    config,
    injector, create,
    contextPad, translate,
    elementTemplatesLoader,
    replaceMenu, appendMenu,
    canvas) {

  this._create = create;
  this._contextPad = contextPad;
  this._translate = translate;
  this._elementTemplatesLoader = elementTemplatesLoader;
  this._replaceMenu = replaceMenu;
  this._appendMenu = appendMenu;
  this._canvas = canvas;

  this._autoPlace = injector.get('autoPlace', false);

  contextPad.registerProvider(LOWER_PRIORITY, this);

  if (config && config.loadTemplates !== false) {
    this.loadTemplates();
  }
}

ConnectorsExtension.$inject = [
  'config.connectorExtension',
  'injector', 'create',
  'contextPad', 'translate',
  'elementTemplatesLoader',
  'replaceMenu', 'appendMenu',
  'canvas'
];

ConnectorsExtension.prototype.loadTemplates = function() {
  this._elementTemplatesLoader.setTemplates(TEMPLATES);
};

ConnectorsExtension.prototype._getReplaceMenuPosition = function(element) {

  var Y_OFFSET = 5;

  var diagramContainer = this._canvas.getContainer(),
      pad = this._contextPad.getPad(element).html;

  var diagramRect = diagramContainer.getBoundingClientRect(),
      padRect = pad.getBoundingClientRect();

  var top = padRect.top - diagramRect.top;
  var left = padRect.left - diagramRect.left;

  var pos = {
    x: left,
    y: top + padRect.height + Y_OFFSET
  };

  return pos;
};

ConnectorsExtension.prototype._getAppendMenuPosition = function(element) {

  var Y_OFFSET = 5;

  var diagramContainer = this._canvas.getContainer(),
      pad = this._contextPad.getPad(element).html;

  var diagramRect = diagramContainer.getBoundingClientRect(),
      padRect = pad.getBoundingClientRect();

  var top = padRect.top - diagramRect.top;
  var left = padRect.left - diagramRect.left;

  var pos = {
    x: left + Y_OFFSET + padRect.width,
    y: top
  };

  return pos;
};

ConnectorsExtension.prototype.getContextPadEntries = function(element) {

  const replaceMenu = this._replaceMenu;
  const appendMenu = this._appendMenu;
  const translate = this._translate;


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

            const position = {
              ...(this._getReplaceMenuPosition(element)),
              cursor: { x: event.x, y: event.y }
            };

            replaceMenu.open(element, position);
          }
        }
      };
    }

    // only allow when appending task is allowed, too
    if (entries['append.append-task']) {

      entries = { ...entries };

      entries['append-anything'] = {
        group: 'model',
        imageUrl: appendImageUrl,
        title: translate('Append connector'),
        action: {
          click: (event, element) => {

            const position = {
              ...(this._getAppendMenuPosition(element)),
              cursor: { x: event.x, y: event.y }
            };

            appendMenu.open(element, position).then(newElement => {

              const createStart = (source) => {
                this._create.start(event, newElement, {
                  source
                });
              };

              const autoPlace = this._autoPlace
                ? (source) => {
                  this._autoPlace.append(source, newElement);
                }
                : createStart;

              autoPlace(element, newElement);
            }).catch(err => console.warn(err));
          }
        }
      };
    }

    return entries;
  };
};