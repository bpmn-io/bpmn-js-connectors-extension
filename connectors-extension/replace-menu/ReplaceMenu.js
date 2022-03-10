import {
  html,
  render
} from 'htm/preact';

import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'preact/hooks';

import {
  domify,
  remove as domRemove
} from 'min-dom';

import {
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

import clsx from 'clsx';

import './ReplaceMenu.css';

const REPLACE_MENU_PROVIDER = 'bpmn-replace';


export default function ReplaceMenu(eventBus, elementTemplates, popupMenu, injector) {
  this._popupMenu = popupMenu;
  this._elementTemplates = elementTemplates;
  this._injector = injector;

  this._container = this._createContainer({});

  eventBus.on('diagram.destroy', () => {
    this._destroy();
  });
}

ReplaceMenu.$inject = [
  'eventBus',
  'elementTemplates',
  'popupMenu',
  'injector'
];

ReplaceMenu.prototype._getMatchingTemplates = function(element) {
  return this._elementTemplates.getAll().filter(template => {
    return isAny(element, template.appliesTo);
  });
};

ReplaceMenu.prototype._applyTemplate = function(element, newTemplate) {
  const commandStack = this._injector.get('commandStack'),
        elementTemplates = this._injector.get('elementTemplates');

  const oldTemplate = elementTemplates.get(element);

  commandStack.execute('propertiesPanel.zeebe.changeTemplate', {
    element: element,
    newTemplate,
    oldTemplate
  });
};

ReplaceMenu.prototype._getTemplateEntries = function(element) {

  const templates = this._getMatchingTemplates(element);

  return templates.map(template => {

    const {
      id,
      name,
      description
    } = template;

    /*
    var menuEntry = {
      label: translate(label),
      className: definition.className,
      id: definition.actionName,
      action: action
    };
    */

    return {
      name,
      description,
      id: `replace-template-${id}`,
      action: () => {
        this._applyTemplate(element, template);
      }
    };
  });
};

ReplaceMenu.prototype._getContext = function(element) {

  const providers = this._popupMenu._getProviders(REPLACE_MENU_PROVIDER);

  const entries = this._popupMenu._getEntries(element, providers);
  const headerEntries = this._popupMenu._getHeaderEntries(element, providers);

  const templateEntries = this._getTemplateEntries(element);

  console.log(entries, headerEntries, templateEntries);

  return {
    entries: [
      ...Object.entries(entries).map(
        ([key, value]) => ({ id: key, ...value })
      ),
      ...templateEntries
    ],
    headerEntries,
    empty: !(
      Object.keys(entries).length ||
      Object.keys(headerEntries).length ||
      templateEntries.length
    )
  };
};

ReplaceMenu.prototype.open = function(element, position) {

  const {
    entries,
    headerEntries
  } = this._getContext(element);

  console.log(position);

  const onClose = () => this.reset();

  render(html`
      <${ReplaceMenuComponent}
        entries=${ entries }
        headerEntries=${ headerEntries }
        onClose=${ onClose }
        position=${ position }
      />
    `, this._container
  );

};

ReplaceMenu.prototype.isEmpty = function(element) {
  return this._getContext(element).empty;
};

ReplaceMenu.prototype.reset = function() {
  render(null, this._container);
};

ReplaceMenu.prototype._createContainer = function(config) {

  let parent = config && config.parent || 'body';

  if (typeof parent === 'string') {
    parent = document.querySelector(parent);
  }

  const container = domify('<div class="replace-menu-parent"></div>');

  parent.appendChild(container);

  return container;
};

ReplaceMenu.prototype._destroy = function() {
  domRemove(this._container);
};


function ReplaceMenuComponent(props) {

  const {
    onClose
  } = props;

  const onSelect = (entry, shouldClose=true) => {
    entry.action();

    shouldClose && onClose();
  };


  const inputRef = useRef();

  const [ value, setValue ] = useState('');

  const [ templates, setTemplates ] = useState(props.entries);
  const [ keyboardSelectedTemplate, setKeyboardSelectedTemplate ] = useState(null);
  const [ mouseSelectedTemplate, setMouseSelectedTemplate ] = useState(null);
  const [ selectedTemplate, setSelectedTemplate ] = useState(null);

  useEffect(() => {

    const filter = (template) => {
      if (!value) {
        return true;
      }

      const search = [ template.name && 'connector' || '', template.name, template.description || '', template.label || '' ].join('---').toLowerCase();

      return value.toLowerCase().split(/\s/g).every(
        term => search.includes(term)
      );
    };

    const templates = props.entries.filter(filter);

    if (!templates.includes(keyboardSelectedTemplate)) {
      setKeyboardSelectedTemplate(templates[0]);
    }

    if (!templates.includes(mouseSelectedTemplate)) {
      setMouseSelectedTemplate(null);
    }

    setTemplates(templates);
  }, [ value, keyboardSelectedTemplate, mouseSelectedTemplate, props.templates ]);


  // focus input on initial mount
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    setSelectedTemplate(mouseSelectedTemplate || keyboardSelectedTemplate);
  }, [ keyboardSelectedTemplate, mouseSelectedTemplate ]);


  const keyboardSelect = useCallback(direction => {

    const idx = templates.indexOf(keyboardSelectedTemplate);

    let nextIdx = idx + direction;

    if (nextIdx < 0) {
      nextIdx = templates.length - 1;
    }

    if (nextIdx >= templates.length) {
      nextIdx = 0;
    }

    setKeyboardSelectedTemplate(templates[nextIdx]);
  }, [ templates, keyboardSelectedTemplate ]);

  const handleKeyDown = useCallback(event => {

    if (event.key === 'Enter' && selectedTemplate) {
      return onSelect(selectedTemplate);
    }

    if (event.key === 'Escape') {
      return onClose();
    }

    // ARROW_UP or SHIFT + TAB navigation
    if (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)) {
      keyboardSelect(-1);

      return event.preventDefault();
    }

    // ARROW_DOWN or TAB navigation
    if (event.key === 'ArrowDown' || event.key === 'Tab') {
      keyboardSelect(1);

      return event.preventDefault();
    }

  }, [ selectedTemplate ]);

  const handleKey = useCallback((event) => {
    setValue(() => event.target.value);
  }, []);

  return html`
    <div class="replace-menu">
      <div class="replace-menu__backdrop" onClick=${ onClose }></div>
      <div class="replace-menu__overlay" style=${ { top: props.position.x, left: props.position.y } }>

        <div class="replace-menu__search">
          <input
            ref=${ inputRef }
            placeholder="Choose task type"
            type="text"
            onKeyup=${ handleKey }
            onKeydown=${ handleKeyDown }
          />
        </div>

        <ul class="replace-menu__results">
          ${templates.slice(0, 7).map(template => html`
            <li
              key=${template.id}
              class=${ clsx('replace-menu__entry', { selected: template === selectedTemplate }) }
              onMouseEnter=${ () => setMouseSelectedTemplate(template) }
              onMouseLeave=${ () => setMouseSelectedTemplate(null) }
              onClick=${ () => onSelect(template) }
            >
              <span class="replace-menu__name">
                ${template.label || template.name}
              </span>
              <span class="replace-menu__description">
                ${template.description || ''}
              </span>
            </li>
          `)}

          ${!templates.length && html`
            <li class="replace-menu__muted-entry">No template found</li>
          `}
        </ul>
      </div>
    </div>
  `;
}