import {
  html
} from 'htm/preact';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'preact/hooks';

import clsx from 'clsx';

import {
  categoryChanged,
  scrollIntoView,
  sanitizeImageUrl
} from '../utils';

import {
  CREATE_OPTIONS
} from './CreateOptions';


export default function CreateMenu(
    elementTemplates, elementFactory,
    injector, changeMenu) {

  this._elementTemplates = elementTemplates;
  this._elementFactory = elementFactory;
  this._injector = injector;
  this._changeMenu = changeMenu;
}

CreateMenu.$inject = [
  'elementTemplates',
  'elementFactory',
  'injector',
  'changeMenu'
];

CreateMenu.prototype._getMatchingTemplates = function() {
  return this._elementTemplates.getAll().filter(template => {
    return template.appliesTo.includes('bpmn:Task') || template.appliesTo.includes('bpmn:ServiceTask');
  });
};

CreateMenu.prototype._getDefaultEntries = function() {

  return CREATE_OPTIONS.map(option => {

    const {
      actionName,
      className,
      label,
      category,
      search,
      rating,
      target
    } = option;

    return {
      label,
      id: `create-${actionName}`,
      className,
      category,
      search,
      rating,
      action: () => {
        return this._elementFactory.create('shape', { ...target });
      }
    };
  });

};

CreateMenu.prototype._getTemplateEntries = function() {

  if (!('createElement' in this._elementTemplates)) {
    return [];
  }

  const templates = this._getMatchingTemplates();

  return templates.map(template => {

    const {
      id,
      name,
      description,
      category,
      search,
      icon = {}
    } = template;

    return {
      name,
      description,
      search,
      category: category || {
        id: 'templates',
        name: 'Templates'
      },
      imageUrl: sanitizeImageUrl(icon.contents),
      id: `create-template-${id}`,
      action: () => {
        return this._elementTemplates.createElement(template);
      }
    };
  });
};

CreateMenu.prototype._getContext = function() {

  const defaultEntries = this._getDefaultEntries();

  const templateEntries = this._getTemplateEntries();

  return {
    entries: [
      ...defaultEntries,
      ...templateEntries
    ],
    empty: !(
      templateEntries.length + defaultEntries.length
    )
  };
};

/**
 * Open create menu and return a promise to signal the result.
 *
 * If the user canceles the operation the promise will be
 * rejected with `user-canceled`.
 *
 * @typedef { { event: DOMEvent, newElement: DiagramElement } } CreateMenuResult
 *
 * @param { Point } position
 *
 * @return { Promise<CreateMenuResult> }
 */
CreateMenu.prototype.open = function(position) {

  const {
    entries
  } = this._getContext();

  const renderFn = (onClose) => html`
    <${CreateMenuComponent}
      entries=${ entries }
      onClose=${ onClose }
    />
  `;

  return this._changeMenu.open(renderFn, {
    position,
    className: 'cmd-create-menu'
  }).then((element) => {

    if (!element) {
      return Promise.reject('user-canceled');
    }

    return element;
  });
};

