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

import clsx from 'clsx';

import './AppendMenu.css';


export default function AppendMenu(eventBus, elementTemplates, injector) {
  this._elementTemplates = elementTemplates;
  this._injector = injector;

  this._container = this._createContainer({});

  eventBus.on('diagram.destroy', () => {
    this._destroy();
  });
}

AppendMenu.$inject = [
  'eventBus',
  'elementTemplates',
  'injector'
];

AppendMenu.prototype._getMatchingTemplates = function(element) {
  return this._elementTemplates.getAll().filter(template => {
    return template.appliesTo.includes('bpmn:Task') || template.appliesTo.includes('bpmn:ServiceTask');
  });
};

AppendMenu.prototype._applyTemplate = function(element, newTemplate) {
  const commandStack = this._injector.get('commandStack'),
        elementTemplates = this._injector.get('elementTemplates');

  const oldTemplate = elementTemplates.get(element);

  commandStack.execute('propertiesPanel.zeebe.changeTemplate', {
    element: element,
    newTemplate,
    oldTemplate
  });
};

AppendMenu.prototype._getTemplateEntries = function(element) {

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
      id: `append-template-${id}`,
      action: () => {
        return this._elementTemplates.createElement(template);
      }
    };
  });
};

AppendMenu.prototype._getContext = function(element) {

  const templateEntries = this._getTemplateEntries(element);

  return {
    entries: [
      ...templateEntries
    ],
    empty: !(
      templateEntries.length
    )
  };
};

AppendMenu.prototype.open = function(element, position) {

  const {
    entries,
    headerEntries
  } = this._getContext(element);

  return new Promise((resolve, reject) => {

    const onClose = () => this.reset();
    const onSelect = (value) => {
      onClose();

      resolve(value);
    };

    const onCancel = () => {
      onClose();

      reject('user canceled');
    };

    render(html`
        <${AppendMenuComponent}
          entries=${ entries }
          position=${ position }
          headerEntries=${ headerEntries }
          onSelect=${ onSelect }
          onCancel=${ onCancel }
        />
      `, this._container
    );
  });
};

AppendMenu.prototype.isEmpty = function(element) {
  return this._getContext(element).empty;
};

AppendMenu.prototype.reset = function() {
  render(null, this._container);
};

AppendMenu.prototype._createContainer = function(config) {

  let parent = config && config.parent || 'body';

  if (typeof parent === 'string') {
    parent = document.querySelector(parent);
  }

  const container = domify('<div class="append-menu-parent"></div>');

  parent.appendChild(container);

  return container;
};

AppendMenu.prototype._destroy = function() {
  domRemove(this._container);
};


function AppendMenuComponent(props) {

  const {
    onSelect: _onSelect,
    onCancel
  } = props;

  const onSelect = (entry, shouldClose=true) => {
    const selection = entry.action();

    _onSelect(selection);
  };

  const inputRef = useRef();

  const [ value, setValue ] = useState('');

  const [ templates, setTemplates ] = useState(props.entries);
  const [ keyboardSelectedTemplate, setKeyboardSelectedTemplate ] = useState(null);
  const [ mouseSelectedTemplate, setMouseSelectedTemplate ] = useState(null);
  const [ selectedTemplate, setSelectedTemplate ] = useState(null);

  console.log(props);

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
      return onCancel();
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
    <div class="append-menu">
      <div class="append-menu__backdrop" onClick=${ onCancel }></div>
      <div class="append-menu__overlay" style=${ `top: ${props.position.x}px; left: ${props.position.y }px` }>

        <div class="djs-popup-body">
          <div class="append-menu__search">
            <input
              ref=${ inputRef }
              placeholder="Append element..."
              type="text"
              onKeyup=${ handleKey }
              onKeydown=${ handleKeyDown }
            />
          </div>

          <ul class="append-menu__results">
            ${templates.map(template => html`
              <li
                key=${template.id}
                class=${ clsx('append-menu__entry', { selected: template === keyboardSelectedTemplate }) }
                onMouseEnter=${ () => setMouseSelectedTemplate(template) }
                onMouseLeave=${ () => setMouseSelectedTemplate(null) }
                onClick=${ (event) => { event.stopPropagation(); onSelect(template); } }
              >
                ${ template.imageUrl && html`
                  <img src=${ template.imageUrl } />
                `}

                <span class=${ clsx('append-menu__name', template.className) }>
                  ${template.label || template.name}
                </span>
                <span class="append-menu__description">
                  ${template.description || ''}
                </span>

              </li>
            `)}

            ${!templates.length && html`
              <li class="append-menu__muted-entry">Nothing found</li>
            `}
          </ul>
        </div>
      </div>
    </div>
  `;
}