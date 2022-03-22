import {
  html
} from 'htm/preact';

import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'preact/hooks';

import clsx from 'clsx';


export default function AppendMenu(elementTemplates, injector, changeMenu) {
  this._elementTemplates = elementTemplates;
  this._injector = injector;
  this._changeMenu = changeMenu;
}

AppendMenu.$inject = [
  'elementTemplates',
  'injector',
  'changeMenu'
];

AppendMenu.prototype._getMatchingTemplates = function(element) {
  return this._elementTemplates.getAll().filter(template => {
    return template.appliesTo.includes('bpmn:Task') || template.appliesTo.includes('bpmn:ServiceTask');
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
    entries
  } = this._getContext(element);

  const renderFn = (onClose) => html`
    <${AppendMenuComponent}
      entries=${ entries }
      onClose=${ onClose }
    />
  `;

  return this._changeMenu.open(renderFn, { position }).then((element) => {

    if (!element) {
      return Promise.reject('user canceled');
    }

    return element;
  });
};

AppendMenu.prototype.isEmpty = function(element) {
  return this._getContext(element).empty;
};


function AppendMenuComponent(props) {

  const {
    onClose,
    entries
  } = props;

  const onSelect = (entry) => {
    const selection = entry.action();

    console.log(selection);

    onClose(selection);
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

      const search = [
        template.name && 'connector' || '',
        template.name, template.description || '',
        template.label || ''
      ].join('---').toLowerCase();

      return value.toLowerCase().split(/\s/g).every(
        term => search.includes(term)
      );
    };

    const templates = entries.filter(filter);

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
    <div class="cmd-change-menu__header">
      <h3 class="cmd-change-menu__title">
        Append a connector
      </h3>
    </div>

    <div class="cmd-change-menu__body">
      <div class="cmd-change-menu__search">
        <svg class="cmd-change-menu__search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M9.0325 8.5H9.625L13.3675 12.25L12.25 13.3675L8.5 9.625V9.0325L8.2975 8.8225C7.4425 9.5575 6.3325 10 5.125 10C2.4325 10 0.25 7.8175 0.25 5.125C0.25 2.4325 2.4325 0.25 5.125 0.25C7.8175 0.25 10 2.4325 10 5.125C10 6.3325 9.5575 7.4425 8.8225 8.2975L9.0325 8.5ZM1.75 5.125C1.75 6.9925 3.2575 8.5 5.125 8.5C6.9925 8.5 8.5 6.9925 8.5 5.125C8.5 3.2575 6.9925 1.75 5.125 1.75C3.2575 1.75 1.75 3.2575 1.75 5.125Z" fill="#22242A"/>
        </svg>

        <input
          ref=${ inputRef }
          type="text"
          onKeyup=${ handleKey }
          onKeydown=${ handleKeyDown }
        />
      </div>

      <ul class="cmd-change-menu__results">
        ${templates.map(template => html`
          <li
            key=${template.id}
            class=${ clsx('cmd-change-menu__entry', { selected: template === keyboardSelectedTemplate }) }
            onMouseEnter=${ () => setMouseSelectedTemplate(template) }
            onMouseLeave=${ () => setMouseSelectedTemplate(null) }
            onClick=${ (event) => { event.stopPropagation(); onSelect(template); } }
          >
            <div class="cmd-change-menu__entry-content">
              ${ template.imageUrl && html`
                <img src=${ template.imageUrl } />
              `}

              <span class=${ clsx('cmd-change-menu__name', template.className) } title="${ template.label || template.name }">
                ${template.label || template.name}
              </span>
              <span class="cmd-change-menu__description" title="${ template.description }">
                ${template.description || ''}
              </span>
            </div>

            <div class="cmd-change-menu__entry-help">
              <a href="#" title="Open element documentation" target="_blank" rel="noopener">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M10.897 10.8967V6.49996H12.1663V10.8973C12.1663 11.2318 12.0385 11.5269 11.7829 11.7825C11.5273 12.0382 11.2322 12.166 10.8976 12.166H2.10234C1.74807 12.166 1.44795 12.043 1.20197 11.797C0.955995 11.5511 0.833008 11.2509 0.833008 10.8967V2.10136C0.833008 1.74709 0.955995 1.44697 1.20197 1.20099C1.44795 0.955019 1.74807 0.832031 2.10234 0.832031H6.49967V2.10136H2.10234V10.8967H10.897ZM12.1668 0.833637H7.76949L7.76886 0.833008V2.10234H10.0122L3.84375 8.27082L4.72901 9.15608L10.8975 2.9876V5.23097H12.1668V0.833637Z" fill="#818698"/>
                </svg>
              </a>
            </div>
          </li>
        `)}

        ${!templates.length && html`
          <li class="cmd-change-menu__muted-entry">Nothing found</li>
        `}
      </ul>
    </div>
  `;
}