function CreateMenuComponent(props) {

  const {
    onClose,
    entries
  } = props;

  const onSelect = (event, entry, dragstart=false) => {
    const newElement = entry.action();

    onClose({
      event,
      newElement,
      dragstart
    });
  };

  const inputRef = useRef();
  const resultsRef = useRef();

  const [ value, setValue ] = useState('');

  const [ templates, setTemplates ] = useState(props.entries);
  const [ selectedTemplate, setSelectedTemplate ] = useState(templates[0]);

  useEffect(() => {

    const filter = (template) => {
      if (!value) {
        return template.rating !== -1;
      }

      const search = [
        template.name && 'connector' || '',
        template.name, template.description || '',
        template.label || '',
        template.search || ''
      ].join('---').toLowerCase();

      return value.toLowerCase().split(/\s/g).every(
        term => search.includes(term)
      );
    };

    const templates = entries.filter(filter);

    if (!templates.includes(selectedTemplate)) {
      setSelectedTemplate(templates[0]);
    }

    setTemplates(templates);
  }, [ value, selectedTemplate, props.templates ]);

  // focus input on initial mount
  useLayoutEffect(() => {
    inputRef.current.focus();
  }, []);

  // scroll to keyboard selected result
  useLayoutEffect(() => {

    const containerEl = resultsRef.current;

    const selectedEl = containerEl.querySelector('.selected');

    if (selectedEl) {
      scrollIntoView(selectedEl);
    }
  }, [ selectedTemplate ]);


  const keyboardSelect = useCallback(direction => {

    const idx = templates.indexOf(selectedTemplate);

    let nextIdx = idx + direction;

    if (nextIdx < 0) {
      nextIdx = templates.length - 1;
    }

    if (nextIdx >= templates.length) {
      nextIdx = 0;
    }

    setSelectedTemplate(templates[nextIdx]);
  }, [ templates, selectedTemplate ]);

  const handleKeyDown = useCallback(event => {

    if (event.key === 'Enter' && selectedTemplate) {
      onSelect(event, selectedTemplate);

      return event.preventDefault();
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

  }, [ selectedTemplate, keyboardSelect ]);

  const handleKey = useCallback((event) => {
    setValue(() => event.target.value);
  }, []);

  return html`
    <div class="cmd-change-menu__header">
      <h3 class="cmd-change-menu__title">
        Create element
      </h3>
    </div>

    <div class="cmd-change-menu__body">
      <div class=${ clsx('cmd-change-menu__search', { hidden: props.entries.length < 5 }) }>
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

      <ul class="cmd-change-menu__results" ref=${ resultsRef }>
        ${templates.map((template, idx) => html`
          ${ categoryChanged(template, templates[idx - 1]) && html`
            <li
              key=${ template.category.id }
              class="cmd-change-menu__entry_header"
            >${ template.category.name }</li>
          ` }

          <li
            key=${template.id}
            class=${ clsx('cmd-change-menu__entry', { selected: template === selectedTemplate }) }
            onMouseEnter=${ () => setSelectedTemplate(template) }
            draggable
            onDragStart=${ (event) => { event.stopPropagation(); event.preventDefault(); onSelect(event, template, true); } }
            onClick=${ (event) => { event.stopPropagation(); onSelect(event, template); } }
            data-entry-id=${ template.id }
          >
            <div class="cmd-change-menu__entry-content">

              <span class=${ clsx('cmd-change-menu__name', template.className) } title="${ template.label || template.name }">
                ${ template.imageUrl && html`
                  <img class="cmd-change-menu__entry-icon" src=${ template.imageUrl } />
                `}

                ${template.label || template.name}
              </span>
              <span class="cmd-change-menu__description" title="${ template.description }">
                ${template.description || ''}
              </span>
            </div>

            ${ template.documentationRef && html`<div class="cmd-change-menu__entry-help">
              <a href="${ template.documentationRef }" title="Open element documentation" target="_blank" rel="noopener">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M10.6368 10.6375V5.91761H11.9995V10.6382C11.9995 10.9973 11.8623 11.3141 11.5878 11.5885C11.3134 11.863 10.9966 12.0002 10.6375 12.0002H1.36266C0.982345 12.0002 0.660159 11.8681 0.396102 11.6041C0.132044 11.34 1.52588e-05 11.0178 1.52588e-05 10.6375V1.36267C1.52588e-05 0.98236 0.132044 0.660173 0.396102 0.396116C0.660159 0.132058 0.982345 2.95639e-05 1.36266 2.95639e-05H5.91624V1.36267H1.36266V10.6375H10.6368ZM12 0H7.2794L7.27873 1.36197H9.68701L3.06507 7.98391L4.01541 8.93425L10.6373 2.31231V4.72059H12V0Z" fill="#818798"/>
                </svg>
              </a>
            </div>` }
          </li>
        `)}

        ${!templates.length && html`
          <li class="cmd-change-menu__muted-entry">Nothing found</li>
        `}
      </ul>
    </div>
  `;
}